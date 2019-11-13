const PIXI = require("pixi.js");



/**
class Old {

	constructor (gameRef) {

		this.game = gameRef;

	}

	init() {

		const { game } = this;

		var texture1 = PIXI.Texture.from("../img/bg-far.png");

		const tilingSprite1 = new PIXI.TilingSprite(
			texture1,
			game.screen.width,
			game.screen.height,
		);
		game.stage.addChild(tilingSprite1);

		tilingSprite1.position.x = 0;
		tilingSprite1.position.y = 0;
		tilingSprite1.tilePosition.x = 0;
		tilingSprite1.tilePosition.y = 0;

		var texture2 = PIXI.Texture.from("../img/bg-mid.png");

		const tilingSprite2 = new PIXI.TilingSprite(
			texture2,
			game.screen.width,
			game.screen.height,
		);
		game.stage.addChild(tilingSprite2);

		tilingSprite2.position.x = 0;
		tilingSprite2.position.y = 128;
		tilingSprite2.tilePosition.x = 0;
		tilingSprite2.tilePosition.y = 0;

		game.ticker.add(() => {
			tilingSprite1.tilePosition.x -= 0.128;
			tilingSprite2.tilePosition.x -= 0.64;
		});

	}

}
 */

function Parallax(game) {

	// Shader stuff
	const vShader = document.getElementById("vertShader").innerText;
	const fShader = document.getElementById("fragShader").innerText;

	console.log(vShader);
	console.log(fShader);
	let uniforms = {
		delta: 0
	};

	const tilingSprite1 = createTilingSprite(game, "../img/bg-far.png", 0, vShader, fShader, uniforms);
	const tilingSprite2 = createTilingSprite(game, "../img/bg-mid.png", 128, vShader, fShader, uniforms);

	let delta = 0;
	game.ticker.add(() => {
		tilingSprite1.tilePosition.x -= 0.128;
		tilingSprite2.tilePosition.x -= 0.64;

		delta += 0.1;
		uniforms.delta = Math.sin(delta) * 0.5;
	});

}

function createTilingSprite(game, location, y, vertShader, fragShader, uniforms) {

	const texture = PIXI.Texture.from(location);
	const shader = new PIXI.Filter(vertShader, fragShader, uniforms);

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


