define(function(require) {
  var Entity = require('../libs/layers/scene/entity');

  return function(lives) {
    Entity.call(this); var self = this;
    var scene = null;

    self.id = function() { return 'player-killer'; }

    var onPigeonHit = function(data) {
      lives--;
      self.raise('player-life-lost', {
        lives: lives
      });
      if(lives === 0)
        killPlayer(data);
    };

    var killPlayer = function(data) {
      self.raise('player-killed', {
        x: data.x,
        y: data.y,
        z: data.z
      });
    };
    
    var onAddedToScene = function(data) {
      scene = data.scene;
      scene.on('pigeon-hit', onPigeonHit);
      self.raise('player-spawned', { lives: lives });
    };

    var onPlayerKilled = function() {
      var player = scene.getEntity('player');
      scene.removeEntity(player);
    };
    
    self.on('player-killed', onPlayerKilled);
    self.on('addedToScene', onAddedToScene);
  };
});
