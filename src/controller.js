
var Controller = function(craftId) {
   Entity.call(this); var self = this;

  self.id = function() { return 'controller-' + craftId; }
  self.tick = function() {
    scene.withEntity(craftId, function(craft) {
      if(movingUp)
        craft.moveUp();
      else if (movingDown)
        craft.moveDown();

      if(movingLeft)
        craft.moveLeft();
      else if (movingRight)
        craft.moveRight();
    });
  };

  var scene = null,
      movingLeft = false,
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



  var onAddedToScene = function(data) {
    scene = data.scene;
  };

  self.on('addedToScene', onAddedToScene);
};
