const PIXI = require("pixi.js");
const InputManager = require("tune-mountain-input-manager");
const Parallax = require("./Parallax");
const Bezier = require("./Bezier");
const Viewport = require("./Viewport");

const manager = new InputManager();

// bind one or more actions (appends to existing actions)
manager.bindAction("a", "Action1");

// get observable
const observable = manager.getObservable();

// this handler will simply print to the console the actions being performed
const handler = ( action ) => console.log(action, " hello");

// subscribe to handle events
observable.subscribe(handler);

const canvas = document.getElementById("mycanvas");

const game = new PIXI.Application({
	view: canvas,
	width: window.innerWidth,
	height: window.innerHeight,
	antialias: true
});

const viewport = Viewport(game);
Parallax(game, viewport);
Bezier(viewport);
addBox(viewport);

function addBox(viewport) {

	// add a red box
	const sprite = viewport.addChild(new PIXI.Sprite(PIXI.Texture.WHITE));
	sprite.tint = 0xff0000;
	sprite.width = sprite.height = 100;
	sprite.position.set(100, 100);
	sprite.anchor.set(0.5);

	//viewport.follow(sprite);
	//viewport.zoomPercent(0.25);
}