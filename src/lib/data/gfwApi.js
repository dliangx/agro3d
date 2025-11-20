// Global Forest Watch API 模拟数据脚本
// 用于测试森林覆盖和变化数据

// 文件保存功能
async function saveDataToFile(data, filename) {
	try {
		// 使用 ES 模块方式保存文件
		const fs = await import('fs');
		const path = await import('path');
		fs.writeFileSync(path.join(process.cwd(), filename), JSON.stringify(data, null, 2));

		return true;
	} catch {
		return false;
	}
}

/**
 * 获取模拟的 GFW 森林覆盖数据
 * @param {number} lat - 纬度
 * @param {number} lng - 经度
 * @param {number} radius - 半径（公里）
 * @returns {Promise<Object>} 森林覆盖数据
 */
export async function fetchGFWForestCover(lat, lng) {
	// 模拟 API 延迟
	await new Promise((resolve) => setTimeout(resolve, 500));

	return {
		data: [
			{
				area_ha: Math.random() * 500 + 100,
				forest_cover_percent: Math.random() * 50 + 30,
				year: new Date().getFullYear() - 1,
				geometry: {
					type: 'Polygon',
					coordinates: [
						[
							[lng - 0.1, lat - 0.1],
							[lng + 0.1, lat - 0.1],
							[lng + 0.1, lat + 0.1],
							[lng - 0.1, lat + 0.1],
							[lng - 0.1, lat - 0.1]
						]
					]
				}
			}
		]
	};
}

/**
 * 获取模拟的森林损失数据
 * @param {number} south - 南边界
 * @param {number} west - 西边界
 * @param {number} north - 北边界
 * @param {number} east - 东边界
 * @param {number} startYear - 开始年份
 * @param {number} endYear - 结束年份
 * @returns {Promise<Object>} 森林损失数据
 */
export async function fetchGFWForestLoss(
	south,
	west,
	north,
	east,
	startYear = 2000,
	endYear = new Date().getFullYear() - 1
) {
	await new Promise((resolve) => setTimeout(resolve, 300));

	const years = [];
	for (let year = startYear; year <= endYear; year++) {
		if (Math.random() > 0.7) {
			// 30% 的年份有损失数据
			years.push({
				year: year,
				loss_area_ha: Math.random() * 50 + 10,
				geometry: {
					type: 'Polygon',
					coordinates: [
						[
							[
								west + Math.random() * (east - west) * 0.5,
								south + Math.random() * (north - south) * 0.5
							],
							[
								west + Math.random() * (east - west) * 0.5 + 0.05,
								south + Math.random() * (north - south) * 0.5
							],
							[
								west + Math.random() * (east - west) * 0.5 + 0.05,
								south + Math.random() * (north - south) * 0.5 + 0.05
							],
							[
								west + Math.random() * (east - west) * 0.5,
								south + Math.random() * (north - south) * 0.5 + 0.05
							],
							[
								west + Math.random() * (east - west) * 0.5,
								south + Math.random() * (north - south) * 0.5
							]
						]
					]
				}
			});
		}
	}

	return {
		data: years
	};
}

/**
 * 获取模拟的森林增益数据
 * @param {number} south - 南边界
 * @param {number} west - 西边界
 * @param {number} north - 北边界
 * @param {number} east - 东边界
 * @returns {Promise<Object>} 森林增益数据
 */
export async function fetchGFWForestGain(south, west, north, east) {
	await new Promise((resolve) => setTimeout(resolve, 400));

	return {
		data: [
			{
				gain_area_ha: Math.random() * 20 + 5,
				period: '2000-2020',
				geometry: {
					type: 'Polygon',
					coordinates: [
						[
							[
								west + Math.random() * (east - west) * 0.3,
								south + Math.random() * (north - south) * 0.3
							],
							[
								west + Math.random() * (east - west) * 0.3 + 0.03,
								south + Math.random() * (north - south) * 0.3
							],
							[
								west + Math.random() * (east - west) * 0.3 + 0.03,
								south + Math.random() * (north - south) * 0.3 + 0.03
							],
							[
								west + Math.random() * (east - west) * 0.3,
								south + Math.random() * (north - south) * 0.3 + 0.03
							],
							[
								west + Math.random() * (east - west) * 0.3,
								south + Math.random() * (north - south) * 0.3
							]
						]
					]
				}
			}
		]
	};
}

