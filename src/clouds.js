
var Clouds = function(layer, count, size) {
  var self = this;
  var items = [];
  var renderables = [];
  var cloudMaterial = new Material(255,255,255);
  cloudMaterial.setImage('cloud.png');

  var init = function() {
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

  self.tick = function() {
    for(var i = 0; i < items.length; i++) {
      updateCloud(i);
    }
  };

  init();
};

