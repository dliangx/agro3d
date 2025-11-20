// @ts-nocheck

// Node.js 兼容的 fetch
const fetch = globalThis.fetch || (await import('node-fetch')).default;

// 文件保存功能
async function saveDataToFile(data, filename) {
	try {
		// 使用 ES 模块方式保存文件
		const fs = await import('fs');
		const path = await import('path');
		fs.writeFileSync(path.join(process.cwd(), filename), JSON.stringify(data, null, 2));
		console.log(`💾 数据已保存到文件: ${filename}`);
		return true;
	} catch (error) {
		console.error('保存文件失败:', error);
		return false;
	}
}

// 配置选项
const CONFIG = {
	retryEndpoints: true
};

// Node.js 兼容的 localStorage
const localStorage = {
	getItem: (key) => {
		if (typeof process !== 'undefined' && process.versions && process.versions.node) {
			return null; // Node.js 环境不使用缓存
		}
		return globalThis.localStorage?.getItem(key);
	},
	setItem: (key, value) => {
		if (typeof process !== 'undefined' && process.versions && process.versions.node) {
			return; // Node.js 环境不使用缓存
		}
		globalThis.localStorage?.setItem(key, value);
	}
};

// 从OSM获取森林数据
async function fetchForestDataFromOSM(south, west, north, east) {
	console.log('🌲 开始从 OSM 获取森林数据...');
	console.log(`📐 查询区域: 南${south}, 西${west}, 北${north}, 东${east}`);

	const overpassQuery = `
    [out:json][timeout:90];
    (
      // 只查询多边形数据，避免LineString
      way["natural"="wood"](${south},${west},${north},${east});
      relation["natural"="wood"](${south},${west},${north},${east});
      way["landuse"="forest"](${south},${west},${north},${east});
      relation["landuse"="forest"](${south},${west},${north},${east});
      way["leisure"="nature_reserve"](${south},${west},${north},${east});
      relation["leisure"="nature_reserve"](${south},${west},${north},${east});
      way["leisure"="park"](${south},${west},${north},${east});
      relation["leisure"="park"](${south},${west},${north},${east});
    );
    (._;>;);
    out geom;
  `;

	const endpoints = CONFIG.retryEndpoints
		? [
				'https://overpass-api.de/api/interpreter',
				'https://overpass.kumi.systems/api/interpreter',
				'https://overpass.openstreetmap.fr/api/interpreter'
			]
		: ['https://overpass-api.de/api/interpreter'];

	let response;

	for (const endpoint of endpoints) {
		try {
			console.log(`🔄 尝试连接到: ${endpoint}`);
			response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: `data=${encodeURIComponent(overpassQuery)}`
			});

			if (response.ok) {
				console.log(`✅ 成功连接到: ${endpoint}`);
				break;
			} else if (response.status === 429) {
				console.warn(`⚠️ ${endpoint} 速率限制`);
				continue;
			} else if (response.status === 400) {
				console.warn(`⚠️ ${endpoint} 请求错误`);
				continue;
			} else {
				console.warn(`⚠️ ${endpoint} 返回错误: ${response.status}`);
				continue;
			}
		} catch (error) {
			console.warn(`⚠️ ${endpoint} 连接失败:`, error.message);
			continue;
		}
	}

	if (!response || !response.ok) {
		throw new Error('无法连接到 Overpass API，请稍后重试');
	}

	let data;
	try {
		const responseText = await response.text();

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

	const geoJSON = convertOSMToGeoJSON(data);
	console.log(`✅ 成功转换 ${geoJSON.features?.length || 0} 个要素`);

	return geoJSON;
}

// 转换OSM数据为GeoJSON格式
function convertOSMToGeoJSON(osmData) {
	const features = [];

	if (!osmData.elements || osmData.elements.length === 0) {
		console.warn('⚠️ OSM 数据为空');
		return {
			type: 'FeatureCollection',
			features: []
		};
	}

	console.log(`🔧 开始转换 OSM 数据: ${osmData.elements.length} 个元素`);

	osmData.elements.forEach((element) => {
		let geometry = null;
		const properties = {
			name: element.tags?.name || '',
			natural: element.tags?.natural || '',
			landuse: element.tags?.landuse || '',
			leisure: element.tags?.leisure || ''
		};

		if (element.type === 'node') {
			geometry = {
				type: 'Point',
				coordinates: [element.lon, element.lat]
			};
		} else if (element.type === 'way') {
			if (element.nodes && element.nodes.length > 0) {
				const coordinates = element.nodes
					.map((nodeId) => {
						const node = osmData.elements.find((el) => el.id === nodeId && el.type === 'node');
						return node ? [node.lon, node.lat] : null;
					})
					.filter((coord) => coord !== null);

				if (
					coordinates.length > 2 &&
					coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
					coordinates[0][1] === coordinates[coordinates.length - 1][1]
				) {
					geometry = {
						type: 'Polygon',
						coordinates: [coordinates]
					};
				} else {
					geometry = {
						type: 'LineString',
						coordinates
					};
				}
			}
		} else if (element.type === 'relation') {
			if (element.members) {
				const outerMembers = element.members.filter(
					(member) => member.role === 'outer' && member.type === 'way'
				);

				if (outerMembers.length > 0) {
					const outerWay = osmData.elements.find(
						(el) => el.id === outerMembers[0].ref && el.type === 'way'
					);

					if (outerWay && outerWay.nodes) {
						const coordinates = outerWay.nodes
							.map((nodeId) => {
								const node = osmData.elements.find((el) => el.id === nodeId && el.type === 'node');
								return node ? [node.lon, node.lat] : null;
							})
							.filter((coord) => coord !== null);

						if (coordinates.length > 2) {
							geometry = {
								type: 'Polygon',
								coordinates: [coordinates]
							};
						}
					}
				}
			}
		}

		if (geometry) {
			features.push({
				type: 'Feature',
				id: element.id,
				properties,
				geometry
			});
		}
	});

	return {
		type: 'FeatureCollection',
		features
	};
}

