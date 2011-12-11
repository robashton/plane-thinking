(function() {
  var game = new Game();
  
  var startGame = function() {
    game.start();
    $('#hud').show();
    $('#game-container').show();
    $('#game-start').hide();
    $('#game-over').hide();
  };

  $(document).ready(function() {
    $('#start-action').click(startGame);
    $('#restart-game-action').click(startGame);
  });

  var onGameEnded = function() {
    $('#game-over').show();
    $('#hud').hide();
    $('#game-container').hide();
  };

  game.on('game-ended', onGameEnded);
})();
