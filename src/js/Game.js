// npm imports
const PIXI = require("pixi.js");
const Planck = require("planck-js");

// local modules
const {
	InputManager,
	GameStateController,
	GameStateEnums
} = require("tune-mountain-input-manager");

const Parallax = require("./Parallax");
const Bezier = require("./Bezier");
const Viewport = require("./Viewport");
const Physics = require("./Physics");
const GenerateCurve = require("./GenerationAlgorithm");
const GameObject = require("./GameObject");
const Coins = require("./Coins");
const Collisions = require("./Collisions");

/**
 *  The object that will represent the game that will be attached to the application.
 *
 *  This class will have to be instantiated with:
 *  	-> stateController: an Rx.Observable that will be listened to for game state changes
 *  	-> canvas: a reference to an HTML canvas element for rendering
 *
 *  This is the main export of the entire Tune-Mountain-Game module.
 *
 *  In production, the game state will be controlled by the subscriptions stateController,
 *  and will reactively switch states based on what they receive from the web app that
 *  controls it.
 *
 *  In development, one can call the methods on this class directly in order to force these state changes.
 */
class Game {

	/**
	 * Constructor for class.
	 *
	 * @param {GameStateController} stateController game state controller object
	 * @param {Node} canvas HTML canvas element
	 */
	constructor(stateController, canvas) {

		// must have both for game to work
		if (!stateController || !canvas) {
			throw new Error("No state controller or canvas passed to Game initialization.");
		}

		// initialize action state tracker
		this.actionState = {};

		// needed for controlling state
		this.stateController = stateController;

		//****** INITIALIZING INPUT MANAGER *******//
		const inputManager = new InputManager();

		// bind actions
		inputManager.bindAction("Spacebar", "jump"); // TODO: (for leo) update input manager to be able to chain bind actions
		inputManager.bindAction("j", "jump");
		inputManager.bindAction(" ", "jump");

		// keep track of actions being performed
		const inputStreamObservable = inputManager.getObservable();

		// Adds the current action being sent to the actionState array every time an action is received
		const inputPerformedHandler = action => {
			// TODO: maybe use function ForEach() for this, it's a bit cleaner
			for (let i = 0; i < action.actions.length; i++) {
				this.actionState[action.actions[i]] = action.type;
			}
		};

		// subscribe to handle events
		inputStreamObservable.subscribe(inputPerformedHandler);

		//****** INITIALIZING PIXI *******//
		this.pixiApp = null;

		this.CAN_JUMP = false;

		this.songAnalysis = null;
		this.songFeatures = null;

		// TODO: must subscribe to state controller for ALL state changes we handle
		// handles when controller emits a request for an idle state
		stateController.onRequestTo(GameStateEnums.IDLE, () => this.idleState(canvas));

		// handles when controller emits song information
		stateController.onRequestTo(GameStateEnums.GENERATE, request => (
			this.generateMountain(request.body.analysis, request.body.features)
		));
	}

	//			*************		  //
	// ***  state switch handlers *** //
	//			*************		  //

	getPixiApp(canvas) {
		if (!this.pixiApp) {
			this.pixiApp = new PIXI.Application({
				view: canvas,
				width: window.innerWidth,
				height: window.innerHeight,
				backgroundColor: 0x42daf5,
				antialias: true
			});
		}

		return this.pixiApp;
	}

	/**
	 * On a request from state controller to switch to Idle state, this function is run.
	 */
	idleState(canvas) {
		this.getPixiApp(canvas);

		const texture1 = PIXI.Texture.from("../img/bg-far.png");
		const texture2 = PIXI.Texture.from("../img/bg-mid.png");

		const background1 = new PIXI.Sprite(texture1);
		const background2 = new PIXI.Sprite(texture2);

		background1.position.x = 0;
		background1.position.y = -325;
		background1.scale.x = 1.75;
		background1.scale.y = 1.5;

		background2.position.x = 0;
		background2.position.y = 0;
		background2.scale.x = 1.75;
		background2.scale.y = 1.5;

		this.pixiApp.stage.addChild(background1);
		this.pixiApp.stage.addChild(background2);
	}

	generateMountain(analysis, features) {

		this.songAnalysis = analysis;
		this.songFeatures = features;

		this.generateMountainState();
		/*
		PIXI.Loader.shared
			.add("/img/Idle.json")
			.add("/img/Jump.json")
			.load(this.generateMountainState());
		 */
	}

