const PIXI = require("pixi.js");
const Bezier = require("./Bezier");
const Physics = require("./Physics");
const Planck = require("planck-js");
const Vec2 = Planck.Vec2;

function GameObject () {

	// Object constructor
	GameObject.prototype.create =({name, position=Vec2(0,0), scale=Vec2(1.0, 1.0), anchor=1, mass=1, sprite=1, followSprite=1, physics=1})  => {
		let object = {};

		if(!name || typeof(name) != "string") {
			object.errorMessage = "name not a String";
			return object;
		}

		object = { name, position, scale, anchor, mass, sprite, followSprite, physics };

		return object;
	};

	// Render given object
	GameObject.prototype.renderPosition = (object) => {

		let physicsPos = object.physics.getPosition();
		object.sprite.anchor = object.anchor;
		object.sprite.position.x = physicsPos.x;
		object.sprite.position.y = physicsPos.y + 5;

		object.followSprite.anchor = object.anchor;
		object.followSprite.position.x = physicsPos.x;
		object.followSprite.position.y = physicsPos.y + 15;
	};

	GameObject.prototype.error = function error (object) {
		console.log(object.errorMessage);
	};

}

module.exports = GameObject;
