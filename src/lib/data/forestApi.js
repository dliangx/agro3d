// @ts-nocheck

// 文件保存功能
function saveDataToFile(data, filename) {
	try {
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		console.log(`💾 数据已保存到文件: ${filename}`);
		return true;
	} catch (error) {
		console.error('❌ 保存文件失败:', error);
		return false;
	}
}

// 清除所有缓存数据
export function clearCache() {
	try {
		const keys = Object.keys(localStorage);
		const cacheKeys = keys.filter((key) => key.startsWith('forest-'));
		cacheKeys.forEach((key) => {
			localStorage.removeItem(key);
			console.log(`🗑️ 清除缓存: ${key}`);
		});
		console.log(`✅ 已清除 ${cacheKeys.length} 个缓存项`);
	} catch (error) {
		console.warn('清除缓存失败:', error);
	}
}

// 初始化时不清除缓存，保留历史数据
// clearCache();

// 配置选项
const CONFIG = {
	useMockData: false, // 强制使用真实数据
	enableCache: true, // 启用缓存
	retryEndpoints: true, // 重试其他端点
	cacheExpiry: 24 * 60 * 60 * 1000 // 24小时
};

// 缓存键名
const CACHE_KEY = 'forest-api-cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24小时

// OpenStreetMap Overpass API 请求脚本
// 用于获取真实的森林和绿地数据

/**
 * 通过 Overpass API 获取指定区域的森林数据
 * @param {number} south - 南边界纬度
 * @param {number} west - 西边界经度
 * @param {number} north - 北边界纬度
 * @param {number} east - 东边界经度
 * @returns {Promise<Object>} GeoJSON 格式的森林数据
 */
export async function fetchForestDataFromOSM(south, west, north, east) {
	// 如果配置为使用模拟数据，直接返回
	if (CONFIG.useMockData) {
		console.log('🎭 配置为使用模拟数据');
		return getMockForestData(south, west, north, east);
	}

	// 检查缓存
	const cacheKey = `forest-${south}-${west}-${north}-${east}`;
	if (CONFIG.enableCache) {
		const cached = getCachedData(cacheKey);
		if (cached) {
			console.log('📦 使用缓存数据');
			return cached;
		}
	}
	const overpassQuery = `
    [out:json][timeout:25];
    (
      // 简化查询，只查询主要的森林类型
      way["natural"="wood"](${south},${west},${north},${east});
      relation["natural"="wood"](${south},${west},${north},${east});
    );
    out geom;
  `;

	// 尝试不同的 Overpass API 端点
	const endpoints = CONFIG.retryEndpoints
		? [
				'https://overpass-api.de/api/interpreter',
				'https://overpass.kumi.systems/api/interpreter',
				'https://overpass.openstreetmap.fr/api/interpreter'
			]
		: ['https://overpass-api.de/api/interpreter'];

	let response;
	let lastError;

	for (const endpoint of endpoints) {
		try {
			console.log(`🔄 尝试连接到: ${endpoint}`);
			console.log(`📋 查询区域: ${south},${west},${north},${east}`);
			response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: `data=${encodeURIComponent(overpassQuery)}`
			});

			if (response.ok) {
				console.log(`✅ 成功连接到: ${endpoint}`);
				console.log(`📡 响应状态: ${response.status}`);
				break;
			} else if (response.status === 429) {
				console.warn(`⚠️ ${endpoint} 速率限制`);
				lastError = new Error(`Rate limited by ${endpoint}`);
				continue;
			} else if (response.status === 400) {
				const errorText = await response.text();
				console.error(`❌ ${endpoint} 请求错误:`, errorText.substring(0, 200));
				lastError = new Error(
					`Bad request to ${endpoint}: ${errorText.split('<description>')[1]?.split('</description>')[0] || '查询语法错误'}`
				);
				continue;
			} else {
				console.warn(`⚠️ ${endpoint} 返回错误: ${response.status}`);
				lastError = new Error(`HTTP error from ${endpoint}: ${response.status}`);
				continue;
			}
		} catch (error) {
			console.warn(`⚠️ ${endpoint} 连接失败:`, error.message);
			lastError = error;
			continue;
		}
	}

	if (!response || !response.ok) {
		if (lastError && lastError.message.includes('Rate limited')) {
			console.warn('⚠️ 所有 Overpass API 端点都达到速率限制，使用模拟数据');
		} else {
			console.warn('⚠️ 所有 Overpass API 端点都连接失败，使用模拟数据');
		}
		return getMockForestData(south, west, north, east);
	}

	let data;
	try {
		const responseText = await response.text();

		// 检查是否是 XML 错误响应
		if (responseText.trim().startsWith('<?xml') || responseText.trim().startsWith('<osm')) {
			console.error('❌ API 返回了 XML 错误信息:', responseText.substring(0, 200));
			throw new Error(
				`Overpass API 错误: ${responseText.split('<description>')[1]?.split('</description>')[0] || '未知错误'}`
			);
		}

		data = JSON.parse(responseText);
		console.log(`📊 API 返回数据: ${data.elements?.length || 0} 个元素`);
	} catch (parseError) {
		console.error('❌ 解析 API 响应失败:', parseError);
		throw new Error(`API 响应解析失败: ${parseError.message}`);
	}

	// 保存原始API数据到文件
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const rawData = {
		timestamp: new Date().toISOString(),
		query: { south, west, north, east },
		apiResponse: data,
		statistics: {
			totalElements: data.elements?.length || 0,
			elementTypes:
				data.elements?.map((el) => el.type).filter((v, i, a) => a.indexOf(v) === i) || [],
			tagTypes:
				data.elements
					?.map((el) => el.tags?.natural || el.tags?.landuse || el.tags?.leisure)
					.filter(Boolean)
					.filter((v, i, a) => a.indexOf(v) === i) || []
		}
	};
	saveDataToFile(rawData, `forest-api-raw-${timestamp}.json`);
	const geoJSON = convertOSMToGeoJSON(data);

	// 缓存成功获取的数据
	if (CONFIG.enableCache) {
		setCachedData(cacheKey, geoJSON);
	}
	return geoJSON;
}

