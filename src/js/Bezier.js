const PIXI = require("pixi.js");

function Bezier(viewport, curvePoints) {
	const bezier = new PIXI.Graphics();
	const points = new PIXI.Graphics();
	const texture = PIXI.Texture.from("..//img/slope tile.png", {wrapMode: PIXI.WRAP_MODES.REPEAT});

	// Initialize graphics elements
	points.lineStyle(0);
	points.beginFill(0xFFFFFF, 1);
	bezier.lineStyle(1, 0xFFFFFF, 1);
	bezier.beginTextureFill(texture);
	bezier.position.x = 0;
	bezier.position.y = 0;

	drawCurves(bezier, points, curvePoints);

	points.endFill();

	viewport.addChild(bezier);
	viewport.addChild(points);
}

module.exports = Bezier;


function drawCurves(bezier, points, curvePoints) {

	let currentPos = {
		x: bezier.position.x,
		y: bezier.position.y
	};

	for (let i = 0; i < curvePoints.length; i++) {

		/*
		const controlPoint1X = curvePoints[i][1].x;
		const controlPoint1Y = curvePoints[i][1].y;
		const controlPoint2X = curvePoints[i][2].x;
		const controlPoint2Y = curvePoints[i][2].y;
		const finalPointX = curvePoints[i][3].x;
		const finalPointY = curvePoints[i][3].y;

		 */
		// new point system
		const vertex = curvePoints[i];

		/**  First two params: first control point
			 Second two params: second control point
			 Final params: destination point
			 Draw curves
		 */
		//bezier.bezierCurveTo(controlPoint1X, controlPoint1Y,
		//	controlPoint2X, controlPoint2Y,
		//	finalPointX, finalPointY);

		bezier.lineTo(vertex.x, vertex.y);

		// Not necessary, just for viewing points
		//points.drawCircle(controlPoint1X, controlPoint1Y, 2);
		//points.drawCircle(controlPoint2X, controlPoint2Y, 2);
		//points.drawCircle(finalPointX, finalPointY, 2);

		currentPos.x = vertex.x;
		currentPos.y = vertex.y;
	}

	bezier.lineTo(currentPos.x, currentPos.y + 200);
	bezier.lineTo(-100, currentPos.y + 200);
	bezier.lineTo(-100, 0);
	bezier.lineTo(0, 0);
	bezier.closePath();
	bezier.endFill();
}
