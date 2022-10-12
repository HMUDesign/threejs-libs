/**
 * World
 */
PROJECT.World = function () {
  HMU.World.call(this, {
    camera: new THREE.Vector3(0, -5, 3),
  });

  this.camera.lookAt(this.scene.position);

  this.on("update", function (e) {
    this.tick(e.delta);
  });

  this.perlin = new HMU.PerlinNoise(0);

  this.geometry = new THREE.PlaneGeometry(10, 6, 50, 30);

  this.material1 = new THREE.MeshNormalMaterial();
  this.material2 = new THREE.MeshBasicMaterial({
    wireframe: true,
    color: "white",
  });

  this.grid1 = new THREE.Mesh(this.geometry, this.material1);
  this.add(this.grid1);
  this.grid2 = new THREE.Mesh(this.geometry, this.material2);
  this.grid2.position.z += 0.001;
  this.add(this.grid2);

  this.speed = new THREE.Vector3(0, 0, 0.5);

  for (var iy = 0; iy <= this.geometry.parameters.heightSegments; iy++) {
    for (var ix = 0; ix <= this.geometry.parameters.widthSegments; ix++) {
      const offset = iy * (this.geometry.parameters.widthSegments + 1) + ix;
      const vertex = this.geometry.vertices[offset];

      vertex.perlin = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
    }
  }
};

PROJECT.World.prototype = Object.create(HMU.World.prototype);

PROJECT.World.prototype.tick = function (delta) {
  for (var iy = 0; iy <= this.geometry.parameters.heightSegments; iy++) {
    for (var ix = 0; ix <= this.geometry.parameters.widthSegments; ix++) {
      const offset = iy * (this.geometry.parameters.widthSegments + 1) + ix;
      const vertex = this.geometry.vertices[offset];
      const perlin = vertex.perlin;

      perlin.add(this.speed.clone().multiplyScalar(delta));
      vertex.z = this.perlin.sample3(perlin.x, perlin.y, perlin.z) + 1;
      vertex.z *= 1 / (1 + Math.exp(-vertex.y * 2 - 2));
    }
  }

  this.geometry.verticesNeedUpdate = true;
  this.geometry.normalsNeedUpdate = true;
  this.geometry.computeFaceNormals();
  this.geometry.computeVertexNormals();
  this.geometry.computeMorphNormals();
};

window.onload = function () {
  this.world = new PROJECT.World();
};
