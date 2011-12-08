var Backdrop = function(layer, count, width, height, material) {
  var self = this;
  var items = [];

  self.update = function() {
    for(var i = 0; i < items.length; i++) {
      var item = items[i];
      if(layer.isVisible(item))
 
  
    }
  };

  var randomX = function() {
    return Math.random() * layer.getWidth();
  };

  var randomY = function() {
    return Math.random() * layer.getHeight();
  };  

  for(var i = 0; i < count; i++) {  
    var x = randomX();
    var y = randomY();
    var entity = new Entity(x, y, width, height, material);
    layer.addEntity(entity);
    items.push({
      renderable: entity,
      x: x,
      y: y
    });
  }   
};

var Game = function () {
  var self = this;

  var engine = new EngineBuilder('colour', 'depth', 'webgl')
                    .nearestPoint(8.0)
                    .sceneWidth(320)
                    .sceneHeight(320)
                    .build();

  var world = engine.world();
                  
  var backdrop = world.addLayer(5.0);
  var foreground = world.addLayer(8.0);

  var doLogic = function() {
    
  };

  var renderScene = function () {
    engine.render();
  };

  self.start = function () {
    setInterval(doLogic, 1000 / 30);
    setInterval(renderScene, 1000 / 30);
  };
};