	/**
	 *  Generate Mountain when a song is received.
	 *
	 *  I'M GONNA TEMPORARILY MAKE THIS FUNCTION PERFORM EVERYTHING ELSE GAME.JS DID
	 *  PRIOR TO THIS REFACTOR!! SO PLS FIGURE IT OUT IF I F*CKED SOMETHING UP.
	 */
	generateMountainState() {

		//let sheet = PIXI.Loader.shared.resources["/img/Idle.json"].spritesheet;
		let idle = ["idle_frame_1.png","idle_frame_2.png","idle_frame_3.png",
			"idle_frame_4.png","idle_frame_5.png", "idle_frame_6.png"];

		let jump = ["jump_frame_1.png","jump_frame_2.png","jump_frame_3.png",
			"jump_frame_4.png","jump_frame_5.png", "jump_frame_6.png",
			"jump_frame_7.png","jump_frame_8.png", "jump_frame_9.png",
			"jump_frame_10.png","jump_frame_11.png", "jump_frame_12.png",
			"jump_frame_13.png","jump_frame_14.png"];

		let idleArray = [];
		let jumpArray = [];

		for (let i=0; i < 4; i++) {
			let texture = PIXI.Texture.from("/img/" + idle[i]);
			idleArray.push(texture);
		}

		for (let i=0; i < 4; i++) {
			let texture = PIXI.Texture.from("/img/" + idle[i]);
			jumpArray.push(texture);
		}

		// check for no pixi
		if (!this.pixiApp) {
			throw new Error("Pixi not initialized properly. Check code.");
		}

		// legacy code
		const curves = GenerateCurve(this.songAnalysis, this.songFeatures);
		const viewport = Viewport(this.pixiApp);

		Parallax(this.pixiApp);

		this.pixiApp.stage.addChild(viewport);

		const world = new Planck.World(Planck.Vec2(0, 100));
		const obj = new GameObject();
		//const texture = PIXI.Texture.from("../img/snowboarder.png");
		//const snowboarder = new PIXI.Sprite(texture);
		const snowboarder = new PIXI.AnimatedSprite(idleArray);
		snowboarder.animationSpeed = .15;
		snowboarder.scale.x = 0.4;
		snowboarder.scale.y = 0.4;
		snowboarder.play();
		let player = obj.create({name: "Player", sprite: snowboarder, animation1: idleArray, animation2: jumpArray});

		const allPoints = Physics(this.pixiApp, viewport, curves, player, obj, world);

		// add coins
		let coinSprites = Coins(this.songAnalysis, allPoints, viewport, player);

		Bezier(viewport, curves);
		Collisions(this.pixiApp, viewport, player, coinSprites);

		// add game object to viewport

		viewport.addChild(player.sprite);
		viewport.follow(player.sprite);
		viewport.zoomPercent(0.15);

		// world on collision for physics
		world.on("pre-solve", contact => {
			let fixtureA = contact.getFixtureA();
			let fixtureB = contact.getFixtureB();

			let bodyA = fixtureA.getBody();
			let bodyB = fixtureB.getBody();

			let playerA = bodyA === player.physics;
			let playerB = bodyB === player.physics;

			if (playerA || playerB) {
				/*
				if (!this.CAN_JUMP) {
					this.CAN_JUMP = true;
					player.sprite = new PIXI.AnimatedSprite(player.animation1);
					snowboarder.animationSpeed = .15;
					snowboarder.play();
				}
				 */

				this.CAN_JUMP = true;
				player.physics.applyForce(Planck.Vec2(1000, -150.0), player.position, true);
			}
		});

		const handleActions = () => {
			if (this.actionState.jump === "press" && this.CAN_JUMP === true) {
				/*
				player.sprite.destroy();
				player.sprite = new PIXI.AnimatedSprite(player.animation2);
				snowboarder.animationSpeed = .15;
				snowboarder.play();
				viewport.addChild(player.sprite);
				viewport.follow(player.sprite);
				 */
				//player.physics.applyLinearImpulse(Planck.Vec2(100, -150), player.position, true);
				player.physics.applyLinearImpulse(Planck.Vec2(100, -200), player.position, true);
				player.physics.setAngle(0);
				this.CAN_JUMP = false;
			}
		};

		this.pixiApp.ticker.add(handleActions);

		this.stateController.notify(GameStateEnums.PLAY, null);
	}

	/**
	 * Allows input to be received and affect characters in game. Notifies website
	 * to initiate song playback!
	 *
	 * // TODO: actually implement a 2-way comm between modules here
	 */
	playLevelState() {
		// do stuff
	}

	/**
	 *  Should prevent inputs from affecting game, and notifies website to pause
	 *  playback. Should also be executed when website requires game to pause for whatever reason.
	 */
	pauseState() {
		// don't stuff
	}

	// add more states as needed... etc. Not all of these should be implemented for A-Fest
	// but its good to have them here for planning purposes.

}

module.exports = Game;
