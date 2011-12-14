define(['../scene/entity'], function(Entity) {
 return function(depth, config) {
    Entity.call(this); var self = this;

    var scene = null;
    var time = 0;
    var particles = {};
    var layer = null;

    self.id = function() { return "particle-system-" + depth; }

    self.tick = function() {  
      time++;
      updateParticles();
    };

    self.setLayer = function(nlayer) {
      layer = nlayer;
    };

    self.render = function(context) {
      for(var type in particles)
        renderParticlesForType(context, type, particles[type]);
    };

    var renderParticlesForType = function(context, type, system) {
      for(var i = 0; i < system.items.length; i++) {
        var item = system.items[i];
        if(!item.exists) continue;
        context.fillRect(item.x, item.y, layer.getDepth(), 0, item.width, item.height, system.material);     
      }
    };

    var updateParticles = function() {
      for(var type in particles) {
        updateParticlesForType(type, particles[type]);
      };
    };

    var updateParticlesForType = function(type, system) {
      for(var i = 0; i < system.items.length; i++) {
        var item = system.items[i];
        if(!item.exists) continue;

        if(time - item.firedAt > system.lifetime) {
          item.exists = false;      
          continue;
        }

        item.x += item.velx;
        item.y += item.vely;
      }
    };

    var onParticlesEmitted = function(data) {
      if(data.z !== depth) return;
      var system = particles[data.id];
      if(system) {
        fireParticles(system, data);
      } else console.warn('Particle system required that does not exist: ' + data.id);
    }; 

    var fireParticles = function(system, data) {
      var desiredCount = data.burst || system.burst;
      var createdCount = 0;
      for(var i = 0; i < system.items.length; i++) {
        var item = system.items[i];
        if(item.exists) continue;
        
        item.exists = true;
        item.x = data.x * layer.getRenderScaleFactor();
        item.y = data.y * layer.getRenderScaleFactor();
        item.velx = (Math.random() * system.velocity - (system.velocity / 2.0)) * layer.getRenderScaleFactor();
        item.vely = (Math.random() * system.velocity - (system.velocity / 2.0)) * layer.getRenderScaleFactor();
        item.width = system.width * layer.getRenderScaleFactor();
        item.heght = system.height * layer.getRenderScaleFactor();
        item.firedAt = time;   

        createdCount++;
        if(createdCount === desiredCount) return;
      }
    };

    var createSystems = function() {
      for(var type in config.types) {
        createSystem(type, config.types[type]);
      };
    };

    var createSystem = function(type, itemConfig) {
      particles[type] = {
        maxCount: itemConfig.maxCount || 15,
        burst: itemConfig.burst || 5,
        texture: itemConfig.texture || null,
        width: itemConfig.width || 5,
        height: itemConfig.width || 5,
        lifetime: itemConfig.lifetime || 60,
        velocity: itemConfig.velocity || 1.0,
        material: itemConfig.material || new Material(255,255,255)
      };
      initializeSystem(particles[type]);
    };

    var initializeSystem = function(data) {
      data.items = new Array(data.maxCount);
      for(var i = 0; i < data.items.length; i++) {
        data.items[i] = {
          exists: false,
          x: 0, y: 0,
          velx: 0.0, vely: 0.0,
          width: data.width, 
          height: data.height
        };
      };
    };

    var onAddedToScene = function(data) {
       scene = data.scene;
       var layer = scene.getLayer(depth);
       layer.addRenderable(self);
       scene.on('particles-emitted', onParticlesEmitted);
       createSystems();
    };

    self.on('addedToScene', onAddedToScene);
  }; 
});


