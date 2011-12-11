var PlayerKiller = function(lives) {
  Entity.call(this); var self = this;

  self.id = function() { return 'player-killer'; }

  var onPigeonHit = function(data) {
    lives--;
    self.raise('player-life-lost', {
      lives: lives
    });
    if(lives === 0)
      killPlayer();
  };

  var killPlayer = function() {
    self.raise('player-killed');
  };
  
  var onAddedToScene = function(data) {
    data.scene.on('pigeon-hit', onPigeonHit);
    self.raise('player-spawned', { lives: lives });
  };

  self.on('addedToScene', onAddedToScene);
};
