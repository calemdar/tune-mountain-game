const PIXI = require("pixi.js");

function Parallax(game, shaders) {

	// Shader stuff
	//const vShader = document.getElementById("vertShader").innerText;
	//const fShader = document.getElementById("fragShader").innerText;

	const vShader = null;
	const fShader = null;
	let uniforms = {
		delta: 0
	};

	const tilingSprite4 = createTilingSprite(game, "../img/bg_layer4.png", -100, shaders);
	const tilingSprite3 = createTilingSprite(game, "../img/bg_layer3.png", -65, shaders);
	const tilingSprite2 = createTilingSprite(game, "../img/bg_layer2.png", -33, shaders);
	const tilingSprite1 = createTilingSprite(game, "../img/bg_layer1.png", 0, shaders);

	let cloud1 = createCloud(game);
	let cloud2 = createCloud(game);

	let speed1 = getRandomArbitrary(0.1, 0.5);
	let speed2 = getRandomArbitrary(0.1, 0.5);
	let zIndex;

	let delta = 0;
	game.ticker.add(() => {
		tilingSprite1.tilePosition.x -= 1.28; // 0.128
		tilingSprite2.tilePosition.x -= 0.64; // 0.64
		tilingSprite3.tilePosition.x -= 0.32;
		tilingSprite4.tilePosition.x -= 0.16;

		delta += 0.1;
		uniforms.delta = Math.sin(delta) * 0.5;

		cloud1.position.x -= speed1;
		cloud2.position.x -= speed2;

		if (cloud1.position.x < -100) {
			cloud1.texture = PIXI.Texture.from("../img/cloud" + getRandomIntInclusive(1, 4) + ".png");
			cloud1.position.x = game.screen.width + 100;
			cloud1.position.y = getRandomIntInclusive(50, 250);
			speed1 = getRandomArbitrary(0.1, 0.5);
		}

		if (cloud2.position.x < -100) {
			cloud2.texture = PIXI.Texture.from("../img/cloud" + getRandomIntInclusive(1, 4) + ".png");
			cloud2.position.x = game.screen.width + 100;
			cloud2.position.y = getRandomIntInclusive(50, 250);
			speed2 = getRandomArbitrary(0.1, 0.5);
		}
	});

}

function createTilingSprite(game, location, y, shaders) {

	const texture = PIXI.Texture.from(location);
	//const shader = new PIXI.Filter(vertShader, fragShader, uniforms);

	const tilingSprite = new PIXI.TilingSprite(
		texture,
		game.screen.width,
		game.screen.height,
	);

	// adding the shader
	tilingSprite.filters = [shaders.shader0];

	game.stage.addChild(tilingSprite);

	tilingSprite.position.x = 0;
	tilingSprite.position.y = y;
	tilingSprite.tilePosition.x = 0;
	tilingSprite.tilePosition.y = 0;
	//tilingSprite.scale.x = 0.75;
	//tilingSprite.scale.y = 0.75;

	return tilingSprite;
}

function createCloud(game) {
	const texture = PIXI.Texture.from("../img/cloud" + getRandomIntInclusive(1, 4) + ".png");
	const sprite = new PIXI.Sprite(texture);

	game.stage.addChild(sprite);

	sprite.position.x = game.screen.width + 100;
	sprite.position.y = getRandomIntInclusive(50, 250);

	return sprite;
}

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}

module.exports = Parallax;


