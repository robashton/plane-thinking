var Hud = function(scene) {
  var self = this;
  var scoreElement = $('#player-score');

  var onScoreChanged = function(data) {
    scoreElement.text(data.score);
  };  

  scene.on('score-changed', onScoreChanged);
};
