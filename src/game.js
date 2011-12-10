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

  var backgroundCloudLayer2 = world.addLayer(3.0);
  var backgroundCloudScene2 = new Scene(backgroundCloudLayer2);
  var backgroundClouds2 = new Clouds(backgroundCloudLayer2, 20, 250);
  backgroundCloudScene2.addEntity(backgroundClouds2);

  var backgroundCloudLayer = world.addLayer(5.0);
  var backgroundCloudScene = new Scene(backgroundCloudLayer);
  var backgroundClouds = new Clouds(backgroundCloudLayer, 10, 250);
  backgroundCloudScene.addEntity(backgroundClouds);
    
  var craftLayer = world.addLayer(8.0);
  var playerScene = new Scene(craftLayer);

  var playerCraft = new Aircraft();
  playerScene.addEntity(playerCraft);

  var stars = new Stars(craftLayer, 60, 5, 30);
  playerScene.addEntity(stars);

  var controller = new Controller(playerCraft);
  playerScene.addEntity(controller);

  var scroller  = new LayerScroller([craftLayer,backgroundCloudLayer, backgroundCloudLayer2 ]);
  playerScene.addEntity(scroller);

  scenes.push(backgroundCloudScene2);
  scenes.push(backgroundCloudScene);
  scenes.push(playerScene);

  var doLogic = function() {
    for(var i = 0; i < scenes.length; i++)
      scenes[i].tick();     
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






