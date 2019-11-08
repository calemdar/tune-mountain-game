const PIXI = require("pixi.js");
const Planck = require("planck-js");
let songAnalysis = require("../../static/json/SmokeandGunsAnalysis");
let songFeatures = require("../../static/json/SmokeandGunsFeatures");
const Vec2 = Planck.Vec2;


// Algorithm to generate the tune mountain
function GenerationAlgorithm (audioAnalysis, audioFeatures){
	let startPoint = Vec2(5, 5);
	let currentPoint = Vec2(5,5);
	let songLength = audioAnalysis.track.duration;
	let curves = [];
	let currentCurve = new PIXI.Graphics();
	let singleCurvePoints = [];



	for(let i = 0; i < audioAnalysis.bars.length; i+=1){
		let start, end, c0, c1, cMax, cMin;
		let currentBar = audioAnalysis.bars[i];

		start = currentPoint;
		// delete this
		console.log(currentPoint);

		end = Vec2(start.x + (currentBar.duration * 100), start.y + (audioFeatures.loudness + 100)); // add bar duration and loudness to move endpoint


		c0 = Vec2(getRandomInt(start.x, end.x), getRandomInt(start.y - 3, end.y + 3)); // get a random control point between start and end points
		c1 = Vec2(getRandomInt(start.x, end.x), getRandomInt(start.y - 3, end.y + 3)); // get a random control point between start and end points

		/*
		cMax = Vec2(end.x + (audioFeatures.valence * 100), start.y - (audioFeatures.energy * 100)); // create control Box
		cMin = Vec2(start.x - (audioFeatures.valence * 100), end.y + (audioFeatures.energy * 100));


		let divideBox = (cMax.x - cMin.x) / audioFeatures.time_signature;         // divide control box into time signature number
		c0 = Vec2(cMin.x + (divideBox), cMin.y + (audioFeatures.danceability * 10));
		c1 = Vec2(cMax.x - (divideBox), cMax.y +  (audioFeatures.danceability * 10));

		*/

		singleCurvePoints.push(start, c0, c1, end);
		curves.push(singleCurvePoints);


		currentPoint = end;
		singleCurvePoints = [];

	}

	function getRandomInt(min, max) {
		return Math.random() * (max - min) + min;
	}

	// move matrix calculations into seperate module
	function addVec(vector1, vector2) {
		let result = Vec2();

		result.x = vector1.x + vector2.x;
		result.y = vector1.y + vector2.y;

		return result;
	}

	// check data confidence
	function checkConfidence(conf) {
		let maxConf = 0.6;
		return conf > maxConf; // true if confidence is higher, false otherwise
	}

	return curves;

}

module.exports = GenerationAlgorithm;