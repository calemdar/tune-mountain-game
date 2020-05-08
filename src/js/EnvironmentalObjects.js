const PIXI = require("pixi.js");
const Planck = require("planck-js");

function EnvironmentalObjects(curves, allPoints, viewport) {
	const textures = createFlagTextures();
	const tentTextureArray = createTentTextures();

	let sectionCounter = 0;
	for (let i = 0; i < allPoints.length; i++) {

		if (allPoints[i].x === curves[sectionCounter][3].x
			&& allPoints[i].y === curves[sectionCounter][3].y) {

			sectionCounter++;
			createFlag(allPoints, i - 3, findAngle(allPoints[i - 4], allPoints[i - 3]));
			createFlag(allPoints, i - 2, findAngle(allPoints[i - 3], allPoints[i - 2]));
			createFlag(allPoints, i - 1, findAngle(allPoints[i - 2], allPoints[i - 1]));
			createFlag(allPoints, i, findAngle(allPoints[i - 1], allPoints[i]));

			if (sectionCounter === curves.length - 1) {
				break;
			}
		}
	}

	let numPointsPerSection = Math.ceil(allPoints.length / curves.length);
	for (let j = 0; j < curves.length - 1; j++) {
		let point = getRandomIntInclusive(numPointsPerSection * j, numPointsPerSection * (j + 1));
		createTent(allPoints, point, findAngle(allPoints[point - 1], allPoints[point]));
	}

	function createFlag(allPoints, i, rotation) {
		let flagTextureArray = textures[getRandomIntInclusive(0, 5)];
		let flag = new PIXI.AnimatedSprite(flagTextureArray);

		flag.scale.x = 0.3;
		flag.scale.y = 0.3;
		flag.anchor.x = 0.5;
		flag.anchor.y = 1.0;
		flag.position.x = allPoints[i].x;
		flag.position.y = allPoints[i].y;
		flag.rotation = rotation;
		flag.animationSpeed = 0.5;
		flag.play();

		viewport.addChild(flag);
	}

	function createTent(allPoints, i, rotation) {
		let tentTexture = tentTextureArray[getRandomIntInclusive(0, 5)];
		let tent = new PIXI.Sprite(tentTexture);

		tent.scale.x = 0.3;
		tent.scale.y = 0.3;
		tent.anchor.x = 0.5;
		tent.anchor.y = 1.0;
		tent.position.x = allPoints[i].x;
		tent.position.y = allPoints[i].y;
		tent.rotation = rotation;

		viewport.addChild(tent);
	}

	// Utility to find the angle between two Vec2 points
	function findAngle(point1, point2) {
		return Math.atan2(point2.y - point1.y, point2.x - point1.x);
	}

	function createFlagTextures() {
		let flag1 = [
			"flag1_1.png",
			"flag1_2.png",
			"flag1_3.png",
			"flag1_4.png",
			"flag1_5.png",
			"flag1_6.png",
			"flag1_7.png",
			"flag1_8.png"
		];

		let flag2 = [
			"flag2_1.png",
			"flag2_2.png",
			"flag2_3.png",
			"flag2_4.png",
			"flag2_5.png",
			"flag2_6.png",
			"flag2_7.png",
			"flag2_8.png"
		];

		let flag3 = [
			"flag3-1.png",
			"flag3-2.png",
			"flag3-3.png",
			"flag3-4.png",
			"flag3-5.png",
			"flag3-6.png",
			"flag3-7.png",
			"flag3-8.png"
		];

		let flag4 = [
			"flag4-1.png",
			"flag4-2.png",
			"flag4-3.png",
			"flag4-4.png",
			"flag4-5.png",
			"flag4-6.png",
			"flag4-7.png",
			"flag4-8.png"
		];

		let flag5 = [
			"flag5-1.png",
			"flag5-2.png",
			"flag5-3.png",
			"flag5-4.png",
			"flag5-5.png",
			"flag5-6.png",
			"flag5-7.png",
			"flag5-8.png"
		];

		let flag6 = [
			"flag6-1.png",
			"flag6-2.png",
			"flag6-3.png",
			"flag6-4.png",
			"flag6-5.png",
			"flag6-6.png",
			"flag6-7.png",
			"flag6-8.png"
		];

		let flag1Array = [];
		let flag2Array = [];
		let flag3Array = [];
		let flag4Array = [];
		let flag5Array = [];
		let flag6Array = [];

		for (let i = 0; i < flag1.length; i++) {
			let texture = PIXI.Texture.from("/img/" + flag1[i]);
			flag1Array.push(texture);
		}

		for (let i = 0; i < flag2.length; i++) {
			let texture = PIXI.Texture.from("/img/" + flag2[i]);
			flag2Array.push(texture);
		}

		for (let i = 0; i < flag3.length; i++) {
			let texture = PIXI.Texture.from("/img/" + flag3[i]);
			flag3Array.push(texture);
		}

		for (let i = 0; i < flag4.length; i++) {
			let texture = PIXI.Texture.from("/img/" + flag4[i]);
			flag4Array.push(texture);
		}

		for (let i = 0; i < flag5.length; i++) {
			let texture = PIXI.Texture.from("/img/" + flag5[i]);
			flag5Array.push(texture);
		}

		for (let i = 0; i < flag6.length; i++) {
			let texture = PIXI.Texture.from("/img/" + flag6[i]);
			flag6Array.push(texture);
		}

		return [flag1Array, flag2Array, flag3Array, flag4Array, flag5Array, flag6Array];
	}

	function createTentTextures() {
		let tex1 = PIXI.Texture.from("../img/tent.png");
		let tex2 = PIXI.Texture.from("../img/tent2.png");
		let tex3 = PIXI.Texture.from("../img/tent3.png");
		let tex4 = PIXI.Texture.from("../img/tent4.png");
		let tex5 = PIXI.Texture.from("../img/tent5.png");
		let tex6 = PIXI.Texture.from("../img/tent6.png");

		return [tex1, tex2, tex3, tex4, tex5, tex6];
	}

	function getRandomIntInclusive(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

}

module.exports = EnvironmentalObjects;
