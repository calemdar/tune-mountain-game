const PIXI = require("pixi.js");
const InputManager = require("tune-mountain-input-manager");
const Parallax = require("./Parallax");
const Bezier = require("./Bezier");
const Viewport = require("./Viewport");

const manager = new InputManager();

// bind one or more actions (appends to existing actions)
manager.bindAction("a", "moveLeft");
manager.bindAction("s", "moveDown");
manager.bindAction("d", "moveRight");
manager.bindAction("w", "moveUp");

// get observable
const observable = manager.getObservable();

const canvas = document.getElementById("mycanvas");

const game = new PIXI.Application({
	view: canvas,
	width: window.innerWidth,
	height: window.innerHeight,
	antialias: true
});

const actionState = {};

const viewport = Viewport(game);
Parallax(game, viewport);
Bezier(viewport);
const character = addCharacter(game, viewport);

// this handler will simply print to the console the actions being performed
const handler = (action => {
	for (let i = 0; i < action.actions.length; i++) {
		actionState[action.actions[i]] = action.type;
	}
});

// subscribe to handle events
observable.subscribe(handler);

game.ticker.add(handleActions);

function handleActions() {
	if (actionState.moveLeft === "press")
	{character.x -= 15;}
	else if (actionState.moveRight === "press")
	{character.x += 15;}
	else if (actionState.moveUp === "press")
	{character.y -= 15;}
	else if (actionState.moveDown === "press")
	{character.y += 15;}
	else if (actionState.moveLeft === "release")
	{character.x -= 0;}
	else if (actionState.moveRight === "release")
	{character.x += 0;}
	else if (actionState.moveUp === "release")
	{character.y -= 0;}
	else if (actionState.moveDown === "release")
	{character.y += 0;}
}

function addCharacter(game, viewport) {
	const character = new PIXI.Sprite.from("../img/snowboarder.png");
	character.anchor.set(0.5);

	character.x = game.screen.width / 2;
	character.y = game.screen.height / 2;

	viewport.addChild(character);
	viewport.follow(character);
	viewport.zoomPercent(0.25);

	return character;
}