const PIXI = require("pixi.js");
const InputManager = require("tune-mountain-input-manager");
const Parallax = require("./Parallax");
const Bezier = require("./Bezier");
const Physics = require("./Physics");
const Planck = require("planck-js");


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
	antialias: true,
	backgroundColor: 0x333333
});

let ticker = PIXI.Ticker.shared;

//Parallax(game);
//Bezier(game);
Physics(game);
ticker.start();