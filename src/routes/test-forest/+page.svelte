<script>
	import { onMount } from 'svelte';
	import { testForestAPI, clearCache, exportForestData } from '$lib/data/forestApi.js';

	let testResult = $state(null);
	let loading = $state(false);
	let error = $state(null);
	let logs = $state([]);

	function addLog(message, type = 'info') {
		logs.push({ timestamp: new Date(), message, type });
	}

	async function runTest() {
		loading = true;
		error = null;
		testResult = null;
		logs = [];

		addLog('🌲 开始测试森林API...');

		try {
			const result = await testForestAPI();
			testResult = result;
			addLog(`✅ 测试成功！获取到 ${result?.length || 0} 个森林区域`, 'success');
		} catch (err) {
			error = err.message;
			addLog(`❌ 测试失败: ${err.message}`, 'error');
		} finally {
			loading = false;
		}
	}

	function handleClearCache() {
		try {
			clearCache();
			addLog('🗑️ 缓存已清除', 'success');
		} catch (err) {
			addLog(`❌ 清除缓存失败: ${err.message}`, 'error');
		}
	}

	async function handleExportData() {
		addLog('💾 开始导出数据...');
		try {
			await exportForestData();
			addLog('✅ 数据导出成功！文件已下载', 'success');
		} catch (err) {
			addLog(`❌ 数据导出失败: ${err.message}`, 'error');
		}
	}

	onMount(() => {
		addLog('📄 测试页面已加载，请点击"开始测试"按钮');
	});
</script>

