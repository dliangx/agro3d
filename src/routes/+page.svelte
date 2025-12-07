<script>
	import { onMount } from 'svelte';
	import createMap from '$lib/Map.js';
	import LandAttribute from '$lib/components/land_attribute.svelte';
	import TreeMenu from '$lib/components/tree_menu.svelte';
	import { forestData } from '$lib/data/forestData.js';

	/**
	 * MapTiler Map 类型别名（用于 JSDoc 提示）
	 * @typedef {import('@maptiler/sdk').Map} MapTilerMap
	 */

	/** @type {MapTilerMap | null} */
	let mapInstance = $state(null);

	// Svelte 5 reactive state
	let showModal = $state(false);
	let drawnGeoJSON = $state(null);
	let drawInstance = $state(/** @type {any} */ (null));

	// Test data for tree menu - using real forest data from forestData.js
	const testTreeData = forestData;

	/**
	 * 在地图上绘制多边形
	 * @param {Object} geojson - GeoJSON 数据
	 */
	function drawPolygon(geojson) {
		if (!mapInstance || !geojson) return;

		console.log('drawPolygon called with:', geojson);

		// 清除现有的绘制图层
		if (mapInstance.getLayer('highlight-polygon')) {
			console.log('Removing existing highlight-polygon layer');
			mapInstance.removeLayer('highlight-polygon');
		}
		if (mapInstance.getLayer('highlight-polygon-outline')) {
			console.log('Removing existing highlight-polygon-outline layer');
			mapInstance.removeLayer('highlight-polygon-outline');
		}
		if (mapInstance.getSource('highlight-polygon')) {
			console.log('Removing existing highlight-polygon source');
			mapInstance.removeSource('highlight-polygon');
		}

		// 添加新的多边形图层
		try {
			mapInstance.addSource('highlight-polygon', {
				type: 'geojson',
				data: geojson
			});
			console.log('Successfully added highlight-polygon source');
		} catch (error) {
			console.error('Error adding source:', error);
			return;
		}

		try {
			mapInstance.addLayer({
				id: 'highlight-polygon',
				type: 'fill',
				source: 'highlight-polygon',
				paint: {
					'fill-color': '#ff0000',
					'fill-opacity': 0.3
				}
			});
			console.log('Successfully added highlight-polygon layer');
		} catch (error) {
			console.error('Error adding highlight-polygon layer:', error);
		}

		try {
			mapInstance.addLayer({
				id: 'highlight-polygon-outline',
				type: 'line',
				source: 'highlight-polygon',
				paint: {
					'line-color': '#ff0000',
					'line-width': 2
				}
			});
			console.log('Successfully added highlight-polygon-outline layer');
		} catch (error) {
			console.error('Error adding highlight-polygon-outline layer:', error);
		}
	}

	onMount(() => {
		mapInstance = createMap('map');

		// Wait for map to load then get draw instance
		mapInstance.on('load', () => {
			if (!mapInstance) return;

			// Get the draw control instance from map's internal controls
			const controls = mapInstance._controls || [];
			drawInstance = controls.find(
				(/** @type {any} */ control) => control?.constructor?.name === 'MapboxDraw'
			);

			if (drawInstance) {
				// Listen for draw events
				mapInstance.on('draw.create', (/** @type {any} */ event) => {
					const features = event.features;
					console.log(features);
					if (features && features.length > 0) {
						drawnGeoJSON = features[0];
						showModal = true;
					}
				});

				mapInstance.on('draw.update', (/** @type {any} */ event) => {
					const features = event.features;
					if (features && features.length > 0) {
						drawnGeoJSON = features[0];
					}
				});

				mapInstance.on('draw.delete', () => {
					drawnGeoJSON = null;
				});
			}
		});

		return () => {
			// cleanup map when the component is destroyed
			if (mapInstance && typeof mapInstance.remove === 'function') {
				mapInstance.remove();
			}
		};
	});

	function closeModal() {
		showModal = false;
		drawnGeoJSON = null;
	}

	function removeDrawnPolygon() {
		if (drawInstance && typeof drawInstance.deleteAll === 'function') {
			drawInstance.deleteAll();
		}
	}

	function handleFormSubmit(/** @type {CustomEvent} */ event) {
		// Handle form submission if needed
		console.log('Form submitted with data:', event.detail);
		removeDrawnPolygon();
		closeModal();
	}

	// Function to handle form submission from LandAttribute component
	function handleLandAttributeSubmit(/** @type {CustomEvent} */ event) {
		handleFormSubmit(event);
	}
</script>

<div id="container">
	<div id="map"></div>
	<div id="scene"></div>
	<TreeMenu items={testTreeData} {mapInstance} {drawPolygon} />
</div>

{#if showModal}
	<div
		class="modal-overlay"
		onkeydown={(e) => e.key === 'Escape' && closeModal()}
		role="dialog"
		aria-modal="true"
		aria-label="地块属性表单"
		tabindex="0"
	>
		<div class="modal-content" role="document">
			<div class="modal-header">
				<h2>地块属性</h2>
				<button class="close-button" onclick={closeModal} aria-label="关闭">×</button>
			</div>
			<div class="modal-body">
				<LandAttribute geojson={drawnGeoJSON} onsubmit={handleLandAttributeSubmit} />
			</div>
		</div>
	</div>
{/if}

<style>
	:global(body) {
		margin: 0;
	}
	#map {
		width: 100%;
		height: 100vh;
		position: absolute;
	}
	#scene {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		transition: opacity 0.8s ease;
	}
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.8); /* 黑底 */
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal-content {
		background: #000; /* 黑底 */
		color: #fff; /* 白字 */
		border-radius: 8px;
		padding: 0;
		max-width: 90vw;
		max-height: 90vh;
		overflow: auto;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px;
		border-bottom: 1px solid #333;
		background: #000;
	}

	.modal-header h2 {
		margin: 0;
		color: #fff;
		font-size: 1.5rem;
	}

	.close-button {
		background: none;
		border: none;
		color: #fff;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0;
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
	}

	.close-button:hover {
		background: #333;
	}

	.modal-body {
		padding: 20px;
		background: #000;
	}
</style>
