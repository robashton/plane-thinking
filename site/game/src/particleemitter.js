define(function(require) {
  var Entity = require('../libs/layers/scene/entity');

  return function() {
    Entity.call(this); 
    var self = this,
       scene = null;

    self.id = function() { return 'global-particle-emitter'; }

    var onStarGathered = function(data) {
      self.raise('particles-emitted', {
        x: data.x,
        y: data.y,
        z: data.z,
        id: 'star'
      });
    };

    var onPigeonHit = function(data) {
      self.raise('particles-emitted', {
        x: data.x,
        y: data.y,
        z: data.z,
        id: 'pigeon'
      });
    };  

    var onPlayerKilled = function(data) {
      self.raise('particles-emitted', {
        x: data.x,
        y: data.y,
        z: data.z,
        id: 'explosion'
      });
    };

    var onAddedToScene = function(data) {
      scene = data.scene;
      scene.on('star-gathered', onStarGathered);
      scene.on('pigeon-hit', onPigeonHit);
      scene.on('player-killed', onPlayerKilled);
    };

    self.on('addedToScene', onAddedToScene);
  };
});
