// App type definitions for SvelteKit
// See https://svelte.dev/docs/kit/types#app.d.ts for information about these interfaces

/**
 * Global App namespace for type definitions
 * @namespace App
 */
const App = {};

/**
 * Error interface
 * @interface App.Error
 */
App.Error = {};

/**
 * Locals interface
 * @interface App.Locals
 */
App.Locals = {};

/**
 * PageData interface
 * @interface App.PageData
 */
App.PageData = {};

/**
 * PageState interface
 * @interface App.PageState
 */
App.PageState = {};

/**
 * Platform interface
 * @interface App.Platform
 */
App.Platform = {};

// Export the App namespace for global availability
if (typeof global !== 'undefined') {
	global.App = App;
}

export { App };
