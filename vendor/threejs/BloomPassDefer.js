/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.BloomPassDefer = function ( bloom ) {

	this.bloom = bloom;

	this.enabled = true;
	this.needsSwap = false;
	this.clear = false;

};

THREE.BloomPassDefer.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if ( maskActive ) renderer.context.disable( renderer.context.STENCIL_TEST );

		// Render original scene with superimposed blur to texture

		this.bloom.quad.material = this.bloom.materialCopy;

		this.bloom.copyUniforms[ "tDiffuse" ].value = this.bloom.renderTargetY;

		if ( maskActive ) renderer.context.enable( renderer.context.STENCIL_TEST );

		if ( this.renderToScreen ) {

			renderer.render( this.bloom.scene, this.bloom.camera );

		} else {

			renderer.render( this.bloom.scene, this.bloom.camera, readBuffer, this.clear );

		}

	}

};
