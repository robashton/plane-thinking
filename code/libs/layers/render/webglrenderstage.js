define(['./webglrenderer'], function(WebglRenderer) {
  return function(target) {
    var self = this;

    var renderer = new WebglRenderer(target);

    renderer.addPass(function(builder) {
        builder
        .addVertexShaderFromElementWithId('shared-vertex')
        .addFragmentShaderFromElementWithId('depth-fragment');
    });

    self.renderScene = function(colour, depth) {
        renderer.render(colour, depth);
    };
  };
});
