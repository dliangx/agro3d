// @ts-nocheck

// Global Forest Watch API 请求脚本
// 用于获取全球森林覆盖和变化数据

/**
 * 获取 GFW 森林覆盖数据
 * @param {number} lat - 纬度
 * @param {number} lng - 经度
 * @param {number} radius - 半径（公里）
 * @returns {Promise<Object>} 森林覆盖数据
 */
export async function fetchGFWForestCover(lat, lng, radius = 10) {
	const url = `https://data-api.globalforestwatch.org/forest-cover`;

	const params = {
		lat: lat,
		lng: lng,
		radius: radius,
		year: new Date().getFullYear() - 1 // 去年的数据
	};

	try {
		const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`GFW API error: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Error fetching GFW forest cover:', error);
		throw error;
	}
}

/**
 * 获取森林损失数据
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
	const url = `https://data-api.globalforestwatch.org/forest-loss`;

	const params = {
		geostore: `${south},${west},${north},${east}`,
		period: `${startYear}-${endYear}`,
		threshold: 30 // 置信度阈值
	};

	try {
		const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`GFW API error: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Error fetching GFW forest loss:', error);
		throw error;
	}
}

/**
 * 获取森林增益数据
 * @param {number} south - 南边界
 * @param {number} west - 西边界
 * @param {number} north - 北边界
 * @param {number} east - 东边界
 * @returns {Promise<Object>} 森林增益数据
 */
export async function fetchGFWForestGain(south, west, north, east) {
	const url = `https://data-api.globalforestwatch.org/forest-gain`;

	const params = {
		geostore: `${south},${west},${north},${east}`,
		period: '2000-2020' // GFW 增益数据的时间范围
	};

	try {
		const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`GFW API error: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Error fetching GFW forest gain:', error);
		throw error;
	}
}

/**
 * 获取生物多样性热点区域
 * @param {number} south - 南边界
 * @param {number} west - 西边界
 * @param {number} north - 北边界
 * @param {number} east - 东边界
 * @returns {Promise<Object>} 生物多样性数据
 */
export async function fetchGFWBiodiversity(south, west, north, east) {
	const url = `https://data-api.globalforestwatch.org/biodiversity`;

	const params = {
		geostore: `${south},${west},${north},${east}`,
		layers: ['species_richness', 'protected_areas'] // 请求的图层
	};

	try {
		const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`GFW API error: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Error fetching GFW biodiversity:', error);
		throw error;
	}
}

/**
 * 获取碳储量数据
 * @param {number} lat - 纬度
 * @param {number} lng - 经度
 * @param {number} radius - 半径（公里）
 * @returns {Promise<Object>} 碳储量数据
 */
export async function fetchGFWCarbon(lat, lng, radius = 10) {
	const url = `https://data-api.globalforestwatch.org/carbon`;

	const params = {
		lat: lat,
		lng: lng,
		radius: radius,
		year: new Date().getFullYear() - 1
	};

	try {
		const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`GFW API error: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Error fetching GFW carbon data:', error);
		throw error;
	}
}

/**
 * 获取火灾风险数据
 * @param {number} south - 南边界
 * @param {number} west - 西边界
 * @param {number} north - 北边界
 * @param {number} east - 东边界
 * @returns {Promise<Object>} 火灾风险数据
 */
export async function fetchGFWFireRisk(south, west, north, east) {
	const url = `https://data-api.globalforestwatch.org/fire-risk`;

	const params = {
		geostore: `${south},${west},${north},${east}`,
		period: '7d' // 7天内的数据
	};

	try {
		const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`GFW API error: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Error fetching GFW fire risk:', error);
		throw error;
	}
}

/**
 * 获取中国主要森林区域的数据
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
			console.error(`Error fetching data for ${region}:`, error);
			results[region] = { error: error.message };
		}
	}

	return results;
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

	return appData;
}

// 使用示例
/*
// 获取中国森林数据
fetchChinaGFWData()
  .then(data => {
    console.log('GFW 中国森林数据:', data);
    const appData = convertGFWToAppFormat(data['东北林区']);
    console.log('应用格式数据:', appData);
  })
  .catch(error => {
    console.error('获取 GFW 数据失败:', error);
  });

// 获取特定区域的森林覆盖
fetchGFWForestCover(30.5928, 114.3055, 50) // 武汉周边50公里
  .then(data => {
    console.log('武汉森林覆盖:', data);
  });
*/
