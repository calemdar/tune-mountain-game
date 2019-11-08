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

// example data
const exampleAnalysis = {
	"bars": [
		{
			"start": 251.98282,
			"duration": 1.0,
			"confidence": 0.652
		},
		{
			"start": 252.98282,
			"duration": 1.0,
			"confidence": 0.652
		},
		{
			"start": 253.98282,
			"duration": 1.0,
			"confidence": 0.652
		}
	],
	"beats": [
		{
			"start": 251.98282,
			"duration": 0.5,
			"confidence": 0.652
		},
		{
			"start": 252.98282,
			"duration": 0.5,
			"confidence": 0.652
		},
		{
			"start": 253.98282,
			"duration": 0.5,
			"confidence": 0.652
		}
	],
	"sections": [{
		"start": 237.02356,
		"duration": 18.32542,
		"confidence": 1,
		"loudness": -20.074,
		"tempo": 98.253,
		"tempo_confidence": 0.767,
		"key": 5,
		"key_confidence": 0.327,
		"mode": 1,
		"mode_confidence": 0.566,
		"time_signature": 4,
		"time_signature_confidence": 1
	}],
	"segments": [{
		"start": 252.15601,
		"duration": 3.19297,
		"confidence": 0.522,
		"loudness_start": -23.356,
		"loudness_max_time": 0.06971,
		"loudness_max": -18.121,
		"loudness_end": -60,
		"pitches": [
			0.709,
			0.092,
			0.196,
			0.084,
			0.352,
			0.134,
			0.161,
			1,
			0.17,
			0.161,
			0.211,
			0.15
		],
		"timbre": [
			23.312,
			-7.374,
			-45.719,
			294.874,
			51.869,
			-79.384,
			-89.048,
			143.322,
			-4.676,
			-51.303,
			-33.274,
			-19.037
		]
	}],
	"tatums": [{
		"start": 251.98282,
		"duration": 0.29765,
		"confidence": 0.652
	}],
	"track": {
		"duration": 255.34898,
		"sample_md5": "",
		"offset_seconds": 0,
		"window_seconds": 0,
		"analysis_sample_rate": 22050,
		"analysis_channels": 1,
		"end_of_fade_in": 0,
		"start_of_fade_out": 251.73333,
		"loudness": -11.84,
		"tempo": 98.002,
		"tempo_confidence": 0.423,
		"time_signature": 4,
		"time_signature_confidence": 1,
		"key": 5,
		"key_confidence": 0.36,
		"mode": 0,
		"mode_confidence": 0.414,
		"codestring": "eJxVnAmS5DgOBL-ST-B9_P9j4x7M6qoxW9tpsZQSCeI...",
		"code_version": 3.15,
		"echoprintstring": "eJzlvQmSHDmStHslxw4cB-v9j_A-tahhVKV0IH9...",
		"echoprint_version": 4.12,
		"synchstring": "eJx1mIlx7ToORFNRCCK455_YoE9Dtt-vmrKsK3EBsTY...",
		"synch_version": 1,
		"rhythmstring": "eJyNXAmOLT2r28pZQuZh_xv7g21Iqu_3pCd160xV...",
		"rhythm_version": 1
	}
};
const exampleFeatures = {
	"duration_ms" : 255349,
	"key" : 5,
	"mode" : 0,
	"time_signature" : 4,
	"acousticness" : 0.514,
	"danceability" : 0.735,
	"energy" : 0.578,
	"instrumentalness" : 0.0902,
	"liveness" : 0.159,
	"loudness" : -11.840,
	"speechiness" : 0.0461,
	"valence" : 0.624,
	"tempo" : 98.002,
	"id" : "06AKEBrKUckW0KREUWRnvT",
	"uri" : "spotify:track:06AKEBrKUckW0KREUWRnvT",
	"track_href" : "https://api.spotify.com/v1/tracks/06AKEBrKUckW0KREUWRnvT",
	"analysis_url" : "https://api.spotify.com/v1/audio-analysis/06AKEBrKUckW0KREUWRnvT",
	"type" : "audio_features"
};

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

const canvas = document.getElementById("mycanvas");

const game = new PIXI.Application({
	view: canvas,
	width: window.innerWidth,
	height: window.innerHeight,
	antialias: true
});

const actionState = {};

let curves = GenerateCurve(exampleAnalysis, exampleFeatures);
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