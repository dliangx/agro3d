<script>
	import TreeContent from './tree_content.svelte';
	import closeIcon from '$lib/assets/close.png';
	import menuIcon from '$lib/assets/menu.png';
	import { Geometry } from '$lib/util/geometry.js';

	let { items = [], mapInstance, drawPolygon } = $props();

	let expanded = $state(false);
	let activeIndex = $state(-1);
	let scrollTimeout = $state(150);

	function handleScroll(e) {
		// 清除之前的超时
		if (scrollTimeout) {
			clearTimeout(scrollTimeout);
		}

		// 设置新的超时 - 防抖 150ms
		scrollTimeout = setTimeout(() => {
			const container = e.target;
			const itemElements = container.querySelectorAll('.content-item');
			const containerRect = container.getBoundingClientRect();
			const containerTop = containerRect.top;

			let closestIndex = -1;
			let closestDistance = Infinity;

			itemElements.forEach((item, index) => {
				const itemRect = item.getBoundingClientRect();
				const itemTop = itemRect.top;
				const distance = Math.abs(itemTop - containerTop - 50); // 50px offset from top

				if (distance < closestDistance) {
					closestDistance = distance;
					closestIndex = index;
				}
			});

			// 只有当索引真正改变时才更新
			if (closestIndex !== activeIndex) {
				activeIndex = closestIndex;

				// 如果滚动到新的项目，在地图上绘制对应的多边形
				if (closestIndex !== -1 && mapInstance && drawPolygon) {
					const item = items[closestIndex];
					console.log('Active index changed to:', closestIndex);
					console.log($state.snapshot(item));
					if (item && item.geojson) {
						// 绘制多边形
						drawPolygon(item.geojson);

						// 计算中心点和边界框并飞到此位置
						const centroid = Geometry.getPolygonCentroid(item.geojson);
						const bbox = Geometry.getPolygonBoundingBox(item.geojson);

						if (centroid && bbox) {
							// 根据边界框大小计算合适的缩放级别
							const [minLng, minLat, maxLng, maxLat] = bbox;
							const width = maxLng - minLng;
							const height = maxLat - minLat;
							const maxDimension = Math.max(width, height);

							// 根据多边形大小动态计算缩放级别
							let zoom;
							if (maxDimension > 1.0) {
								zoom = 7; // 非常大的区域
							} else if (maxDimension > 0.5) {
								zoom = 8; // 大区域
							} else if (maxDimension > 0.2) {
								zoom = 9; // 中等区域
							} else if (maxDimension > 0.1) {
								zoom = 10; // 小区域
							} else if (maxDimension > 0.05) {
								zoom = 11; // 非常小的区域
							} else if (maxDimension > 0.02) {
								zoom = 12; // 极小的区域
							} else if (maxDimension > 0.01) {
								zoom = 13; // 超小的区域
							} else {
								zoom = 14; // 最小的区域
							}

							mapInstance.flyTo({
								center: centroid,
								zoom: zoom,
								duration: 8000
							});
						}
					}
				}
			}
		}, 150);
	}
</script>

{#if !expanded}
	<div class="tree-menu">
		<button class="toggle-button" onclick={() => (expanded = !expanded)}>
			<img src={menuIcon} alt="menu" class="icon" />
		</button>
	</div>
{:else}
	<div class="tree-menu expanded">
		<button class="toggle-button" onclick={() => (expanded = !expanded)}>
			<img src={closeIcon} alt="close" class="icon" />
		</button>
		<ul class="content-list" onscroll={handleScroll}>
			{#each items as item, index (item.name)}
				<li class="content-item {activeIndex === index ? 'active' : ''}">
					<TreeContent {...item} />
				</li>
			{/each}
		</ul>
	</div>
{/if}

<style>
	.toggle-button {
		position: absolute;
		top: 0;
		left: 0;
		background: none;
		border: none;
		cursor: pointer;
		padding: 8px;
		border-radius: 4px;
		background: rgba(0, 0, 0, 0.7);
	}

	.toggle-button:hover {
		background: rgba(0, 0, 0, 0.9);
	}

	.icon {
		width: 24px;
		height: 24px;
		display: block;
	}
	.expanded {
		position: fixed;
		top: 0;
		left: 0;
		width: 250px;
		height: 100vh;
		background: rgba(0, 0, 0, 0.8);
		z-index: 1000;
		overflow: hidden;
	}

	.content-list {
		list-style: none;
		padding: 0;

		display: flex;
		flex-direction: column;
		gap: 20px;
		align-items: flex-start;
		color: #fff;
		height: 100vh;
		overflow-y: auto;
		overflow-x: hidden;
		scrollbar-width: none;
		-ms-overflow-style: none;
		padding-bottom: calc(100vh - 400px);
	}

	.content-list::-webkit-scrollbar {
		display: none;
	}

	.content-item {
		width: 100%;
		max-width: 600px;
		transition: all 0.3s ease;
	}

	.content-item.active {
		background: rgba(255, 255, 255, 0.1);
	}
</style>
