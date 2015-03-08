// This is a port of Ken Perlin's Java code. The original Java code is at http://cs.nyu.edu/~perlin/noise/

var PerlinNoise = (function() {
	var PerlinNoise = {};
	
	var permutation = [
		151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,
		8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,
		35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,
		134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,
		55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,
		18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,
		226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,
		17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,
		167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,
		246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,
		239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,
		254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180,
	];
	
	var p = [];
	for(var i = 0; i < 256; i++) p[i] = p[i + 256] = permutation[i];
	
	PerlinNoise.noise3 = function(x, y, z, m) {
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
		var H0 = p[Z0], H1 = p[Z1];
		var H00 = p[Y0 + H0], H01 = p[Y0 + H1];
		var H10 = p[Y1 + H0], H11 = p[Y1 + H1];
		var H000 = p[X0 + H00], H001 = p[X0 + H01];
		var H010 = p[X0 + H10], H011 = p[X0 + H11];
		var H100 = p[X1 + H00], H101 = p[X1 + H01];
		var H110 = p[X1 + H10], H111 = p[X1 + H11];
		
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
	
	PerlinNoise.noise3tess = function(x,y,z, a,b, n,m) {
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
