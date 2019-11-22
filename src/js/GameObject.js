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
	GameObject.prototype.renderPosition = (object) => {

		let physicsPos = object.physics.getPosition();
		object.sprite.anchor = object.anchor;
		object.sprite.position.x = physicsPos.x;
		object.sprite.position.y = physicsPos.y + 15;

		// change this later
		object.sprite.rotation = object.physics.getAngle();

		if(object.physics.getAngle() < (Math.PI / 3.5) && object.physics.getAngle() > (- Math.PI / 3.5)) {    				// if the angle is more than 180 degree (PI radians)
			//object.sprite.rotation = object.physics.getAngle();
		}
		else{
			//object.physics.setAngle((Math.PI / 3.5));
		}

		//console.log("Physics Pos: " + physicsPos);
		//console.log("Pixi Pos: " + object.sprite.position.x);
	};
	GameObject.prototype.error = function error (object) {
		console.log(object.errorMessage);
	};

	GameObject.prototype.swapSprites = function swapSprites(object, newSprite) {
		let tempSprite = object.sprite;
		tempSprite.alpha = 0;

		object.sprite = newSprite;

	}

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