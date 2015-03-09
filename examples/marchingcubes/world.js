var PROJECT = PROJECT || {};

PROJECT.World = function() {
	HMU.World.call(this, {
		camera: new THREE.Vector3(-2.5,2.5,5),
		fov: { x: 50, y: 50 },
	});
	this.camera.lookAt(this.scene.position);
	
	this.load().then(this.build.bind(this));
}

PROJECT.World.prototype = Object.create(HMU.World.prototype);

PROJECT.World.prototype.load = function() {
	var world = this;
	
	return Promise.all([
		MarchingCubes.load(),
	]);
}

function saturate(v) {
	if(v < 0) return 0;
	if(v > 1) return 1;
	return v;
}

PROJECT.World.prototype.build = function() {
	var Noise = new PerlinNoise(0);
	
	function density(pos) {
		var density = -pos.y;
//		var density = - Math.sqrt(Math.pow(pos.x, 2) + Math.pow(pos.y, 2) + Math.pow(pos.z, 2)) + 1.5;
		
		var pos2 = pos.clone().multiplyScalar(1.5);
		density += Noise.sample3tess(pos2.x, pos2.y, pos2.z, 2,2, 2);
		
		return density;
	}
	
	this.light = new THREE.DirectionalLight(0xffffff);
	this.light.position.set(0, .75, 1);
	this.add(this.light);
	
	var T = Date.now();
	var geometry = new MarchingCubes(density, new THREE.Vector3(-2,-2,-2), new THREE.Vector3(2,2,2), 4 / 128);
	console.log(Date.now() - T)
	
	this.mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: 0xff0000 }));
	this.mesh.scale.multiplyScalar(1);
	this.mesh.add(new THREE.AxisHelper());
	this.add(this.mesh);
	
	this.on('update', function(e) {
		this.mesh.rotation.y += Math.PI / 8 * e.delta;
	})
}
