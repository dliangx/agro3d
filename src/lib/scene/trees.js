import * as THREE from 'three';
import { Tree, TreePreset } from '../tree';

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function paintUI() {
	return new Promise((resolve) => requestAnimationFrame(resolve));
}

export async function createTrees(preset = 'Ash Medium', mixed = false) {
	const forest = new THREE.Group();
	forest.name = 'Forest';

	const logoElement = document.getElementById('logo');
	const progressElement = document.getElementById('loading-text');

	logoElement.style.clipPath = `inset(100% 0% 0% 0%)`;
	progressElement.innerHTML = 'LOADING... 0%';

	const treeCount = 100;
	const minDistance = 120;
	const maxDistance = 500;

	function createMixedTree() {
		const r = minDistance + Math.random() * maxDistance;
		const theta = 2 * Math.PI * Math.random();
		const presets = Object.keys(TreePreset);
		const index = Math.floor(Math.random() * presets.length);

		const t = new Tree();
		t.position.set(r * Math.cos(theta), 0, r * Math.sin(theta));
		t.loadPreset(presets[index]);
		t.options.seed = 10000 * Math.random();
		t.generate();
		t.castShadow = true;
		t.receiveShadow = true;

		forest.add(t);
	}

	function createTree() {
		const r = minDistance + Math.random() * maxDistance;
		const theta = 2 * Math.PI * Math.random();

		const t = new Tree();
		t.position.set(r * Math.cos(theta), 0, r * Math.sin(theta));
		t.loadPreset(preset);
		t.options.seed = 10000 * Math.random();
		t.generate();
		t.castShadow = true;
		t.receiveShadow = true;

		forest.add(t);
	}

	async function loadTrees(i) {
		while (i < treeCount) {
			if (!mixed) {
				createTree();
			} else {
				createMixedTree();
			}

			const progress = Math.floor((100 * (i + 1)) / treeCount);

			// Update progress UI
			logoElement.style.clipPath = `inset(${100 - progress}% 0% 0% 0%)`;
			progressElement.innerText = `LOADING... ${progress}%`;

			// Wait for the next animation frame to continue
			await paintUI();

			i++;
		}

		// All trees are loaded, hide loading screen
		await sleep(300);
		logoElement.style.clipPath = `inset(0% 0% 0% 0%)`;
		document.getElementById('loading-screen').style.display = 'none';
	}

	// Start the tree loading process
	await loadTrees(0);
	return forest;
}