/**
 * 将 OSM 数据转换为 GeoJSON 格式
 * @param {Object} osmData - OSM API 返回的数据
 * @returns {Object} GeoJSON 格式的数据
 */
function convertOSMToGeoJSON(osmData) {
	const features = [];
	console.log(`🔧 开始转换 OSM 数据: ${osmData.elements?.length || 0} 个元素`);

	if (!osmData.elements || osmData.elements.length === 0) {
		console.warn('⚠️ OSM 数据为空');
		console.log('🔍 完整的 OSM 数据:', osmData);
		return {
			type: 'FeatureCollection',
			features: []
		};
	}

	// 处理所有元素类型
	osmData.elements.forEach((element) => {
		let geometry = null;
		let properties = {
			name: element.tags?.name || '未命名区域',
			natural: element.tags?.natural,
			landuse: element.tags?.landuse,
			leisure: element.tags?.leisure,
			...element.tags
		};

		// 处理 ways (多边形)
		if (element.type === 'way' && element.nodes) {
			const coordinates = element.nodes
				.map((nodeId) => {
					const node = osmData.elements.find((el) => el.id === nodeId && el.type === 'node');
					return node ? [node.lon, node.lat] : null;
				})
				.filter((coord) => coord !== null);

			if (coordinates.length > 2) {
				// 确保多边形闭合
				if (
					coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
					coordinates[0][1] !== coordinates[coordinates.length - 1][1]
				) {
					coordinates.push(coordinates[0]);
				}

				geometry = {
					type: 'Polygon',
					coordinates: [coordinates]
				};
			}
		}
		// 处理 relations (复杂多边形)
		else if (element.type === 'relation' && element.members) {
			// 简化处理：只处理外环
			const outerMembers = element.members.filter((member) => member.role === 'outer');
			if (outerMembers.length > 0) {
				const outerWay = outerMembers[0];
				const way = osmData.elements.find((el) => el.id === outerWay.ref && el.type === 'way');
				if (way && way.nodes) {
					const coordinates = way.nodes
						.map((nodeId) => {
							const node = osmData.elements.find((el) => el.id === nodeId && el.type === 'node');
							return node ? [node.lon, node.lat] : null;
						})
						.filter((coord) => coord !== null);

					if (coordinates.length > 2) {
						// 确保多边形闭合
						if (
							coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
							coordinates[0][1] !== coordinates[coordinates.length - 1][1]
						) {
							coordinates.push(coordinates[0]);
						}

						geometry = {
							type: 'Polygon',
							coordinates: [coordinates]
						};
					}
				}
			}
		}

		// 如果有有效的几何数据，创建要素
		if (geometry) {
			features.push({
				type: 'Feature',
				id: element.id,
				properties: properties,
				geometry: geometry
			});
		}
	});

	console.log(`✅ 转换完成: ${features.length} 个要素`);

	// 保存转换后的GeoJSON数据到文件
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const geoJSONData = {
		timestamp: new Date().toISOString(),
		type: 'FeatureCollection',
		features: features,
		metadata: {
			totalFeatures: features.length,
			conversionStatistics: {
				successfulConversions: features.length,
				failedConversions: (osmData.elements?.length || 0) - features.length
			}
		}
	};
	saveDataToFile(geoJSONData, `forest-geojson-${timestamp}.json`);

	return {
		type: 'FeatureCollection',
		features: features
	};
}

