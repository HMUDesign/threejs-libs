HMU.World.Extras = HMU.World.Extras || {};

HMU.World.Extras.Mouse = (function() {
	function isAncestor(item, parent) {
		do {
			if(parent === item) return true;
		} while(item = item.parent);
		return false;
	}
	
	function removeAncestors(item, list) {
		for(var j in list) {
			if(isAncestor(item, list[j])) {
				delete list[j];
			}
		}
	}
	
	function hasDescendents(item, list) {
		for(var j in list) {
			if(isAncestor(list[j], item)) {
				return true;
			}
		}
		
		return false;
	}
	
	var Mouse = function() {
		var raycaster = new THREE.Raycaster();
		var mouse = new THREE.Vector2();
		mouse.buffer = 10;
		
		var element = this.renderer.domElement;
		document.body.addEventListener('mousemove', function(e) {
			mouse.active = (
				e.clientX > mouse.buffer &&
				e.clientY > mouse.buffer &&
				e.clientX < element.width - mouse.buffer &&
				e.clientY < element.height - mouse.buffer
			);
			
			mouse.x = (e.clientX / element.width) * 2 - 1;
			mouse.y = - (e.clientY / element.height) * 2 + 1;
		}, false);
		
		document.body.addEventListener('click', function(e) {
			var event = { type: 'click' };
			hovered.filter(function(item) {
				//console.log('click', item.name)
				item.dispatchEvent(event);
			});
		}, false);
		
		var hovered = [];
		
		this.on('update', function() {
			if(!mouse.active) return;
			
			raycaster.setFromCamera(mouse, this.camera);
			
			var intersects = raycaster.intersectObjects(this.scene.children, true);
			
			var items = [];
			for(var i in intersects) {
				var item = intersects[i].object;
				while(item && !(item instanceof HMU.World.Object3D)) item = item.parent;
				if(!item) continue;
				
				removeAncestors(item, items);
				
				if(!hasDescendents(item, items)) {
					items.push(item);
				}
			}
			
			var event = { type: 'mouseleave' };
			hovered = hovered.filter(function(item) {
				if(items.indexOf(item) === -1) {
					//console.log('leave', item.name)
					item.dispatchEvent(event);
					return false;
				}
				
				return true;
			});
			
			var event = { type: 'mouseenter' };
			items.filter(function(item) {
				if(hovered.indexOf(item) === -1) {
					//console.log('enter', item.name)
					item.dispatchEvent(event);
					hovered.push(item);
				}
			});
		});
	}
	
	return Mouse;
})();
