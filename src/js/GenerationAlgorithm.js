const PIXI = require("pixi.js");
const Planck = require("planck-js");
//let songAnalysis = require("../../static/json/SmokeandGunsAnalysis");
//let songFeatures = require("../../static/json/SmokeandGunsFeatures");
const Vec2 = Planck.Vec2;


// Algorithm to generate the tune mountain
// y = -1 up, y = +1 down, x = -1 left, x = +1 right
function GenerationAlgorithm (audioAnalysis, audioFeatures){

	let currentPoint = Vec2(-10,0);
	let songLength = audioAnalysis.track.duration;
	let timeSignature = audioFeatures.time_signature;
	let curves = [];
	let currentCurve = new PIXI.Graphics();
	let singleCurvePoints = [];
	let start, end, beatIterator, curveBeats;

	// Run thorugh all sections
	for(let i = 0; i < audioAnalysis.sections.length; i+=1){
		let  c0, c1, cUp, cBottom;

		let currentSection = audioAnalysis.sections[i];

		let durationMultiplier = timeToLength(currentSection);
		console.log("Section time: " + currentSection.duration);
		/*
		// Random points

		//c0 = Vec2(getRandomInt(start.x, end.x), getRandomInt(start.y - 3, end.y + 3)); // get a random control point between start and end points
		//c1 = Vec2(getRandomInt(start.x, end.x), getRandomInt(start.y - 3, end.y + 3)); // get a random control point between start and end points

		*/

		// Start and end points of new section curve
		start = currentPoint;
		end = Vec2(start.x + (currentSection.duration), start.y + (50 + currentSection.loudness));

		end = extendCurve(currentSection, start, end, audioFeatures.tempo);

		// Create control Box for section curve
		cUp = Vec2(start.x - (audioFeatures.valence * 100), start.y + (audioFeatures.energy * 50));
		cBottom = Vec2(end.x + (audioFeatures.valence * 100), end.y - (audioFeatures.energy * 50));

		// Divide control box into time signature number
		let divideBox = (cBottom.x - cUp.x) / (timeSignature);

		// Section curve control points
		c0 = Vec2(cUp.x + (divideBox), cBottom.y + (audioFeatures.danceability * 10));
		c1 = Vec2(cBottom.x - (divideBox * (timeSignature / 2)), cUp.y - (audioFeatures.danceability * 10));

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
			end.x += 1000;

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

	// Utility to find the angle between two Vec2 points in radians
	function findAngle(point1, point2) {

		let angle = Math.atan2(point2.y - point1.y, point2.x - point1.x);
		return angle;
	}

	function radianToDegree(radian) {
		let degree = radian * 180 / Math.PI;
		return degree;
	}

	// returns a float representing the length of section within the entire song
	function timeToLength(section){
		//let multiplier = 4;
		let durationPercent = ((section.duration / songLength) * 100);

		return durationPercent;
	}

	function extendCurve(section, startPoint, endPoint, tempo){

		let sectionAngle = radianToDegree(findAngle(startPoint, endPoint));
		let durationMultiplier = timeToLength(section);
		let xLength = (endPoint.x - startPoint.x);
		let yLength = (endPoint.y - startPoint.y);
		//console.log("Initial curve X len: " + xLength + " Y len: " + yLength + " Angle: " + sectionAngle);


		if (sectionAngle > 0 && sectionAngle <= 10){
			endPoint.x += xLength * (tempo / 1.50) ;
			endPoint.y += (yLength * (tempo / 1.50)) / 3.0;

		}
		else if (sectionAngle > 10 && sectionAngle <= 20){
			endPoint.x += xLength * (tempo / 1.52);
			endPoint.y += (yLength * (tempo / 1.52)) / 3.0;

		}
		else if (sectionAngle > 20 && sectionAngle <= 30){
			endPoint.x += xLength * (tempo / 1.54);
			endPoint.y += (yLength * (tempo / 1.54)) / 3.0;

		}
		else if (sectionAngle > 30 && sectionAngle <= 40){
			endPoint.x += xLength * (tempo / 1.56);
			endPoint.y += (yLength * (tempo / 1.56)) / 3.0;

		}
		else if (sectionAngle > 40 && sectionAngle <= 50){
			endPoint.x += xLength * (tempo / 1.60);
			endPoint.y += (yLength * (tempo / 1.60)) / 3.0;

		}
		else if (sectionAngle > 50 && sectionAngle <= 60){
			endPoint.x += xLength * (tempo / 1.62);
			endPoint.y += (yLength * (tempo / 1.62)) / 3.0;

		}
		else if (sectionAngle > 60 && sectionAngle <= 70){
			endPoint.x += xLength * (tempo / 1.65);
			endPoint.y += (yLength * (tempo / 1.65)) / 3.0;

		}
		else if (sectionAngle > 70 && sectionAngle <= 80){
			endPoint.x += xLength * (tempo / 1.60);
			endPoint.y += (yLength * (tempo / 1.60)) / 3.0;

		}
		else if (sectionAngle > 80 && sectionAngle <= 90){
			endPoint.x += xLength * (tempo / 1.60);
			endPoint.y += (yLength * (tempo / 1.60)) / 3.0;

		}
		//console.log("Final curve X len: " + (endPoint.x - startPoint.x) + " Y len: " + (endPoint.y - startPoint.y) + " Angle: " + radianToDegree(findAngle(startPoint, endPoint)));

		return endPoint;
	}

	return curves;

}

module.exports = GenerationAlgorithm;