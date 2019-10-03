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

	let currentPos = {
		x: bezier.position.x,
		y: bezier.position.y
	};

	/**  First two params: first control point
	 Second two params: second control point
	 Final params: destination point
	 Draw curves
	 MAX CPY change - 175 pixels
	 MAX CPX change -
	*/
	bezier.bezierCurveTo(100, 200, 200, 200, 240, 100);
	bezier.bezierCurveTo(250, 50, 400, 150, 500, 200);

	// Draw control and final position points
	points.drawCircle(100, 200, 2);
	points.drawCircle(200, 200, 2);
	points.drawCircle(250, 50, 2);
	points.drawCircle(400, 150, 2);
	points.endFill();
	points.beginFill(0x00AA00, 1);
	points.drawCircle(240, 100, 2);
	points.drawCircle(500, 200, 2);
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

/*
function drawCurves(bezier, points) {

	let currentPos = {
		x: bezier.position.x,
		y: bezier.position.y
	};
	let j = 0;

	for (let i = 0; i <= songAnalysis.bars.length; i++) {
		// Dancability to determine vertical displacement between control points
		// Valence to determine horizontal displacement
		// Energy to determine max values for just vertical - max would be 175px
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

		const finalXVariation = songAnalysis.bars[i].duration * 10;
		for (let k = 0; k <= segments.length; k++) {

		}

		const controlPoint1X = currentPos.x +;
		const controlPoint1Y = currentPos.y +;
		const controlPoint2X = currentPos.x +;
		const controlPoint2Y = currentPos.y +;
		const finalPointX = currentPos.x + finalXVariation;
		const finalPointY = currentPos.y + loudnessToPixels(songFeatures.loudness, finalXVariation);

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
*/

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

/*
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