/**
 * 获取模拟的生物多样性数据
 * @param {number} south - 南边界
 * @param {number} west - 西边界
 * @param {number} north - 北边界
 * @param {number} east - 东边界
 * @returns {Promise<Object>} 生物多样性数据
 */
export async function fetchGFWBiodiversity(south, west, north, east) {
	await new Promise((resolve) => setTimeout(resolve, 350));

	return {
		data: {
			species_richness: Math.random() * 100 + 50,
			protected_areas: Math.floor(Math.random() * 5) + 1,
			hotspots: [
				{
					name: '生物多样性热点区域',
					richness_score: Math.random() * 10 + 5,
					geometry: {
						type: 'Polygon',
						coordinates: [
							[
								[
									west + Math.random() * (east - west) * 0.7,
									south + Math.random() * (north - south) * 0.7
								],
								[
									west + Math.random() * (east - west) * 0.7 + 0.02,
									south + Math.random() * (north - south) * 0.7
								],
								[
									west + Math.random() * (east - west) * 0.7 + 0.02,
									south + Math.random() * (north - south) * 0.7 + 0.02
								],
								[
									west + Math.random() * (east - west) * 0.7,
									south + Math.random() * (north - south) * 0.7 + 0.02
								],
								[
									west + Math.random() * (east - west) * 0.7,
									south + Math.random() * (north - south) * 0.7
								]
							]
						]
					}
				}
			]
		}
	};
}

/**
 * 获取模拟的碳储量数据
 * @param {number} lat - 纬度
 * @param {number} lng - 经度
 * @param {number} radius - 半径（公里）
 * @returns {Promise<Object>} 碳储量数据
 */
export async function fetchGFWCarbon() {
	await new Promise((resolve) => setTimeout(resolve, 250));

	return {
		data: {
			carbon_stock_tons: Math.random() * 10000 + 5000,
			carbon_density: Math.random() * 50 + 100,
			year: new Date().getFullYear() - 1
		}
	};
}

/**
 * 获取模拟的火灾风险数据
 * @param {number} south - 南边界
 * @param {number} west - 西边界
 * @param {number} north - 北边界
 * @param {number} east - 东边界
 * @returns {Promise<Object>} 火灾风险数据
 */
export async function fetchGFWFireRisk(south, west, north, east) {
	await new Promise((resolve) => setTimeout(resolve, 200));

	return {
		data: {
			fire_risk_level: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
			active_fires: Math.floor(Math.random() * 3),
			risk_areas: [
				{
					risk_score: Math.random() * 10,
					geometry: {
						type: 'Polygon',
						coordinates: [
							[
								[
									west + Math.random() * (east - west) * 0.8,
									south + Math.random() * (north - south) * 0.8
								],
								[
									west + Math.random() * (east - west) * 0.8 + 0.01,
									south + Math.random() * (north - south) * 0.8
								],
								[
									west + Math.random() * (east - west) * 0.8 + 0.01,
									south + Math.random() * (north - south) * 0.8 + 0.01
								],
								[
									west + Math.random() * (east - west) * 0.8,
									south + Math.random() * (north - south) * 0.8 + 0.01
								],
								[
									west + Math.random() * (east - west) * 0.8,
									south + Math.random() * (north - south) * 0.8
								]
							]
						]
					}
				}
			]
		}
	};
}

/**
 * 获取指定区域的森林数据并自动保存
 * @param {number} south - 南边界
 * @param {number} west - 西边界
 * @param {number} north - 北边界
 * @param {number} east - 东边界
 * @returns {Promise<Object>} 森林数据和应用格式数据
 */
