<script>
	// createEventDispatcher 已弃用 -> 使用表单 DOM 节点派发 CustomEvent

	import area from '@turf/area';

	/**
	 * GeoJSON 类型别名
	 * @typedef {import('geojson').GeoJSON} GeoJSON
	 */

	/**
	 * @type {{
	 *   geojson?: GeoJSON | null;
	 *   action?: string;
	 *   method?: 'GET' | 'POST';
	 * }}
	 */
	const { geojson = null, action = '/api/land', method = 'POST' } = $props();

	// 表单字段
	let parcelName = $state('');
	let species = $state('');
	const speciesOptions = ['Apple', 'Pear', 'Olive', 'Mango', 'Pine', 'Other'];

	let imagePreview = $state('');

	// 计算面积（平方米），使用 @turf/area，若无 geojson 则为 0
	/** @type {number} */

	const areaSqm = $derived(geojson ? Math.max(0, area(geojson)) : 0);
	const areaHa = $derived(areaSqm / 10000);

	/**
	 * 处理图片选择，生成本地预览
	 * @param {Event} e
	 */
	function onImageChange(e) {
		const input = /** @type {HTMLInputElement} */ (e.target);
		const file = input.files && input.files[0] ? input.files[0] : null;
		if (file) {
			imagePreview = URL.createObjectURL(file);
		} else {
			imagePreview = '';
		}
	}

	// 不再使用自定义派发，使用表单原生提交（action/method/enctype）
</script>

<form class="form" {action} {method}>
	<div class="row">
		<label for="parcelName">地块名称</label>
		<input
			id="parcelName"
			name="name"
			type="text"
			bind:value={parcelName}
			placeholder="输入地块名称"
			required
		/>
	</div>

	<div class="row">
		<label for="species">树木种类</label>
		<select id="species" name="species" bind:value={species} required>
			<option value="" disabled hidden>选择树木种类</option>
			{#each speciesOptions as opt (opt)}
				<option value={opt}>{opt}</option>
			{/each}
		</select>
	</div>

	<div class="row">
		<label for="area">土地面积 (ha)</label>
		<input
			id="area"
			name="areaHa_display"
			type="text"
			readonly
			value={areaHa ? areaHa.toFixed(4) : '0.0000'}
		/>
	</div>

	<!-- 隐藏字段用于服务器接受实际数值/geojson -->
	<input type="hidden" name="geojson" value={geojson ? JSON.stringify(geojson) : ''} />
	<input type="hidden" name="areaSqm" value={areaSqm} />
	<input type="hidden" name="areaHa" value={areaHa} />

	<div class="row">
		<label for="image">图片</label>
		<input id="image" name="image" type="file" accept="image/*" onchange={onImageChange} />
		{#if imagePreview}
			<img src={imagePreview} alt="preview" class="image-preview" />
		{/if}
	</div>

	<div style="text-align:right;">
		<button type="submit" disabled={!parcelName || !species || areaSqm <= 0}>提交</button>
	</div>
</form>

<style>
	.form {
		max-width: 640px;
		margin: 12px;
		padding: 12px;
		border: 1px solid #e6e6e6;
		border-radius: 6px;
		background: #fff;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
	}
	.row {
		display: flex;
		gap: 12px;
		margin-bottom: 10px;
		align-items: center;
	}
	label {
		width: 120px;
		font-weight: 600;
	}
	input[type='text'],
	select,
	input[readonly] {
		flex: 1;
		padding: 6px 8px;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
	.image-preview {
		max-width: 180px;
		max-height: 120px;
		object-fit: cover;
		border-radius: 4px;
		border: 1px solid #ddd;
	}
	button {
		padding: 8px 12px;
		border-radius: 4px;
		border: none;
		background: #0b74de;
		color: white;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
