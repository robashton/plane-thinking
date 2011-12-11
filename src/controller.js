
var Controller = function(craftId, canvasElement) {
  Entity.call(this); var self = this;

  var inputElement = $(canvasElement);
  var touchX = 0;
  var touchY = 0;
  var layer = null;

  self.id = function() { return 'controller-' + craftId; }
  self.tick = function() {
    scene.withEntity(craftId, function(craft) {
        craft.setThrustTarget(touchX, touchY);
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
    var coords = layer.browserToGameWorld([x,y]);
    touchX = coords[0];
    touchY = coords[1];    
  };

  inputElement.mousemove(onMouseMove);

  var onAddedToScene = function(data) {
    scene = data.scene;
    layer = scene.getLayer(8.0);
  };

  self.on('addedToScene', onAddedToScene);
};
