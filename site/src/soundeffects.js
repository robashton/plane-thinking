var SoundEffects = function() {
  Entity.call(this); var self = this;

  self.id = function() { return "sound-effects"; }

  var onStarGathered = function() {
    var audio = new Audio('audio/star.wav');
    audio.volume = 0.1;
    audio.play();
  };

  var onPigeonHit = function() {
    var audio = new Audio('audio/pigeon.wav');
    audio.volume = 0.1;
    audio.play();
  };

  var onAddedToScene = function(data) {
    var scene = data.scene;    
    scene.on('star-gathered', onStarGathered);
    scene.on('pigeon-hit', onPigeonHit);
  };

  self.on('addedToScene', onAddedToScene);
};
