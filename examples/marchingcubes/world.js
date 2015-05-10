var PROJECT = PROJECT || {};

PROJECT.World = function() {
	HMU.World.call(this, {
		camera: new THREE.Vector3(-2.5,2.5,5),
		fov: { x: 50, y: 50 },
	});
	
	this.camera.lookAt(this.scene.position);
	
/*
	var controls = new THREE.FlyControls(this.camera);
	
	controls.movementSpeed = 2;
	controls.domElement = this.renderer.domElement;
	controls.rollSpeed = Math.PI / 4;
	controls.autoForward = false;
	controls.dragToLook = false;
	this.on('update', function(e) {
		controls.update(e.delta);
	});
*/
	
	this.camera.light = new THREE.PointLight(0xffffff, 1, 1);
	this.camera.add(this.camera.light);
	
	this.light = new THREE.DirectionalLight(0xffffff);
	this.light.position.set(0, .75, 1);
	this.add(this.light);
	
	
	this.build();
}

PROJECT.World.prototype = Object.create(HMU.World.prototype);

function saturate(v) {
	if(v < 0) return 0;
	if(v > 1) return 1;
	return v;
}

PROJECT.World.prototype.build = function() {
	var Noise = new HMU.PerlinNoise(0);
	
	function density(pos) {
//		var density = - pos.y;
		var density = - Math.sqrt(Math.pow(pos.x, 2) + Math.pow(pos.y, 2) + Math.pow(pos.z, 2)) + 1.25;
		
		var pos2 = pos.clone().multiplyScalar(1.5);
		density += Noise.sample3tess(pos2.x, pos2.y, pos2.z, 2,2, 2);
		
		return density;
	}
	
	var T = Date.now();
	var geometry = new HMU.MarchingCubes(density, new THREE.Vector3(-2,-2,-2), new THREE.Vector3(2,2,2), 4 / 128);
	console.log(Date.now() - T)
	
	this.mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: 0xff0000, side: THREE.DoubleSide }));
	this.mesh.scale.multiplyScalar(1);
	this.add(this.mesh);
}
