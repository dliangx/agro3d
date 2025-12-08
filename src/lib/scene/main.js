import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { createScene } from './scene';


let _current = null;

/**
 * Initialize and show the 3D scene. If a scene is already active it will be replaced.
 * @param {string} preset
 * @param {boolean} mixed
 */
export async function initScene(preset, mixed) {
  	// Hide the map layer (if present) so the 3D scene is visible
	const mapEl = document.getElementById('map');
	if (mapEl) {
		mapEl.style.display = 'none';
		mapEl.style.pointerEvents = 'none';
	}
  // initialization log removed to satisfy linting rules
  document.getElementById('loading-screen').style.display = 'flex';
	const container = document.getElementById('scene');
	if (!container) return;

	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setClearColor(0);
	renderer.setSize(container.clientWidth, container.clientHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;
	renderer.toneMapping = THREE.NeutralToneMapping;
	renderer.toneMappingExposure = 2;
	container.appendChild(renderer.domElement);

	const { scene, environment, tree, camera, controls } = await createScene(renderer, preset, mixed);



	const composer = new EffectComposer(renderer);

	composer.addPass(new RenderPass(scene, camera));

	const smaaPass = new SMAAPass(
		container.clientWidth * renderer.getPixelRatio(),
		container.clientHeight * renderer.getPixelRatio()
	);
	composer.addPass(smaaPass);

	composer.addPass(new OutputPass());

	const clock = new THREE.Clock();
	let _animId = null;
	function animate() {
		// Update time for wind sway shaders
		const t = clock.getElapsedTime();
		tree.update(t);
		scene.getObjectByName('Forest').children.forEach((o) => o.update(t));
		environment.update(t);

		controls.update();
		composer.render();
		_animId = requestAnimationFrame(animate);
		if (_current) _current._animId = _animId;
	}

	function resize() {
		renderer.setSize(container.clientWidth, container.clientHeight);
		smaaPass.setSize(container.clientWidth, container.clientHeight);
		composer.setSize(container.clientWidth, container.clientHeight);
		camera.aspect = container.clientWidth / container.clientHeight;
		camera.updateProjectionMatrix();
	}

	window.addEventListener('resize', resize);

	// setupUI(tree, environment, renderer, scene, camera, controls, 'Ash Medium');
	animate();
	resize();

	// save current scene instance so it can be destroyed later
	_current = {
		renderer,
		composer,
		camera,
		controls,
		scene,
		environment,
		tree,
		container,
		mapEl,
		resize,
		_animId
	};

	// ensure the saved instance has the current animation id
	if (_animId) _current._animId = _animId;

	return _current;

}


/**
 * Destroy the active scene if any: stop animation, remove DOM, dispose resources and listeners.
 */
export function destroyScene() {
	if (!_current) return;
  document.getElementById('loading-screen').style.display = 'none';

	try {
		// cancel animation
		if (_current._animId) cancelAnimationFrame(_current._animId);
		// remove resize listener
		window.removeEventListener('resize', _current.resize);
		// restore map element
		if (_current.mapEl) {
			_current.mapEl.style.display = '';
			_current.mapEl.style.pointerEvents = '';
		}
		// remove renderer canvas
		if (_current.renderer && _current.renderer.domElement && _current.container) {
			_current.container.removeChild(_current.renderer.domElement);
		}

		// dispose three.js objects
		try {
			_current.scene.traverse((obj) => {
				if (obj.geometry) {
					obj.geometry.dispose();
				}
				if (obj.material) {
					const mat = obj.material;
					if (Array.isArray(mat)) {
						mat.forEach((m) => m.dispose && m.dispose());
					} else {
						mat.dispose && mat.dispose();
					}
				}
			});
		} catch {
			// ignore dispose errors
		}

		// dispose renderer
		try {
			_current.renderer.dispose();
		} catch { void 0; }

		// call optional disposers on environment/tree
		try {
			_current.environment && _current.environment.dispose && _current.environment.dispose();
		} catch { void 0; }
		try {
			_current.tree && _current.tree.dispose && _current.tree.dispose();
		} catch { void 0; }
	} finally {
		_current = null;
	}
}

/**
 * Convenience: replace the current scene with a new one.
 */
export async function addScene(preset, mixed) {
  	if (!_current) {
      return await initScene(preset, mixed);
    }else {
      destroyScene();
    }
}

