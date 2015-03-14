/**
 * World
 */
PROJECT.World = function() {
	HMU.World.call(this, {
		camera: new THREE.Vector3(0,-3,3),
	});
	
	this.camera.lookAt(this.scene.position);
	
	this.on('update', function(e) {
		this.tick(e.delta);
	});
	
	this.perlin = new HMU.PerlinNoise(0);
	
	this.item = new THREE.Mesh(new THREE.IcosahedronGeometry(.05), new THREE.MeshNormalMaterial());
	
	this.speed = new THREE.Vector3(0,0,0);
	
	this.grid = [];
	for(var x = -2; x <= 2; x += .1) {
		x = Math.round(x * 10) / 10;
		
		var i = this.grid.length;
		this.grid[i] = [];
		for(var y = -2; y <= 2; y += .1) {
			y = Math.round(y * 10) / 10;
			
			var item = this.item.clone();
			this.grid[i].push(item);
			
			item.perlin = new THREE.Vector3(x,y,0);
			item.position.x = x;
			item.position.y = y;
			item.position.z = 0;
			
			this.add(item);
		}
	}
}

PROJECT.World.prototype = Object.create(HMU.World.prototype);

PROJECT.World.prototype.gui = function() {
	this.gui = new dat.GUI();
	
	var speed = this.gui.addFolder('Speed');
	speed.add(this.speed, 'x', -1, 1);
	speed.add(this.speed, 'y', -1, 1);
	speed.add(this.speed, 'z', -1, 1);
}

PROJECT.World.prototype.tick = function(d) {
	for(var i = 0; i < this.grid.length; i++) {
		for(var j = 0; j < this.grid[i].length; j++) {
			var item = this.grid[i][j];
			item.perlin.add(this.speed.clone().multiplyScalar(d));
			item.position.z = this.perlin.noise3(item.perlin.x, item.perlin.y, item.perlin.z) + 1;
		}
	}
}

window.onload = function() {
	this.world = new PROJECT.World();
	this.world.gui();
}