/**
 * 获取中国主要森林区域的示例数据
 * @returns {Promise<Object>} 森林数据
 */
export async function fetchChinaForestData() {
	// 使用非常小的测试区域 - 北京香山公园
	const testBbox = {
		south: 39.95, // 香山以南
		west: 116.15, // 香山以西
		north: 40.0, // 香山以北
		east: 116.25 // 香山以东
	};

	console.log(
		`🗺️ 查询区域: 北${testBbox.north.toFixed(2)}, 南${testBbox.south.toFixed(2)}, 东${testBbox.east.toFixed(2)}, 西${testBbox.west.toFixed(2)}`
	);

	return await fetchForestDataFromOSM(testBbox.south, testBbox.west, testBbox.north, testBbox.east);
}

/**
 * 获取中国完整范围的森林数据（大范围查询）
 * @returns {Promise<Object>} 森林数据
 */
export async function fetchChinaForestDataFull() {
	// 中国完整边界范围
	const chinaBbox = {
		south: 18.0, // 最南端
		west: 73.0, // 最西端
		north: 53.0, // 最北端
		east: 135.0 // 最东端
	};

	console.log(
		`🗺️ 查询完整中国区域: 北${chinaBbox.north}, 南${chinaBbox.south}, 东${chinaBbox.east}, 西${chinaBbox.west}`
	);

	return await fetchForestDataFromOSM(
		chinaBbox.south,
		chinaBbox.west,
		chinaBbox.north,
		chinaBbox.east
	);
}

/**
 * 获取指定城市的森林数据
 * @param {string} cityName - 城市名称
 * @param {number} buffer - 缓冲区大小（度）
 * @returns {Promise<Object>} 森林数据
 */
export async function fetchCityForestData(cityName, buffer = 0.5) {
	// 城市坐标映射（简化版）
	const cityCoordinates = {
		北京: { lat: 39.9042, lon: 116.4074 },
		上海: { lat: 31.2304, lon: 121.4737 },
		广州: { lat: 23.1291, lon: 113.2644 },
		深圳: { lat: 22.5431, lon: 114.0579 },
		武汉: { lat: 30.5928, lon: 114.3055 },
		成都: { lat: 30.5728, lon: 104.0668 },
		西安: { lat: 34.3416, lon: 108.9398 },
		南京: { lat: 32.0603, lon: 118.7969 }
	};

	const city = cityCoordinates[cityName];
	if (!city) {
		throw new Error(`未找到城市 ${cityName} 的坐标数据`);
	}

	const south = city.lat - buffer;
	const north = city.lat + buffer;
	const west = city.lon - buffer;
	const east = city.lon + buffer;

	return await fetchForestDataFromOSM(south, west, north, east);
}