<div class="test-container">
	<h1>🌲 森林API测试页面</h1>

	<div class="controls">
		<button onclick={runTest} disabled={loading} class="test-button">🌲 开始测试</button>
		<button onclick={handleClearCache} class="test-button clear">🗑️ 清除缓存</button>
		<button
			onclick={handleExportData}
			disabled={!testResult || testResult.length === 0}
			class="test-button export">💾 导出数据</button
		>
	</div>

	{#if loading}
		<div class="loading">⏳ 测试中...</div>
	{/if}

	{#if error}
		<div class="error-message">
			<h3>❌ 错误信息</h3>
			<pre>{error}</pre>
		</div>
	{/if}

	<div class="results">
		{#if testResult}
			<h3>📊 测试结果 ({testResult.length} 个项目)</h3>
			{#if testResult.length > 0}
				<div class="stats">
					<div class="stat-item">
						<span class="stat-label">总面积</span>
						<span class="stat-value"
							>{(testResult.reduce((sum, item) => sum + item.area, 0) / 1000000).toFixed(2)} km²</span
						>
					</div>
					<div class="stat-item">
						<span class="stat-label">平均面积</span>
						<span class="stat-value"
							>{(
								testResult.reduce((sum, item) => sum + item.area, 0) /
								testResult.length /
								1000000
							).toFixed(2)} km²</span
						>
					</div>
				</div>

				<div class="forest-list">
					{#each testResult as forest, index (index)}
						<div class="forest-item">
							<h4>{index + 1}. {forest.name}</h4>
							<div class="forest-details">
								<span
									>面积: {(forest.area / 1000000).toFixed(2)} km² ({forest.area.toLocaleString()} m²)</span
								>
								<span>树种: {forest.species}</span>
								<span>阶段: {forest.stage}</span>
								<span>ID: {forest.geojson?.id || 'N/A'}</span>
								<span>类型: {forest.geojson?.geometry?.type || 'N/A'}</span>
							</div>
							<div class="forest-properties">
								<strong>属性:</strong>
								<pre class="properties-json">{JSON.stringify(
										forest.geojson?.properties || {},
										null,
										2
									)}</pre>
							</div>
						</div>
					{/each}
				</div>

				<div class="raw-data">
					<h4>📋 完整原始数据</h4>
					<pre>{JSON.stringify(testResult, null, 2)}</pre>
				</div>
			{:else}
				<div class="no-data">
					<h4>⚠️ 没有获取到数据</h4>
					<p>可能的原因：</p>
					<ul>
						<li>查询区域没有森林数据</li>
						<li>API 速率限制</li>
						<li>网络连接问题</li>
						<li>数据转换失败</li>
					</ul>
					<p>请查看浏览器控制台获取详细错误信息</p>
				</div>
			{/if}
		{/if}
	</div>

	<div class="logs">
		<h3>📝 运行日志</h3>
		<div class="log-list">
			{#each logs as log (log.timestamp)}
				<div class="log-item {log.type}">
					<span class="timestamp">[{log.timestamp.toLocaleTimeString()}]</span>
					<span class="message">{log.message}</span>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.test-container {
		padding: 20px;
		max-width: 800px;
		margin: 0 auto;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	h1 {
		color: #2d5016;
		margin-bottom: 20px;
	}

	.controls {
		margin-bottom: 20px;
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}

	.test-button {
		background: #4a7c59;
		color: white;
		border: none;
		padding: 10px 20px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 16px;
		flex: 1;
		min-width: 120px;
	}

	.test-button.clear {
		background: #e74c3c;
	}

	.test-button.export {
		background: #27ae60;
	}

	.test-button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.test-button:hover:not(:disabled) {
		opacity: 0.8;
	}

	.loading {
		text-align: center;
		padding: 20px;
		font-size: 18px;
		color: #666;
	}

	.error-message {
		background: #fee;
		border: 1px solid #fcc;
		border-radius: 6px;
		padding: 15px;
		margin-bottom: 20px;
	}

	.error-message h3 {
		color: #c33;
		margin: 0 0 10px 0;
	}

	.results {
		margin-bottom: 30px;
	}

	.stats {
		display: flex;
		gap: 20px;
		margin-bottom: 20px;
		padding: 15px;
		background: #f8f9fa;
		border-radius: 8px;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.stat-label {
		font-size: 14px;
		color: #666;
		margin-bottom: 5px;
	}

	.stat-value {
		font-size: 18px;
		font-weight: bold;
		color: #2d5016;
	}

	.no-data {
		text-align: center;
		padding: 40px;
		color: #666;
		font-size: 18px;
		background: #fff3cd;
		border: 1px solid #ffeaa7;
		border-radius: 8px;
	}

	.no-data h4 {
		margin: 0 0 15px 0;
		color: #856404;
	}

	.no-data ul {
		text-align: left;
		display: inline-block;
		margin: 15px 0;
	}

	.no-data li {
		margin-bottom: 5px;
	}

	.forest-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-bottom: 20px;
	}

	.forest-item {
		background: #f8f9fa;
		border: 1px solid #e9ecef;
		border-radius: 6px;
		padding: 15px;
	}

	.forest-item h4 {
		margin: 0 0 10px 0;
		color: #2d5016;
	}

	.forest-details {
		display: flex;
		flex-direction: column;
		gap: 5px;
		font-size: 14px;
		color: #666;
		margin-bottom: 10px;
	}

	.forest-details span {
		display: block;
	}

	.forest-properties {
		margin-top: 10px;
		padding: 10px;
		background: #f5f5f5;
		border-radius: 4px;
	}

	.properties-json {
		font-size: 12px;
		margin: 5px 0 0 0;
		background: white;
		padding: 8px;
		border-radius: 4px;
		max-height: 150px;
		overflow-y: auto;
	}

	.more-items {
		text-align: center;
		color: #666;
		font-style: italic;
		padding: 10px;
	}

	.raw-data {
		background: #f5f5f5;
		border-radius: 6px;
		padding: 15px;
		margin-top: 20px;
	}

	.raw-data h4 {
		margin: 0 0 10px 0;
	}

	.raw-data pre {
		background: white;
		padding: 10px;
		border-radius: 4px;
		overflow-x: auto;
		font-size: 12px;
		max-height: 400px;
		overflow-y: auto;
	}

	.logs {
		border-top: 2px solid #e9ecef;
		padding-top: 20px;
	}

	.log-list {
		display: flex;
		flex-direction: column;
		gap: 5px;
		max-height: 300px;
		overflow-y: auto;
	}

	.log-item {
		padding: 5px 10px;
		border-radius: 4px;
		font-family: monospace;
		font-size: 14px;
	}

	.log-item.info {
		background: #e3f2fd;
	}

	.log-item.success {
		background: #e8f5e8;
		color: #2e7d32;
	}

	.log-item.error {
		background: #ffebee;
		color: #c62828;
	}

	.timestamp {
		color: #666;
		margin-right: 10px;
	}

	.message {
		font-weight: 500;
	}
</style>
