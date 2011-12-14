define(function(require) {
  var TextureHandler = require('./resources/texturehandler');
  var SoundHandler = require('./resources/soundhandler');
  var ResourceLoader = require('./resources/resourceloader');
  var Scene = require('./scene/scene');
  var EngineBuilder = require('render/renderenginebuilder');
    
  return function() {
    Eventable.call(this);

    var self = this,
        requestAnimationFrame = findRequestAnimationFrame(),
        engine = null,
        scene = null,
        tickTimerId = null;

    self.start = function() {
     createAssets();
     startTimers();
     self.raise("started");
    };

    self.stop = function() {
     stopTimers();
     destroyAssets();
     self.raise("stopped");
    };

    self.scene = function() { return scene; }
    self.engine = function() { return engine; }

    var createAssets = function() {
        engine = new EngineBuilder('colour')
                  .nearestPoint(8.0)
                  .sceneWidth(640)
                  .sceneHeight(480)
                  .backgroundColour(10, 10, 150)
                  .build();

      var world = engine.world();
      var resources = new ResourceLoader([new TextureHandler(), new SoundHandler()]);
      scene = new Scene(world, resources);   
    };

    var destroyAssets = function() {
      engine = null;
      scene = null; 
      hud = null;
    };

    var startTimers = function() {
      tickTimerId = setInterval(doLogic, 1000 / 30);
      renderScene();
    };

    var renderScene = function() {
      if(engine === null) return;
      engine.render();
      requestAnimationFrame(renderScene);
    };
    
    var stopTimers = function() {
      clearInterval(tickTimerId);
      tickTimerId = null;
    };

    var findRequestAnimationFrame = function() {
      return  
        window.requestAnimationFrame        || 
        window.webkitRequestAnimationFrame  || 
        window.mozRequestAnimationFrame     || 
        window.oRequestAnimationFrame       || 
        window.msRequestAnimationFrame      ||
        function(callback, element){
          window.setTimeout(callback, 1000 / 30);
        };
    };  
  };

});
