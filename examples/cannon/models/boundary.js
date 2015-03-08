PROJECT.Boundary = function(position, rotation) {
	THREE.Mesh.call(this, PROJECT.Boundary.geometry, PROJECT.Boundary.material);
	this.cannon = new CANNON.Body({ mass: 0, material: PROJECT.Boundary.cannon_mat });
	this.cannon.name = 'boundary';
	this.cannon.addShape(PROJECT.Boundary.cannon_shape);
	
	position && this.position.copy(position);
	rotation && this.rotation.copy(rotation);
	this.setCannon();
}

PROJECT.Boundary.geometry = new THREE.PlaneBufferGeometry(20,1);
PROJECT.Boundary.material = new THREE.MeshNormalMaterial();
PROJECT.Boundary.cannon_shape = new CANNON.Plane();
PROJECT.Boundary.cannon_mat = new CANNON.Material();

PROJECT.Boundary.prototype = Object.create(THREE.Mesh.prototype);

PROJECT.Boundary.prototype.setCannon = function() {
	this.cannon.position.set(this.position.x, this.position.y, this.position.z);
	this.cannon.quaternion.set(this.quaternion.x, this.quaternion.y, this.quaternion.z, this.quaternion.w);
}
