const PIXI = require("pixi.js");
let songAnalysis = require("../../static/json/SmokeandGunsAnalysis");
let songFeatures = require("../../static/json/SmokeandGunsFeatures");


function Bezier(viewport) {
	const bezier = new PIXI.Graphics();
	const points = new PIXI.Graphics();

	// Initialize graphics elements
	points.lineStyle(0);
	points.beginFill(0xFFFFFF, 1);
	bezier.lineStyle(5, 0xAA0000, 1);
	bezier.position.x = 15;
	bezier.position.y = 15;

	drawCurves(bezier, points);

	points.endFill();

	viewport.addChild(bezier);
	viewport.addChild(points);
}

/*
function Bezier(viewport) {
	console.log(songAnalysis);
}
*/

module.exports = Bezier;


function drawCurves(bezier, points) {

	let currentPos = {
		x: bezier.position.x,
		y: bezier.position.y
	};
	let j = 0;

	for (let i = 0; i < songAnalysis.bars.length; i++) {
		/*
		let barStart = songAnalysis.bars[i].start;
		let barFinish = songAnalysis.bars[i].duration + barStart;
		let segments = [];
		let addedSegment = false;

		for (j; j <= songAnalysis.segments.length; j++) {
			let segmentStart = songAnalysis.segments[j].start;
			let segmentFinish = songAnalysis.segments[j].duration + barStart;
			if (segmentStart >= barStart && segmentFinish <= barFinish) {
				segments.push(songAnalysis.segments[j]);

				if (!addedSegment)
					addedSegment = true;
			}
			else {
				if (addedSegment)
					break;
			}
		}
		*/

		const finalXVariation = songAnalysis.bars[i].duration;
		const controlPoint1X = currentPos.x + featuretoPixel(songFeatures.acousticness, finalXVariation * 5);
		const controlPoint1Y = currentPos.y + featuretoPixel(songFeatures.danceability, finalXVariation * 5);
		const controlPoint2X = currentPos.x + featuretoPixel(songFeatures.valence, finalXVariation * 5);
		const controlPoint2Y = currentPos.y + featuretoPixel(songFeatures.energy, finalXVariation * 5);
		const finalPointX = currentPos.x + finalXVariation * 10;
		const finalPointY = currentPos.y + loudnessToPixels(songFeatures.loudness, finalXVariation * 10);

		/**  First two params: first control point
			 Second two params: second control point
			 Final params: destination point
			 Draw curves
			 MAX CPY change - 175 pixels
			 MAX CPX change -
		 */
		bezier.bezierCurveTo(controlPoint1X, controlPoint1Y,
			controlPoint2X, controlPoint2Y,
			finalPointX, finalPointY);

		// Not necessary, just for viewing points
		points.drawCircle(controlPoint1X, controlPoint1Y, 2);
		points.drawCircle(controlPoint2X, controlPoint2Y, 2);
		points.drawCircle(finalPointX, finalPointY, 2);

		currentPos.x = finalPointX;
		currentPos.y = finalPointY;
	}
}


function loudnessToPixels(loudness, xDistance) {
	let finalY;

	switch(true) {
	case loudness > -10:
		finalY = xDistance * 2;
		break;
	case (loudness > -30 && loudness <= -10):
		finalY = xDistance * 1.5;
		break;
	case (loudness > -50 && loudness <= -30):
		finalY = xDistance;
		break;
	case loudness <= -50:
		finalY = xDistance * 0.5;
		break;
	}

	return finalY;
}

function featuretoPixel(feature, finalXDistance) {
	let distance;

	switch(true) {
	case feature > 0.9:
		distance = finalXDistance * 2;
		break;
	case (feature > 0.6 && feature <= 0.9):
		distance = finalXDistance * 1.5;
		break;
	case (feature > 0.3 && feature <= 0.6):
		distance = finalXDistance;
		break;
	case feature <= 0.3:
		distance = finalXDistance * 0.5;
		break;
	}

	return distance;
}

/*
// Dancability to determine vertical displacement between control points
		// Valence to determine horizontal displacement
		// Energy to determine max values for just vertical - max would be 175px
function createControlPoint(point, currentPos) {
	let maxY;
	let xDisplacement;
	let yDisplacement;

	switch(true) {
	case songFeatures.energy > 0.9:
		maxY = 175;
		break;
	case (songFeatures.energy > 0.6 && songFeatures.energy <= 0.9):
		maxY = 125;
		break;
	case (songFeatures.energy > 0.3 && songFeatures.energy <= 0.6):
		maxY = 100;
		break;
	case songFeatures.energy <= 0.3:
		maxY = 50;
		break;
	}
}
 */