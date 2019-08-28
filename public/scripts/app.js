const canvas = document.getElementById('mycanvas');

const app = new PIXI.Application({
    view: canvas,
    width: window.innerWidth,
    height: window.innerHeight
});

const renderer = new PIXI.Renderer({});

const texture = PIXI.Texture.from('husky.png');
const husky = new PIXI.Sprite(texture);

husky.x = app.renderer.width / 2;
husky.y = app.renderer.height / 2;
husky.anchor.x = 0.5;
husky.anchor.y = 0.5;

app.stage.addChild(husky);
app.ticker.add(animate);

function animate() {
    husky.rotation += 0.01;
}