export async function fetchRegionGFWData(south, west, north, east) {
	// 获取指定区域的森林数据
	const [cover, loss, biodiversity] = await Promise.all([
		fetchGFWForestCover((south + north) / 2, (west + east) / 2, 50),
		fetchGFWForestLoss(south, west, north, east),
		fetchGFWBiodiversity(south, west, north, east)
	]);

	const regionData = { cover, loss, biodiversity };
	const appData = convertGFWToAppFormat(regionData);

	// 计算统计信息
	const totalArea = appData.reduce((sum, item) => sum + item.area, 0);

	// 自动保存数据到文件
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const filename = `gfw-forest-data-${timestamp}.json`;

	const outputData = {
		timestamp: new Date().toISOString(),
		bbox: { south, west, north, east },
		data: appData,
		statistics: {
			totalAreas: appData.length,
			totalArea: totalArea,
			totalAreaKm2: totalArea / 1000000,
			averageArea: totalArea / appData.length
		},
		metadata: {
			source: 'Global Forest Watch API (模拟数据)',
			dataTypes: ['森林覆盖', '森林损失', '生物多样性'],
			processingTime: new Date().toISOString()
		}
	};

	saveDataToFile(outputData, filename);

	return {
		regionData,
		appData,
		statistics: outputData.statistics
	};
}

/**
 * 获取中国主要森林区域的模拟数据
 * @returns {Promise<Object>} 综合森林数据
 */
export async function fetchChinaGFWData() {
	// 中国主要森林区域边界
	const forestRegions = {
		东北林区: { south: 41.0, west: 120.0, north: 53.0, east: 135.0 },
		西南林区: { south: 21.0, west: 97.0, north: 34.0, east: 110.0 },
		东南林区: { south: 18.0, west: 108.0, north: 30.0, east: 122.0 },
		西北林区: { south: 35.0, west: 73.0, north: 50.0, east: 96.0 }
	};

	const results = {};

	for (const [region, bbox] of Object.entries(forestRegions)) {
		try {
			const [cover, loss, biodiversity] = await Promise.all([
				fetchGFWForestCover((bbox.south + bbox.north) / 2, (bbox.west + bbox.east) / 2, 100),
				fetchGFWForestLoss(bbox.south, bbox.west, bbox.north, bbox.east),
				fetchGFWBiodiversity(bbox.south, bbox.west, bbox.north, bbox.east)
			]);

			results[region] = {
				cover,
				loss,
				biodiversity,
				bbox
			};
		} catch (error) {
			results[region] = { error: error.message };
		}
	}
}

/**
 * 获取指定区域的 GFW 森林数据并自动保存
 * @param {number} south - 南边界
 * @param {number} west - 西边界
 * @param {number} north - 北边界
 * @param {number} east - 东边界
 * @param {string} dataTypes - 数据类型: 1=森林覆盖, 2=森林损失, 3=生物多样性
 * @returns {Promise<Object>} 森林数据
 */
