var Scene = function(world) {
 Eventable.call(this); var self = this;

  var layers = {};
  var entitiesById = {};
  var entitiesByIndex = [];

  self.addLayer = function(depth) {
    layers[depth] = world.addLayer(depth);
  };

  self.getLayer = function(depth) {
    return layers[depth];
  };

  self.addEntity = function(entity) {
    entitiesById[entity.id()] = entity;
    entitiesByIndex.push(entity);
    entity.setScene(self);
  };

  self.tick = function() {
     self.each(function(entity) {
        if(entity.tick) entity.tick();
     });
  };

  self.withEntity = function(id, callback) {
    var entity = entitiesById[id];
    if(entity) callback(entity);
  };

  self.eachLayer = function(callback) {
    for(var i in layers) {
      callback(layers[i]);
    }
  };

  self.each = function(callback) {
    for(var i = 0; i < entitiesByIndex.length; i++)
      callback(entitiesByIndex[i]);
  };

  self.crossEach = function(callback) {
    for(var i = 0; i < entitiesByIndex.length; i++) {
      for(var j = i; j < entitiesByIndex.length; j++) {
         callback(i,j,entitiesByIndex[i], entitiesByIndex[j]);
      }
    }
  };
};

