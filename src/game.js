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
  var self = this;
  var scenes = [];

  var engine = new EngineBuilder('colour')
                    .nearestPoint(8.0)
                    .sceneWidth(640)
                    .sceneHeight(480)
                    .backgroundColour(10, 10, 150)
                    .build();

  var world = engine.world();

  var scene = new Scene(world);
  
  scene.addLayer(3.0);
  scene.addLayer(5.0);
  scene.addLayer(8.0);

  scene.addEntity(new Clouds(3.0, 20, 250));
  scene.addEntity(new Clouds(5.0, 10, 250));
  scene.addEntity(new Aircraft('player', 8.0));
  scene.addEntity(new Stars(8.0, 60, 6, 30));
  scene.addEntity(new Controller('player'));
  scene.addEntity(new LayerScroller());

  var doLogic = function() {
    scene.tick();    
  };

  var renderScene = function () {
    engine.render();
    requestAnimFrame(renderScene);
  };

  self.start = function () {
    setInterval(doLogic, 1000 / 30);
    renderScene();
  };
};






