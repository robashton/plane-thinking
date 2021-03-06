define(function(require) {
  var Spawnables = require('./spawnables');

  return function(depth, frequency, maxCount, size) {
    Spawnables.call(this, depth, frequency, maxCount, size, 'pigeons', 'img/pigeon.png');
    var self = this;

    var onItemCollided = function(data) {
      self.raise('pigeon-hit', {
        x: data.x,
        y: data.y,
        z: depth
      });
    };

    self.on('item-collided', onItemCollided);
  };
});
