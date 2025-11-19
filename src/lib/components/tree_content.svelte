<script>
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
	<img src={imageFile} alt="Tree" />
	<h2>{name}</h2>
	<p>Area: {area} m²</p>
	<p>Species: {species}</p>
	<p>Stage: {stage}</p>
	{#if geojson}
		<div class="geojson">
			<h3>GeoJSON</h3>
			<pre>{JSON.stringify(geojson, null, 2)}</pre>
		</div>
	{/if}
</div>
