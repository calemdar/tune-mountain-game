const Planck = require("planck-js");

function Physics(ticker) {

	const world = Planck.World({
		gravity: Planck.Vec2(0, -10)
	});

	let bar = world.createBody();
	bar.createFixture(Planck.Edge(Planck.Vec2(-10, 0), Planck.Vec2(10, 0)));
	bar.setAngle(0.2);

	let box = world.createBody().setDynamic();
	box.createFixture(Planck.Box(0.5, 0.5));
	box.setPosition(Planck.Vec2(1.0, 1.0));
	box.setMassData({
		mass : 1,
		center : Planck.Vec2(),
		I : 1
	});

	const renderStep = function() {
		world.step(1 / 60);
		// iterate over bodies and fixtures
		for (let body = world.getBodyList(); body; body = body.getNext()) {
			for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
				// draw or update fixture

			}
		}
		console.log(world);
	};

	ticker.add(renderStep);
	console.log(renderStep);
}

module.exports = Physics;
