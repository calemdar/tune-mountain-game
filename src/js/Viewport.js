const PIXI = require("pixi.js");
const Viewport = require("pixi-viewport").Viewport;

function CreateViewport(game) {
	// create viewport
	const viewport = new Viewport({
		screenWidth: window.innerWidth,
		screenHeight: window.innerHeight,
		worldWidth: 1000,
		worldHeight: 1000,

		interaction: game.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
	});

	// add the viewport to the stage
	game.stage.addChild(viewport);

	// activate plugins
	viewport
		.pinch()
		.wheel()
		.decelerate();

	//const point = new PIXI.Point(100, 100);
	//viewport.snapZoom({width: 300, center: point});

	return viewport;
}

module.exports = CreateViewport;