// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();

var Game = function () {
  Eventable.call(this);  var self = this;

  var engine = null;
  var scene = null;
  var hud = null;
  var tickTimerId = null;

  self.start = function () {
   createAssets();
   startTimers();
  };

  self.stop = function() {
    destroyAssets();
    stopTimers();
  };

  var doLogic = function() {
    scene.tick();    
  };

  var renderScene = function () {
    if(engine === null) return;
    engine.render();
    requestAnimFrame(renderScene);
  };

  var destroyAssets = function() {
    engine = null;
    scene = null; 
    hud = null;
  };

  var stopTimers = function() {
    clearInterval(tickTimerId);
    tickTimerId = null;
    self.raise('game-ended');
  };

  var createAssets = function() {
    engine = new EngineBuilder('colour')
                      .nearestPoint(8.0)
                      .sceneWidth(640)
                      .sceneHeight(480)
                      .backgroundColour(10, 10, 150)
                      .build();

    var world = engine.world();

    scene = new Scene(world);
    hud = new Hud(scene);

    scene.addLayer(3.0);
    scene.addLayer(5.0);
    scene.addLayer(8.0);

    scene.addEntity(new Clouds(3.0, 20, 250));
    scene.addEntity(new Clouds(5.0, 10, 250));
    scene.addEntity(new Aircraft('player', 8.0));
    scene.addEntity(new Stars(8.0, 60, 6, 30));
    scene.addEntity(new Pigeons(8.0, 60, 5, 30));
    scene.addEntity(new Controller('player', document.getElementById('colour')));
    scene.addEntity(new LayerScroller());
    scene.addEntity(new Scores());
    scene.addEntity(new PlayerKiller(3));
    scene.on('player-killed', onPlayerKilled);
  };

  var startTimers = function() {
    tickTimerId = setInterval(doLogic, 1000 / 30);
    renderScene();
  };

  var onPlayerKilled = function() {
    setTimeout(self.stop, 1000);
  };
};






