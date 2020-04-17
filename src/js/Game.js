// npm imports
const PIXI = require("pixi.js");
const particles = require("pixi-particles");
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
const PulseTrees = require("./PulseTrees");
const Score = require("./Score");
const Shaders = require("./Shaders");
const Trees = require("./Trees");

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
	constructor(stateController, canvas, inputManagerInstance = null) {

		// must have both for game to work
		if (!stateController || !canvas) {
			throw new Error("No state controller or canvas passed to Game initialization.");
		}

		// initialize action state tracker
		this.actionState = {};

		// needed for controlling state
		this.stateController = stateController;

		//****** INITIALIZING INPUT MANAGER *******//
		const inputManager = inputManagerInstance ? inputManagerInstance : new InputManager();

		// bind actions
		inputManager.bindAction("Spacebar", "jump"); // TODO: (for leo) update input manager to be able to chain bind actions
		inputManager.bindAction("j", "jump");
		inputManager.bindAction(" ", "jump");
		inputManager.bindAction("w", "trick1");
		inputManager.bindAction("a", "trick2");

		// keep track of actions being performed
		const inputStreamObservable = inputManager.getObservable();

		// Adds the current action being sent to the actionState array every time an action is received
		const inputPerformedHandler = actionEventObj => {
			this.actionState[actionEventObj.action] = actionEventObj.type;
		};

		// subscribe to handle events
		inputStreamObservable.subscribe(inputPerformedHandler);

		//****** INITIALIZING PIXI *******//
		this.pixiApp = null;

		this.ON_SLOPE = false;

		this.songAnalysis = null;
		this.songFeatures = null;

		// initialize the sprite tracker
		this.sprites = {
			title: null,
			idle: null,
			jump: null,
			trick1: null,
			trick2: null
		};

		this.score = null;
		this.consecutiveTricks = 0;
		this.multiplier = 1;

		// TODO: must subscribe to state controller for ALL state changes we handle
		// handles when controller emits a request for an idle state
		stateController.onRequestTo(GameStateEnums.IDLE, () => this.idleState(canvas));

		// handles when controller emits song information
		stateController.onRequestTo(GameStateEnums.GENERATE, request => (
			this.generateMountain(request.body.analysis, request.body.features)
		));

		// handles when controller emits pause request
		stateController.onRequestTo(GameStateEnums.PAUSE, () => this.pauseState());

		// handles when controller emits play request
		stateController.onRequestTo(GameStateEnums.PLAY, () => this.playLevelState());
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
				antialias: true,
				sharedTicker: true
			});
		}

		this.pixiApp.maxFPS = 60;

		return this.pixiApp;
	}

	/**
	 * On a request from state controller to switch to Idle state, this function is run.
	 */
	idleState(canvas) {
		this.getPixiApp(canvas);

		const texture = PIXI.Texture.from("../img/title page.png");
		const background = new PIXI.Sprite(texture);
		background.position.x = 0;
		background.position.y = -175;
		background.scale.x = 1.75;
		background.scale.y = 1.5;
		this.pixiApp.stage.addChild(background);
		this.sprites.title = background;
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

		let canvas = document.getElementById("mycanvas");
		// check for no pixi
		if (!this.pixiApp) {
			//throw new Error("Pixi not initialized properly. Check code.");
			this.getPixiApp(canvas);
		}
		this.pixiApp.stage.removeChild(this.sprites.title);

		//let sheet = PIXI.Loader.shared.resources["/img/Idle.json"].spritesheet;
		let textures = this.createTextures();

		// Compile Shaders
		let shaderObject = Shaders(this.songFeatures, this.getPixiApp());

		const curves = GenerateCurve(this.songAnalysis, this.songFeatures);
		const viewport = Viewport(this.pixiApp);

		Parallax(this.pixiApp, shaderObject);

		this.pixiApp.stage.addChild(viewport);

		const world = new Planck.World(Planck.Vec2(0, 100));
		const obj = new GameObject();

		const texture = PIXI.Texture.from("../img/snowboarder.png");
		const followSprite = new PIXI.Sprite(texture);
		followSprite.visible = false;

		const idleSnowboarder = new PIXI.AnimatedSprite(textures.idle);
		idleSnowboarder.animationSpeed = .15;
		idleSnowboarder.scale.x = 0.2;
		idleSnowboarder.scale.y = 0.2;
		idleSnowboarder.play();
		let player = obj.create({name: "Player", sprite: idleSnowboarder, followSprite: followSprite});

		const jumpSnowboarder = new PIXI.AnimatedSprite(textures.jump);
		jumpSnowboarder.animationSpeed = .15;
		jumpSnowboarder.scale.x = 0.2;
		jumpSnowboarder.scale.y = 0.2;
		jumpSnowboarder.loop = false;
		jumpSnowboarder.onComplete = () => {
			this.swapSprites(player, viewport, this.sprites.idle, "finish jump");
		};

		const tailGrabSnowboarder = new PIXI.AnimatedSprite(textures.tailGrab);
		tailGrabSnowboarder.animationSpeed = .15;
		tailGrabSnowboarder.scale.x = 0.2;
		tailGrabSnowboarder.scale.y = 0.2;
		tailGrabSnowboarder.loop = false;
		tailGrabSnowboarder.onComplete = () => {
			this.swapSprites(player, viewport, this.sprites.idle, "trick1 complete");
		};

		const _360Snowboarder = new PIXI.AnimatedSprite(textures._360);
		_360Snowboarder.animationSpeed = .15;
		_360Snowboarder.scale.x = 0.2;
		_360Snowboarder.scale.y = 0.2;
		_360Snowboarder.loop = false;
		_360Snowboarder.onComplete = () => {
			this.swapSprites(player, viewport, this.sprites.idle, "trick2 complete");
		};

		// Assign sprites and score to the Game
		this.sprites.idle = idleSnowboarder;
		this.sprites.jump = jumpSnowboarder;
		this.sprites.trick1 = tailGrabSnowboarder;
		this.sprites.trick2 = _360Snowboarder;
		this.score = new Score(this.stateController);

		// Generate physics points for curves
		const allPoints = Physics(this.pixiApp, viewport, curves, player, obj, world);

		// add coins
		//let coinSprites = Coins(this.songAnalysis, allPoints, viewport, player);
		let allTrees = Trees(this.songAnalysis.sections, this.songFeatures, allPoints, viewport, this.pixiApp);

		Bezier(viewport, allPoints);
		//Collisions(this.pixiApp, viewport, player, coinSprites, this.songFeatures);

		// add game object to viewport

		viewport.addChild(player.followSprite);
		viewport.addChild(player.sprite);
		viewport.zoomPercent(6.0);

		const followPlayer = () => {
			viewport.moveCenter(player.followSprite.position.x + 20, player.followSprite.position.y - 15);
		};

		// world on collision for physics
		world.on("pre-solve", contact => {
			let fixtureA = contact.getFixtureA();
			let fixtureB = contact.getFixtureB();

			let bodyA = fixtureA.getBody();
			let bodyB = fixtureB.getBody();

			let playerA = bodyA === player.physics;
			let playerB = bodyB === player.physics;

			if (playerA || playerB) {

				if (this.ON_SLOPE === false) {

					if (playingTrickAnimation()) {
						this.consecutiveTricks = 0;
						this.multiplier = 1;
					}

					emitter.emit = true;
					this.swapSprites(player, viewport, this.sprites.idle, "idle");
				}

				this.ON_SLOPE = true;
				player.physics.applyForce(Planck.Vec2(this.songAnalysis.track.tempo, -100.0), player.position, true);
				//console.log(player.physics.getLinearVelocity());
				//player.physics.setLinearVelocity(Planck.Vec2(20, -10));
			}

			if (playerA) {
				// eslint-disable-next-line no-mixed-spaces-and-tabs
			    player.sprite.rotation = bodyB.getAngle();
			}
			else {
				// eslint-disable-next-line no-mixed-spaces-and-tabs
				player.sprite.rotation = bodyA.getAngle();
			}
		});

		const playingTrickAnimation = () => {
			if (this.sprites.trick1.playing
				|| this.sprites.trick2.playing) {
				return true;
			}
			else {
				return false;
			}
		};

		const handleActions = () => {
			if (this.actionState.jump === "press" && this.ON_SLOPE === true) {

				emitter.emit = false;
				this.swapSprites(player, viewport, this.sprites.jump, "jump");

				//player.physics.applyLinearImpulse(Planck.Vec2(100, -150), player.position, true);
				player.physics.applyLinearImpulse(Planck.Vec2(this.songAnalysis.track.tempo, -200), player.position, true);
				//player.physics.setAngle(0);
				this.ON_SLOPE = false;
			}

			if (this.actionState.trick1 === "press" && this.ON_SLOPE === false && !playingTrickAnimation()) {
				this.swapSprites(player, viewport, this.sprites.trick1, "trick1");
			}

			if (this.actionState.trick2 === "press" && this.ON_SLOPE === false && !playingTrickAnimation()) {
				this.swapSprites(player, viewport, this.sprites.trick2, "trick2");
			}

		};

		// Timing stuff
		let time0 = performance.now();  // in milliseconds
		let lastCurveTime = time0;
		let curveEndIndex = 0;
		let nextCurveEnding = curves[curveEndIndex][3];
		const handleTime = () => {
			//console.log(player.position);
			if(player.position.x > nextCurveEnding.x && curveEndIndex < curves.length - 1){
				let currentTime = performance.now();
				let timePassed = (currentTime - lastCurveTime) / 1000.0;   // in seconds
				curveEndIndex += 1;
				nextCurveEnding = curves[curveEndIndex][3];


				console.log("Time taken to finish curve" + curveEndIndex + " : " + timePassed);
				//console.log("Total time passed: " + ((currentTime - time0) / 1000.0));
				lastCurveTime = currentTime;
			}
		};

		const particle = PIXI.Texture.from("../img/particle.png");
		let emitter = new particles.Emitter(viewport, [particle],
			{
				"alpha": {
					"start": 1,
					"end": 0
				},
				"scale": {
					"start": 0.02,
					"end": 0.01,
					"minimumScaleMultiplier": 1
				},
				"color": {
					"start": "#e4f9ff",
					"end": "#3fcbff"
				},
				"speed": {
					"start": 75,
					"end": 25,
					"minimumSpeedMultiplier": 1
				},
				"acceleration": {
					"x": 0,
					"y": 0
				},
				"maxSpeed": 0,
				"startRotation": {
					"min": 0,
					"max": 360
				},
				"noRotation": false,
				"rotationSpeed": {
					"min": 0,
					"max": 0
				},
				"lifetime": {
					"min": 0.2,
					"max": 0.8
				},
				"blendMode": "normal",
				"frequency": 0.001,
				"emitterLifetime": -1,
				"maxParticles": 500,
				"pos": {
					"x": 0,
					"y": 0
				},
				"addAtBack": false,
				"spawnType": "circle",
				"spawnCircle": {
					"x": 1,
					"y": 1.5,
					"r": 0
				}
			}
		);

		// Calculate the current time
		let elapsed = Date.now();

		const updateEmitter = function() {

			let now = Date.now();

			// The emitter requires the elapsed
			// number of seconds since the last update
			emitter.updateSpawnPos(player.position.x, player.position.y);
			emitter.update((now - elapsed) * 0.001);
			elapsed = now;
		};


		this.pixiApp.ticker.add(handleActions);
		this.pixiApp.ticker.add(handleTime);
		this.pixiApp.ticker.add(followPlayer);
		this.pixiApp.ticker.add(updateEmitter);

		this.stateController.notify(GameStateEnums.PLAY, null);
	}

	swapSprites(player, viewport, sprite, trick) {

		if (trick === "trick1 complete") {
			this.calculateScore(1);
			console.log("NewScore: " + this.score.getScore());
		}

		if (trick === "trick2 complete") {
			this.calculateScore(2);
			console.log("NewScore: " + this.score.getScore());
		}

		let rotation = player.sprite.rotation;
		let xposition = player.sprite.position.x;
		let yposition = player.sprite.position.y;
		player.sprite.stop();
		viewport.removeChild(player.sprite);
		player.sprite = sprite;
		player.sprite.rotation = rotation;
		player.sprite.position.x = xposition;
		player.sprite.position.y = yposition;
		player.sprite.gotoAndPlay(0);
		viewport.addChild(player.sprite);
	}

	calculateScore(trickNum) {
		this.consecutiveTricks++;
		if (this.consecutiveTricks !== 1 && (this.consecutiveTricks - 1) % 5 === 0) {
			this.multiplier += 0.2;
		}

		switch (trickNum) {
		case 1:
			this.score.updateScore(200 * this.multiplier);
			return;
		case 2:
			this.score.updateScore(250 * this.multiplier);
			return;
		default:
			this.score.updateScore(100);
			return;
		}
	}

	createTextures() {
		let idle = [
			"idle_frame_1.png",
			"idle_frame_2.png",
			"idle_frame_3.png",
			"idle_frame_4.png",
			"idle_frame_5.png",
			"idle_frame_6.png"
		];

		let jump = [
			"ollie1.png",
			"ollie2.png",
			"ollie3.png",
			"ollie4.png",
			"ollie5.png",
			"ollie6.png",
			"ollie7.png",
			"ollie8.png",
			"ollie9.png",
			"ollie10.png",
			"ollie11.png",
			"ollie12.png",
			"ollie13.png",
			"ollie14.png",
			"ollie15.png"
		];

		let tailGrab = [
			"tail_grab1.png",
			"tail_grab2.png",
			"tail_grab3.png",
			"tail_grab4.png",
			"tail_grab5.png",
			"tail_grab6.png",
			"tail_grab7.png",
			"tail_grab8.png",
			"tail_grab9.png",
			"tail_grab10.png",
			"tail_grab11.png",
			"tail_grab12.png",
			"tail_grab13.png"
		];

		let _360 = [
			"360_frame_1.png",
			"360_frame_2.png",
			"360_frame_3.png",
			"360_frame_4.png",
			"360_frame_5.png",
			"360_frame_6.png",
			"360_frame_7.png",
			"360_frame_8.png",
			"360_frame_9.png",
			"360_frame_10.png",
			"360_frame_11.png",
			"360_frame_12.png",
			"360_frame_13.png",
			"360_frame_14.png"
		];

		let idleArray = [];
		let jumpArray = [];
		let tailGrabArray = [];
		let _360Array = [];

		for (let i = 0; i < 6; i++) {
			let texture = PIXI.Texture.from("/img/" + idle[i]);
			idleArray.push(texture);
		}

		for (let i = 0; i < 15; i++) {
			let texture = PIXI.Texture.from("/img/" + jump[i]);
			jumpArray.push(texture);
		}

		for (let i = 0; i < 13; i++) {
			let texture = PIXI.Texture.from("/img/" + tailGrab[i]);
			tailGrabArray.push(texture);
		}

		for (let i = 0; i < 14; i++) {
			let texture = PIXI.Texture.from("/img/" + _360[i]);
			_360Array.push(texture);
		}

		return {
			idle: idleArray,
			jump: jumpArray,
			tailGrab: tailGrabArray,
			_360: _360Array
		};
	}

	/**
	 * Allows input to be received and affect characters in game. Notifies website
	 * to initiate song playback!
	 *
	 * // TODO: actually implement a 2-way comm between modules here
	 */
	playLevelState() {
		this.pixiApp.ticker.start();
	}

	/**
	 *  Should prevent inputs from affecting game, and notifies website to pause
	 *  playback. Should also be executed when website requires game to pause for whatever reason.
	 */
	pauseState() {
		this.pixiApp.ticker.stop();
	}

	// add more states as needed... etc. Not all of these should be implemented for A-Fest
	// but its good to have them here for planning purposes.

}

module.exports = Game;
