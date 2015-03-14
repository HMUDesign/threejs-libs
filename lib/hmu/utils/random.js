var HMU = HMU || {};

HMU.Random = {
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
	vector3: function( base, spread ) {
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
	euler: function( base, spread ) {
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
	color: function( base, spread ) {
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
	float: function( base, spread ) {
		return base + spread * (Math.random() - 0.5);
	},
};
