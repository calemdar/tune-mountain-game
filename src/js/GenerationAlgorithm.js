const PIXI = require("pixi.js");
const Planck = require("planck-js");
//let songAnalysis = require("../../static/json/SmokeandGunsAnalysis");
//let songFeatures = require("../../static/json/SmokeandGunsFeatures");
const Vec2 = Planck.Vec2;


// Algorithm to generate the tune mountain
// y = -1 up, y = +1 down, x = -1 left, x = +1 right
function GenerationAlgorithm (audioAnalysis, audioFeatures){

	let currentPoint = Vec2(-10,0);
	let maxMountainLength = Vec2(100, 300);
	let songLength = audioAnalysis.track.duration;
	let timeSignature = audioFeatures.time_signature;
	let curves = [];
	let currentCurve = new PIXI.Graphics();
	let singleCurvePoints = [];
	let start, end, beatIterator, curveBeats;
	let currentTime = 0;

	// Run thorugh all sections
	for(let i = 0; i < audioAnalysis.sections.length; i+=1){
		let  c0, c1, cUp, cBottom;

		let currentSection = audioAnalysis.sections[i];
		currentTime = currentSection.start;

		let durationMultiplier = timeToLength(currentSection);

		/*
		// Random points

		//c0 = Vec2(getRandomInt(start.x, end.x), getRandomInt(start.y - 3, end.y + 3)); // get a random control point between start and end points
		//c1 = Vec2(getRandomInt(start.x, end.x), getRandomInt(start.y - 3, end.y + 3)); // get a random control point between start and end points

		*/

		// Start and end points of new section curve
		start = currentPoint;
		end = Vec2(start.x + (currentSection.duration * durationMultiplier), start.y + ((50 + currentSection.loudness) * (durationMultiplier / 2)));

		// Create control Box for section curve
		cUp = Vec2(start.x - (audioFeatures.valence * 10), start.y + (audioFeatures.energy * 5));
		cBottom = Vec2(end.x + (audioFeatures.valence * 10), end.y - (audioFeatures.energy * 5));

		// Divide control box into time signature number
		let divideBox = (cBottom.x - cUp.x) / (timeSignature);

		// Section curve control points
		c0 = Vec2(cBottom.x + (divideBox), cBottom.y + (currentSection.key));
		c1 = Vec2(cUp.x - (divideBox * (timeSignature / 2)), cUp.y - (currentSection.key));

		// Push current section curve into curve arrays
		singleCurvePoints.push(start, c0, c1, end);
		curves.push(singleCurvePoints);

		// Change current point to the end of the section curve
		currentPoint = end;
		singleCurvePoints = [];

		// add one long line at the end
		if(i === (audioAnalysis.sections.length - 1)){
			start = end;
			c0 = start;
			c0.x += 200;
			c1 = c0;
			end = start;
			end.x += 500;

			singleCurvePoints.push(start, c0, c1, end);
			curves.push(singleCurvePoints);
			currentPoint = end;
			singleCurvePoints = [];
		}

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

	// helper function to looki into sections
	function getCurrentSection(currentTime) {
		let section;
		for(let i = 0; i < audioAnalysis.sections.length; i += 1){
			section = audioAnalysis.sections[i];
			//console.log(section);
			//console.log(currentTime);

			// checks if within the correct duration
			if(section.start <= currentTime && ((section.start + section.duration) > currentTime)){

				return section;
			}
			console.log("didnt find section");
		}

	}

	// returns a float representing the length of section within the entire song
	function timeToLength(section){

		let durationPercent = ((section.duration / songLength) * 100);
		//let curveLength = durationPercent;
		return durationPercent;
	}

	return curves;

}

module.exports = GenerationAlgorithm;