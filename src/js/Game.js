const PIXI = require("pixi.js");
const InputManager = require("tune-mountain-input-manager");
const Parallax = require("./Parallax");
const Bezier = require("./Bezier");
const Viewport = require("./Viewport");
const Physics = require("./Physics");
const Planck = require("planck-js");
const GenerateCurve = require("./GenerationAlgorithm");
const GameObject = require("./GameObject");
let CAN_JUMP = false;

function Game(analysis, features, game) {
	// Game code
	const manager = new InputManager();

	// bind one or more actions (appends to existing actions)
	/*
	manager.bindAction("a", "moveLeft");
	manager.bindAction("s", "moveDown");
	manager.bindAction("d", "moveRight");
	manager.bindAction("w", "moveUp");
	 */
	manager.bindAction("Spacebar", "jump");
	manager.bindAction("j", "jump");
	manager.bindAction(" ", "jump");

	// get observable
	const observable = manager.getObservable();



	const actionState = {};

	let curves = GenerateCurve(analysis, features);
	//console.log(curves);

	const viewport = Viewport(game);
	Parallax(game);

	game.stage.addChild(viewport);

	const world = new Planck.World(Planck.Vec2(0, 75));
	const obj = new GameObject();
	const texture = PIXI.Texture.from("../img/snowboarder.png");
	const snowboarder = new PIXI.Sprite(texture);
	let player = obj.create({name: "Player", sprite: snowboarder});

	const allPoints = Physics(game, viewport, curves, player, obj, world);

	// add game object to viewport
	viewport.addChild(player.sprite);
	viewport.follow(player.sprite);
	viewport.zoomPercent(0.25);

	Bezier(viewport, curves);

	// Adds the current action being sent to the actionState array
	const handler = (action => {
		for (let i = 0; i < action.actions.length; i++) {
			actionState[action.actions[i]] = action.type;
		}
	});

	// subscribe to handle events
	observable.subscribe(handler);

	world.on("pre-solve", function(contact) {
		let fixtureA = contact.getFixtureA();
		let fixtureB = contact.getFixtureB();

		let bodyA = fixtureA.getBody();
		let bodyB = fixtureB.getBody();

		let playerA = bodyA === player.physics;
		let playerB = bodyB === player.physics;

		if (playerA || playerB) {
			CAN_JUMP = true;
		}
	});

	game.ticker.add(handleActions);


	function handleActions() {
		if (actionState.jump === "press" && CAN_JUMP === true) {
			player.physics.applyLinearImpulse(Planck.Vec2(100, -150), player.position, true);
			CAN_JUMP = false;
		}
	}
	/*
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
	 */
}


module.exports = Game;