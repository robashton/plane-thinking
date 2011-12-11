var Hud = function(scene) {
  var self = this;
  var scoreElement = $('#player-score');
  var lifeElement = $('#player-lives');

  var onScoreChanged = function(data) {
    scoreElement.text(data.score);
  };  

  var onPlayerLifeLost = function(data) {
    lifeElement.text(data.lives);
  };

  var onPlayerSpawned= function(data) {
    lifeElement.text(data.lives);
  };

  scene.on('score-changed', onScoreChanged);
  scene.on('player-life-lost', onPlayerLifeLost);
  scene.on('player-spawned', onPlayerSpawned);
};
