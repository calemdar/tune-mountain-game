const PIXI = require("pixi.js");

function Parallax(game) {

	// Shader stuff
	//const vShader = document.getElementById("vertShader").innerText;
	//const fShader = document.getElementById("fragShader").innerText;

	const vShader = null;
	const fShader = null;
	let uniforms = {
		delta: 0
	};

	const tilingSprite1 = createTilingSprite(game, "../img/bg-far.png", 0, vShader, fShader, uniforms);
	const tilingSprite2 = createTilingSprite(game, "../img/bg-mid.png", 100, vShader, fShader, uniforms);

	let delta = 0;
	game.ticker.add(() => {
		tilingSprite1.tilePosition.x -= 0.128;
		tilingSprite2.tilePosition.x -= 0.30;

		delta += 0.1;
		uniforms.delta = Math.sin(delta) * 0.5;
	});

}

function createTilingSprite(game, location, y, vertShader, fragShader, uniforms) {

	const texture = PIXI.Texture.from(location);
	//const shader = new PIXI.Filter(vertShader, fragShader, uniforms);

	const tilingSprite = new PIXI.TilingSprite(
		texture,
		game.screen.width,
		game.screen.height,
	);

	// adding the shader
	//tilingSprite.filters = [shader];

	game.stage.addChild(tilingSprite);

	tilingSprite.position.x = 0;
	tilingSprite.position.y = y;
	tilingSprite.tilePosition.x = 0;
	tilingSprite.tilePosition.y = 0;

	return tilingSprite;
}

module.exports = Parallax;


