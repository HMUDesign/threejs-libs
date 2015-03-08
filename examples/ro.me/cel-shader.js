/**
 * @author ROME Project / http://ro.me/
 * @author hmudesign / http://www.hmudesign.com/
 *
 * Cel shader
 * ported to three.js v70 from original at
 * http://www.ro.me/tech/cel-shader
 */

var ShaderTest = {
	cel: {
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
				value: new THREE.Color(0xff0000)
			},
		},
		
		vertexShader: [
			'varying vec3 vNormal;',
			'varying vec3 vRefract;',
			'',
			'void main() {',
				'vec4 mPosition = modelMatrix * vec4( position, 1.0 );',
				'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
				'vec3 nWorld = normalize ( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );',
				'vNormal = normalize( normalMatrix * normal );',
				'vec3 I = mPosition.xyz - cameraPosition;',
				'vRefract = refract( normalize( I ), nWorld, 1.02 );',
				'gl_Position = projectionMatrix * mvPosition;',
			'}'
		].join('\n'),
		
		fragmentShader: [
			'uniform vec3 uBaseColor;',
			'uniform vec3 uDirLightPos;',
			'uniform vec3 uDirLightColor;',
			'uniform vec3 uAmbientLightColor;',
			'varying vec3 vNormal;',
			'varying vec3 vRefract;',
			'',
			'void main() {',
				'float directionalLightWeighting = max( dot( vNormal, uDirLightPos ), 0.0);',
				'vec3 lightWeighting = uAmbientLightColor + uDirLightColor * directionalLightWeighting;',
				'float cameraWeighting = dot( vNormal, vRefract );',
				'',
				'float intensity = smoothstep( -0.5, 1.0, pow( length( lightWeighting ), 20.0 ) );',
				'intensity += length(lightWeighting) * 0.2;',
				'intensity += pow( 1.0 - length( cameraWeighting ), 6.0 );',
				'intensity = intensity * 0.2 + 0.3;',
				'',
				'if ( intensity < 0.50 ) {',
					'gl_FragColor = vec4( 2.0 * intensity * uBaseColor, 1.0 );',
				'} else {',
					'gl_FragColor = vec4( 1.0 - 2.0 * ( 1.0 - intensity ) * ( 1.0 - uBaseColor ), 1.0 );',
				'}',
			'}'
		].join('\n')
	}
};

var camera, scene, renderer;

function init() {
	camera = new THREE.PerspectiveCamera(45, 1, 1, 3000);
	camera.position.z = 1000;
	
	scene = new THREE.Scene();
	
	var light = new THREE.DirectionalLight(0xffffff);
	light.position.x = 1;
	light.position.y = 0;
	light.position.z = 1;
	scene.add(light);
	
	renderer = new THREE.WebGLRenderer({ antialias: true });
	document.body.appendChild(renderer.domElement);
	
	var geometry = new THREE.TorusGeometry(50, 20, 32, 64);
	
	var shader = ShaderTest['cel'];
	
	for(var i = 0; i < 100; i++) {
		var material = new THREE.ShaderMaterial({
			uniforms: THREE.UniformsUtils.clone(shader.uniforms),
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader
		});
		
		material.uniforms.uDirLightPos.value = light.position;
		material.uniforms.uDirLightColor.value = light.color;
		material.uniforms.uAmbientLightColor.value = new THREE.Color(0x050505);
		material.uniforms.uBaseColor.value = new THREE.Color(Math.random() * 0xffffff);
		
		var mesh = new THREE.Mesh(geometry, material);
		mesh.position.x = Math.random() * 800 - 400;
		mesh.position.y = Math.random() * 800 - 400;
		mesh.position.z = Math.random() * 800 - 400;
		mesh.rotation.x = Math.random() * 360 * Math.PI / 180;
		mesh.rotation.y = Math.random() * 360 * Math.PI / 180;
		mesh.rotation.z = Math.random() * 360 * Math.PI / 180;
		
		scene.add(mesh);
	}
	
	window.addEventListener('resize', onWindowResize, false);
	onWindowResize();
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function loop() {
	requestAnimationFrame(loop);
	
	for(var i = 0, l = scene.children.length; i < l; i++) {
		scene.children[i].rotation.x += 0.01;
		scene.children[i].rotation.y += 0.01;
	}
	
	renderer.render(scene, camera);
}

window.onload = function() {
	init();
	loop();
}