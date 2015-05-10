var HMU = HMU || {};

HMU.World = (function() {
	var World = function(config) {
		config = config || {};
		
		this.parent = config.parent || document.body;
		
		this.scene = new THREE.Scene();
		
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.camera.position.copy(config.camera || new THREE.Vector3(0,0,0));
		this.add(this.camera);
		
		this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
		this.renderer.setClearColor(0x000000, 0);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.parent.appendChild(this.renderer.domElement);
		
		this.clock = new THREE.Clock(false);
		this._animate = this.animate.bind(this);
		
		if(config.pause) {
			window.addEventListener('focus', this.play.bind(this), false);
			window.addEventListener('blur', this.pause.bind(this), false);
		}
		
		if(typeof Stats !== 'undefined') {
			this.stats = new Stats();
			this.parent.appendChild(this.stats.domElement);
		}
		
		if(typeof TWEEN !== 'undefined') {
			TWEEN._time = 0;
			this.on('update', function(e) {
				TWEEN._time = e.time;
				TWEEN.update(e.time);
			});
		}
		
		for(var extra in World.Extras) {
			for(var method in World.Extras[extra].prototype) {
				this[method] = World.Extras[extra].prototype[method];
			}
			
			World.Extras[extra].call(this, config);
		}
		
		setTimeout(this.play.bind(this), 0);
	}
	
	THREE.EventDispatcher.prototype.apply(World.prototype);
	World.prototype.on = World.prototype.addEventListener;
	
	World.prototype.add = function(object) {
		this.scene.add(object);
	}
	
	World.prototype.play = function() {
		this.clock.start();
		requestAnimationFrame(this._animate);
	}
	
	World.prototype.pause = function() {
		this.clock.stop();
	}
	
	World.prototype.animate = function() {
		if(this.clock.running) {
			requestAnimationFrame(this._animate);
		}
		
		this.frame(this.clock.getDelta(), this.clock.getElapsedTime());
	}
	
	World.prototype.frame = function(d,t) {
		this.bubble({ type: 'update', delta: d || 0, time: t || 0 });
		
		this.render();
		if(this.stats) this.stats.update();
	}
	
	World.prototype.bubble = function(event) {
		this.dispatchEvent(event);
		
		for(var i = 0; i < this.scene.children.length; i++) {
			if(!this.scene.children[i] || !this.scene.children[i].bubble) continue;
			
			this.scene.children[i].bubble(event);
		}
	}
	
	World.prototype.render = function() {
		this.renderer.render(this.scene, this.camera);
	}
	
	return World;
})();
