// npm imports
const PIXI = require("pixi.js");
const Planck = require("planck-js");

// local modules
const {InputManager} = require("tune-mountain-input-manager");
const Parallax = require("./Parallax");
const Bezier = require("./Bezier");
const Viewport = require("./Viewport");
const Physics = require("./Physics");
const GenerateCurve = require("./GenerationAlgorithm");
const GameObject = require("./GameObject");
const Coins = require("./Coins");

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
		this.pixiApp = new PIXI.Application({
			view: canvas,
			width: window.innerWidth,
			height: window.innerHeight,
			antialias: true
		});

		this.CAN_JUMP = false;

		// TODO: must subscribe to state controller for ALL state changes we handle
		// handles when controller emits a request for an idle state
		stateController
			.filter(msg => msg.state === "IDLE")
			.subscribe(() => this.idleState());

		// handles when controller emits song information
		stateController
			.filter(msg => msg.state === "GENERATE")
			.subscribe(msg => this.generateMountainState(
				msg.body.analysis,
				msg.body.features
			));
	}

	//			*************		  //
	// ***  state switch handlers *** //
	//			*************		  //

	/**
	 * On a request from state controller to switch to Idle state, this function is run.
	 */
	idleState() {
		// should render an idle thing in canvas
	}

	/**
	 *  Generate Mountain when a song is received.
	 *
	 *  I'M GONNA TEMPORARILY MAKE THIS FUNCTION PERFORM EVERYTHING ELSE GAME.JS DID
	 *  PRIOR TO THIS REFACTOR!! SO PLS FIGURE IT OUT IF I F*CKED SOMETHING UP.
	 */
	generateMountainState(analysis, features) {

		// check for no pixi
		if (!this.pixiApp) {
			throw new Error("Pixi not initialized properly. Check code.");
		}

		// legacy code
		const curves = GenerateCurve(analysis, features);
		const viewport = Viewport(this.pixiApp);

		Parallax(this.pixiApp);

		this.pixiApp.stage.addChild(viewport);

		const world = new Planck.World(Planck.Vec2(0, 75));
		const obj = new GameObject();
		const texture = PIXI.Texture.from("../img/snowboarder.png");
		const snowboarder = new PIXI.Sprite(texture);
		let player = obj.create({name: "Player", sprite: snowboarder});

		const allPoints = Physics(this.pixiApp, viewport, curves, player, obj, world);

		// add coins
		Coins(analysis, allPoints, viewport);

		// add game object to viewport
		viewport.addChild(player.sprite);
		viewport.follow(player.sprite);
		viewport.zoomPercent(0.25);

		Bezier(viewport, curves);

		world.on("pre-solve", contact => {
			let fixtureA = contact.getFixtureA();
			let fixtureB = contact.getFixtureB();

			let bodyA = fixtureA.getBody();
			let bodyB = fixtureB.getBody();

			let playerA = bodyA === player.physics;
			let playerB = bodyB === player.physics;

			if (playerA || playerB) {
				this.CAN_JUMP = true;
				player.physics.applyForce(Planck.Vec2(400, -15.0), player.position, true);
			}
		});

		const handleActions = () => {
			if (this.actionState.jump === "press" && this.CAN_JUMP === true) {
				player.physics.applyLinearImpulse(Planck.Vec2(100, -150), player.position, true);
				this.CAN_JUMP = false;
			}
		};

		this.pixiApp.ticker.add(handleActions);

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
