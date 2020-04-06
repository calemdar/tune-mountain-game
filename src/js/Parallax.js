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

	let delta = 0;
	game.ticker.add(() => {
		tilingSprite1.tilePosition.x -= 1.28; // 0.128
		tilingSprite2.tilePosition.x -= 0.64; // 0.64
		tilingSprite3.tilePosition.x -= 0.32;
		tilingSprite4.tilePosition.x -= 0.16;

		delta += 0.1;
		uniforms.delta = Math.sin(delta) * 0.5;
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

module.exports = Parallax;


