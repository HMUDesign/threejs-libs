/**
 * World
 */
PROJECT.World = function() {
	HMU.World.call(this, {
		fixed: true,
		camera: new THREE.Vector3(0, 0, 3),
	});
	
	this.animator = new HMU.Animator();
	
	this.build();
	this.start();
	
	this.on('update', function(e) {
		this.animator.tick(e.time);
	});
}

PROJECT.World.prototype = Object.create(HMU.World.prototype);

PROJECT.World.prototype.build = function() {
	this.add(new THREE.AxisHelper(5));
	
	this.item = new THREE.Mesh(new THREE.IcosahedronGeometry(), new THREE.MeshNormalMaterial());
	this.item.position.y = -2;
	this.add(this.item);
	
	this.animator.add(this.item.position, 'y', { duration: 3, change: 4, easing: 'easeInOutQuad' });
	this.animator.add(this.item.rotation, 'x', { duration: 3, change: Math.PI, easing: 'easeOutBounce' });
	this.animator.add(this.item.rotation, 'z', { duration: 3, change: Math.PI / 3, easing: 'easeOutElastic' });
}

window.onload = function() {
	this.world = new PROJECT.World();
}
