define(function() {
  return function() {
    var self = this;

    self.projection = mat4.create();
    self.view = mat4.create();
    self.world = mat4.create();
    self.resolution = new glMatrixArrayType(2);

    self.update = function(renderWidth, renderHeight) {
      mat4.ortho(0, renderWidth, renderHeight, 0, -1, 1, self.projection);
      mat4.lookAt([0, 0, 0], [0, 0, -1], [0, 1, 0], self.view);
      mat4.identity(self.world);
      mat4.scale(self.world, [renderWidth, renderHeight, 1.0]);
      
      self.resolution[0] = renderWidth;
      self.resolution[1] = renderHeight;
    };
  };
});

