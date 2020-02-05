const PIXI = require("pixi.js");
const Bezier = require("./Bezier");
const Physics = require("./Physics");
const Planck = require("planck-js");
const Vec2 = Planck.Vec2;

function GameObject () {

	// Object constructor
	GameObject.prototype.create =({name, position=Vec2(0,0), scale=Vec2(1.0, 1.0), anchor=1, mass=1, sprite=1, physics=1})  => {
		let object = {};

		if(!name || typeof(name) != "string") {
			object.errorMessage = "name not a String";
			return object;
		}

		object = { name, position, scale, anchor, mass, sprite, physics };

		return object;
	};

	// Render given object
	GameObject.prototype.renderPosition = (object) => {

		let physicsPos = object.physics.getPosition();
		object.sprite.anchor = object.anchor;
		//object.sprite.scale = object.scale;
		object.sprite.position.x = physicsPos.x;
		object.sprite.position.y = physicsPos.y + 15;

		// change this later
		//object.sprite.rotation = object.physics.getAngle();

		if(object.physics.getAngle() < (Math.PI / 3.5) && object.physics.getAngle() > (- Math.PI / 3.5)) {    				// if the angle is more than 180 degree (PI radians)
			//object.sprite.rotation = object.physics.getAngle();
		}
		else{
			//object.sprite.rotation = (Math.PI / 3.5);
		}

		//console.log("Physics Pos: " + physicsPos);
		//console.log("Pixi Pos: " + object.sprite.position.x);
	};
	GameObject.prototype.error = function error (object) {
		console.log(object.errorMessage);
	};

	// Change sprite of current game object
	GameObject.prototype.swapSprites = function swapSprites(object, newSprite) {
		let tempSprite = object.sprite;
		tempSprite.alpha = 0;

		object.sprite = newSprite;

	};

}

module.exports = GameObject;