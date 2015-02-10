var HMU = HMU || {};

HMU.World = function(config) {
	config = config || {};
	
	this.parent = config.parent || document.body;
	
	this.scene = new THREE.Scene();
	if(config.scenePosition) {
		this.scene.position.copy(config.scenePosition);
	}
	
	if(config.views) {
		this.views = config.views;
		
		for(var i = 0; i < this.views.length; i++) {
			var view = this.views[i];
			
			if(view.position) {
				view.camera.position = view.position;
			}
			
			if(view.rotation) {
				view.camera.rotation.x = view.rotation.x;
				view.camera.rotation.y = view.rotation.y;
				view.camera.rotation.z = view.rotation.z;
			}
			
			if(view.look) {
				view.camera.lookAt(view.look);
			}
		}
	}
	else {
		this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
		if(config.camera) {
			this.camera.position.copy(config.camera);
		}
	}
	
	if(config.look) {
		this.lookAt();
	}
	
	this.renderer = new THREE.WebGLRenderer({ alpha: true });
	this.renderer.setClearColor(0x000000, 0);
	
	if(config.fixed) {
		this.renderer.domElement.classList.add('fixed');
	}
	
	this.parent.appendChild(this.renderer.domElement);
	
	if(typeof Stats !== 'undefined') {
		this.stats = new Stats();
		this.parent.appendChild(this.stats.domElement);
	}
	
	this.clock = new THREE.Clock(false);
	this.clock.start();
	
	this._animate = HMU.World.prototype.animate.bind(this);
	
	var world = this;
	window.addEventListener('resize', HMU.World.prototype.resize.bind(this), false);
	
	this.on('loaded', this.resize);
	
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
	
	var config = {
		type: 'resize',
		width: width || window.innerWidth,
		height: height || window.innerHeight,
	}
	
	this.dispatchEvent(config);
	
	if(this.camera) {
		this.camera.aspect = config.width / config.height;
		this.camera.updateProjectionMatrix();
	}
	
	this.renderer.setSize(config.width, config.height);
}

HMU.World.prototype.lookAt = function(position) {
	if(!this.camera) return;
	
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
	
	this.frame(this.clock.getDelta(), this.clock.getElapsedTime());
}

HMU.World.prototype.frame = function(d,t) {
	this.dispatchEvent({ type: 'update', delta: d || 0, time: t || 0 });
	
	this.render();
	if(this.stats) this.stats.update();
}

HMU.World.prototype.render = function() {
	if(this.views) {
		var
			windowWidth = this.renderer.domElement.width;
			windowHeight = this.renderer.domElement.height;
		
		for(var i = 0; i < this.views.length; i++) {
			var view = this.views[i];
			
			var left   = Math.floor( windowWidth  * view.viewport.left );
			var bottom = Math.floor( windowHeight * view.viewport.bottom );
			var width  = Math.floor( windowWidth  * view.viewport.width );
			var height = Math.floor( windowHeight * view.viewport.height );
			
			this.renderer.setViewport(left, bottom, width, height);
			this.renderer.setScissor(left, bottom, width, height);
			this.renderer.enableScissorTest (true);
			
			view.camera.aspect = width / height;
			view.camera.updateProjectionMatrix();
			
			this.renderer.render(this.scene, view.camera);
		}
	}
	else {
		this.renderer.render(this.scene, this.camera);
	}
}