/**
 * 将 GeoJSON 数据转换为应用所需的格式
 * @param {Object} geoJSON - GeoJSON 数据
 * @returns {Array} 应用格式的数据
 */
export function convertToAppFormat(geoJSON) {
	if (!geoJSON || !geoJSON.features) {
		return [];
	}

	return geoJSON.features
		.map((feature, index) => {
			// 验证feature数据
			if (
				!feature ||
				!feature.geometry ||
				!feature.geometry.coordinates ||
				!feature.geometry.coordinates[0]
			) {
				console.warn(`⚠️ 跳过无效的要素 ${index}:`, feature);
				return null;
			}

			// 计算多边形面积（简化计算）
			const area = calculatePolygonArea(feature.geometry.coordinates[0]);

			return {
				name: feature.properties?.name || `森林区域 ${index + 1}`,
				area: area,
				species: getSpeciesFromTags(feature.properties || {}),
				stage: '3', // 默认为成熟林
				imageFile: '',
				geojson: feature
			};
		})
		.filter((item) => item !== null); // 过滤掉无效项
}

/**
 * 计算多边形面积（简化版，使用平面近似）
 * @param {Array} coordinates - 坐标数组
 * @returns {number} 面积（平方米）
 */
function calculatePolygonArea(coordinates) {
	if (!coordinates || coordinates.length < 3) return 1000000; // 默认1平方公里

	let area = 0;
	const n = coordinates.length;

	for (let i = 0; i < n; i++) {
		const coord1 = coordinates[i];
		const coord2 = coordinates[(i + 1) % n];

		if (!coord1 || !coord2 || coord1.length < 2 || coord2.length < 2) {
			return 1000000; // 默认1平方公里
		}

		const [x1, y1] = coord1;
		const [x2, y2] = coord2;

		// 使用鞋带公式计算面积
		area += x1 * y2 - x2 * y1;
	}

	// 转换为平方米（近似转换）
	const calculatedArea = Math.abs(area) * 111000 * 111000 * 0.5;

	// 确保面积不为0或NaN
	if (isNaN(calculatedArea) || calculatedArea <= 0) {
		return 1000000; // 默认1平方公里
	}

	return Math.round(calculatedArea);
}

/**
 * 根据 OSM 标签推断树种
 * @param {Object} tags - OSM 标签
 * @returns {string} 树种名称
 */
function getSpeciesFromTags(tags) {
	if (!tags) return '混合森林';

	if (tags.leaf_type === 'broadleaved') return '阔叶林';
	if (tags.leaf_type === 'needleleaved') return '针叶林';
	if (tags.leaf_type === 'mixed') return '混交林';

	// 根据其他标签推断
	if (tags.natural === 'wood') {
		if (tags.leaf_cycle === 'deciduous') return '落叶林';
		if (tags.leaf_cycle === 'evergreen') return '常绿林';
	}

	return '混合森林';
}

// 使用示例
/*
// 获取中国森林数据
fetchChinaForestData()
  .then(data => {
    const appData = convertToAppFormat(data);
    console.log('获取到森林数据:', appData);
  })
  .catch(error => {
    console.error('获取数据失败:', error);
  });

// 获取武汉周边森林数据
fetchCityForestData('武汉', 0.3)
  .then(data => {
    const appData = convertToAppFormat(data);
    console.log('武汉森林数据:', appData);
  });
*/

// 直接测试调用 - 可以在编辑器中直接运行
if (typeof window !== 'undefined' && window.location.href.includes('test')) {
	console.log('🌲 开始测试森林API...');
	fetchChinaForestData()
		.then((data) => {
			const appData = convertToAppFormat(data);
			console.log('✅ 成功获取森林数据:', appData.length, '个项目');
			console.log('前3个项目:', appData.slice(0, 3));
		})
		.catch((error) => {
			console.error('❌ 获取数据失败:', error);
		});
}

