/**
 * @author ROME Project / http://ro.me/
 * @author hmudesign / http://www.hmudesign.com/
 *
 * Cel shader
 * ported to three.js v70 from original at
 * http://www.ro.me/tech/hatching-glow-shader
 */

var ShaderTest = {
	hatching: {
		uniforms: {
			uDirLightPos: {
				type: 'v3',
				value: new THREE.Vector3()
			},
			uDirLightColor: {
				type: 'c',
				value: new THREE.Color(0xeeeeee)
			},
			uAmbientLightColor: {
				type: 'c',
				value: new THREE.Color(0x050505)
			},
			uBaseColor: {
				type: 'c',
				value: new THREE.Color(0xffffff)
			},
			uLineColor0: {
				type: 'c',
				value: new THREE.Color(0x000000)
			},
			uLineColor1: {
				type: 'c',
				value: new THREE.Color(0x000000)
			},
			uLineColor2: {
				type: 'c',
				value: new THREE.Color(0x000000)
			},
			uLineColor3: {
				type: 'c',
				value: new THREE.Color(0x000000)
			},
			uLineColor4: {
				type: 'c',
				value: new THREE.Color(0x000000)
			}
		},
		
		vertexShader: [
			'varying vec3 vNormal;',
			'void main() {',
				'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
				'vNormal = normalize( normalMatrix * normal );',
			'}'
		].join('\n'),
		
		fragmentShader: [
			'uniform vec3 uBaseColor;',
			'uniform vec3 uLineColor0;',
			'uniform vec3 uLineColor1;',
			'uniform vec3 uLineColor2;',
			'uniform vec3 uLineColor3;',
			'uniform vec3 uLineColor4;',
			'uniform vec3 uDirLightPos;',
			'uniform vec3 uDirLightColor;',
			'uniform vec3 uAmbientLightColor;',
			'varying vec3 vNormal;',
			'',
			'void main() {',
				'float directionalLightWeighting = max( dot( vNormal, uDirLightPos ), 0.0);',
				'vec3 lightWeighting = uAmbientLightColor + uDirLightColor * directionalLightWeighting;',
				
				'gl_FragColor = vec4( uBaseColor, 1.0 );',
				
				'if ( length(lightWeighting) < 1.00 ) {',
					'if (mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0) {',
						'gl_FragColor = vec4( uLineColor1, 1.0 );',
					'}',
				'}',
				'if ( length(lightWeighting) < 0.75 ) {',
					'if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0) {',
						'gl_FragColor = vec4( uLineColor2, 1.0 );',
					'}',
				'}',
				'if ( length(lightWeighting) < 0.50 ) {',
					'if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0) {',
						'gl_FragColor = vec4( uLineColor3, 1.0 );',
					'}',
				'}',
				'if ( length(lightWeighting) < 0.3465 ) {',
					'if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0) {',
						'gl_FragColor = vec4( uLineColor4, 1.0 );',
					'}',
				'}',
			'}'
		].join('\n')
	}
};

var cameraOrtho, cameraPerspective, sceneRTT, sceneScreen, renderer, mesh1, mesh2, directionalLight;
var rtTexture, rtTextureX, rtTextureY, materialScreen, materialConvolution, blurx, blury, quadBG, quadScreen;

