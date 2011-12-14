define(function(require) {
  var Entity = require('../libs/layers/scene/entity');
  var Difficulty  = require('./difficulty');

  return function() {
    Entity.call(this); var self = this;
    var score = 0;
    
    self.id = function() { return 'scores'; }
   
    var onStarGathered = function() {
      score++;
      self.raise('score-changed', {
        score: score
      });

      Difficulty.increase(0.05);
    }; 

    var onAddedToScene = function(data) {
      var scene = data.scene;
      scene.on('star-gathered', onStarGathered);
    };
    
    self.on('addedToScene', onAddedToScene);
  };
});
