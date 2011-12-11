var Clouds = function(depth, count, size) {
  Entity.call(this);

  var self = this;

  var layer = null;
  var items = [];
  var renderables = [];
  var cloudMaterial = new Material(255,255,255);
  cloudMaterial.setImage('cloud.png');

  self.id = function() {
    return 'clouds-' + depth;
  };

  self.tick = function() {
    for(var i = 0; i < items.length; i++) {
      updateCloud(i);
    }
  };

  var onAddedToScene = function(data) {
    layer = data.scene.getLayer(depth);
    setupInitialClouds();
  };

  var setupInitialClouds = function() {
    for(var i = 0 ; i < count ; i++) {
      createCloud();
    }
  };

  var createCloud = function() {
    var cloudSize = (size / 2.0) + Math.random() * (size / 2.0);
    var x =  Math.random() * layer.getWidth() * 2.0, 
        y = Math.random() * layer.getHeight(),
        width = cloudSize,
        height = cloudSize;

    var renderable = new Renderable(x, y, width, height, cloudMaterial);
    items.push({x: x, y: y, width: width, height: height});  
    renderables.push(renderable);
    layer.addRenderable(renderable);
  };

  var updateCloud = function(i) {
    var item = items[i];
    if(item.x + item.width < layer.getLeft())
      replaceCloud(i);
  };

  var replaceCloud = function(i) {
    var item = items[i];
    item.y = Math.random() * layer.getHeight();
    item.x = layer.getRight() + (Math.random() * layer.getWidth())
    renderables[i].position(item.x, item.y);
  };


  self.on('addedToScene', onAddedToScene);
};

