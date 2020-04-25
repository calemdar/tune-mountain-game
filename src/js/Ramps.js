const PIXI = require("pixi.js");
const Planck = require("planck-js");
const Vec2 = Planck.Vec2;
const GameObject = require("./GameObject");


/**
 * @return {number}
 */
function Ramps(curves, allPoints, viewport, game, world) {
	const obj = new GameObject();
	const texture = PIXI.Texture.from("../img/ramp.png");

	let sectionCounter = 0;
	for (let i = 0; i < allPoints.length; i++) {

		if (allPoints[i].x === curves[sectionCounter][3].x
			&& allPoints[i].y === curves[sectionCounter][3].y) {

			sectionCounter++;
			createRamp(allPoints, i, findAngle(allPoints[i - 1], allPoints[i]));

			if (sectionCounter === curves.length - 1) {
				break;
			}
		}
	}

	function createRamp(allPoints, i, rotation) {
		let ramp = new PIXI.Sprite(texture);

		ramp.scale.x = 0.3;
		ramp.scale.y = 0.3;
		ramp.anchor.x = 1.0;
		ramp.anchor.y = 1.0;
		ramp.position.x = allPoints[i].x;
		ramp.position.y = allPoints[i].y;
		ramp.rotation = rotation;
		let bounds = ramp.getBounds();

		let vertex1 = {x: allPoints[i - 1].x - 5, y: allPoints[i - 1].y - 5};
		let vertex2 = {x: allPoints[i].x + 50, y: allPoints[i].y - 20};
		let linelength = findMagnitude(subtractVec(vertex2, vertex1));

		let rampPhysics = world.createBody().setStatic();
		let rampFixture = rampPhysics.createFixture(Planck.Box(linelength, 0.01), 1.0);
		rampFixture.setFriction(.1);
		rampPhysics.setPosition(findMidpoint(vertex1, vertex2));
		let angle = findAngle(vertex1, vertex2);
		rampPhysics.setAngle(angle);

		//let coinObj = obj.create({name: "coin"+ coinSprites.length, position: coin.position, physics: coinPhysics});
		viewport.addChild(ramp);
	}

	// Utility to find the angle between two Vec2 points
	function findAngle(point1, point2) {
		return Math.atan2(point2.y - point1.y, point2.x - point1.x);
	}

	// Utility to find the magnitude of a Vec2
	function findMagnitude(vector){
		let magnitude = Math.sqrt((vector.x * vector.x) + (vector.y * vector.y));
		return magnitude / 2;
	}

	// Utility to find the midpoint between two Vec2 points
	function findMidpoint(point1, point2){
		let result = Vec2();

		result.x = (point1.x + point2.x) / 2.0;
		result.y = (point1.y + point2.y) / 2.0;

		return result;
	}

	// Utility to subtract two Vec2 together
	function subtractVec(vector1, vector2) {
		let result = Vec2();

		result.x = vector1.x - vector2.x;
		result.y = vector1.y - vector2.y;

		return result;
	};
}

module.exports = Ramps;