// 获取中国森林数据
export async function fetchChinaForestData(
	south = 39.95,
	west = 116.15,
	north = 40.05,
	east = 116.35
) {
	// 使用更具体的查询区域 - 北京香山、颐和园等森林区域
	const testBbox = {
		south,
		west,
		north,
		east
	};

	return await fetchForestDataFromOSM(testBbox.south, testBbox.west, testBbox.north, testBbox.east);
}

// 获取城市森林数据
export async function fetchCityForestData(cityName, radius = 0.3) {
	const cityCoordinates = {
		北京: { lat: 39.9042, lon: 116.4074 },
		上海: { lat: 31.2304, lon: 121.4737 },
		广州: { lat: 23.1291, lon: 113.2644 },
		深圳: { lat: 22.3193, lon: 114.1694 },
		武汉: { lat: 30.5928, lon: 114.3055 },
		成都: { lat: 30.5728, lon: 104.0668 },
		西安: { lat: 34.3416, lon: 108.9398 },
		南京: { lat: 32.0603, lon: 118.7969 }
	};

	const city = cityCoordinates[cityName];
	if (!city) {
		throw new Error(`不支持的城市: ${cityName}`);
	}

	const south = city.lat - radius;
	const north = city.lat + radius;
	const west = city.lon - radius;
	const east = city.lon + radius;

	return await fetchForestDataFromOSM(south, west, north, east);
}

// 转换为应用格式
export function convertToAppFormat(geoJSON) {
	if (!geoJSON || !geoJSON.features) {
		return [];
	}

	return geoJSON.features
		.map((feature, index) => {
			// 放宽条件，接受Polygon和有效的LineString
			if (
				!feature.geometry ||
				!feature.geometry.coordinates ||
				!feature.geometry.coordinates[0] ||
				feature.geometry.coordinates[0].length < 3
			) {
				return null;
			}

			// 只处理多边形数据
			if (feature.geometry.type !== 'Polygon') {
				return null;
			}

			const area = calculatePolygonArea(feature.geometry.coordinates[0]);

			return {
				name: feature.properties?.name || `森林区域 ${index + 1}`,
				area: area,
				species: getSpeciesFromTags(feature.properties),
				stage: '成熟',
				imageFile: '',
				geojson: feature
			};
		})
		.filter(Boolean);
}

// 计算多边形面积（使用球面坐标）
function calculatePolygonArea(coordinates) {
	if (!coordinates || coordinates.length < 3) return 10000;

	let area = 0;
	const n = coordinates.length;

	// 使用球面多边形面积公式
	for (let i = 0; i < n; i++) {
		const j = (i + 1) % n;
		const xi = coordinates[i][0];
		const yi = coordinates[i][1];
		const xj = coordinates[j][0];
		const yj = coordinates[j][1];

		// 将经纬度转换为弧度
		const xiRad = (xi * Math.PI) / 180;
		const yiRad = (yi * Math.PI) / 180;
		const xjRad = (xj * Math.PI) / 180;
		const yjRad = (yj * Math.PI) / 180;

		area += (xjRad - xiRad) * (2 + Math.sin(yiRad) + Math.sin(yjRad));
	}

	// 地球半径（米）
	const earthRadius = 6371000;
	const calculatedArea = Math.abs((area * earthRadius * earthRadius) / 2);

	// 确保面积不为零
	return calculatedArea > 0 ? calculatedArea : 10000;
}

// 从标签获取树种信息
function getSpeciesFromTags(properties) {
	if (properties.natural === 'wood') {
		if (properties.leaf_type === 'broadleaved') return '阔叶林';
		if (properties.leaf_type === 'needleleaved') return '针叶林';
		if (properties.leaf_type === 'mixed') return '混交林';
		if (properties.leaf_cycle === 'deciduous') return '落叶林';
		if (properties.leaf_cycle === 'evergreen') return '常绿林';
		return '天然林';
	}

	// 根据其他标签推断
	if (properties.type === 'multipolygon') return '复合林区';
	if (properties.protected === 'yes') return '保护林';
	if (properties.managed === 'yes') return '管理林';

	return '混合林';
}

// 测试函数
export async function testForestAPI(south = 39.95, west = 116.15, north = 40.05, east = 116.35) {
	const data = await fetchChinaForestData(south, west, north, east);
	const appData = convertToAppFormat(data);

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
	await saveDataToFile(finalData, `forest-app-data-${timestamp}.json`);

	return appData;
}

// 直接执行功能
if (import.meta.url === `file://${process.argv[1]}`) {
	// 从命令行参数获取坐标或使用默认值
	const south = process.argv[2] ? parseFloat(process.argv[2]) : 39.95;
	const west = process.argv[3] ? parseFloat(process.argv[3]) : 116.15;
	const north = process.argv[4] ? parseFloat(process.argv[4]) : 40.05;
	const east = process.argv[5] ? parseFloat(process.argv[5]) : 116.35;

	testForestAPI(south, west, north, east)
		.then((data) => {
			console.log('🎉 森林数据获取完成');
		})
		.catch((error) => {
			console.error('获取森林数据失败:', error);
			process.exit(1);
		});
}
