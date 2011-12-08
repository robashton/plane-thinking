var Game = function () {
  var self = this;
  var scenes = [];

  var engine = new EngineBuilder('colour', 'depth', 'webgl')
                    .nearestPoint(8.0)
                    .sceneWidth(640)
                    .sceneHeight(480)
                    .build();

  var world = engine.world();
  
  var craftLayer = world.addLayer(8.0);
  var playerScene = new Scene(craftLayer);

  var playerCraft = new Aircraft();
  playerScene.addEntity(playerCraft);

  var controller = new Controller(playerCraft);
  playerScene.addEntity(controller);

  var scroller  = new LayerScroller([craftLayer]);
  playerScene.addEntity(scroller);

  scenes.push(playerScene);
  
  var doLogic = function() {
    for(var i = 0; i < scenes.length; i++)
      scenes[i].tick();     
  };

  var renderScene = function () {
    engine.render();
  };

  self.start = function () {
    setInterval(doLogic, 1000 / 30);
    setInterval(renderScene, 1000 / 30);
  };
};

var LayerScroller = function(layers) {
  var self = this;
  var x = 0;

  self.tick = function() {
    x -= 3.0;
    
    for(var i = 0; i < layers.length; i++)
      layers[i].transformX(x);
  };
};

var Clouds = function(layer) {
  var self = this;

  
  

};

var Scene = function(layer) {
  var self = this;
  var entities = [];

  self.addEntity = function(entity) {
    entities.push(entity);
    registerEntityRenderable(entity);
  };

  self.tick = function() {
     self.each(function(entity) {
        entity.tick();
     });
  };

  self.each = function(callback) {
    for(var i = 0 ; i < entities.length; i++)
      callback(entities[i]);
  };

  var registerEntityRenderable = function(entity) {
    if(!entity.renderable) return;
    var renderable = entity.renderable();
    layer.addRenderable(renderable);
  };
};

var Aircraft = function() {
  var self = this;
  var x = 0;
  var y = 0;
  var aircraftMaterial = new Material(255,255,255);
  aircraftMaterial.setImage('plane.png');
  var renderable = new Renderable(0,0, 64, 64, aircraftMaterial);

  self.renderable = function() {
    return renderable;
  };   

  self.tick = function() {
    x += Aircraft.Speed;
    renderable.position(x,y);
  };

  self.moveLeft = function() {
    x -= 5.0;
  };

  self.moveRight = function() {
    x += 5.0;
  };

  self.moveUp = function() {
    y -= 5.0;
  };

  self.moveDown = function() {
    y += 5.0;
  };
};

Aircraft.Speed = 3.0;

var Controller = function(craft) {
  var self = this;

  var movingLeft = false,
      movingRight = false,
      movingUp = false,
      movingDown = false;
  
  document.onkeydown = function(ev) {
    if(ev.keyCode === 37)
      movingLeft = true;
    else if(ev.keyCode === 38)
      movingUp = true;
    else if(ev.keyCode === 39)
      movingRight = true;
    else if(ev.keyCode === 40)
      movingDown = true;
    return false;
  };

  document.onkeyup = function(ev) {
    if(ev.keyCode === 37)
      movingLeft = false;
    else if(ev.keyCode === 38)
      movingUp = false;
    else if(ev.keyCode === 39)
      movingRight = false;
    else if(ev.keyCode === 40)
      movingDown = false;
    return false;
  };

  self.tick = function() {
    if(movingUp)
      craft.moveUp();
    else if (movingDown)
      craft.moveDown();

    if(movingLeft)
      craft.moveLeft();
    else if (movingRight)
      craft.moveRight();


  };
};


