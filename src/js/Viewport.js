
const Viewport = require("pixi-viewport").Viewport;

function CreateViewport(game) {
	// create viewport
	const viewport = new Viewport({
		screenWidth: window.innerWidth,
		screenHeight: window.innerHeight,
		worldWidth: 1000,
		worldHeight: 1000,

		interaction: game.renderer.plugins.interaction
	});

	// activate plugins
	viewport
		//.drag()
		//.pinch()
		//.wheel()
		.decelerate();

	return viewport;
}

module.exports = CreateViewport;