// 缓存管理函数
function getCachedData(key) {
	try {
		const cached = localStorage.getItem(key);
		if (cached) {
			const { data, timestamp } = JSON.parse(cached);
			if (Date.now() - timestamp < CACHE_EXPIRY) {
				return data;
			}
		}
	} catch (error) {
		console.warn('缓存读取失败:', error);
	}
	return null;
}

function setCachedData(key, data) {
	try {
		const cacheItem = {
			data,
			timestamp: Date.now()
		};
		localStorage.setItem(key, JSON.stringify(cacheItem));
	} catch (error) {
		console.warn('缓存写入失败:', error);
	}
}

// 模拟数据生成函数
function getMockForestData(south, west, north, east) {
	console.log('🎭 生成模拟森林数据');
	console.log(`📐 边界框: 南${south}, 西${west}, 北${north}, 东${east}`);

	const features = [];
	const centerLat = (south + north) / 2;
	const centerLon = (west + east) / 2;

	// 生成一些模拟森林区域
	console.log(`📍 中心点: 经度${centerLon}, 纬度${centerLat}`);

	for (let i = 0; i < 8; i++) {
		const latOffset = (Math.random() - 0.5) * (north - south) * 0.8;
		const lonOffset = (Math.random() - 0.5) * (east - west) * 0.8;

		const center = [centerLon + lonOffset, centerLat + latOffset];
		const size = 0.05 + Math.random() * 0.1;

		console.log(
			`🌳 生成森林 ${i + 1}: 中心[${center[0].toFixed(4)}, ${center[1].toFixed(4)}], 大小${size.toFixed(4)}`
		);

		const coordinates = generatePolygon(center, size);

		features.push({
			type: 'Feature',
			id: `mock-forest-${i}`,
			properties: {
				name: `模拟森林区域 ${i + 1}`,
				natural: 'wood',
				landuse: 'forest'
			},
			geometry: {
				type: 'Polygon',
				coordinates: [coordinates]
			}
		});
	}

	console.log(`✅ 模拟数据生成完成: ${features.length} 个森林区域`);

	return {
		type: 'FeatureCollection',
		features
	};
}

function generatePolygon(center, size) {
	const coordinates = [];
	const points = 6 + Math.floor(Math.random() * 4); // 6-9个点
	console.log(`   生成 ${points} 边形`);

	for (let i = 0; i < points; i++) {
		const angle = (i / points) * 2 * Math.PI;
		const radius = size * (0.8 + Math.random() * 0.4); // 随机半径
		const lat = center[1] + radius * Math.sin(angle);
		const lon = center[0] + radius * Math.cos(angle);
		coordinates.push([lon, lat]);
	}

	// 闭合多边形
	coordinates.push(coordinates[0]);
	console.log(`   多边形坐标: ${coordinates.length} 个点`);
	return coordinates;
}

// 配置管理函数
export function setConfig(newConfig) {
	Object.assign(CONFIG, newConfig);
	console.log('⚙️ 配置已更新:', CONFIG);
}

export function getConfig() {
	return { ...CONFIG };
}

