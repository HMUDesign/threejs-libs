var HMU = HMU || {};

HMU.World = function(config) {
	config = config || {};
	
	this.parent = config.parent || document.body;
	
	this.scene = new THREE.Scene();
	
	this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
	this.camera.position.copy(config.camera || new THREE.Vector3(0,0,1));
	this.scene.add(this.camera);
	
	if(config.fov) {
		this.fov = typeof config.fov === 'object' ? config.fov : {};
		if(typeof this.fov !== 'object') this.fov = {};
		
		if(!this.fov.x) this.fov.x = 2 * THREE.Math.radToDeg(Math.atan(1 / 2));
		var width = 2 * Math.tan(THREE.Math.degToRad(this.fov.x / 2));
		
		if(!this.fov.y) this.fov.y = 2 * THREE.Math.radToDeg(Math.atan(width / 3));
		var height = 2 * Math.tan(THREE.Math.degToRad(this.fov.y / 2));
		
		if(this.fov.debug) {
//			console.log(width, height, width / height)
			
			this.box = new THREE.Mesh(new THREE.BoxGeometry(width, height, 1), new THREE.MeshBasicMaterial({ wireframe: true }));
			this.box.name = 'FOV Helper';
			this.box.position.set(0, 0, -1.5);
			this.camera.add(this.box);
		}
	}
	
	this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
	this.renderer.setClearColor(0x000000, 0);
	this.parent.appendChild(this.renderer.domElement);
	
	if(config.html) {
		this.html = document.createElement('div');
		this.html.setAttribute('id', 'container');
		
		this.container = document.createElement('div');
		
		this.on('scroll', function() {
			var height1 = 2 * Math.tan(THREE.Math.degToRad(this.camera.fov / 2));
			var height2 = 2 * Math.tan(THREE.Math.degToRad(this.fov.y / 2));
			var scaley = height2 / height1;
			this.html.scale = scaley;
			
			var part = this.camera.position.y + Math.tan(THREE.Math.degToRad(this.camera.fov / 2));
			this.container.style.transform  = 'translate3d(-50%, 0, 0)';
			this.container.style.transform += 'scale(' + scaley + ')';
			this.container.style.transform += 'translateY(' + part * document.body.scrollHeight / 2 + 'px)';
		});
		
		this.html.appendChild(this.container);
		document.body.appendChild(this.html);
	}
	
	if(typeof Stats !== 'undefined') {
		this.stats = new Stats();
		this.parent.appendChild(this.stats.domElement);
	}
	
	this.clock = new THREE.Clock(false);
	this._animate = this.animate.bind(this);
	
	window.addEventListener('resize', this.resize.bind(this), false);
	window.addEventListener('scroll', this.scroll.bind(this), false);
	
	if(config.pause) {
		window.addEventListener('focus', this.play.bind(this), false);
		window.addEventListener('blur', this.pause.bind(this), false);
	}
	
	if(window.TWEEN) {
		TWEEN._time = 0;
		this.on('update', function(e) {
			TWEEN._time = e.time;
			TWEEN.update(e.time);
		});
	}
	
	this.resize();
	this.play();
	
	for(var extra in HMU.World.Extras) {
		HMU.World.Extras[extra].call(this);
	}
}

THREE.EventDispatcher.prototype.apply(HMU.World.prototype);
HMU.World.prototype.on = HMU.World.prototype.addEventListener;

HMU.World.prototype.resize = function() {
	var event = {
		type: 'resize',
		width: document.body.clientWidth || window.innerWidth,
		height: window.innerHeight,
	};
	
	this.bubble(event);
	
	this.camera.aspect = event.width / event.height;
	
	if(this.fov) {
		this.camera.fov = this.fov.y;
		
		var height = 2 * Math.tan(THREE.Math.degToRad(this.fov.y / 2));
		var _fovx = THREE.Math.radToDeg(2 * Math.atan(height * this.camera.aspect / 2));
		
		if(_fovx < this.fov.x) {
			var width = 2 * Math.tan(THREE.Math.degToRad(this.fov.x / 2));
			var _fovy = THREE.Math.radToDeg(2 * Math.atan(width / this.camera.aspect / 2));
			this.camera.fov = _fovy;
		}
		
		this.camera.shiftfov = -Math.tan(THREE.Math.degToRad(this.camera.fov / 2));
		this.scroll();
	}
	
	this.camera.updateProjectionMatrix();
	
	this.renderer.setSize(event.width, event.height);
}

HMU.World.prototype.setHeight = function(height) {
	this.height = height;
	
	var height = 2 * Math.tan(THREE.Math.degToRad(this.camera.fov / 2));
	
	if(this.height < height) this.height = height;
	
//	document.body.style.height = (100 * this.height / height) + '%';
}

HMU.World.prototype.scroll = function() {
	var event = {
		type: 'scroll',
		percent: document.body.scrollTop / (document.body.scrollHeight - window.innerHeight),
	};
	
	var height = 2 * Math.tan(THREE.Math.degToRad(this.camera.fov / 2));
	
	this.camera.shiftscroll = - event.percent * (this.height ? (this.height - height) : 1);
	this.camera.position.y = (this.camera.shiftfov || 0) + this.camera.shiftscroll;
	
	this.bubble(event);
}

HMU.World.prototype.add = function(object) {
	this.scene.add(object);
}

HMU.World.prototype.play = function() {
	this.clock.start();
	requestAnimationFrame(this._animate);
}

HMU.World.prototype.pause = function() {
	this.clock.stop();
}

HMU.World.prototype.animate = function() {
	if(this.clock.running) {
		requestAnimationFrame(this._animate);
	}
	
	this.frame(this.clock.getDelta(), this.clock.getElapsedTime());
}

HMU.World.prototype.frame = function(d,t) {
	this.bubble({ type: 'update', delta: d || 0, time: t || 0 });
	
	this.render();
	if(this.stats) this.stats.update();
}

HMU.World.prototype.bubble = function(event) {
	this.dispatchEvent(event);
	
	for(var i = 0; i < this.scene.children.length; i++) {
		if(!this.scene.children[i] || !this.scene.children[i].bubble) continue;
		
		this.scene.children[i].bubble(event);
	}
}

HMU.World.prototype.render = function() {
	this.renderer.render(this.scene, this.camera);
}
