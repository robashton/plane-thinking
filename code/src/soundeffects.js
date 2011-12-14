define(function(require) {
  var Entity = require('../libs/layers/scene/entity');

  return function() {
    Entity.call(this); var self = this;

    self.id = function() { return "sound-effects"; }

    var starEffect = null;
    var pigeonEffect = null;

    var onStarGathered = function() {
      starEffect.play(0.1);
    };

    var onPigeonHit = function() {
      pigeonEffect.play(0.1);
    };

    var onAddedToScene = function(data) {
      var scene = data.scene;    
      scene.on('star-gathered', onStarGathered);
      scene.on('pigeon-hit', onPigeonHit);
      starEffect = scene.resources.get('audio/star.wav');
      pigeonEffect = scene.resources.get('audio/pigeon.wav');
    };

    self.on('addedToScene', onAddedToScene);
  };
});