export async function fetchGFWRegionData(south, west, north, east, dataTypes = '123') {
	// 根据数据类型决定获取哪些数据
	const promises = [];
	const selectedDataTypes = [];
	const regionData = {};

	if (dataTypes.includes('1')) {
		promises.push(fetchGFWForestCover((south + north) / 2, (west + east) / 2, 50));
		selectedDataTypes.push('森林覆盖');
	}
	if (dataTypes.includes('2')) {
		promises.push(fetchGFWForestLoss(south, west, north, east));
		selectedDataTypes.push('森林损失');
	}
	if (dataTypes.includes('3')) {
		promises.push(fetchGFWBiodiversity(south, west, north, east));
		selectedDataTypes.push('生物多样性');
	}

	// 获取数据
	const results = await Promise.all(promises);

	// 将结果分配到对应的字段
	let resultIndex = 0;
	if (dataTypes.includes('1')) {
		regionData.cover = results[resultIndex++];
	}
	if (dataTypes.includes('2')) {
		regionData.loss = results[resultIndex++];
	}
	if (dataTypes.includes('3')) {
		regionData.biodiversity = results[resultIndex++];
	}

	const appData = convertGFWToAppFormat(regionData);

	// 计算统计信息
	const totalArea = appData.reduce((sum, item) => sum + item.area, 0);

	// 自动保存数据到文件
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const filename = `gfw-forest-data-${timestamp}.json`;

	const outputData = {
		timestamp: new Date().toISOString(),
		bbox: { south, west, north, east },
		data: appData,
		statistics: {
			totalAreas: appData.length,
			totalArea: totalArea,
			totalAreaKm2: totalArea / 1000000,
			averageArea: totalArea / appData.length
		},
		metadata: {
			source: 'Global Forest Watch API (模拟数据)',
			dataTypes: selectedDataTypes,
			processingTime: new Date().toISOString()
		}
	};

	await saveDataToFile(outputData, filename);

	return appData;
}

/**
 * 将 GFW 数据转换为应用格式
 * @param {Object} gfwData - GFW 原始数据
 * @returns {Array} 应用格式的数据
 */
export function convertGFWToAppFormat(gfwData) {
	if (!gfwData || typeof gfwData !== 'object') {
		return [];
	}

	const appData = [];

	// 处理森林覆盖数据
	if (gfwData.cover && gfwData.cover.data) {
		gfwData.cover.data.forEach((item, index) => {
			appData.push({
				name: `森林覆盖区域 ${index + 1}`,
				area: item.area_ha * 10000, // 转换为平方米
				species: '混合森林',
				stage: '3',
				imageFile: '',
				geojson: {
					type: 'Feature',
					properties: {
						name: `GFW森林覆盖 ${index + 1}`,
						forest_cover: item.forest_cover_percent,
						year: item.year
					},
					geometry: item.geometry
				}
			});
		});
	}

	// 处理森林损失数据
	if (gfwData.loss && gfwData.loss.data) {
		gfwData.loss.data.forEach((item, index) => {
			appData.push({
				name: `森林损失区域 ${index + 1}`,
				area: item.loss_area_ha * 10000,
				species: '受损森林',
				stage: '1', // 受损状态
				imageFile: '',
				geojson: {
					type: 'Feature',
					properties: {
						name: `GFW森林损失 ${index + 1}`,
						loss_year: item.year,
						loss_area: item.loss_area_ha
					},
					geometry: item.geometry
				}
			});
		});
	}

	// 处理生物多样性热点区域
	if (gfwData.biodiversity && gfwData.biodiversity.data && gfwData.biodiversity.data.hotspots) {
		gfwData.biodiversity.data.hotspots.forEach((hotspot, index) => {
			appData.push({
				name: `生物多样性热点 ${index + 1}`,
				area: 1000000, // 默认面积
				species: '多样生态系统',
				stage: '3',
				imageFile: '',
				geojson: {
					type: 'Feature',
					properties: {
						name: `生物多样性热点 ${index + 1}`,
						richness_score: hotspot.richness_score,
						protected_areas: gfwData.biodiversity.data.protected_areas
					},
					geometry: hotspot.geometry
				}
			});
		});
	}

	return appData;
}

// 使用示例
if (import.meta.url === `file://${process.argv[1]}`) {
	// 从命令行参数获取坐标或使用默认值
	const south = process.argv[2] ? parseFloat(process.argv[2]) : 39.95;
	const west = process.argv[3] ? parseFloat(process.argv[3]) : 116.15;
	const north = process.argv[4] ? parseFloat(process.argv[4]) : 40.05;
	const east = process.argv[5] ? parseFloat(process.argv[5]) : 116.35;
	const dataTypes = process.argv[6] || '123';

	await fetchGFWRegionData(south, west, north, east, dataTypes)
		.then(() => {})
		.catch(() => {
			process.exit(1);
		});
}
