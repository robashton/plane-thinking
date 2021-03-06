define(function(require) {
  var Entity = require('../libs/layers/scene/entity');
  var Material = require('../libs/layers/render/material');
  var Renderable = require('../libs/layers/render/renderable');

  return function(depth, frequency, maxCount, size, id, texture) {
    Entity.call(this); var self = this;

    var layer = null;
    var items = [];
    var itemsToRemove = {};

    var renderables = [];
    var frameCount = 0;
    var scene = null;
    var material = new Material(255,255,255);

    self.id = function() {
      return id;
    };
    
    self.tick = function() {
      if(wantsToPop() && items.length < maxCount)
        spawnNewItem();
      for(var i = 0; i < items.length; i++) {
        updateItem(i);
      }
      purgeStaleItems();
    };

    var wantsToPop = function() {
      var value = Math.random() * frequency;
      return (value < 1.0);
    };

    var detectCollisionsBetweenItemAndPlayer = function(i) {
      var item = items[i];
      scene.withEntity('player', function(player) {
        if(player.intersectsWith({
          x: item.x + (item.size / 4.0),
          y: item.y + (item.size / 4.0),
          width: item.size / 2.0,
          height: item.size / 2.0
        })) {
          removeItem(i);
          self.raise('item-collided', {
            x: item.x,
            y: item.y
          });
        }
      });
    };

    var spawnNewItem = function() {
      var item = {
        x: layer.getRight(),
        y: Math.random() * layer.getHeight(),
        size: (size / 2.0) + Math.random() * (size / 2.0)
      };
      var renderable = new Renderable(item.x, item.y, item.size, item.size, material);
      layer.addRenderable(renderable);

      items.push(item);
      renderables.push(renderable);
    };
    
    var updateItem = function(i) {
      var item = items[i];
      if(item.x + item.size < layer.getLeft()) {
        removeItem(i);
      }
      else if(!detectCollisionsBetweenItemAndPlayer(i))
        renderables[i].position(item.x, item.y);
    };

    var removeItem = function(i) {
       itemsToRemove[i] = {};
    };

    var purgeStaleItems = function() {
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
      scene = data.scene;
      layer = scene.getLayer(depth);
      material.setImage(scene.resources.get(texture));
    };

    self.on('addedToScene', onAddedToScene);
  };
});
