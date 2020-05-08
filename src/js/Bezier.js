const PIXI = require("pixi.js");

/**
 * Creates the drawing of the mountain slope
 * @param viewport - the camera viewport
 * @param curvePoints - the points of the mountain slope
 */
function Bezier(viewport, curvePoints) {
	const bezier = new PIXI.Graphics();
	const texture = PIXI.Texture.from("..//img/slope tile.png", {wrapMode: PIXI.WRAP_MODES.REPEAT});

	bezier.lineStyle(1, 0xFFFFFF, 1);
	bezier.beginTextureFill(texture);
	bezier.position.x = 0;
	bezier.position.y = 0;

	drawCurves(bezier, curvePoints);

	viewport.addChild(bezier);
}

module.exports = Bezier;


function drawCurves(bezier, curvePoints) {

	let currentPos = {
		x: bezier.position.x,
		y: bezier.position.y
	};

	for (let i = 0; i < curvePoints.length; i++) {

		const vertex = curvePoints[i];

		bezier.lineTo(vertex.x, vertex.y);

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
