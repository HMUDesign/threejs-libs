var HMU = HMU || {};

HMU.World = function(config) {
	config = config || {};
	
	this.parent = config.parent || document.body;
	
	this.scene = new THREE.Scene();
	if(config.scenePosition) {
		this.scene.position.copy(config.scenePosition);
	}
	
	this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
	if(config.camera) {
		this.camera.position = config.camera;
	}
	
	this.renderer = new THREE.WebGLRenderer({ alpha: true });
	this.renderer.setClearColor(0x000000, 0);
	if(config.viewport) {
		this.viewport = config.viewport;
	}
	
	if(config.fixed) {
		this.renderer.domElement.classList.add('fixed');
	}
	
	this.stats = new Stats();
	this.clock = new THREE.Clock(false);
	this.clock.start();
	
	this.parent.appendChild(this.renderer.domElement);
	this.parent.appendChild(this.stats.domElement);
	
	this._animate = HMU.World.prototype.animate.bind(this);
	
	window.addEventListener('resize', HMU.World.prototype.resize.bind(this), false);
	this.resize();
	
	if(config.pause) {
		window.addEventListener('focus', HMU.World.prototype.play.bind(this), false);
		window.addEventListener('blur', HMU.World.prototype.pause.bind(this), false);
	}
	
	
	THREE.DefaultLoadingManager.onProgress = function(item, loaded, total) {
		console.log('loaded', item, loaded, total);
	}
	THREE.DefaultLoadingManager.onLoad = THREE.EventDispatcher.prototype.dispatchEvent.bind(this, { type: 'loaded' });
}

THREE.EventDispatcher.prototype.apply(HMU.World.prototype);
HMU.World.prototype.on = HMU.World.prototype.addEventListener;

HMU.World.prototype.resize = function(width, height) {
	if(typeof width !== 'number') width = null;
	if(typeof height !== 'number') height = null;
	
	width = width || (this.parent && this.parent.offsetWidth) || window.innerWidth,
	height = height || (this.parent && this.parent.offsetHeight) || window.innerHeight;
	
	if(this.viewport) {
//		this.renderer.setViewport(this.viewport.x * width, this.viewport.y * height, width, height);
		width *= 1 + 2 * Math.abs(this.viewport.x);
		height *= 1 + 2 * Math.abs(this.viewport.y);
	}
	
	this.renderer.setSize(width, height);
	this.camera.aspect = width / height;
	this.camera.updateProjectionMatrix();
}

HMU.World.prototype.lookAt = function(position) {
	this.camera.lookAt(position || this.scene.position);
}

HMU.World.prototype.add = function(object) {
	this.scene.add(object);
}

HMU.World.prototype.play = function() {
	this.clock.start();
	this.start();
}

HMU.World.prototype.pause = function() {
	this.clock.stop();
}

HMU.World.prototype.start = function() {
	requestAnimationFrame(this._animate);
}

HMU.World.prototype.animate = function() {
	if(this.clock.running) {
		requestAnimationFrame(this._animate);
	}
	
	this.dispatchEvent({ type: 'update', delta: this.clock.getDelta(), time: this.clock.getElapsedTime() });
	
	this.renderer.render(this.scene, this.camera);
	
	this.stats.update();
}

HMU.World.prototype.once = function(d,t) {
	this.dispatchEvent({ type: 'update', delta: d || 0, time: t || 0 });
	
	this.renderer.render(this.scene, this.camera);
	
	this.stats.update();
}
