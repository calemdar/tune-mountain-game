const exampleAnalysis = require("../../static/json/SmokeandGunsAnalysis"),
	exampleFeatures = require("../../static/json/SmokeandGunsFeatures");
const Game = require("../js/Game");
const {GameStateController, GameStateEnums} = require("tune-mountain-input-manager");

// script that will run on website --> root for bundle

// this will immediately emit a generate message with generic analysis and features
const mockStateController = new GameStateController();
mockStateController.request(GameStateEnums.GENERATE, {
	"analysis": exampleAnalysis,
	"features": exampleFeatures
});

// if you want to test state switching, do the following:
// mockStateController.next( ... etc );

// fetches canvas specific to this testing environment
const canvas = document.getElementById("mycanvas");

// init game

new Game(mockStateController, canvas);