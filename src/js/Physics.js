const PIXI = require("pixi.js");
const Planck = require("planck-js");
const GameObject = require("./GameObject");

/**
 * Create all physical objects.
 *
 * @param {PixiApp} game app to draw alll the objects on
 * @param {Viewport} viewport to add all Sprites to
 * @param {Array} curvePoints that has all the points on the Bezier curves
 * @param {GameObject} player that is the player to control
 * @param {GameObject} obj the Game object constructor
 * @param {PlanckWorld} world created using Planck.js
 */
function Physics(game, viewport, curvePoints, player, obj, world, deletedBodies) {

	const pl = Planck, Vec2 = pl.Vec2;
	let allCurvePoints = [];

	// Player object
	let playerBody = world.createBody().setDynamic();
	playerBody.createFixture(pl.Circle(1.0), 1.0);
	playerBody.setPosition(Vec2(-2.0, -17.0));
	playerBody.setMassData({
		mass : 5,
		center : Vec2(),
		I : 1
	});

	player.physics = playerBody;
	player.position = playerBody.getPosition();
	player.anchor = Vec2(0.3, 1.0);
	player.mass = playerBody.getMass();


	// Physics Bezier Curve
	// creates single point for the given Bezier curve
	// t = varying value between 0 and 1
	// p0 = start point of curve
	// p1 = end point of curve
	// c0 = first control point
	// c1 = second control point
	const cubicBezierPoint = function (t, p0, p1, c0, c1) {

		//return (1-t)^3 * p0 + 3*(1-t)^2 * t * c0 + 3*(1-t) * t^2 * c1 + t^3 * p1
		//       {   first   }  {      second     }  {      third      }  { fourth }
		let point;
		let addVectors;
		let first = scaleVec(p0, ((1-t)*(1-t)*(1-t)));
		let second = scaleVec(c0, (3 * ((1-t)*(1-t)) * t));
		let third = scaleVec(c1, (3 * (1-t) * (t*t)));
		let fourth = scaleVec(p1, (t*t*t));


		addVectors = addVec(first, second);
		addVectors = addVec(addVectors, third);
		addVectors = addVec(addVectors, fourth);

		point = addVectors;

		return point;

	};

	// Creates the Bezier curve with the resolution of "numPoints"
	// p0 = start point of curve
	// p1 = end point of curve
	// c0 = first control point
	// c1 = second control point
	const bezierCurvePoints = function(p0, c0, c1, p1) {

		let t;
		// Curve resolution
		let numPoints = 60;
		let point = Vec2();

		for(let i = 0; i < numPoints; i++){
			t = i / numPoints;
			point = cubicBezierPoint(t, p0, p1, c0, c1);

			allCurvePoints.push(point);
		}
	};

	// Create physical lines between all the points created by bezierCurvePoints
	// points = all points created by bezierCurvePoints
	const physicalBezierCurve = function (points) {
		let line;
		let newAngle;
		let lineOffset = 0.0;

		for(let i = 0; i < points.length - 1; i+=1){

			let vertex1 = points[i];
			let vertex2 = points[i+1];
			let lineLength = findMagnitude(subtractVec(vertex2, vertex1));

			line = world.createBody().setStatic();
			let currentCurve = line.createFixture(pl.Box(lineLength - lineOffset, 0.01), 1.0);
			currentCurve.setFriction(.1);
			line.setPosition(findMidpoint(vertex1, vertex2));
			newAngle = findAngle(vertex1, vertex2);
			line.setAngle(newAngle);

			//console.log("Point " + i + " Angle " + (findAngle(vertex1, vertex2) * (180 / Math.PI)));
		}

	};

	// Utility to scale Vec2 with a number
	const scaleVec = function (vector, number){
		let result = Vec2();

		result.x = vector.x * number;
		result.y = vector.y * number;

		return result;
	};

	// Utility to add two Vec2 together
	const addVec = function (vector1, vector2){
		let result = Vec2();

		result.x = vector1.x + vector2.x;
		result.y = vector1.y + vector2.y;

		return result;
	};

	// Utility to subtract two Vec2 together
	const subtractVec = function (vector1, vector2){
		let result = Vec2();

		result.x = vector1.x - vector2.x;
		result.y = vector1.y - vector2.y;

		return result;
	};

	// Utility to find the midpoint between two Vec2 points
	const findMidpoint = function (point1, point2){
		let result = Vec2();

		result.x = (point1.x + point2.x) / 2.0;
		result.y = (point1.y + point2.y) / 2.0;

		return result;
	};

	// Utility to find the angle between two Vec2 points
	const findAngle = function (point1, point2) {

		let angle = Math.atan2(point2.y - point1.y, point2.x - point1.x);
		return angle;
	};

	// Utility to find the magnitude of a Vec2
	const findMagnitude = function(vector){
		let magnitude = Math.sqrt((vector.x * vector.x) + (vector.y * vector.y));
		return magnitude / 2;
	};


	const getCurvePoints = function (){

		for(let i = 0; i < curvePoints.length; i+=1){
			//bezierCurvePoints(Vec2(25,25), Vec2(100,200), Vec2(200,200), Vec2(240,150));
			//bezierCurvePoints(Vec2(240,150), Vec2(350,150), Vec2(450,350), Vec2(700,200));

			bezierCurvePoints(curvePoints[i][0], curvePoints[i][1], curvePoints[i][2], curvePoints[i][3]);
		}

		physicalBezierCurve(allCurvePoints);
	};

	// Testing
	getCurvePoints();

	// Render everything in the physics world
	const renderStep = function() {

		world.step(1 / 60);

		// iterate over bodies and fixtures
		for (let body = world.getBodyList(); body; body = body.getNext()) {
			for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
				// draw or update fixture
			}
			if(deletedBodies){
				for(let del = 0; del < deletedBodies.length; del++){
					if(body === deletedBodies[del]){
						world.destroyBody(body);
					}
				}

			}
		}

		//console.log(player.physics.getLinearVelocity());


		let physicsPos = obj.renderPosition(player);

		// new speed test

	};

	game.ticker.add(renderStep);
	return allCurvePoints;
}

module.exports = Physics;
