const PIXI = require("pixi.js");
let songAnalysis = require("../../static/json/SmokeandGunsAnalysis");
let songFeatures = require("../../static/json/SmokeandGunsFeatures");
const Planck = require("planck-js");


function Bezier(viewport, curvePoints) {
	const bezier = new PIXI.Graphics();
	const points = new PIXI.Graphics();
	const texture = PIXI.Texture.from("..//img/husky.png");

	// Initialize graphics elements
	points.lineStyle(0);
	points.beginFill(0xFFFFFF, 1);
	bezier.lineStyle(5, 0x0000AA, 1);
	bezier.beginTextureFill(texture);
	bezier.position.x = 5;
	bezier.position.y = 5;

	drawCurves(bezier, points, curvePoints);

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


function drawCurves(bezier, points, curvePoints) {

	let currentPos = {
		x: bezier.position.x,
		y: bezier.position.y
	};
	let j = 0;

	for (let i = 0; i < curvePoints.length; i++) {

		const controlPoint1X = curvePoints[i][1].x;
		const controlPoint1Y = curvePoints[i][1].y;
		const controlPoint2X = curvePoints[i][2].x;
		const controlPoint2Y = curvePoints[i][2].y;
		const finalPointX = curvePoints[i][3].x;
		const finalPointY = curvePoints[i][3].y;

		/**  First two params: first control point
			 Second two params: second control point
			 Final params: destination point
			 Draw curves
		 */
		bezier.bezierCurveTo(controlPoint1X, controlPoint1Y,
			controlPoint2X, controlPoint2Y,
			finalPointX, finalPointY);

		// Not necessary, just for viewing points
		//points.drawCircle(controlPoint1X, controlPoint1Y, 2);
		//points.drawCircle(controlPoint2X, controlPoint2Y, 2);
		//points.drawCircle(finalPointX, finalPointY, 2);

		currentPos.x = finalPointX;
		currentPos.y = finalPointY;
	}

	bezier.lineTo(currentPos.x, currentPos.y + 200);
	bezier.lineTo(-100, currentPos.y + 200);
	bezier.lineTo(-100, 5);
	bezier.lineTo(5, 5);
	bezier.closePath();
	bezier.endFill();
}
