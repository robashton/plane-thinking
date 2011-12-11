var Stars = function(depth, frequency, maxCount, size) {
   Spawnables.call(this, depth, frequency, maxCount, size, 'stars', 'star.png');
   var self = this;

  var onItemCollided = function(data) {
    self.raise('star-gathered', {
      x: data.x,
      y: data.y
    });
  };

  self.on('item-collided', onItemCollided);
};

