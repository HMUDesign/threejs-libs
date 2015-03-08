var PROJECT = PROJECT || {};

PROJECT.World = function() {
	HMU.World.call(this, {
		camera: new THREE.Vector3(0,1.5,0),
	});
	
	WorldVROculus.debug = true;
	WorldVR(this);
	
	this.build();
	
	this.on('update', function(e) {
		this.item.rotation.y += Math.PI / 8 * e.delta;
	});
}

PROJECT.World.prototype = Object.create(HMU.World.prototype);

PROJECT.World.prototype.build = function() {
	this.add(new THREE.AxisHelper(5));
	
	this.item = new THREE.Mesh(new THREE.IcosahedronGeometry(), new THREE.MeshNormalMaterial());
	this.item.position.set(0,1.5,-1.5);
	this.add(this.item);
}
