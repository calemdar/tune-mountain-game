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
		.drag()
		.pinch()
		.wheel()
		.decelerate();

	// add a red box
	const sprite = viewport.addChild(new PIXI.Sprite(PIXI.Texture.WHITE));
	sprite.tint = 0xff0000;
	sprite.width = sprite.height = 100;
	sprite.position.set(100, 100);
	sprite.anchor.set(0.5);

	//viewport.follow(sprite);
	//viewport.zoomPercent(0.25);

	return viewport;
}

module.exports = CreateViewport;