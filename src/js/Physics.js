const PIXI = require("pixi.js");
const Planck = require("planck-js");
const GameObject = require("./GameObject");


function Physics(game, viewport, curvePoints, player, obj, world) {

	const pl = Planck, Vec2 = pl.Vec2;
	let allCurvePoints = [];

	let ground = world.createBody();
	ground.createFixture(pl.Edge(Vec2(0.0, 100.0), Vec2(100.0, 200.0)), 1.0);
	ground.setPosition(Vec2(0, 100));

	// physics object
	let playerBody = world.createBody().setDynamic();
	//box.createFixture(pl.Circle(0.5), 1.0);
	playerBody.createFixture(pl.Box(3, 1), 1.0);
	playerBody.setPosition(Vec2(150.0, -10.0));
	//playerBody.setLinearVelocity(Vec2(120, 0.0));
	playerBody.setMassData({
		mass : 5,
		center : Vec2(),
		I : 1
	});

	player.physics = playerBody;
	player.position = playerBody.getPosition();
	player.anchor = Vec2(0.5, 1);
	player.mass = playerBody.getMass();

	// Physics Bezier Curve
	const cubicBezierPoint = function (t, p0, p1, c0, c1) {

		//return (1-t)^3 * p0 + 3*(1-t)^2 * t * c0 + 3*(1-t) * t^2 * c1 + t^3 * p1
		//       {   first   }  {      second     }  {      third      }  { fourth }
		let point;
		let addVectors;
		let first = multiplyVec(p0, ((1-t)*(1-t)*(1-t)));
		let second = multiplyVec(c0, (3 * ((1-t)*(1-t)) * t));
		let third = multiplyVec(c1, (3 * (1-t) * (t*t)));
		let fourth = multiplyVec(p1, (t*t*t));


		addVectors = addVec(first, second);
		addVectors = addVec(addVectors, third);
		addVectors = addVec(addVectors, fourth);

		point = addVectors;

		return point;

	};

	const bezierCurvePoints = function(p0, c0, c1, p1) {

		let t;
		// TODO Tie this value to tempo or beats
		let numPoints = 60;
		let point = Vec2();

		for(let i = 0; i < numPoints; i++){
			t = i / numPoints;
			point = cubicBezierPoint(t, p0, p1, c0, c1);

			allCurvePoints.push(point);
		}
	};

	const physicalBezierCurve = function (points) {
		let line;
		let newAngle;
		let lineOffset = 0.03;

		for(let i = 0; i < points.length - 1; i+=1){

			let vertex1 = points[i];
			let vertex2 = points[i+1];
			let lineLength = findMagnitude(subtractVec(vertex2, vertex1));

			line = world.createBody();
			let currentCurve = line.createFixture(pl.Box(lineLength - lineOffset, 0.01), 1.0);
			currentCurve.setFriction(.1);
			line.setPosition(findMidpoint(vertex1, vertex2));
			newAngle = findAngle(vertex1, vertex2);
			line.setAngle(newAngle);

			//console.log("Point " + i + " Angle " + (findAngle(vertex1, vertex2) * (180 / Math.PI)));
		}

	};

	const multiplyVec = function (vector, number){
		let result = Vec2();

		result.x = vector.x * number;
		result.y = vector.y * number;

		return result;
	};

	const addVec = function (vector1, vector2){
		let result = Vec2();

		result.x = vector1.x + vector2.x;
		result.y = vector1.y + vector2.y;

		return result;
	};

	const subtractVec = function (vector1, vector2){
		let result = Vec2();

		result.x = vector1.x - vector2.x;
		result.y = vector1.y - vector2.y;

		return result;
	};

	const findMidpoint = function (point1, point2){
		let result = Vec2();

		result.x = (point1.x + point2.x) / 2.0;
		result.y = (point1.y + point2.y) / 2.0;

		return result;
	};

	const findAngle = function (point1, point2) {

		let angle = Math.atan2(point2.y - point1.y, point2.x - point1.x);
		return angle;
	};

	const findMagnitude = function(point1){
		let magnitude = Math.sqrt((point1.x * point1.x) + (point1.y * point1.y));
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

	const renderStep = function() {

		world.step(1 / 60);

		// iterate over bodies and fixtures
		for (let body = world.getBodyList(); body; body = body.getNext()) {
			for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
				// draw or update fixture
			}
		}

		//console.log(player.physics.getLinearVelocity());
		/*
		if (player.position.x > 250 && !reachedPosition) {
			player.physics.applyForce(Vec2(500, 0), player.position, true);
			reachedPosition = true;
		}
		*/

		let physicsPos = obj.renderPosition(player);
	};



	game.ticker.add(renderStep);
	return allCurvePoints;
}

module.exports = Physics;