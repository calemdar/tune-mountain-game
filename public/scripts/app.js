const canvas = document.getElementById("mycanvas");

const game = new PIXI.Application({
	view: canvas,
	width: window.innerWidth,
	height: window.innerHeight
});

const renderer = new PIXI.Renderer({});

const texture = PIXI.Texture.from("../img/husky.png");
const husky = new PIXI.Sprite(texture);

husky.x = game.renderer.width / 2;
husky.y = game.renderer.height / 2;
husky.anchor.x = 0.5;
husky.anchor.y = 0.5;

game.stage.addChild(husky);
game.ticker.add(animate);

function animate() {
	husky.rotation += 0.01;
}