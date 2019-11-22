const PIXI = require("pixi.js");
const Planck = require("planck-js");
//let songAnalysis = require("../../static/json/SmokeandGunsAnalysis");
//let songFeatures = require("../../static/json/SmokeandGunsFeatures");
const Vec2 = Planck.Vec2;


// Algorithm to generate the tune mountain
// y = -1 up, y = +1 down, x = -1 left, x = +1 right
function GenerationAlgorithm (audioAnalysis, audioFeatures){
	let startPoint = Vec2(5, 5);
	let currentPoint = Vec2(5,5);
	let songLength = audioAnalysis.track.duration;
	let timeSignature = audioFeatures.time_signature;
	let curves = [];
	let currentCurve = new PIXI.Graphics();
	let singleCurvePoints = [];
	let start, end, beatIterator, curveBeats;
	let currentTime = 0;


	for(let i = 0; i < audioAnalysis.sections.length; i+=1){
		let  c0, c1, cMax, cMin;

		//let currentBar = audioAnalysis.bars[i];
		//let currentSection = getCurrentSection(currentBar.start);
		let currentSection = audioAnalysis.sections[i];
		currentTime = currentSection.start;

		let durationMultiplier = timeToLength(currentSection);

		start = currentPoint;
		/*
		// Random points

		//c0 = Vec2(getRandomInt(start.x, end.x), getRandomInt(start.y - 3, end.y + 3)); // get a random control point between start and end points
		//c1 = Vec2(getRandomInt(start.x, end.x), getRandomInt(start.y - 3, end.y + 3)); // get a random control point between start and end points

		*/

		//console.log(durationMultiplier);
		end = Vec2(start.x + (currentSection.duration * durationMultiplier), start.y + ((50 + currentSection.loudness) * 20)); // add bar duration and loudness to move endpoint

		cMax = Vec2(end.x + (audioFeatures.valence * 100), start.y - (audioFeatures.energy * 50)); // create control Box
		cMin = Vec2(start.x - (audioFeatures.valence * 100), end.y + (audioFeatures.energy * 50));

		let divideBox = (cMax.x - cMin.x) / (timeSignature);         // divide control box into time signature number

		c0 = Vec2(cMin.x + (divideBox), cMin.y + (currentSection.key * 10));
		c1 = Vec2(cMax.x - (divideBox * (timeSignature / 2)), cMax.y - (currentSection.key * 10));

		singleCurvePoints.push(start, c0, c1, end);
		curves.push(singleCurvePoints);


		currentPoint = end;
		singleCurvePoints = [];

		// add one long line at the end
		if(i === (audioAnalysis.sections.length - 1)){
			start = end;
			c0 = start;
			c0.x += 100;
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
	// returns the length of section depending on total time
	function timeToLength(section){
		let multiplier = 9;
		let durationPercent = (section.duration / songLength) * 100;
		//let curveLength = durationPercent;
		return durationPercent * multiplier;
	}

	return curves;

}

module.exports = GenerationAlgorithm;