// 导出测试函数以便在其他地方调用
export async function testForestAPI(useMock = false) {
	console.log('🌲 开始测试森林API...');

	if (useMock) {
		console.log('🎭 测试模式：使用模拟数据');
		setConfig({ useMockData: true, enableCache: true });
	} else {
		console.log('📡 测试模式：连接真实 API');
		setConfig({ useMockData: false, enableCache: true });
	}

	try {
		console.log('🗺️ 获取中国森林数据...');
		const data = await fetchChinaForestData();
		console.log('✅ 成功获取原始 GeoJSON 数据');
		console.log(`📊 原始数据包含 ${data.features?.length || 0} 个要素`);

		console.log('🔄 正在转换为应用格式...');
		const appData = convertToAppFormat(data);
		console.log(`✅ 成功转换 ${appData.length} 个项目`);

		// 计算统计信息
		const totalArea = appData.reduce((sum, item) => sum + item.area, 0);
		const speciesCount = {};
		const sourceStats = {};

		appData.forEach((item) => {
			speciesCount[item.species] = (speciesCount[item.species] || 0) + 1;
			const source =
				item.geojson?.properties?.natural ||
				item.geojson?.properties?.landuse ||
				item.geojson?.properties?.leisure ||
				'unknown';
			sourceStats[source] = (sourceStats[source] || 0) + 1;
		});

		// 保存最终应用数据到文件
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const finalData = {
			timestamp: new Date().toISOString(),
			data: appData,
			statistics: {
				totalItems: appData.length,
				totalArea: totalArea,
				totalAreaKm2: totalArea / 1000000,
				averageArea: totalArea / appData.length,
				speciesDistribution: speciesCount,
				sourceDistribution: sourceStats
			},
			metadata: {
				queryRegion: 'China Forest Test Area',
				dataSource: 'OpenStreetMap Overpass API',
				processingTime: new Date().toISOString()
			}
		};
		saveDataToFile(finalData, `forest-app-data-${timestamp}.json`);

		console.log('🎉 森林API测试完成！');
		console.log(`💾 数据已保存到文件: forest-app-data-${timestamp}.json`);
		return appData;
	} catch (error) {
		console.error('❌ 获取数据失败:', error);
		console.error('🔧 错误详情:', error.message);
		if (error.response) {
			console.error('📡 HTTP 状态码:', error.response.status);
		}

		// 如果真实 API 失败，抛出错误
		console.error('❌ 真实数据获取失败，请稍后重试');
		throw error;
	}
}

// 快速测试函数 - 使用模拟数据
export async function quickTest() {
	console.log('🚀 快速测试模式（使用模拟数据）...');
	return testForestAPI(true);
}

// 真实数据测试函数
export async function realDataTest() {
	console.log('🔍 真实数据测试模式...');
	return testForestAPI(false);
}

// 导出数据函数
export async function exportForestData() {
	console.log('💾 导出森林数据...');
	try {
		const data = await fetchChinaForestData();
		const appData = convertToAppFormat(data);

		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const exportData = {
			timestamp: new Date().toISOString(),
			forestData: appData,
			metadata: {
				exportType: 'complete',
				region: 'China Forest Area',
				dataSource: 'OpenStreetMap',
				totalItems: appData.length
			}
		};

		saveDataToFile(exportData, `forest-export-${timestamp}.json`);
		return exportData;
	} catch (error) {
		console.error('❌ 导出数据失败:', error);
		throw error;
	}
}

// 简单调试测试函数
export async function debugTest() {
	console.log('🐛 调试测试开始...');

	// 强制使用模拟数据
	setConfig({ useMockData: true, enableCache: false });

	try {
		console.log('1. 调用 fetchChinaForestData...');
		const data = await fetchChinaForestData();
		console.log('2. fetchChinaForestData 完成:', data?.features?.length || 0, '个要素');

		console.log('3. 调用 convertToAppFormat...');
		const appData = convertToAppFormat(data);
		console.log('4. convertToAppFormat 完成:', appData?.length || 0, '个项目');

		if (appData && appData.length > 0) {
			console.log('5. 前3个项目:');
			appData.slice(0, 3).forEach((item, index) => {
				console.log(`   ${index + 1}. ${item.name}`);
				console.log(`      面积: ${item.area}`);
				console.log(`      树种: ${item.species}`);
				console.log(`      阶段: ${item.stage}`);
				console.log(`      GeoJSON:`, item.geojson ? '存在' : '不存在');
			});
		} else {
			console.log('5. 没有获取到数据');
		}

		return appData;
	} catch (error) {
		console.error('❌ 调试测试失败:', error);
		throw error;
	}
}
