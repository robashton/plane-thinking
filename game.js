var Backdrop = function(layer, bounds, count, width, height, material) {
  var self = this;
  var items = [];

  self.update = function() {

  };

  var randomX = function() {
    return bounds.minx + Math.random() * (bounds.maxx - bounds.minx);
  };

  var randomY = function() {
    return bounds.miny + Math.random() * (bounds.maxy - bounds.miny);
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
                  
 var background = world.addLayer(0.1);
  var skyMaterial = new Material(0,0,126);
  var groundMaterial = new Material(0, 128, 0);

  var sky = new Backdrop(background, {
    minx: 0, maxx: 0,
    miny: 0, maxy: 0
  }, 1, background.getWidth(), background.getHeight() / 2.0, skyMaterial);

  var grass = new Backdrop(background, {
    minx: 0, maxx: 0,
    miny: background.getHeight() / 2.0, maxy: background.getHeight() / 2.0
  }, 1, background.getWidth(), background.getHeight() / 2.0, groundMaterial);

  var cloudLayer = world.addLayer(2.0);
  var cloudMaterial = new Material(255,255,255);
  cloudMaterial.setImage('cloud.png');
  var backdrop = new Backdrop(cloudLayer, {
    minx: 0, maxx: cloudLayer.getWidth(),
    miny: 0, maxy: cloudLayer.getHeight() / 3.0
  }, 10, 128, 128, cloudMaterial);

  var treeLayer = world.addLayer(5.0);
  var treeMaterial = new Material(255,255,255);
  treeMaterial.setImage('tree.png');
  var backdrop = new Backdrop(treeLayer, {
    minx: 0, maxx: treeLayer.getWidth(),
    miny: treeLayer.getHeight() / 2 - 30,
    maxy: treeLayer.getHeight()
  }, 10, 32, 32, treeMaterial);

  var foregroundLayer = world.addLayer(8.0);

  var doLogic = function() {
    backdrop.update();
  };

  var renderScene = function () {
    engine.render();
  };

  self.start = function () {
    setInterval(doLogic, 1000 / 30);
    setInterval(renderScene, 1000 / 30);
  };
};
