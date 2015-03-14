// This is a port of Ken Perlin's Java code. The original Java code is at http://cs.nyu.edu/~perlin/noise/

HMU.PerlinNoise = (function() {
	var PerlinNoise = function(seed) {
		var _rand = seed;
		function rand() {
			_rand = (1103515245 * _rand + 12345) % 4294967297;
			return _rand / 4294967297;
		}
		
		this.p = new Array(256);
		for(var i = 0; i < this.p.length; i++) {
			this.p[i] = i;
		}
		
		for(var i = 0; i < this.p.length; i++) {
			var j = Math.floor(rand() * this.p.length);
			var t = this.p[i];
			this.p[i] = this.p[j];
			this.p[j] = t;
		}
		
		for(var i = 0, l = this.p.length; i < l; i++) {
			this.p[i + l] = this.p[i];
		}
	}
	
	PerlinNoise.prototype.noise3 = function(x, y, z, m) {
		if(m) {
			// FIND UNIT CUBE THAT CONTAINS POINT, MODULO M.
			var X0 = (Math.floor(x) % m) & 255;
			var Y0 = (Math.floor(y) % m) & 255;
			var Z0 = (Math.floor(z) % m) & 255;
			var X1 = ((Math.floor(x) + 1) % m) & 255;
			var Y1 = ((Math.floor(y) + 1) % m) & 255;
			var Z1 = ((Math.floor(z) + 1) % m) & 255;
		}
		else {
			// FIND UNIT CUBE THAT CONTAINS POINT.
			var X0 = Math.floor(x) & 255;
			var Y0 = Math.floor(y) & 255;
			var Z0 = Math.floor(z) & 255;
			var X1 = (Math.floor(x) + 1) & 255;
			var Y1 = (Math.floor(y) + 1) & 255;
			var Z1 = (Math.floor(z) + 1) & 255;
		}
		
		// FIND RELATIVE X,Y,Z OF POINT IN CUBE.
		x -= Math.floor(x);
		y -= Math.floor(y);
		z -= Math.floor(z);
		
		// COMPUTE FADE CURVES FOR EACH OF X,Y,Z.
		var u = fade(x);
		var v = fade(y);
		var w = fade(z);
		
		// HASH COORDINATES OF THE 8 CUBE CORNERS.
		var H0 = this.p[Z0], H1 = this.p[Z1];
		var H00 = this.p[Y0 + H0], H01 = this.p[Y0 + H1];
		var H10 = this.p[Y1 + H0], H11 = this.p[Y1 + H1];
		var H000 = this.p[X0 + H00], H001 = this.p[X0 + H01];
		var H010 = this.p[X0 + H10], H011 = this.p[X0 + H11];
		var H100 = this.p[X1 + H00], H101 = this.p[X1 + H01];
		var H110 = this.p[X1 + H10], H111 = this.p[X1 + H11];
		
		// SHORTHAND VALUES FOR BLENDING RESULTS
		var x0 = x, x1 = x - 1;
		var y0 = y, y1 = y - 1;
		var z0 = z, z1 = z - 1;
		
		// ADD BLENDER RESULTS FROM 8 CORNERS OF THE CUBE.
		return lerp(w,
			lerp(v,
				lerp(u,
					grad(H000, x0, y0, z0),
					grad(H100, x1, y0, z0)
				),
				lerp(u,
					grad(H010, x0, y1, z0),
					grad(H110, x1, y1, z0)
				)
			),
			lerp(v,
				lerp(u,
					grad(H001, x0, y0, z1),
					grad(H101, x1, y0, z1)
				),
				lerp(u,
					grad(H011, x0, y1, z1),
					grad(H111, x1, y1, z1)
				)
			)
		);
	}
	
	PerlinNoise.prototype.noise3tess = function(x,y,z, a,b, n,m) {
		var sum = 0;
		
		var scale = 1;
		for(var i = 0; i < n; i++) {
			sum += this.noise3(x, y, z, m) / scale;
			
			scale *= a;
			
			x *= b;
			y *= b;
			z *= b;
			m *= b;
		}
		
		return sum;
	}
	
	function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
	
	function lerp(t, a, b) { return a + t * (b - a); }
	
	function grad(hash, x, y, z) {
		var h = hash & 15;                     // CONVERT LO 4 BITS OF HASH CODE
		var u = h < 8 ? x : y;                 // INTO 12 GRADIENT DIRECTIONS.
		var v = h < 4 ? y : h === 12 || h === 14 ? x : z;
		
		return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
	}
	
	return PerlinNoise;
})();
