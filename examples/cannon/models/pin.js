PROJECT.Pin = function() {
	THREE.Mesh.call(this, PROJECT.Pin.geometry, PROJECT.Pin.material);
	this.cannon = new CANNON.Body({ mass: 0, material: PROJECT.Pin.cannon_mat });
	this.cannon.name = 'pin';
	this.cannon.addShape(PROJECT.Pin.cannon_shape);
}

PROJECT.Pin.geometry = new THREE.IcosahedronGeometry(.05, 1);
PROJECT.Pin.material = new THREE.MeshNormalMaterial();
PROJECT.Pin.cannon_shape = new CANNON.Sphere(.05);
PROJECT.Pin.cannon_mat = new CANNON.Material();

PROJECT.Pin.prototype = Object.create(THREE.Mesh.prototype);
