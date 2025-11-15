<script>
	import { onMount } from 'svelte';
	import createMap from '$lib/Map.js';

	/**
	 * MapTiler Map 类型别名（用于 JSDoc 提示）
	 * @typedef {import('@maptiler/sdk').Map} MapTilerMap
	 */

	/** @type {MapTilerMap | null} */
	let mapInstance = null;

	onMount(() => {
		mapInstance = createMap('map');
		return () => {
			// cleanup map when the component is destroyed
			if (mapInstance && typeof mapInstance.remove === 'function') {
				mapInstance.remove();
			}
		};
	});
</script>

<style>
	:global(body) { margin: 0; }
	#map { width: 100%; height: 100vh; }
</style>

<div id="container">
    <div id="map"></div>
</div>

