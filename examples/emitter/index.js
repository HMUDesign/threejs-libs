var world = new HMU.World({
	camera: new THREE.Vector3(0,0,50),
});

world.coin = new THREE.Mesh(
	new THREE.CylinderGeometry(1.25, 1.25, 1.25 / 8, 12, 1, false),
	new THREE.MeshNormalMaterial()
);
world.coin.mass = 1;

world.emitter = new HMU.Emitter({
	particle: world.coin,
	
	position: new HMU.Option(new THREE.Vector3(0, 0, 0)),
	velocity: new HMU.Option(new THREE.Vector3(0, 15, 0), new THREE.Vector3(10, 5, 10)),
	acceleration: new HMU.Option(new THREE.Vector3(0, -9.8, 0), new THREE.Vector3(0, 0, 0)),
	
	angularVelocity: new HMU.Option(new THREE.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2), new THREE.Vector3(Math.PI / 4, Math.PI / 4, Math.PI / 4)),
});
world.add(world.emitter);

var gui = new dat.GUI();
gui.add(world.emitter.config, 'particles', 100, 500);
gui.add(world.emitter.config.particle, 'mass', 1, 5);

var velocity = gui.addFolder('Velocity');
velocity.add(world.emitter.config.velocity.base, 'x', 0, 50);
velocity.add(world.emitter.config.velocity.base, 'y', 0, 50);
velocity.add(world.emitter.config.velocity.base, 'z', 0, 50);

var velocitySpread = gui.addFolder('Velocity Spread');
velocitySpread.add(world.emitter.config.velocity.spread, 'x', 0, 50);
velocitySpread.add(world.emitter.config.velocity.spread, 'y', 0, 50);
velocitySpread.add(world.emitter.config.velocity.spread, 'z', 0, 50);

world.on('update', function(e) {
	world.emitter.tick(e.delta);
});

world.renderer.domElement.addEventListener('mousedown', HMU.Emitter.prototype.reset.bind(world.emitter), false );
