var Scene = function(layer) {
  var self = this;
  var entities = [];

  self.addEntity = function(entity) {
    entities.push(entity);
    registerEntityRenderable(entity);
  };

  self.tick = function() {
     self.each(function(entity) {
        entity.tick();
     });
  };

  self.each = function(callback) {
    for(var i = 0 ; i < entities.length; i++)
      callback(entities[i]);
  };

  var registerEntityRenderable = function(entity) {
    if(!entity.renderable) return;
    var renderable = entity.renderable();
    layer.addRenderable(renderable);
  };
};

