/**
 * @typedef {Object} GeoJSONFeature
 * @property {string} id
 * @property {string} type
 * @property {Object} properties
 * @property {Object} geometry
 * @property {string} geometry.type
 * @property {number[][][]} geometry.coordinates
 */

export class Geometry {
	/**
	 * 计算多边形的中心点（质心）
	 * @param {GeoJSONFeature} geojson - GeoJSON 对象
	 * @returns {[number, number] | null} 中心点坐标 [经度, 纬度]，如果无法计算返回 null
	 */
	static getPolygonCentroid(geojson) {
		if (!geojson || !geojson.geometry || geojson.geometry.type !== 'Polygon') {
			return null;
		}

		const coordinates = geojson.geometry.coordinates;
		if (!coordinates || coordinates.length === 0) {
			return null;
		}

		// 取第一个环（外环）计算中心点
		const ring = coordinates[0];
		if (ring.length < 3) {
			return null;
		}

		let area = 0;
		let centroidX = 0;
		let centroidY = 0;

		// 使用质心公式计算多边形中心点
		for (let i = 0; i < ring.length - 1; i++) {
			const [x1, y1] = ring[i];
			const [x2, y2] = ring[i + 1];

			const cross = x1 * y2 - x2 * y1;
			area += cross;
			centroidX += (x1 + x2) * cross;
			centroidY += (y1 + y2) * cross;
		}

		if (Math.abs(area) < 1e-9) {
			// 如果面积太小，使用简单平均
			let sumX = 0;
			let sumY = 0;
			for (let i = 0; i < ring.length - 1; i++) {
				sumX += ring[i][0];
				sumY += ring[i][1];
			}
			return [sumX / (ring.length - 1), sumY / (ring.length - 1)];
		}

		area /= 2;
		centroidX /= 6 * area;
		centroidY /= 6 * area;

		return [centroidX, centroidY];
	}

	/**
	 * 计算多边形的边界框
	 * @param {GeoJSONFeature} geojson - GeoJSON 对象
	 * @returns {[number, number, number, number] | null} 边界框 [minLng, minLat, maxLng, maxLat]，如果无法计算返回 null
	 */
	static getPolygonBoundingBox(geojson) {
		if (!geojson || !geojson.geometry || geojson.geometry.type !== 'Polygon') {
			return null;
		}

		const coordinates = geojson.geometry.coordinates;
		if (!coordinates || coordinates.length === 0) {
			return null;
		}

		const ring = coordinates[0];
		if (ring.length < 3) {
			return null;
		}

		let minLng = Infinity;
		let minLat = Infinity;
		let maxLng = -Infinity;
		let maxLat = -Infinity;

		for (const [lng, lat] of ring) {
			minLng = Math.min(minLng, lng);
			minLat = Math.min(minLat, lat);
			maxLng = Math.max(maxLng, lng);
			maxLat = Math.max(maxLat, lat);
		}

		return [minLng, minLat, maxLng, maxLat];
	}
}
