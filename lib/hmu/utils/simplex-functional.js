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
	
	SimplexNoise.prototype.sample = function() {
		var input = Array.prototype.slice.call(arguments);
		var N = input.length;
		
		// Coordinate Skewing
		var shift  = input.reduce(function(sum, v) { return sum + v; }, 0)
		    shift *= (Math.sqrt(N + 1) - 1) / N;
		
		var skewed = input.map(function(v) { return v + shift; });
		var base = skewed.map(function(v) { return Math.floor(v); });
		var relative = skewed.map(function(v, i) { return v - base[i]; });
		
		// Simplical Subdivision
		var simplex = input.map(function(v, i) { return i })
			.sort(function(a, b) { return relative[a] < relative[b]; })
			.reduce(function(simplex, i) {
				var next = simplex[simplex.length - 1].slice();
				next[i] += 1;
				
				return simplex.concat([ next ]);
			}, [ base.slice() ]);
		
		// Gradient Selection
		var that = this;
		var hash = simplex.map(function(v) {
			return v.reduce(function(hash, v) {
				return that.p[hash + v];
			}, 0);
		});
		
		// Kernel Summation
		return 70 * input.map(function(v, i) { return i })
			.reduce(function(sum, i) {
				var shift  = simplex[i].reduce(function(sum, v) { return sum + v; }, 0);
				    shift *= (1 / Math.sqrt(N + 1) - 1) / N;
				
				var unskewed = simplex[i].map(function(v) { return v + shift });
				var displacement = input.map(function(v, i) { return v - unskewed[i]; });
				
				var r = .5;
				var d = displacement.reduce(function(sum, v) { return sum + v * v; }, 0);
				
				return sum + Math.pow(r - d, 4) * grad2(hash[i], displacement);
			}, 0);
	}
	
	return SimplexNoise;
	
	function grad(hash, displacement) {
		if(displacement.length === 2) return grad2(hash, displacement);
		if(displacement.length === 3) return grad3(hash, displacement);
		
		throw new Error('grad: unknown length ' + displacement.length);
	}
	
	function grad2(hash, displacement) {
		if(hash & 4) {
			return ((hash & 2) ? displacement[0] : -displacement[0]) + ((hash & 1) ? displacement[1] : -displacement[1]);
		}
		else {
			return (hash & 2) ? ((hash & 1) ? displacement[0] : -displacement[0]) : ((hash & 1) ? displacement[1] : -displacement[1]);
		}
	}
	
	function grad3(hash, displacement) {
		var h = hash & 15;
		var u = h < 8 ? displacement[0] : displacement[1];
		var v = h < 4 ? displacement[1] : h === 12 || h === 14 ? displacement[0] : displacement[2];
		
		return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
	}
})();
