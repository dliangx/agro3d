<script>
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
	 *   onsubmit?: (event: CustomEvent) => void;
	 * }}
	 */
	const { geojson = null, action = '/api/land', method = 'POST', onsubmit } = $props();
	console.log(geojson);
	// 表单字段
	let parcelName = $state('');
	let species = $state('');
	let stage = $state(''); // Initialize stage as an empty string
	const speciesOptions = ['Apple', 'Pear', 'Olive', 'Mango', 'Pine', 'Other'];
	const stageOptions = ['Young', 'Mature', 'Old'];
	let imagePreview = $state('');
	let imageFile = $state(/** @type {File | null} */ (null));

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
			imageFile = file;
		} else {
			imagePreview = '';
			imageFile = null;
		}
	}

	/**
	 * 处理表单提交
	 * @param {Event} e
	 */
	function handleSubmit(e) {
		e.preventDefault();

		const formData = {
			name: parcelName,
			species: species,
			stage: stage,
			areaSqm: areaSqm,
			areaHa: areaHa,
			geojson: geojson,
			image: imageFile
		};

		// 调用父组件传递的onsubmit回调
		if (onsubmit) {
			onsubmit(
				new CustomEvent('submit', {
					detail: formData
				})
			);
		}
	}
</script>

<form class="form" {action} {method} onsubmit={handleSubmit}>
	<div class="row">
		<label for="parcelName">地块名称</label>
		<input
			id="parcelName"
			name="name"
			type="text"
			value={parcelName}
			oninput={(e) => (parcelName = /** @type {HTMLInputElement} */ (e.target).value)}
			placeholder="输入地块名称"
			required
		/>
	</div>

	<div class="row">
		<label for="species">树木种类</label>
		<select
			id="species"
			name="species"
			value={species}
			onchange={(e) => (species = /** @type {HTMLSelectElement} */ (e.target).value)}
			required
		>
			<option value="" disabled>选择树木种类</option>
			{#each speciesOptions as opt (opt)}
				<option value={opt}>{opt}</option>
			{/each}
		</select>
	</div>

	<div class="row">
		<label for="stage">生长阶段</label>
		<select
			id="stage"
			name="stage"
			value={stage}
			onchange={(e) => (stage = /** @type {HTMLSelectElement} */ (e.target).value)}
			required
		>
			<option value="" disabled>选择生长阶段</option>
			{#each stageOptions as opt (opt)}
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
		border: 1px solid #333;
		border-radius: 6px;
		background: #000;
		color: #fff;
		box-shadow: 0 1px 4px rgba(255, 255, 255, 0.1);
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
		color: #fff;
	}
	input[type='text'],
	select,
	input[readonly] {
		flex: 1;
		padding: 6px 8px;
		border: 1px solid #555;
		border-radius: 4px;
		background: #111;
		color: #fff;
	}
	input[type='text']:focus,
	select:focus,
	input[readonly]:focus {
		outline: 2px solid #666;
		outline-offset: 1px;
	}
	.image-preview {
		max-width: 180px;
		max-height: 120px;
		object-fit: cover;
		border-radius: 4px;
		border: 1px solid #555;
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
