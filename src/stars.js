
var Stars = function(depth, frequency, maxCount, size) {
  Entity.call(this); var self = this;

  var layer = null;
  var items = [];
  var itemsToRemove = {};

  var renderables = [];
  var frameCount = 0;

  var starMaterial = new Material(255,255,255);
  starMaterial.setImage('star.png');

  self.id = function() {
    return 'stars';
  };
  
  self.tick = function() {
    if(frameCount++ % frequency === 0 && items.length < maxCount)
      spawnNewStar();
    for(var i = 0; i < items.length; i++) {
      updateStar(i);
    }
    purgeStaleStars();
  };  

  var spawnNewStar = function() {
    var star = {
      x: layer.getRight(),
      y: Math.random() * layer.getHeight(),
      size: (size / 2.0) + Math.random() * (size / 2.0)
    };
    var renderable = new Renderable(star.x, star.y, star.size, star.size, starMaterial);
    layer.addRenderable(renderable);

    items.push(star);
    renderables.push(renderable);
  };
  
  var updateStar = function(i) {
    var star = items[i];
    if(star.x + star.size < layer.getLeft()) {
      removeStar(i);
    }
    else {
      renderables[i].position(star.x, star.y);
    }
  };

  var removeStar = function(i) {
     itemsToRemove[i] = {};
  };

  var purgeStaleStars = function() {
    var newItems = [];
    var newRenderables = [];

    for(var i = 0; i < items.length; i++) {
       if(!itemsToRemove[i]) {
          newItems.push(items[i]);
          newRenderables.push(renderables[i]);
       } else {
          layer.removeRenderable(renderables[i]);
       }    
    };

    items = newItems;
    renderables = newRenderables;
    itemsToRemove = {};
  };

  var onAddedToScene = function(data) {
    layer = data.scene.getLayer(depth);
  };

  self.on('addedToScene', onAddedToScene);
};

