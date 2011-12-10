var Scene = function(world) {
  var self = this;

  var layers = {};
  var entities = {};

  self.addLayer = function(depth) {
    layers[depth] = world.addLayer(depth);
  };

  self.getLayer = function(depth) {
    return layers[depth];
  };

  self.addEntity = function(entity) {
    entities[entity.id()] = entity;
    entity.setScene(self);
  };

  self.tick = function() {
     self.each(function(entity) {
        entity.tick();
     });
  };

  self.withEntity = function(id, callback) {
    var entity = entities[id];
    if(entity) callback(entity);
  };

  self.eachLayer = function(callback) {
    for(var i in layers) {
      callback(layers[i]);
    }
  };

  self.each = function(callback) {
    for(var i in entities)
      callback(entities[i]);
  };

};

