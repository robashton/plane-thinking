var Pigeons = function(depth, frequency, maxCount, size) {
   Spawnables.call(this, depth, frequency, maxCount, size, 'pigeons', 'pigeon.png');
   var self = this;

  var onItemCollided = function(data) {
    self.raise('pigeon-hit', {
      x: data.x,
      y: data.y
    });
  };

  self.on('item-collided', onItemCollided);
};

