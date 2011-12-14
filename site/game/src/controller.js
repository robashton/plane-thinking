define(function(require) {
  var Entity = require('../libs/layers/scene/entity');

  return function(craftId, canvasElement) {
    Entity.call(this); var self = this;

    var inputElement = $(canvasElement);
    var touchX = 0;
    var touchY = 0;
    var layer = null;
    var lastTransformX = 0;
    var currentTransformX = 0;

    self.id = function() { return 'controller-' + craftId; }
    self.tick = function() {
      scene.withEntity(craftId, function(craft) {    
       var transformed = layer.browserToGameWorld([touchX,touchY]);
   
        craft.setThrustTarget(transformed[0], transformed[1]);
      });
    };

    var scene = null,
        movingLeft = false,
        movingRight = false,
        movingUp = false,
        movingDown = false;

    var onMouseMove = function(e) {
      var x = e.pageX + inputElement.offset().left;
      var y = e.pageY + inputElement.offset().top;
      touchX = x;
      touchY = y;
    };

    inputElement.mousemove(onMouseMove);

    var onAddedToScene = function(data) {
      scene = data.scene;
      layer = scene.getLayer(8.0);
    };

    self.on('addedToScene', onAddedToScene);
  };
});
