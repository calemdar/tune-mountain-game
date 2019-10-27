
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

	// add the viewport to the stage
	//game.stage.addChild(viewport);

	// activate plugins
	viewport
		.drag()
		.pinch()
		.wheel()
		.decelerate();

	return viewport;
}

module.exports = CreateViewport;