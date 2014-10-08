PROJECT.Ball = function() {
	THREE.Mesh.call(this, PROJECT.Ball.geometry, PROJECT.Ball.material);
	this.cannon = new CANNON.Body({ mass: 1, material: PROJECT.Ball.cannon_mat });
	this.cannon.name = 'ball';
	this.cannon.addShape(PROJECT.Ball.cannon_shape);
}

PROJECT.Ball.geometry = new THREE.IcosahedronGeometry(.15, 1);
PROJECT.Ball.material = new THREE.MeshNormalMaterial();
PROJECT.Ball.cannon_shape = new CANNON.Sphere(.15);
PROJECT.Ball.cannon_mat = new CANNON.Material();

PROJECT.Ball.prototype = Object.create(THREE.Mesh.prototype);

PROJECT.Ball.prototype.destroy = function() {
	this.cannon.world.remove(this.cannon);
	this.parent.remove(this);
}
