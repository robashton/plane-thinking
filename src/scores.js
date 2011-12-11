var Scores = function() {
  Entity.call(this); var self = this;
  var score = 0;
  
  self.id = function() { return 'scores'; }
 
  var onStarGathered = function() {
    score++;
    self.raise('score-changed', {
      score: score
    });
  }; 

  var onAddedToScene = function(data) {
    var scene = data.scene;
    scene.on('star-gathered', onStarGathered);
  };
  
  self.on('addedToScene', onAddedToScene);
};
