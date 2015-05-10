var HMU = HMU || {};

HMU.SimplexNoise = (function() {
	var SimplexNoise = function(seed) {
		var _rand = seed || 0;
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
	
	SimplexNoise.prototype.sample2 = function(x, y) {
		var N = 2;
		
		// Coordinate Skewing
		var shift = (x + y) * (Math.sqrt(N + 1) - 1) / N;
		
		var sx = x + shift;
		var sy = y + shift;
		
		var bx = Math.floor(sx);
		var by = Math.floor(sy);
		
		var rx = sx - bx;
		var ry = sy - by;
		
		// Simplical Subdivision
		
		var p0x = bx;
		var p0y = by;
		
		if(rx > ry) {
			var p1x = p0x + 1;
			var p1y = p0y;
		}
		else {
			var p1x = p0x;
			var p1y = p0y + 1;
		}
		
		var p2x = p0x + 1;
		var p2y = p0y + 1;
		
		// Gradient Selection
		
		var h0 = this.p[p0x + this.p[p0y]];
		var h1 = this.p[p1x + this.p[p1y]];
		var h2 = this.p[p2x + this.p[p2y]];
		
		// Kernel Summation
		var sum = 0;
		var r = .5;
		
		var shift0 = (p0x + p0y) * (1 / Math.sqrt(N + 1) - 1) / N;
		var u0x = p0x + shift0;
		var u0y = p0y + shift0;
		var d0x = x - u0x;
		var d0y = y - u0y;
		var d0 = d0x * d0x + d0y * d0y;
		sum += Math.pow(r - d0, 4) * grad2(h0, d0x, d0y);
		
		var shift1 = (p1x + p1y) * (1 / Math.sqrt(N + 1) - 1) / N;
		var u1x = p1x + shift1;
		var u1y = p1y + shift1;
		var d1x = x - u1x;
		var d1y = y - u1y;
		var d1 = d1x * d1x + d1y * d1y;
		sum += Math.pow(r - d1, 4) * grad2(h1, d1x, d1y);
		
		var shift2 = (p2x + p2y) * (1 / Math.sqrt(N + 1) - 1) / N;
		var u2x = p2x + shift2;
		var u2y = p2y + shift2;
		var d2x = x - u2x;
		var d2y = y - u2y;
		var d2 = d2x * d2x + d2y * d2y;
		sum += Math.pow(r - d2, 4) * grad2(h2, d2x, d2y);
		
		return sum * 70;
	}
	
	SimplexNoise.prototype.sample3 = function(x, y, z) {
		var N = 3;
		
		// Coordinate Skewing
		var shift = (x + y + z) * (Math.sqrt(N + 1) - 1) / N;
		
		var sx = x + shift;
		var sy = y + shift;
		var sz = z + shift;
		
		var bx = Math.floor(sx);
		var by = Math.floor(sy);
		var bz = Math.floor(sz);
		
		var rx = sx - bx;
		var ry = sy - by;
		var rz = sz - bz;
		
		// Simplical Subdivision
		
		var p0x = bx;
		var p0y = by;
		var p0z = bz;
		
		if(rx > ry) {
			if(ry > rz) {
				var p1x = p0x + 1;
				var p1y = p0y;
				var p1z = p0z;
				
				var p2x = p1x;
				var p2y = p1y + 1;
				var p2z = p1z;
			}
			else if(rx > rz) {
				var p1x = p0x + 1;
				var p1y = p0y;
				var p1z = p0z;
				
				var p2x = p1x;
				var p2y = p1y;
				var p2z = p1z + 1;
			}
			else  {
				var p1x = p0x;
				var p1y = p0y;
				var p1z = p0z + 1;
				
				var p2x = p1x + 1;
				var p2y = p1y;
				var p2z = p1z;
			}
		}
		else {
			if(ry < rz) {
				var p1x = p0x;
				var p1y = p0y;
				var p1z = p0z + 1;
				
				var p2x = p1x;
				var p2y = p1y + 1;
				var p2z = p1z;
			}
			else if(rx > rz) {
				var p1x = p0x;
				var p1y = p0y + 1;
				var p1z = p0z;
				
				var p2x = p1x + 1;
				var p2y = p1y;
				var p2z = p1z;
			}
			else  {
				var p1x = p0x;
				var p1y = p0y + 1;
				var p1z = p0z;
				
				var p2x = p1x;
				var p2y = p1y;
				var p2z = p1z + 1;
			}
		}
		
		var p3x = p0x + 1;
		var p3y = p0y + 1;
		var p3z = p0z + 1;
		
		// Gradient Selection
		
		var h0 = this.p[p0x + this.p[p0y + this.p[p0z]]];
		var h1 = this.p[p1x + this.p[p1y + this.p[p1z]]];
		var h2 = this.p[p2x + this.p[p2y + this.p[p2z]]];
		var h3 = this.p[p3x + this.p[p3y + this.p[p3z]]];
		
		// Kernel Summation
		var sum = 0;
		var r = .5;
		
		var shift0 = (p0x + p0y + p0z) * (1 / Math.sqrt(N + 1) - 1) / N;
		var u0x = p0x + shift0;
		var u0y = p0y + shift0;
		var u0z = p0z + shift0;
		var d0x = x - u0x;
		var d0y = y - u0y;
		var d0z = z - u0z;
		var d0 = d0x * d0x + d0y * d0y + d0z * d0z;
		sum += Math.pow(r - d0, 4) * grad3(h0, d0x, d0y, d0z);
		
		var shift1 = (p1x + p1y + p1z) * (1 / Math.sqrt(N + 1) - 1) / N;
		var u1x = p1x + shift1;
		var u1y = p1y + shift1;
		var u1z = p1z + shift1;
		var d1x = x - u1x;
		var d1y = y - u1y;
		var d1z = z - u1z;
		var d1 = d1x * d1x + d1y * d1y + d1z * d1z;
		sum += Math.pow(r - d1, 4) * grad3(h1, d1x, d1y, d1z);
		
		var shift2 = (p2x + p2y + p2z) * (1 / Math.sqrt(N + 1) - 1) / N;
		var u2x = p2x + shift2;
		var u2y = p2y + shift2;
		var u2z = p2z + shift2;
		var d2x = x - u2x;
		var d2y = y - u2y;
		var d2z = z - u2z;
		var d2 = d2x * d2x + d2y * d2y + d2z * d2z;
		sum += Math.pow(r - d2, 4) * grad3(h2, d2x, d2y, d2z);
		
		var shift3 = (p3x + p3y + p3z) * (1 / Math.sqrt(N + 1) - 1) / N;
		var u3x = p3x + shift3;
		var u3y = p3y + shift3;
		var u3z = p3z + shift3;
		var d3x = x - u3x;
		var d3y = y - u3y;
		var d3z = z - u3z;
		var d3 = d3x * d3x + d3y * d3y + d3z * d3z;
		sum += Math.pow(r - d3, 4) * grad3(h3, d3x, d3y, d3z);
		
		return sum * 70;
	}
	
	return SimplexNoise;
	
	function grad2(hash, x, y) {
		if(hash & 4) {
			return ((hash & 2) ? x : -x) + ((hash & 1) ? y : -y);
		}
		else {
			return (hash & 2) ? ((hash & 1) ? x : -x) : ((hash & 1) ? y : -y);
		}
	}
	
	function grad3(hash, x, y, z) {
		var h = hash & 15;
		var u = h < 8 ? x : y;
		var v = h < 4 ? y : h === 12 || h === 14 ? x : z;
		
		return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
	}
})();
