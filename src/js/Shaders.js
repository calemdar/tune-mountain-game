const PIXI = require("pixi.js");

function Shaders(audioFeatures, game){
	let shaders = {};
	const vShader = `attribute vec2 aVertexPosition;
	attribute vec2 aTextureCoord;
	uniform mat3 projectionMatrix;
	varying vec2 vTextureCoord;

	void main() {
    	gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    	vTextureCoord = aTextureCoord;
	}`;

	const fShader = `precision mediump float;

	varying vec2 vTextureCoord;
	uniform sampler2D uSampler;
	uniform float time;
	
	void main(){
		vec4 color = texture2D(uSampler, vTextureCoord);
	
		float frequency = 0.1;
	
		color.r += sin(time * frequency);
		color.g -= sin(time * frequency);
		color.b += sin(time * frequency);
		gl_FragColor = color;
	}`;

	const stripeShader = `precision mediump float;

	varying vec2 vTextureCoord;
	uniform sampler2D uSampler;
	uniform float time;
	uniform float tempo;
	uniform float energy;
	uniform float valence;
	uniform float resolutionX;
	uniform float resolutionY;
	
	void main(){
		vec4 color = texture2D(uSampler, vTextureCoord);
		vec2 p = gl_FragCoord.xy / vec2(resolutionX, resolutionY);
		
		float frequency = 0.1;
		
		color.rgb = vec3(valence * p.y , 1. - cos(time * energy * 4.), smoothstep(abs(time * energy + tempo * 10.), 0.2, 0.7));
		
		gl_FragColor = color;
	}`;

	const circleShader = `precision mediump float;
	varying vec2 vTextureCoord;
	uniform sampler2D uSampler;
	uniform float time;
	uniform float resolutionX;
	uniform float resolutionY;
	uniform float valence;
	uniform float tempo;
	
	float circle(vec2 _st, float _radius){
		vec2 dist = _st-vec2(0.5);
		return 1.-smoothstep(_radius-(_radius*0.01),
		_radius+(_radius*0.01),
		dot(dist,dist)*5.0);
	}
	
	void main () {
		vec4 color = texture2D(uSampler, vTextureCoord);
		vec2 p = gl_FragCoord.xy / vec2(resolutionX, resolutionY);
		float frequency = 10.;
		//float tempo = 120.;
		//float valence = 0.3;
		float wave = circle(p + 0.5, sin(time * tempo / 10.) + 2.0);
	
		color.r = smoothstep(sin(time * (tempo / 100.)), 0.5, p.x * valence /p.y * valence);
		color.b = smoothstep(cos(time * valence * (tempo / 100.)), 2.0, p.x + 1.5);
	
		gl_FragColor = color;
	}`;

	let uniforms = {
		time: 0,
		resolutionX: game.screen.width,
		resolutionY: game.screen.height,
		valence: audioFeatures.valence,
		tempo: audioFeatures.tempo,
		energy: audioFeatures.energy
	};

	let time = 0;
	game.ticker.add(() => {
		time += 0.01;
		uniforms.time = time;
	});


	// Create Pixi filters
	const shader0 = new PIXI.Filter(vShader, stripeShader, uniforms);
	//const circle = new PIXI.Filter(vShader, circleShader, uniforms);

	shaders.shader0 = shader0;
	//shaders.circle = circle;

	//console.log(shaders);

	return shaders;
}

module.exports = Shaders;