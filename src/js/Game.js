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

const viewport = Viewport(game);
Parallax(game, viewport);
Bezier(viewport);
addBox(viewport);
const character = addCharacter(game, viewport);

// this handler will simply print to the console the actions being performed
const handler = (action => {
	if (action.type === "press") {
		switch (action.actions[0]) {
		case "moveLeft":
			character.x -= 15;
			break;
		case "moveRight":
			character.x += 15;
			break;
		case "moveUp":
			character.y -= 15;
			break;
		case "moveDown":
			character.y += 15;
			break;
		default:
			console.log("we did something else");
			break;
		}
	}
});

// subscribe to handle events
observable.subscribe(handler);

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