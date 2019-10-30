const PIXI = require("pixi.js");
const Bezier = require("./Bezier");
const Physics = require("./Physics");
const Planck = require("planck-js");
const Vec2 = Planck.Vec2;

function GameObject () {

	GameObject.prototype.create =({name, position=Vec2(0,0), scale=1, anchor=1, mass=1, sprite=1, physics=1})  => {
		let object = {};

		if(!name || typeof(name) != "string") {
			object.errorMessage = "name not a String";
			return object;
		}

		object = { name, position, scale, anchor, mass, sprite, physics };

		return object;
	};
	GameObject.prototype.renderPosition = (object, game) => {

		let physicsPos = object.physics.getPosition();
		object.sprite.anchor = object.anchor;

		let circle = new PIXI.Graphics();
		circle.beginFill(0xFF0000, 1);

		circle.drawCircle(physicsPos.x, physicsPos.y, 2);
		//circle.endFill();

		game.stage.addChild(circle);


		object.sprite.position.x = physicsPos.x;
		object.sprite.position.y = physicsPos.y;
		//console.log("Physics Pos: " + physicsPos);
		//console.log("Pixi Pos: " + object.sprite.position.x);
	};
	GameObject.prototype.error = function error (object) {
		console.log(object.errorMessage);
	};

}

/*
let cube = obj.create("Cube", {Pixi:{x:0, y:0}, Planck: {x:0, y:0}}, 1.0);
let sphere = obj.create("Sphere", {Pixi:{x:0, y:0}, Planck: {x:0, y:0}});
let rectangle = obj.create( {Pixi:{x:5, y:5}, Planck: {x:0, y:0}});

console.log(cube);
console.log(sphere);
console.log(rectangle);
*/

module.exports = GameObject;