// Tree properties type definition
export const TreeProps = {
	name: '',
	area: 0,
	species: '',
	stage: '',
	imageFile: '',
	geojson: null
};

// Alternative: using a function to create tree props
export function createTreeProps(overrides = {}) {
	return {
		name: '',
		area: 0,
		species: '',
		stage: '',
		imageFile: '',
		geojson: null,
		...overrides
	};
}

// For type checking in JavaScript, you can use JSDoc comments if needed
/**
 * @typedef {Object} TreeProps
 * @property {string} name
 * @property {number} area
 * @property {string} species
 * @property {string} stage
 * @property {string} imageFile
 * @property {any} geojson
 */
