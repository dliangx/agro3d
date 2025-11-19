<script>
	import treeDefault from '$lib/assets/tree_default.png';
	/** @type {import('$lib/types/TreeProps').TreeProps} */
	let {
		name = '',
		area = 0.0,
		species = '',
		imageFile = '',
		geojson = null,
		stage = ''
	} = $props();
</script>

<div class="tree-content">
	<img src={imageFile || treeDefault} alt="Tree" />
	<h2>{name}</h2>
	<div class="info-row">
		<span class="label">Area:</span>
		<span class="value">{area} m²</span>
	</div>
	<div class="info-row">
		<span class="label">Species:</span>
		<span class="value">{species}</span>
	</div>
	<div class="info-row">
		<span class="label">Stage:</span>
		<span class="value">{stage}</span>
	</div>
	{#if geojson}
		<div class="geojson">
			<h3>GeoJSON</h3>
			<pre>{JSON.stringify(geojson, null, 2)}</pre>
		</div>
	{/if}
</div>

<style>
	.tree-content {
		padding: 20px;
		text-align: left;
		line-height: 1.6;

		background: rgba(255, 255, 255, 0.05);
	}

	.tree-content img {
		max-width: 200px;
		max-height: 150px;
		object-fit: cover;
		border-radius: 8px;
		margin-bottom: 15px;
	}

	.tree-content h2 {
		margin: 10px 0;
		font-size: 1.4rem;
		text-align: center;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 8px 0;
		padding: 4px 0;
	}

	.label {
		font-weight: 600;
		text-align: left;
		flex: 1;
	}

	.value {
		text-align: center;
		flex: 1;
	}

	.geojson {
		margin-top: 15px;
		padding: 10px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 6px;
	}

	.geojson h3 {
		margin: 0 0 10px 0;
		font-size: 1.1rem;
	}

	.geojson pre {
		font-size: 0.9rem;
		text-align: left;
		overflow-x: auto;
		white-space: pre-wrap;
		word-wrap: break-word;
	}
</style>
