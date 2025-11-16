// @ts-nocheck

import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

maptilersdk.config.apiKey = 'meJ81d0wIYGBeFSm8QV4';

export default function createMap(container) {
	// container can be an element or an id string
	const map = new maptilersdk.Map({
		container, // element or id
		style: maptilersdk.MapStyle.SATELLITE,
		center: [114.3055, 30.5928], // 武汉 (经度, 纬度)
		zoom: 2,
		projection: 'globe',
		terrain: true,
		terrainControl: true,
		minZoom: 2,
		maxZoom: 18,
		space: {
			preset: 'milkyway-bright'
		}
	});

	const draw = new MapboxDraw({
		displayControlsDefault: false,
		controls: {
			polygon: true,
			trash: true
		}
	});
	map.addControl(draw);

	const drawControls = document.querySelectorAll('.mapboxgl-ctrl-group.mapboxgl-ctrl');
	drawControls.forEach((elem) => {
		elem.classList.add('maplibregl-ctrl', 'maplibregl-ctrl-group');
	});

	return map;
}
