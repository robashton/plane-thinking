define(function(require) {
  var Entity = require('../libs/layers/scene/entity');
  var Renderable = require('../libs/layers/render/renderable');
  var Material = require('../libs/layers/render/material');
  var Difficulty  = require('./difficulty');

  var Aircraft = function(id, depth) {
    Entity.call(this); var self = this;

    var thrustAmount = 0.2;
    var friction = 0.97;
    var gravity = 0.005;
    var thrustTarget = vec3.create([0,0,0]);
    var desiredDirection = vec3.create([0,0,0]);
    var position = vec3.create([256,256,0]);
    var velocity = vec3.create([0,0,0]);
    var currentRotation = Math.PI / 2; // FORWARDS HO!
    var desiredRotation = 0;
    var rotationSpeed = 0.15;
    var width = 64;
    var height = 64;
    var distanceFromTarget = 0;

    var aircraftMaterial = new Material(255,255,255);
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
      distanceFromTarget = vec3.length(desiredDirection);
      vec3.normalize(desiredDirection);
      desiredRotation =  -Math.atan2(-desiredDirection[0], -desiredDirection[1]);
      rotateTowardsTarget();
    };

    var rotateTowardsTarget = function() {
      adjustDesiredRotationToNearestPoint();
      
      var difference = restrictAngle(desiredRotation - currentRotation);
      var adjustedRotationSpeed = rotationSpeed * Math.min(difference / 0.5, 1.0);
      if(adjustedRotationSpeed < 0.01) return;
       
      if(difference < Math.PI)
        currentRotation += adjustedRotationSpeed;
      else 
        currentRotation -= adjustedRotationSpeed;
    };

    var restrictAngle = function(input) {
      while(input >= (Math.PI * 2))
        input -= (Math.PI * 2);
      while(input < 0)
        input += (Math.PI * 2);
      return input;
    };

    var adjustDesiredRotationToNearestPoint = function() {
      desiredRotation = restrictAngle(desiredRotation);
      currentRotation = restrictAngle(currentRotation);    
    };

    var updateVelocityBasedOnDirection = function() {
      applyThrust();
      applyGravity();
      applyDrag();
      position[0] += 3.0 * Difficulty.scale();
      applyBounds();
    };
   
    var applyThrust = function() {
      var adjustedThrustAmount = Math.min(thrustAmount, thrustAmount * (distanceFromTarget / 100.0))    
      adjustedThrustAmount *= Difficulty.scale(0.1);

      var x = Math.sin(currentRotation) * adjustedThrustAmount;
      var y = -Math.cos(currentRotation) * adjustedThrustAmount;
        
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

    var applyBounds = function() {
      if(position[0] < layer.getLeft()) position[0] = layer.getLeft();
      if(position[0] + width > layer.getRight()) position[0] = layer.getRight() - width;
      if(position[1] < 0) position[1] = 0;
      if(position[1] + height > layer.getHeight()) position[1] = layer.getHeight() - height;
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
      aircraftMaterial.setImage(data.scene.resources.get('img/plane.png'));
      layer = data.scene.getLayer(depth);
      layer.addRenderable(renderable);
    };

     var onRemovedFromScene = function(data) {
      layer.removeRenderable(renderable);
    }; 

    self.on('addedToScene', onAddedToScene);
    self.on('removedFromScene', onRemovedFromScene);
  };

  Aircraft.Speed = 3.0;
  return Aircraft;
});

