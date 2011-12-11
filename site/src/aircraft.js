
var Aircraft = function(id, depth) {
  Entity.call(this); var self = this;

  var thrustAmount = 0.3;
  var friction = 0.95;
  var gravity = 0.05;
  var thrustTarget = vec3.create([0,0,0]);
  var desiredDirection = vec3.create([0,0,0]);
  var position = vec3.create([256,256,0]);
  var velocity = vec3.create([0,0,0]);
  var currentRotation = Math.PI / 2; // FORWARDS HO!
  var desiredRotation = 0;
  var rotationSpeed = 0.08;
  var width = 64;
  var height = 64;

  var aircraftMaterial = new Material(255,255,255);
  aircraftMaterial.setImage('plane.png');
  var renderable = new Renderable(0,0, width, height, aircraftMaterial);
  var layer = null;  

  self.id = function() { return id; }

  self.tick = function() {
    updateDirectionTowardsTarget();
    updateVelocityBasedOnDirection();
    updatePositionBasedOnVelocity();
    updateRenderableComponent();
  };

  self.setThrustTarget = function(x, y) {
    thrustTarget[0] = x;
    thrustTarget[1] = y;
  };  

  self.intersectsWith = function(square) {
    if(position[0] + width < square.x) return false;
    if(position[1] + height < square.y) return false;
    if(position[0] > square.x + square.width) return false;
    if(position[1] > square.y + square.height) return false;
    return true;
  };

  var updateDirectionTowardsTarget = function() {
    vec3.subtract(thrustTarget, position, desiredDirection);
    vec3.normalize(desiredDirection);
    desiredRotation =  -Math.atan2(-desiredDirection[0], -desiredDirection[1]);
    rotateTowardsTarget();
  };

  var rotateTowardsTarget = function() {
    adjustDesiredRotationToNearestPoint();
    if(trySnapToDesiredRotation()) return; 
    

      
    if(desiredRotation > currentRotation)
      currentRotation += rotationSpeed;
    else 
      currentRotation -= rotationSpeed;
  };

  var trySnapToDesiredRotation = function() {    
    if(Math.abs(desiredRotation - currentRotation) <= (rotationSpeed * 2.0)) {
      currentRotation = desiredRotation;  
      return true;
    };
  };

  var adjustDesiredRotationToNearestPoint = function() {
    if(desiredRotation - currentRotation > Math.PI)
       desiredRotation -= Math.PI * 2.0;
    else if(currentRotation - desiredRotation > Math.PI)
      desiredRotation += Math.PI * 2.0;
  };

  var updateVelocityBasedOnDirection = function() {
    applyThrust();
    applyGravity();
    applyDrag();
    position[0] += 3.0;
  };
 
  var applyThrust = function() {
    var x = Math.sin(currentRotation) * thrustAmount;
    var y = -Math.cos(currentRotation) * thrustAmount;
      
    velocity[0] += x;
    velocity[1] += y;
  };

  var applyGravity = function() {
    // If we're flying horizontally then gravity does not apply
    velocity[1] += gravity;
  };

  var applyDrag = function() {
    velocity[0] *= friction;
    velocity[1] *= friction;
  };

  var updatePositionBasedOnVelocity = function() {
    vec3.add(position, velocity);
    renderable.position(position[0], position[1]);
  };

  var updateRenderableComponent = function() {
    renderable.position(position[0], position[1]);

    renderable.rotation(currentRotation - (Math.PI / 2.0));
  };

  var onAddedToScene = function(data) {
    layer = data.scene.getLayer(depth);
    layer.addRenderable(renderable);
  };

  self.on('addedToScene', onAddedToScene);
};

Aircraft.Speed = 3.0;
