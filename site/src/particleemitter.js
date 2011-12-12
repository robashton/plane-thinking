var ParticleEmitter = function() {
  Entity.call(this); var self = this;
  var scene = null;

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

  var onAddedToScene = function(data) {
    scene = data.scene;
    scene.on('star-gathered', onStarGathered);
    scene.on('pigeon-hit', onPigeonHit);
  };

  self.on('addedToScene', onAddedToScene);
};
