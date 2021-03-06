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
const Coins = require("./Coins");
const EnvironmentalObjects = require("./EnvironmentalObjects");
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
		inputManager.bindAction("s", "trick3");
		inputManager.bindAction("d", "trick4");

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
		this.viewport = null;
		this.pixiState = "IDLE";

		this.ON_SLOPE = false;
		this.TUMBLING = false;

		this.songAnalysis = null;
		this.songFeatures = null;

		// initialize the sprite tracker
		this.sprites = {
			title: null,
			idle: null,
			jump: null,
			trick1: null,
			trick2: null,
			trick3: null,
			trick4: null,
			tumble: null,
			coins: null,
			trees: null
		};

		this.score = null;
		this.consecutiveTricks = 0;
		this.multiplier = 1;

		// TODO: must subscribe to state controller for ALL state changes we handle
		// handles when controller emits a request for an idle state
		stateController.onRequestTo(GameStateEnums.IDLE, request => this.idleState(canvas, request.body.reason));

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

			this.pixiApp.maxFPS = 60;
		}

		return this.pixiApp;
	}

	/**
	 * On a request from state controller to switch to Idle state, this function is run.
	 */
	idleState(canvas, reason) {

		// If receiving reason, need to reset game and global variables (either song has ended or paused from another device)

		/*
		if (reason && this.pixiState === "PLAYING") {

			this.pixiState = "IDLE";
			this.actionState = {};
			this.songAnalysis = null;
			this.songFeatures = null;

			// initialize the sprite tracker
			this.sprites = {
				title: null,
				idle: null,
				jump: null,
				trick1: null,
				trick2: null,
				trick3: null,
				trick4: null,
				coins: null,
				trees: null
			};

			this.ON_SLOPE = false;
			this.score = null;
			this.consecutiveTricks = 0;
			this.multiplier = 1;

			this.pixiApp.ticker = null;
			this.pixiApp = null;
			this.viewport = null;
		}
		*/

		this.getPixiApp(canvas);

		const texture = PIXI.Texture.from("../img/title image.png");
		const background = new PIXI.Sprite(texture);
		background.width = window.innerWidth;
		background.height = window.innerHeight;
		this.pixiApp.stage.addChild(background);
		this.sprites.title = background;
	}

	generateMountain(analysis, features) {

		this.songAnalysis = analysis;
		this.songFeatures = features;

		if(!this.songAnalysis.error && !this.songFeatures.error) {
			this.generateMountainState();
		}
		else{
			alert("Spotify couldn't find correct data");

		}
	}

	/**
	 *  Generate Mountain when a song is received.
	 */
	generateMountainState() {


		let canvas = document.getElementById("mycanvas");
		// check for no pixi
		if (!this.pixiApp) {
			//throw new Error("Pixi not initialized properly. Check code.");
			this.getPixiApp(canvas);
		}

		this.pixiApp.stage.removeChild(this.sprites.title);
		this.pixiState = "PLAYING";

		// Compile Shaders
		let shaderObject = Shaders(this.songFeatures, this.getPixiApp());

		const curves = GenerateCurve(this.songAnalysis, this.songFeatures);
		this.viewport = Viewport(this.pixiApp);

		Parallax(this.pixiApp, shaderObject);

		this.pixiApp.stage.addChild(this.viewport);

		const world = new Planck.World(Planck.Vec2(0, 100));
		const obj = new GameObject();

		// Create textures and animated sprites for character
		let textures = this.createTextures();
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
			this.swapSprites(player, this.viewport, this.sprites.idle, "finish jump");
		};

		const tailgrabSnowboarder = new PIXI.AnimatedSprite(textures.tailgrab);
		tailgrabSnowboarder.animationSpeed = .15;
		tailgrabSnowboarder.scale.x = 0.2;
		tailgrabSnowboarder.scale.y = 0.2;
		tailgrabSnowboarder.loop = false;
		tailgrabSnowboarder.onComplete = () => {
			this.swapSprites(player, this.viewport, this.sprites.idle, "trick1 complete");
		};

		const _360Snowboarder = new PIXI.AnimatedSprite(textures._360);
		_360Snowboarder.animationSpeed = .15;
		_360Snowboarder.scale.x = 0.2;
		_360Snowboarder.scale.y = 0.2;
		_360Snowboarder.loop = false;
		_360Snowboarder.onComplete = () => {
			this.swapSprites(player, this.viewport, this.sprites.idle, "trick2 complete");
		};

		const frontflipSnowboarder = new PIXI.AnimatedSprite(textures.frontflip);
		frontflipSnowboarder.animationSpeed = .15;
		frontflipSnowboarder.scale.x = 0.2;
		frontflipSnowboarder.scale.y = 0.2;
		frontflipSnowboarder.loop = false;
		frontflipSnowboarder.onComplete = () => {
			this.swapSprites(player, this.viewport, this.sprites.idle, "trick3 complete");
		};

		const backflipSnowboarder = new PIXI.AnimatedSprite(textures.backflip);
		backflipSnowboarder.animationSpeed = .15;
		backflipSnowboarder.scale.x = 0.2;
		backflipSnowboarder.scale.y = 0.2;
		backflipSnowboarder.loop = false;
		backflipSnowboarder.onComplete = () => {
			this.swapSprites(player, this.viewport, this.sprites.idle, "trick4 complete");
		};

		const tumbleSnowboarder = new PIXI.AnimatedSprite(textures.tumble);
		tumbleSnowboarder.animationSpeed = .10;
		tumbleSnowboarder.scale.x = 0.2;
		tumbleSnowboarder.scale.y = 0.2;
		tumbleSnowboarder.loop = false;
		tumbleSnowboarder.onComplete = () => {
			this.TUMBLING = false;
			this.swapSprites(player, this.viewport, this.sprites.idle, "tumble complete");
		};

		// Assign sprites and score to the Game
		this.sprites.idle = idleSnowboarder;
		this.sprites.jump = jumpSnowboarder;
		this.sprites.trick1 = tailgrabSnowboarder;
		this.sprites.trick2 = _360Snowboarder;
		this.sprites.trick3 = frontflipSnowboarder;
		this.sprites.trick4 = backflipSnowboarder;
		this.sprites.tumble = tumbleSnowboarder;
		this.score = new Score(this.stateController);

		// global variable so Physics.js can see it
		let deletedBodies = [];

		// Generate physics points for curves
		const allPoints = Physics(this.pixiApp, this.viewport, curves, player, obj, world, deletedBodies);

		// add coins
		this.sprites.trees = Trees(this.songAnalysis.sections, this.songFeatures, allPoints, this.viewport, this.pixiApp);
		this.sprites.coins = Coins(this.songAnalysis, allPoints, this.viewport, player, this.pixiApp, world, deletedBodies, this.score);
		EnvironmentalObjects(curves, allPoints, this.viewport, this.pixiApp, world);
		Bezier(this.viewport, allPoints);

		// add game object to viewport
		this.viewport.addChild(player.followSprite);
		this.viewport.addChild(player.sprite);
		this.viewport.zoomPercent(6.0);

		const followPlayer = () => {
			this.viewport.moveCenter(player.followSprite.position.x + 20, player.followSprite.position.y - 15);
		};

		// world on collision for physics
		world.on("pre-solve", contact => {
			if (this.pixiState === "PLAYING") {
				let fixtureA = contact.getFixtureA();
				let fixtureB = contact.getFixtureB();

				let bodyA = fixtureA.getBody();
				let bodyB = fixtureB.getBody();

				let playerA = bodyA === player.physics;
				let playerB = bodyB === player.physics;

				if (playerA || playerB) {

					if (this.ON_SLOPE === false) {

						if (this.TUMBLING) {
							return;
						}

						if (playingTrickAnimation()) {
							this.consecutiveTricks = 0;
							this.multiplier = 1;
							this.TUMBLING = true;
							this.swapSprites(player, this.viewport, this.sprites.tumble, "tumble");
							return;
						}

						emitter.emit = true;
						this.swapSprites(player, this.viewport, this.sprites.idle, "idle");
					}

					this.ON_SLOPE = true;
					player.physics.applyForce(Planck.Vec2(this.songAnalysis.track.tempo, -100.0), player.position, true);
				}

				if (playerA) {
					// eslint-disable-next-line no-mixed-spaces-and-tabs
					player.sprite.rotation = bodyB.getAngle();
				} else {
					// eslint-disable-next-line no-mixed-spaces-and-tabs
					player.sprite.rotation = bodyA.getAngle();
				}
			}
		});

		const playingTrickAnimation = () => {
			if (this.sprites.trick1.playing != null
				&& this.sprites.trick2.playing != null
				&& this.sprites.trick3.playing != null
				&& this.sprites.trick4.playing != null) {
				return this.sprites.trick1.playing
					|| this.sprites.trick2.playing
					|| this.sprites.trick3.playing
					|| this.sprites.trick4.playing;
			}
			return false;
		};

		const handleActions = () => {
			if (this.actionState.jump === "press" && this.ON_SLOPE === true) {

				emitter.emit = false;
				this.swapSprites(player, this.viewport, this.sprites.jump, "jump");

				player.physics.applyLinearImpulse(Planck.Vec2(this.songAnalysis.track.tempo, -200), player.position, true);
				//player.physics.setAngle(0);
				this.ON_SLOPE = false;
			}

			if (this.actionState.trick1 === "press" && this.ON_SLOPE === false && this.TUMBLING === false && !playingTrickAnimation()) {
				this.swapSprites(player, this.viewport, this.sprites.trick1, "trick1");
			}

			if (this.actionState.trick2 === "press" && this.ON_SLOPE === false && this.TUMBLING === false && !playingTrickAnimation()) {
				this.swapSprites(player, this.viewport, this.sprites.trick2, "trick2");
			}

			if (this.actionState.trick3 === "press" && this.ON_SLOPE === false && this.TUMBLING === false && !playingTrickAnimation()) {
				this.swapSprites(player, this.viewport, this.sprites.trick3, "trick3");
			}

			if (this.actionState.trick4 === "press" && this.ON_SLOPE === false && this.TUMBLING === false && !playingTrickAnimation()) {
				this.swapSprites(player, this.viewport, this.sprites.trick4, "trick4");
			}

		};

		// Timing stuff
		let time0 = performance.now();  // in milliseconds
		let lastCurveTime = time0;
		let curveEndIndex = 0;
		let nextCurveEnding = curves[curveEndIndex][3];
		const handleTime = () => {
			if(player.position.x > nextCurveEnding.x && curveEndIndex < curves.length - 1){
				let currentTime = performance.now();
				let timePassed = (currentTime - lastCurveTime) / 1000.0;   // in seconds
				curveEndIndex += 1;
				nextCurveEnding = curves[curveEndIndex][3];

				//console.log("Time taken to finish curve" + curveEndIndex + " : " + timePassed);
				//console.log("Total time passed: " + ((currentTime - time0) / 1000.0));
				lastCurveTime = currentTime;
			}
		};

		const particle = PIXI.Texture.from("../img/particle.png");
		let emitter = new particles.Emitter(this.viewport, [particle],
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

		for (let i = 1; i < 5; i++) {
			if (trick === "trick" + i +" complete") {
				this.calculateScore(i);
			}
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
			this.score.updateScore(100 * this.multiplier, this.multiplier);
			return;
		case 2:
			this.score.updateScore(250 * this.multiplier, this.multiplier);
			return;
		case 3:
			this.score.updateScore(200 * this.multiplier, this.multiplier);
			return;
		case 4:
			this.score.updateScore(200 * this.multiplier, this.multiplier);
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

		let tailgrab = [
			"tail grab1.png",
			"tail grab2.png",
			"tail grab3.png",
			"tail grab4.png",
			"tail grab5.png",
			"tail grab6.png",
			"tail grab7.png",
			"tail grab8.png",
			"tail grab9.png"
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

		let frontFlip = [
			"front flip1.png",
			"front flip2.png",
			"front flip3.png",
			"front flip4.png",
			"front flip5.png",
			"front flip6.png",
			"front flip7.png",
			"front flip8.png",
			"front flip9.png",
			"front flip10.png",
			"front flip11.png",
			"front flip12.png",
			"front flip13.png"
		];

		let backflip = [
			"backflip1.png",
			"backflip2.png",
			"backflip3.png",
			"backflip4.png",
			"backflip5.png",
			"backflip6.png",
			"backflip7.png",
			"backflip8.png",
			"backflip9.png",
			"backflip10.png",
			"backflip11.png",
			"backflip12.png",
			"backflip13.png",
			"backflip14.png"
		];

		let tumble = [
			"tumble1.png",
			"tumble2.png",
			"tumble3.png",
			"tumble4.png",
			"tumble5.png",
			"tumble6.png",
			"tumble7.png",
			"tumble8.png",
			"tumble9.png",
			"tumble10.png",
			"tumble11.png",
			"tumble12.png",
			"tumble13.png",
			"tumble14.png"
		];

		let idleArray = [];
		let jumpArray = [];
		let tailgrabArray = [];
		let _360Array = [];
		let frontflipArray = [];
		let backflipArray = [];
		let tumbleArray = [];

		for (let i = 0; i < idle.length; i++) {
			let texture = PIXI.Texture.from("/img/" + idle[i]);
			idleArray.push(texture);
		}

		for (let i = 0; i < jump.length; i++) {
			let texture = PIXI.Texture.from("/img/" + jump[i]);
			jumpArray.push(texture);
		}

		for (let i = 0; i < tailgrab.length; i++) {
			let texture = PIXI.Texture.from("/img/" + tailgrab[i]);
			tailgrabArray.push(texture);
		}

		for (let i = 0; i < _360.length; i++) {
			let texture = PIXI.Texture.from("/img/" + _360[i]);
			_360Array.push(texture);
		}

		for (let i = 0; i < frontFlip.length; i++) {
			let texture = PIXI.Texture.from("/img/" + frontFlip[i]);
			frontflipArray.push(texture);
		}

		for (let i = 0; i < backflip.length; i++) {
			let texture = PIXI.Texture.from("/img/" + backflip[i]);
			backflipArray.push(texture);
		}

		for (let i = 0; i < tumble.length; i++) {
			let texture = PIXI.Texture.from("/img/" + tumble[i]);
			tumbleArray.push(texture);
		}

		return {
			idle: idleArray,
			jump: jumpArray,
			tailgrab: tailgrabArray,
			_360: _360Array,
			frontflip: frontflipArray,
			backflip: backflipArray,
			tumble: tumbleArray
		};
	}

	/**
	 * Allows input to be received and affect characters in game. Notifies website
	 * to initiate song playback!
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
