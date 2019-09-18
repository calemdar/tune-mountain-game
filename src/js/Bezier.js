const PIXI = require("pixi.js");

const songAnal = {
	"bars": [{
		"start": 251.98282,
		"duration": 0.29765,
		"confidence": 0.652
	}],
	"beats": [{
		"start": 251.98282,
		"duration": 0.29765,
		"confidence": 0.652
	}],
	"sections": [{
		"start": 237.02356,
		"duration": 18.32542,
		"confidence": 1,
		"loudness": -20.074,
		"tempo": 98.253,
		"tempo_confidence": 0.767,
		"key": 5,
		"key_confidence": 0.327,
		"mode": 1,
		"mode_confidence": 0.566,
		"time_signature": 4,
		"time_signature_confidence": 1
	}],
	"segments": [{
		"start": 252.15601,
		"duration": 3.19297,
		"confidence": 0.522,
		"loudness_start": -23.356,
		"loudness_max_time": 0.06971,
		"loudness_max": -18.121,
		"loudness_end": -60,
		"pitches": [
			0.709,
			0.092,
			0.196,
			0.084,
			0.352,
			0.134,
			0.161,
			1,
			0.17,
			0.161,
			0.211,
			0.15
		],
		"timbre": [
			23.312,
			-7.374,
			-45.719,
			294.874,
			51.869,
			-79.384,
			-89.048,
			143.322,
			-4.676,
			-51.303,
			-33.274,
			-19.037
		]
	}],
	"tatums": [{
		"start": 251.98282,
		"duration": 0.29765,
		"confidence": 0.652
	}],
	"track": {
		"duration": 255.34898,
		"sample_md5": "",
		"offset_seconds": 0,
		"window_seconds": 0,
		"analysis_sample_rate": 22050,
		"analysis_channels": 1,
		"end_of_fade_in": 0,
		"start_of_fade_out": 251.73333,
		"loudness": -11.84,
		"tempo": 98.002,
		"tempo_confidence": 0.423,
		"time_signature": 4,
		"time_signature_confidence": 1,
		"key": 5,
		"key_confidence": 0.36,
		"mode": 0,
		"mode_confidence": 0.414,
		"codestring": "eJxVnAmS5DgOBL-ST-B9_P9j4x7M6qoxW9tpsZQSCeI...",
		"code_version": 3.15,
		"echoprintstring": "eJzlvQmSHDmStHslxw4cB-v9j_A-tahhVKV0IH9...",
		"echoprint_version": 4.12,
		"synchstring": "eJx1mIlx7ToORFNRCCK455_YoE9Dtt-vmrKsK3EBsTY...",
		"synch_version": 1,
		"rhythmstring": "eJyNXAmOLT2r28pZQuZh_xv7g21Iqu_3pCd160xV...",
		"rhythm_version": 1
	}
};

function Bezier(game) {
	const bezier = new PIXI.Graphics();
	const points = new PIXI.Graphics();

	// Initialize graphics elements
	points.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
	points.beginFill(0xFFFFFF, 1);
	bezier.lineStyle(5, 0xAA0000, 1);
	bezier.position.x = 25;
	bezier.position.y = 25;

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

	game.stage.addChild(bezier);
	game.stage.addChild(points);
}

module.exports = Bezier;

/**
function drawCurves() {
	for (let i = 0; i <= songAnal.bars.length; i++) {
		// Dancability to determine vertical displacement between control points
		// Valence to determine horizontal displacement
		// Energy to determine max values for just vertical - max would be 175px
		const controlPoint1X = currentPos.x +;
		const controlPoint1Y = currentPos.y +;
		const controlPoint2X = currentPos.x +;
		const controlPoint2Y = currentPos.y +;
		const finalPointX = currentPos.x + (conversion(songAnal.bars[i].duration));
		const finalPointY = currentPos.y + (conversion(songFeat.loudness));

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

function createControlPoint(point) {

}

 */