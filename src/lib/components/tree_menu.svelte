<script>
	import TreeContent from './tree_content.svelte';
	import closeIcon from '$lib/assets/close.png';
	import menuIcon from '$lib/assets/menu.png';

	/** @type {import('$lib/types/TreeProps').TreeProps[]} */
	let items = $state([]);
	let expanded = $state(false);
</script>

{#if expanded}
	<div class="tree-menu">
		<button onclick={() => (expanded = !expanded)}>
			<img src={closeIcon} alt="关闭" class="icon" />
		</button>
		<ul>
			{#each items as item (item.name)}
				<li>
					<TreeContent {...item} />
				</li>
			{/each}
		</ul>
	</div>
{:else}
	<div class="tree-menu">
		<button onclick={() => (expanded = !expanded)}>
			<img src={menuIcon} alt="菜单" class="icon" />
		</button>
	</div>
{/if}
