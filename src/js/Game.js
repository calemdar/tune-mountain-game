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
	height: 384,
	antialias: true
});

const viewport = Viewport(game);
Parallax(game, viewport);
Bezier(game);
