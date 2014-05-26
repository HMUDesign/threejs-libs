var HMU = HMU || {};

HMU.utils = {
	/**
	 * Given a base vector and a spread range vector, create
	 * a new THREE.Vector3 instance with randomised values.
	 * From ShaderParticleUtils
	 *
	 * @private
	 *
	 * @param  {THREE.Vector3} base
	 * @param  {THREE.Vector3} spread
	 * @return {THREE.Vector3}
	 */
	randomVector3: function( base, spread ) {
		var v = new THREE.Vector3();
		
		v.copy( base );
		
		v.x += Math.random() * spread.x - (spread.x/2);
		v.y += Math.random() * spread.y - (spread.y/2);
		v.z += Math.random() * spread.z - (spread.z/2);
		
		return v;
	},
	
	/**
	 * Given a base euler and a spread range euler, create
	 * a new THREE.Euler instance with randomised values.
	 * From ShaderParticleUtils::randomVector3
	 *
	 * @private
	 *
	 * @param  {THREE.Euler} base
	 * @param  {THREE.Euler} spread
	 * @return {THREE.Euler}
	 */
	randomEuler: function( base, spread ) {
		var v = new THREE.Euler();
		
		v.copy( base );
		
		v.x += Math.random() * spread.x - (spread.x / 2);
		v.y += Math.random() * spread.y - (spread.y / 2);
		v.z += Math.random() * spread.z - (spread.z / 2);
		
		return v;
	},
	
	/**
	 * Create a new THREE.Color instance and given a base vector and
	 * spread range vector, assign random values.
	 *
	 * Note that THREE.Color RGB values are in the range of 0 - 1, not 0 - 255.
	 *
	 * @private
	 *
	 * @param  {THREE.Vector3} base
	 * @param  {THREE.Vector3} spread
	 * @return {THREE.Color}
	 */
	randomColor: function( base, spread ) {
		var v = new THREE.Color();
		
		v.copy( base );
		
		v.r += (Math.random() * spread.x) - (spread.x/2);
		v.g += (Math.random() * spread.y) - (spread.y/2);
		v.b += (Math.random() * spread.z) - (spread.z/2);
		
		v.r = Math.max( 0, Math.min( v.r, 1 ) );
		v.g = Math.max( 0, Math.min( v.g, 1 ) );
		v.b = Math.max( 0, Math.min( v.b, 1 ) );
		
		return v;
	},
	
	/**
	 * Create a random Number value based on an initial value and
	 * a spread range
	 *
	 * @private
	 *
	 * @param  {Number} base
	 * @param  {Number} spread
	 * @return {Number}
	 */
	randomFloat: function( base, spread ) {
		return base + spread * (Math.random() - 0.5);
	},
};

HMU.Option = function(value, spread) {
	if(typeof value === 'string') {
		this.type = value;
		value = spread;
		spread = arguments[2];
	}
	else if(value instanceof THREE.Vector3) {
		this.type = 'Vector3';
	}
	else if(value instanceof THREE.Euler) {
		this.type = 'Euler';
	}
	else if(value instanceof THREE.Color) {
		this.type = 'Color';
	}
	else if(typeof value === 'number') {
		this.type = 'Number';
	}
	
	if(this.type === 'Vector3') {
		this.value  = value  instanceof THREE.Vector3 ? value  : new THREE.Vector3();
		this.spread = spread instanceof THREE.Vector3 ? spread : new THREE.Vector3();
	}
	else if(this.type === 'Euler') {
		this.value  = value  instanceof THREE.Euler ? value  : new THREE.Euler();
		this.spread = spread instanceof THREE.Euler ? spread : new THREE.Euler();
	}
	else if(this.type === 'Color') {
		this.value  = value  instanceof THREE.Color ? value  : new THREE.Color(0x000000);
		this.spread = spread instanceof THREE.Vector3 ? spread : new THREE.Vector3();
	}
	else if(this.type === 'Number') {
		this.value  = typeof value  === 'number' ? value  : 0;
		this.spread = typeof spread === 'number' ? spread : 0;
	}
	else {
		throw new Error('Unknown type ' + this.type);
	}
}

HMU.Option.prototype.get = function() {
	if(this.type === 'Vector3') {
		return HMU.utils.randomVector3(this.value, this.spread);
	}
	if(this.type === 'Euler') {
		return HMU.utils.randomEuler(this.value, this.spread);
	}
	if(this.type === 'Color') {
		return HMU.utils.randomColor(this.value, this.spread);
	}
	else if(this.type === 'Number') {
		return HMU.utils.randomFloat(this.value, this.spread);
	}
	else {
		throw new Error('Unknown type ' + this.type);
	}
}