function init() {
	cameraOrtho = new THREE.OrthographicCamera(-1,1, 1,-1, 0,1);
	cameraPerspective = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
	
	sceneRTT = new THREE.Scene();
	sceneScreen = new THREE.Scene();
	
	directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(0,0,1);
	sceneRTT.add(directionalLight);
	
	rtTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBFormat,
		stencilBuffer: false
	});
	
	rtTextureX = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBFormat,
		stencilBuffer: false
	});
	
	rtTextureY = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBFormat,
		stencilBuffer: false
	});
	
	materialScreen = new THREE.ShaderMaterial({
		uniforms: {
			tDiffuse: {
				type: 't',
				value: rtTexture
			},
			opacity: {
				type: 'f',
				value: 1.5
			}
		},
		vertexShader: document.getElementById('vs-generic').textContent,
		fragmentShader: document.getElementById('fs-screen').textContent,
		blending: THREE.AdditiveBlending,
		transparent: true
	});
	
	blurX = new THREE.Vector2(1 / 512, 0.0);
	blurY = new THREE.Vector2(0.0, 1 / 512);
	
	var sigma = 4.0, kernelSize = 25;
	var convolutionShader = THREE.ConvolutionShader;
	var convolutionUniforms = THREE.UniformsUtils.clone( convolutionShader.uniforms );
	convolutionUniforms[ 'uImageIncrement' ].value = blurX;
	convolutionUniforms[ 'cKernel' ].value = THREE.ConvolutionShader.buildKernel( sigma );
	
	materialConvolution = new THREE.ShaderMaterial({
		uniforms: convolutionUniforms,
		vertexShader: convolutionShader.vertexShader,
		fragmentShader: convolutionShader.fragmentShader,
		defines: {
			'KERNEL_SIZE_FLOAT': kernelSize.toFixed( 1 ),
			'KERNEL_SIZE_INT': kernelSize.toFixed( 0 )
		}
	});
	
	shader = ShaderTest['hatching'];
	
	var lineColor1 = 0xff0000, lineColor2 = 0x0000ff;
	
	material1 = new THREE.ShaderMaterial({
		uniforms: THREE.UniformsUtils.clone(shader.uniforms),
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	});
	
	material1.uniforms.uDirLightColor.value = directionalLight.color;
	material1.uniforms.uDirLightPos.value = directionalLight.position;
	material1.uniforms.uBaseColor.value.setHex(0x000000);
	material1.uniforms.uLineColor0.value.setHex(lineColor1);
	material1.uniforms.uLineColor1.value.setHex(lineColor1);
	material1.uniforms.uLineColor2.value.setHex(lineColor1);
	material1.uniforms.uLineColor3.value.setHex(lineColor1);
	material1.uniforms.uLineColor4.value.setHex(0xffff00);
	
	material2 = new THREE.ShaderMaterial({
		uniforms: THREE.UniformsUtils.clone(shader.uniforms),
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	});
	
	material2.uniforms.uDirLightColor.value = directionalLight.color;
	material2.uniforms.uDirLightPos.value = directionalLight.position;
	material2.uniforms.uBaseColor.value.setHex(0x000000);
	material2.uniforms.uLineColor0.value.setHex(lineColor2);
	material2.uniforms.uLineColor1.value.setHex(lineColor2);
	material2.uniforms.uLineColor2.value.setHex(lineColor2);
	material2.uniforms.uLineColor3.value.setHex(lineColor2);
	material2.uniforms.uLineColor4.value.setHex(0x00ffff);
	
	var geometry = new THREE.TorusGeometry(250, 100, 32, 64);
	createMesh(geometry, sceneRTT);
	
	quadScreen = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
	sceneScreen.add(quadScreen);
	
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.autoClear = false;
	document.body.appendChild(renderer.domElement);
	
	window.addEventListener('resize', onWindowResize, false);
	onWindowResize();
}

function onWindowResize() {
	cameraPerspective.aspect = window.innerWidth / window.innerHeight;
	cameraPerspective.updateProjectionMatrix();
	
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	rtTexture = rtTexture.clone();
	rtTexture.setSize(window.innerWidth, window.innerHeight);
	
	rtTextureX = rtTexture.clone();
	rtTextureY = rtTexture.clone();
}

function createMesh(geometry, scene) {
	var material = new THREE.MeshNormalMaterial();
	
	mesh1 = new THREE.Mesh(geometry, material1);
	mesh1.position.x = -300;
	mesh1.position.z = -1000;
	scene.add(mesh1);
	
	mesh2 = new THREE.Mesh(geometry, material2);
	mesh2.position.x = 300;
	mesh2.position.z = -1000;
	scene.add(mesh2);
}

function loop() {
	requestAnimationFrame(loop);
	
	mesh1.rotation.y += Math.PI / 8 * .025;
	mesh2.rotation.y -= Math.PI / 8 * .025;
	
	renderer.context.enable(renderer.context.DEPTH_TEST);
	renderer.render(sceneRTT, cameraPerspective, rtTexture, true);
	
	quadScreen.material = materialConvolution;
	
	materialConvolution.uniforms.tDiffuse.value = rtTexture;
	materialConvolution.uniforms.uImageIncrement.value = blurX;
	renderer.render(sceneScreen, cameraOrtho, rtTextureX, true);
	
	materialConvolution.uniforms.tDiffuse.value = rtTextureX;
	materialConvolution.uniforms.uImageIncrement.value = blurY;
	renderer.render(sceneScreen, cameraOrtho, rtTextureY, true);
	
	quadScreen.material = materialScreen;
	
	materialScreen.uniforms.tDiffuse.value = rtTextureY;
	renderer.render(sceneScreen, cameraOrtho, rtTexture, false);
	
	materialScreen.uniforms.tDiffuse.value = rtTexture;
	renderer.render(sceneScreen, cameraOrtho);
}

window.onload = function() {
	init();
	loop();
}