
define('libs/layers/shared/eventcontainer',[],function() {
  return function() {
    var self = this;
    var handlers = [];

    self.raise = function(source, data) {
      for(var i = 0; i < handlers.length; i++)
        handlers[i].call(source, data);
    };
   
    self.add = function(handler) {
      handlers.push(handler);
    };

    self.remove = function(handler) {
      var newItems = [];
      for(var i = 0; i < handlers.length; i++)
          if(handlers[i] !== handler) 
            newItems.push(handlers[i]);
      handlers = newItems;
    };
  };
});


define('libs/layers/shared/eventable',['./eventcontainer'], function(EventContainer) {
  return function() {
    var self = this;
    var eventListeners = {};
    var allContainer = new EventContainer();

    self.on = function(eventName, callback) {
      eventContainerFor(eventName).add(callback);
    };

    self.off = function(eventName, callback) {
      eventContainerFor(eventName).remove(callback);
    }; 

    self.onAny = function(callback) {
      allContainer.add(callback);
    };

    self.raise = function(eventName, data) {
      var container = eventListeners[eventName];

      if(container)
        container.raise(self, data);

      allContainer.raise(self, {
        event: eventName,
        data: data
      });
    };

    var eventContainerFor = function(eventName) {
      var container = eventListeners[eventName];
      if(!container) {
        container =  new EventContainer();
        eventListeners[eventName] = container;
      }
      return container;
    };
  };
});


define('libs/layers/scene/entity',['../shared/eventable'], function(Eventable) {
  return function() {
    Eventable.call(this); var self = this;
    var scene = null;
    var eventListeners = {};

    self.setScene = function(nscene) {
      scene = nscene;
      raiseAddedToScene();
    };

    self.clearScene = function() {
      scene = null;
      raiseRemovedFromScene();
    };

    var raiseAddedToScene = function() {
      self.raise('addedToScene', {scene: scene });
    };

    var raiseRemovedFromScene = function() {
      self.raise('removedFromScene');
    };

    var onAnyEventRaised = function(data) {
      if(scene)
        scene.raise(data.event, data.data);
    };

    self.onAny(onAnyEventRaised);
  };
});


define('libs/layers/components/particles',['../scene/entity'], function(Entity) {
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



define('libs/layers/render/material',[],function() {
  return function(r, g, b) {
    var self = this;
    var image = null;


    self.rgba = function() {
      return 'rgba(' + r + ', ' + g + ', ' + b + ', 255)'; 
    };

    self.scale = function(scaleFactor) {
      return new Material(
        parseInt(r * scaleFactor), 
        parseInt(g * scaleFactor), 
        parseInt(b * scaleFactor));
    };

    self.setImage = function(img) {
      image = img;
    };

    self.image = function() { return image ? image.get() : null; }
  };
});



define('libs/layers/resources/texture',['../shared/eventable'], function(Eventable) {
  return function(url) {
    Eventable.call(this);  

    var self = this;
    var image = null;

    self.load = function() {
      image = new Image();
      image.src = url;
      image.loadeddata = onInitialLoadCompleted;
    };

    self.get = function() {
      return image;
    };

    var onInitialLoadCompleted = function() {
      self.raise('loaded');
    };
  };
});



define('libs/layers/resources/texturehandler',['./texture'], function(Texture) {
  return function() {   
    var self = this;

    self.handles = function(url) {
      return url.indexOf('.png') > 0;
    };
    
    self.get = function(url) {
      return new Texture(url);
    };
  };
});



define('libs/layers/resources/sound',['../shared/eventable'], function(Eventable) {
  return  function(url) {
    Eventable.call(this);  

    var self = this;
    
    self.load = function() {
      var audio = new Audio(url);
      audio.loadeddata = onInitialLoadCompleted;
    };

    var onInitialLoadCompleted = function() {
      self.raise('loaded');
    };

    self.play = function(volume) {
      var audio = new Audio(url);
      audio.volume = volume;
      audio.play();
    };  
  };
});


define('libs/layers/resources/soundhandler',['./sound'], function(Sound) {
  return function() {
    var self = this;

    self.handles = function(path) {
      return path.indexOf('.wav') > 0;
    };

    self.get = function(path) {
      return new Sound(path);
    };
  };
});


define('libs/layers/resources/resourceloader',['../shared/eventable'], function(Eventable) {
  return function(handlers) {
    Eventable.call(this);

    var self = this,
        pendingResourceCount = 0;

    self.get = function(name) {
      var handler = findHandlerForResource(name);
      if(!handler) {
        console.error("Failed to find handler for resource: " + name);
      }
      return loadResourceFromHandler(handler, name);    
    };

    var loadResourceFromHandler = function(handler, name) {
      pendingResourceCount++;
      var resource = handler.get(name);
      resource.on('loaded', onResourceLoaded);
      resource.load();
      return resource;
    };

    var onResourceLoaded = function() {
      pendingResourceCount--;
      if(pendingResourceCount === 0)
        self.raise('all-resources-loaded');
    };

    var findHandlerForResource = function(name) {
      for(var i = 0; i < handlers.length; i++) {
        if(handlers[i].handles(name)) return handlers[i];
      }
      return null;
    };  
  };
});



define('libs/layers/scene/scene',['../shared/eventable'], function(Eventable) {
  return function(world, resources) {
   Eventable.call(this); var self = this;

    var layers = {};
    var entitiesById = {};
    var entitiesByIndex = [];
    self.resources = resources;

    self.addLayer = function(depth) {
      layers[depth] = world.addLayer(depth);
    };

    self.getLayer = function(depth) {
      return layers[depth];
    };

    self.addEntity = function(entity) {
      entitiesById[entity.id()] = entity;
      entitiesByIndex.push(entity);
      entity.setScene(self);
    };

    self.removeEntity = function(entity) {
      delete entitiesById[entity.id()];
      var newEntities = [];
      for(var i = 0 ; i < entitiesByIndex.length; i++)
        if(entitiesByIndex[i] !== entity) 
          newEntities.push(entitiesByIndex[i]);
      entitiesByIndex = newEntities;
      entity.clearScene();
    };

    self.getEntity = function(id, callback) {
      return entitiesById[id];
    };

    self.tick = function() {
       self.each(function(entity) {
          if(entity.tick) entity.tick();
       });
    };

    self.withEntity = function(id, callback) {
      var entity = entitiesById[id];
      if(entity) callback(entity);
    };

    self.eachLayer = function(callback) {
      for(var i in layers) {
        callback(layers[i]);
      }
    };

    self.each = function(callback) {
      for(var i = 0; i < entitiesByIndex.length; i++)
        callback(entitiesByIndex[i]);
    };

    self.crossEach = function(callback) {
      for(var i = 0; i < entitiesByIndex.length; i++) {
        for(var j = i; j < entitiesByIndex.length; j++) {
           callback(i,j,entitiesByIndex[i], entitiesByIndex[j]);
        }
      }
    };
  };
});




define('libs/layers/render/layer',['require','../shared/eventable'],function(require) {
  var Eventable = require('../shared/eventable');

  return function (config) {
    Eventable.call(this);
    var self = this;
    var items = [];

    var depth = config.depth,
        distanceScaleFactor = config.distanceScaleFactor, 
        renderScaleFactor = config.renderScaleFactor,
        sceneWidth = config.sceneWidth,
        sceneHeight = config.sceneHeight,
        transformX = 0;

    self.addRenderable = function (renderable) {
      items.push(renderable);
      renderable.setLayer(self);
    };

    self.removeRenderable = function(renderable) {
      var newItems = [];
      for(var i = 0; i < items.length; i++) {
          if(renderable !== items[i])
            newItems.push(items[i]);
      }
      items = newItems;
    };

    self.render = function (context) {
      context.translate(transformX * renderScaleFactor, 0);
      for (var i = 0; i < items.length; i++)
        renderItem(context, i);
      context.translate(0, 0);
    };

    self.getDepth = function() {
      return depth;
    };

    self.getRight = function() {
      return self.getWidth() + transformX;
    };

    self.getLeft = function() {
      return transformX;
    };

    self.getWidth = function() {
      return sceneWidth / distanceScaleFactor;
    };

    self.getHeight = function() {
      return sceneHeight / distanceScaleFactor;
    };

    self.getRenderScaleFactor = function() {
      return renderScaleFactor;
    };

    self.transformX = function(x) {
      transformX = x;
      self.raise('onTransformed', { x: x });
    };

    self.browserToGameWorld = function(points) {
      points[0] = transformX + (points[0] / renderScaleFactor);
      points[1] = (points[1] / renderScaleFactor);
      return points;
    };

    var renderItem = function (context, i) {
      var item = items[i];   
      item.render(context);
    };
  };
});


define('libs/layers/render/world',['./layer'], function(Layer) {
  return function (sceneWidth, sceneHeight, nearestPoint, renderScaleFactor) {
    var self = this;
    var layers = [];

    self.render = function (context) {
      for (var i = 0; i < layers.length; i++)
        layers[i].render(context);
    };

    self.addLayer = function(distance) {
      var distanceScaleFactor = distance / nearestPoint;
      var layer = new Layer({
        depth: distance,
        distanceScaleFactor: distanceScaleFactor,
        renderScaleFactor: distanceScaleFactor * renderScaleFactor,
        sceneWidth: sceneWidth,
        sceneHeight: sceneHeight
      });

      layers.push(layer);
      return layer;
    };
  };
});

define('libs/layers/render/canvasrenderstage',[],function() {
  return function (colourElement, depthElement, nearestPoint) {
    var self = this;

    var colourBuffer = null;
    var depthBuffer = null;

    var currentTranslation = [0,0];

    self.fillRect = function (x, y, z, rotation, width, height, material) {
      fillColourBuffer(x, y, z, rotation, width, height, material);
      fillDepthBuffer(x, y, z, rotation, width, height, material);
    };

    self.translate = function(x, y) {
      currentTranslation[0] = x;
      currentTranslation[1] = y;
    };

    var fillColourBuffer = function (x, y, z, rotation, width, height, material) {
      colourBuffer.fillStyle = material.rgba();
      applyTransforms(colourBuffer, x, y, rotation, width, height);

      if(material.image()) {
        colourBuffer.drawImage(material.image(), x, y, width, height);
      } else {
        colourBuffer.fillRect(x, y, width, height);
      }
      clearTransforms(colourBuffer);
    };

    var applyTransforms = function(ctx, x, y, rotation, width, height) {
      var middlex = x + (width / 2.0) - currentTranslation[0];
      var middley = y + (width / 2.0) -currentTranslation[1];
    
      ctx.save();
      ctx.translate(middlex, middley);
      ctx.rotate(rotation);
      ctx.translate(-middlex, -middley);
      ctx.translate(-currentTranslation[0], -currentTranslation[1]);
    };

    var clearTransforms = function(ctx) {
      ctx.restore();
    };

    var fillDepthBuffer = function (x, y, z, rotation, width, height, material) {
      if(!depthBuffer) return;
      var depthComponent = (z / nearestPoint);
      depthBuffer.globalAlpha = depthComponent;    

      if(material.image()) {
        depthBuffer.drawImage(material.image(), x, y, width, height);
      } else {
        depthBuffer.fillRect(x, y, width, height);
      }
    };

    var createBuffers = function () {
      colourBuffer = colourElement.getContext('2d');
      if(depthElement)
        depthBuffer = depthElement.getContext('2d');
    };

    createBuffers();
  };
});



define('libs/layers/render/rendertarget',[],function() {
  return function(gl, width, height) {
    var self = this;
    var width = width;
    var height = height;
    var rttFramebuffer = null;
    var rttTexture = null;
    var renderbuffer  = null;

    self.upload = function() {
      gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
    };

    self.clear = function() {
     gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    self.getTexture = function() {
      return rttTexture;
    };

    rttFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);

    rttTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, rttTexture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rttTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);  
  };
});



define('libs/layers/render/screenrendertarget',[],function() {
  return function(gl) {
    var self = this;

    self.upload = function() {
       gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };
    self.clear = function() {};
    self.getTexture = function() { throw "Not supported"; }

  };
});




define('libs/layers/render/effect',[],function() {
  return function(gl, program) {
    var self = this;

    var aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    var aTextureCoords = gl.getAttribLocation(program, 'aTextureCoords');
    var uProjection = gl.getUniformLocation(program, 'uProjection');
    var uView = gl.getUniformLocation(program, 'uView');
    var uWorld = gl.getUniformLocation(program, 'uWorld');
    var uResolution = gl.getUniformLocation(program, 'uResolution');
    var uColourSampler = gl.getUniformLocation(program, 'uColourSampler');
    var uDepthSampler = gl.getUniformLocation(program, 'uDepthSampler');

    self.begin = function() {
      gl.useProgram(program);
    };  

    self.buffers = function(vertexBuffer, textureBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(aVertexPosition);

      gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
      gl.vertexAttribPointer(aTextureCoords, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(aTextureCoords);
    };

    self.camera = function(camera) {
      gl.uniformMatrix4fv(uProjection, false, camera.projection);
      gl.uniformMatrix4fv(uView, false, camera.view);
      gl.uniformMatrix4fv(uWorld, false, camera.world);
      gl.uniform2f(uResolution, false, camera.resolution);
    };

    self.inputTextures = function(inputColour, depth) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, inputColour);
      gl.uniform1i(uColourSampler, 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, depth);
      gl.uniform1i(uDepthSampler, 1);
    };

    self.render = function() {
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
  };
});



define('libs/layers/render/effectbuilder',['./effect'], function(Effect) {
  return function(gl) {
    var self = this;
    var shaders = [];

    self.addVertexShaderFromElementWithId = function(id) {
      var vertexText = document.getElementById(id).innerText;
      var vertexShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader, vertexText);
      gl.compileShader(vertexShader);
      shaders.push(vertexShader);
      return self;
    };

    self.addFragmentShaderFromElementWithId = function(id) {
      var fragmentText = document.getElementById(id).innerText;
      var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, fragmentText);
      gl.compileShader(fragmentShader);
      shaders.push(fragmentShader);
      return self;
    };

    self.build = function() {
      var builtProgram = buildProgram();
      return new Effect(gl, builtProgram);
    }; 

    var buildProgram = function() {
      var program = gl.createProgram();

      for(var i = 0 ; i < shaders.length; i++)
        gl.attachShader(program, shaders[i]);

      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          throw "Couldn't create program";
      }
      return program;
    };

  };
});



define('libs/layers/render/webglrenderer',['./rendertarget', './screenrendertarget', './effectbuilder'], 
function(RenderTarget, ScreenRenderTarget, EffectBuilder) {
  return function (target, shaderFactory) {
    var self = this;

    var gl = null;
    var vertexBuffer = null;
    var textureBuffer = null;

    var renderWidth = 0;
    var renderHeight = 0;
    var camera = new Camera();

    var effects = [];

    var colourInput = null;
    var depthInput = null;
    var currentColourInput = null;
    var currentDepthInput = null;
    var memoryTargetOne = null;
    var memoryTargetTwo = null;
    var screenTarget = null;

    self.render = function (colourCanvas, depthCanvas) { 
      if(effects.length === 0)
        throw "No effects were specified before calling render!";

      fillTextureFromCanvas(colourInput, colourCanvas);
      fillTextureFromCanvas(depthInput, depthCanvas);

      currentColourInput = colourInput;
      currentDepthInput = depthInput;
      var currentRenderTarget = effects.length === 1 ? screenTarget : memoryTargetOne;

      for(var i = 0; i < effects.length; i++) {
        currentRenderTarget.upload();
        renderPass(effects[i]);
        currentRenderTarget.clear();

        if(i < effects.length - 1) {
          currentColourInput = currentRenderTarget.getTexture();
          currentRenderTarget = i === (effects.length-2) ? screenTarget : (currentRenderTarget === memoryTargetOne ? memoryTargetTwo : memoryTargetOne);       
        }
      }   
    };

    var renderPass = function(effect) {
      gl.viewport(0, 0, renderWidth, renderHeight);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      camera.update(renderWidth, renderHeight);

      effect.begin();
      effect.buffers(vertexBuffer, textureBuffer);
      effect.camera(camera);
      effect.inputTextures(currentColourInput, currentDepthInput);
      effect.render();
    };

    var createBuffers = function () {
      createGlContext();
      createGeometry();
      createRenderTargets();
      setupInitialState();
    };

    var createRenderTargets = function() {
      colourInput = createTextureForCopyingInto();
      depthInput = createTextureForCopyingInto();
      memoryTargetOne = new RenderTarget(gl, renderWidth, renderHeight);
      memoryTargetTwo = new RenderTarget(gl, renderWidth, renderHeight);
      screenTarget = new ScreenRenderTarget(gl);
    };

    var setupInitialState = function () {
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
    };

    var createGeometry = function () {
      vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadVertices), gl.STATIC_DRAW);

      textureBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadTextureCoords), gl.STATIC_DRAW);
    };

    self.addPass = function(builderFunction) {
      var builder = new EffectBuilder(gl);
      builderFunction(builder);
      var effect = builder.build();
      effects.push(effect);
    };

    var createTextureForCopyingInto = function() {
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindTexture(gl.TEXTURE_2D, null);
      return texture;
    };

    var fillTextureFromCanvas = function (texture, canvasElement) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvasElement);
    };

    var createGlContext = function () {
      gl = target.getContext("experimental-webgl", 
            { antialias: false });

      renderWidth = target.width;
      renderHeight = target.height;
    };

    var quadVertices = [
         0.0, 0.0, 0.0,
         1.0, 0.0, 0.0,
         0.0, 1.0, 0.0,
         1.0, 1.0, 0.0
    ];

    var quadTextureCoords = [
         0.0, 1.0,
         1.0, 1.0,
         0.0, 0.0,
         1.0, 0.0,
    ];

    createBuffers();
  };
});

define('libs/layers/render/webglrenderstage',['./webglrenderer'], function(WebglRenderer) {
  return function(target) {
    var self = this;

    var renderer = new WebglRenderer(target);

    renderer.addPass(function(builder) {
        builder
        .addVertexShaderFromElementWithId('shared-vertex')
        .addFragmentShaderFromElementWithId('depth-fragment');
    });

    self.renderScene = function(colour, depth) {
        renderer.render(colour, depth);
    };
  };
});

define('libs/layers/render/renderengine',['./material', './world', './canvasrenderstage', './webglrenderstage'], 
  function(Material, World, CanvasRenderStage, WebglRenderStage) {

  return function(config) {     
    var self = this;

    var baseScaleFactor = config.colourElement.width / config.sceneWidth,     
        world = new World(config.sceneWidth, config.sceneHeight, config.nearestPoint, baseScaleFactor),
        backFillMaterial = new Material(config.backgroundColour.r, config.backgroundColour.g, config.backgroundColour.b),  
        canvasRenderStage = new CanvasRenderStage(config.colourElement, config.depthElement, config.nearestPoint),
        webglRenderStage = null;

    if(config.depthElement && config.glElement)
      webglRenderStage = new WebglRenderStage(config.glElement);

    self.render = function() {
      canvasRenderStage.fillRect(0, 0, 0, 0, config.colourElement.width, config.colourElement.height, backFillMaterial);
      world.render(canvasRenderStage);
      if(webglRenderStage)
        webglRenderStage.renderScene(config.colourElement, config.depthElement);
    };

    self.world = function() { return world; }
  };

});

define('libs/layers/render/renderenginebuilder',['./renderengine'], function(Engine) {

  return function(colourId, depthId, webglId) {
    var self = this;
    var config = {};
    
    self.nearestPoint = function(value) {
      config.nearestPoint = value;
      return self;
    };

    self.sceneWidth = function(value) {
      config.sceneWidth = value;
      return self;
    };

    self.sceneHeight = function(value) {
      config.sceneHeight = value;
      return self;
    };

    self.backgroundColour = function(r,g,b) {
      config.backgroundColour = { r: r, g: g, b: b };
      return self;
    };
    
    self.build = function() {    
      config.colourElement = document.getElementById(colourId);
      config.depthElement = document.getElementById(depthId);
      config.glElement = document.getElementById(webglId);
      config.sceneWidth = config.sceneWidth || colourElement.width;
      config.sceneHeight = config.sceneHeight || colourElement.height;
      config.backgroundColour = config.backgroundColour || { r: 0, g: 0, b: 0 }; 
      config.nearestPoint = config.nearestPoint || 8.0;
      return new Engine(config);
    };  
  };

});

define('libs/layers/driver',['require','./resources/texturehandler','./resources/soundhandler','./resources/resourceloader','./scene/scene','./render/renderenginebuilder','./shared/eventable'],function(require) {
  var TextureHandler = require('./resources/texturehandler');
  var SoundHandler = require('./resources/soundhandler');
  var ResourceLoader = require('./resources/resourceloader');
  var Scene = require('./scene/scene');
  var EngineBuilder = require('./render/renderenginebuilder');
  var Eventable = require('./shared/eventable');

  var findRequestAnimationFrame = function() {
    return window.requestAnimationFrame        || 
      window.webkitRequestAnimationFrame  || 
      window.mozRequestAnimationFrame     || 
      window.oRequestAnimationFrame       || 
      window.msRequestAnimationFrame      ||
      function(callback, element){
        window.setTimeout(callback, 1000 / 30);
      };
  };  

  return function() {
    Eventable.call(this);

    var self = this,
        requestAnimationFrame = findRequestAnimationFrame(),
        engine = null,
        scene = null,
        tickTimerId = null;

    self.start = function() {
     createAssets();
     startTimers();
     self.raise("started");
    };

    self.stop = function() {
     stopTimers();
     destroyAssets();
     self.raise("stopped");
    };

    self.scene = function() { return scene; }
    self.engine = function() { return engine; }

    var createAssets = function() {
        engine = new EngineBuilder('colour')
                  .nearestPoint(8.0)
                  .sceneWidth(640)
                  .sceneHeight(480)
                  .backgroundColour(10, 10, 150)
                  .build();

      var world = engine.world();
      var resources = new ResourceLoader([new TextureHandler(), new SoundHandler()]);
      scene = new Scene(world, resources);   
    };

    var destroyAssets = function() {
      engine = null;
      scene = null; 
      hud = null;
    };

    var startTimers = function() {
      tickTimerId = setInterval(doLogic, 1000 / 30);
      renderScene();
    };

    var doLogic = function() {
      scene.tick();
    };

    var renderScene = function() {
      if(engine === null) return;
      engine.render();
      requestAnimationFrame(renderScene);
    };
    
    var stopTimers = function() {
      clearInterval(tickTimerId);
      tickTimerId = null;
    };
  };

});

define('libs/layers/render/renderable',[],function() {
  return function(x, y, width, height, material) {
    var self = this;

    var rx = 0;
    var ry = 0;
    var z = 0;
    var rwidth = 0;
    var rheight = 0;
    var layer = null;
    var rotation = 0;

    self.setLayer = function(nlayer) {
      layer = nlayer;
      updateRenderCoords();
      updateRenderSize();
    };  

    self.position = function(nx, ny) {
      x = nx;
      y = ny;
      updateRenderCoords();
    };

    self.rotation = function(value) {
      rotation = value;
    };

    self.render = function(context) {
      context.fillRect(rx, ry, layer.getDepth(), rotation, rwidth, rheight, material);
    };

    var updateRenderCoords = function() {
      rx = x * layer.getRenderScaleFactor();
      ry = y * layer.getRenderScaleFactor();
    };

    var updateRenderSize = function() {
      rwidth = width * layer.getRenderScaleFactor();
      rheight = height * layer.getRenderScaleFactor();
    };
  };
});



define('src/clouds',['require','../libs/layers/scene/entity','../libs/layers/render/renderable','../libs/layers/render/material'],function(require) {
  var Entity = require('../libs/layers/scene/entity');
  var Renderable = require('../libs/layers/render/renderable');
  var Material = require('../libs/layers/render/material');

  return function(depth, count, size) {
    Entity.call(this);

    var self = this;

    var layer = null;
    var items = [];
    var renderables = [];
    var cloudMaterial = new Material(255,255,255);

    self.id = function() {
      return 'clouds-' + depth;
    };

    self.tick = function() {
      for(var i = 0; i < items.length; i++) {
        updateCloud(i);
      }
    };

    var onAddedToScene = function(data) {
      cloudMaterial.setImage(data.scene.resources.get('img/cloud.png'));
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
});

define('src/spawnables',['require','../libs/layers/scene/entity','../libs/layers/render/material','../libs/layers/render/renderable'],function(require) {
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

define('src/stars',['require','./spawnables'],function(require) {
  var Spawnables = require('./spawnables');

  return function(depth, frequency, maxCount, size) {
     Spawnables.call(this, depth, frequency, maxCount, size, 'stars', 'img/star.png');
     var self = this;

    var onItemCollided = function(data) {
      self.raise('star-gathered', {
        x: data.x,
        y: data.y,
        z: depth
      });
    };

    self.on('item-collided', onItemCollided);
  };
});



define('src/pigeons',['require','./spawnables'],function(require) {
  var Spawnables = require('./spawnables');

  return function(depth, frequency, maxCount, size) {
    Spawnables.call(this, depth, frequency, maxCount, size, 'pigeons', 'img/pigeon.png');
    var self = this;

    var onItemCollided = function(data) {
      self.raise('pigeon-hit', {
        x: data.x,
        y: data.y,
        z: depth
      });
    };

    self.on('item-collided', onItemCollided);
  };
});

define('src/controller',['require','../libs/layers/scene/entity'],function(require) {
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

define('src/playerkiller',['require','../libs/layers/scene/entity'],function(require) {
  var Entity = require('../libs/layers/scene/entity');

  return function(lives) {
    Entity.call(this); var self = this;
    var scene = null;

    self.id = function() { return 'player-killer'; }

    var onPigeonHit = function(data) {
      lives--;
      self.raise('player-life-lost', {
        lives: lives
      });
      if(lives === 0)
        killPlayer(data);
    };

    var killPlayer = function(data) {
      self.raise('player-killed', {
        x: data.x,
        y: data.y,
        z: data.z
      });
    };
    
    var onAddedToScene = function(data) {
      scene = data.scene;
      scene.on('pigeon-hit', onPigeonHit);
      self.raise('player-spawned', { lives: lives });
    };

    var onPlayerKilled = function() {
      var player = scene.getEntity('player');
      scene.removeEntity(player);
    };
    
    self.on('player-killed', onPlayerKilled);
    self.on('addedToScene', onAddedToScene);
  };
});

define('src/soundeffects',['require','../libs/layers/scene/entity'],function(require) {
  var Entity = require('../libs/layers/scene/entity');

  return function() {
    Entity.call(this); var self = this;

    self.id = function() { return "sound-effects"; }

    var starEffect = null;
    var pigeonEffect = null;

    var onStarGathered = function() {
      starEffect.play(0.4);
    };

    var onPigeonHit = function() {
      pigeonEffect.play(0.4);
    };

    var onAddedToScene = function(data) {
      var scene = data.scene;    
      scene.on('star-gathered', onStarGathered);
      scene.on('pigeon-hit', onPigeonHit);
      starEffect = scene.resources.get('audio/star.wav');
      pigeonEffect = scene.resources.get('audio/pigeon.wav');
    };

    self.on('addedToScene', onAddedToScene);
  };
});

define('src/particleemitter',['require','../libs/layers/scene/entity'],function(require) {
  var Entity = require('../libs/layers/scene/entity');

  return function() {
    Entity.call(this); 
    var self = this,
       scene = null;

    self.id = function() { return 'global-particle-emitter'; }

    var onStarGathered = function(data) {
      self.raise('particles-emitted', {
        x: data.x,
        y: data.y,
        z: data.z,
        id: 'star'
      });
    };

    var onPigeonHit = function(data) {
      self.raise('particles-emitted', {
        x: data.x,
        y: data.y,
        z: data.z,
        id: 'pigeon'
      });
    };  

    var onPlayerKilled = function(data) {
      self.raise('particles-emitted', {
        x: data.x,
        y: data.y,
        z: data.z,
        id: 'explosion'
      });
    };

    var onAddedToScene = function(data) {
      scene = data.scene;
      scene.on('star-gathered', onStarGathered);
      scene.on('pigeon-hit', onPigeonHit);
      scene.on('player-killed', onPlayerKilled);
    };

    self.on('addedToScene', onAddedToScene);
  };
});

define('src/difficulty',['require'],function(require) {
  var Difficulty = function(scale) {
    var self = this;
    var original = scale;

    self.reset = function() {
      scale = original;
    };

    self.increase = function(amount) {
      scale += amount;
    };

    self.scale = function(input) { 
      if(!input) return scale;
      var difference = (original - scale);
      difference *= input;
      return original + difference;      
    }    
  };
  return new Difficulty(1.0);
});

define('src/aircraft',['require','../libs/layers/scene/entity','../libs/layers/render/renderable','../libs/layers/render/material','./difficulty'],function(require) {
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


define('src/layerscroller',['require','../libs/layers/scene/entity','./difficulty'],function(require) {
  var Entity = require('../libs/layers/scene/entity');
  var Difficulty  = require('./difficulty');

  return function() {
    Entity.call(this); var self = this;
    var x = 0;
    var scene = null;

    self.id = function() { return 'scroller-thingy'; }

    self.tick = function() {
      x += 3.0 * Difficulty.scale();
      scene.eachLayer(function(layer) {
        layer.transformX(x);
      });   
    };

    var onAddedToScene = function(data) {
      scene = data.scene;
    };

    self.on('addedToScene', onAddedToScene);
  };

});

define('src/scores',['require','../libs/layers/scene/entity','./difficulty'],function(require) {
  var Entity = require('../libs/layers/scene/entity');
  var Difficulty  = require('./difficulty');

  return function() {
    Entity.call(this); var self = this;
    var score = 0;
    
    self.id = function() { return 'scores'; }
   
    var onStarGathered = function() {
      score++;
      self.raise('score-changed', {
        score: score
      });

      Difficulty.increase(0.05);
    }; 

    var onAddedToScene = function(data) {
      var scene = data.scene;
      scene.on('star-gathered', onStarGathered);
    };
    
    self.on('addedToScene', onAddedToScene);
  };
});

define('src/hud',['require'],function(require) {
  return function(scene) {
    var self = this;
    var scoreElement = $('.player-score');
    var lifeElement = $('#player-lives');
    

    var onScoreChanged = function(data) {
      scoreElement.text(data.score);
    };  

    var onPlayerLifeLost = function(data) {
      lifeElement.text(data.lives);
    };

    var onPlayerSpawned = function(data) {
      lifeElement.text(data.lives);
      scoreElement.text(0);
    };

    scene.on('score-changed', onScoreChanged);
    scene.on('player-life-lost', onPlayerLifeLost);
    scene.on('player-spawned', onPlayerSpawned);
  };
});

define('src/game',['require','../libs/layers/components/particles','../libs/layers/shared/eventable','../libs/layers/render/material','../libs/layers/driver','./clouds','./aircraft','./stars','./pigeons','./controller','./layerscroller','./scores','./playerkiller','./soundeffects','./particleemitter','./difficulty','./hud'],function(require) {

  var Particles = require('../libs/layers/components/particles');
  var Eventable = require('../libs/layers/shared/eventable');
  var Material = require('../libs/layers/render/material');
  var Driver = require('../libs/layers/driver');

  var Clouds = require('./clouds');
  var Aircraft = require('./aircraft');
  var Stars = require('./stars');
  var Pigeons = require('./pigeons');
  var Controller = require('./controller');
  var LayerScroller = require('./layerscroller');
  var Scores = require('./scores');
  var PlayerKiller = require('./playerkiller');
  var SoundEffects = require('./soundeffects');
  var ParticleEmitter = require('./particleemitter');
  var Difficulty  = require('./difficulty');
  var Hud = require('./hud');

  return function () {
    Eventable.call(this);  var self = this;

    var hud = null;
    var driver = new Driver();

    var onStarted = function() {
      populateScene();
    };

    var onStopped = function() {
      Difficulty.reset();
    };


    driver.on('started', onStarted);
    driver.on('stopped', onStopped);

    self.start = function () {
     driver.start();
    };

    self.stop = function() {
      driver.stop();
      self.raise('game-ended');
    };

    var populateScene = function() {
      var scene = driver.scene();

      hud = new Hud(scene);

      scene.addLayer(3.0);
      scene.addLayer(5.0);
      scene.addLayer(8.0);

      scene.addEntity(new Clouds(3.0, 20, 250));
      scene.addEntity(new Clouds(5.0, 10, 250));
      scene.addEntity(new Aircraft('player', 8.0));
      scene.addEntity(new Stars(8.0, 30, 6, 30));
      scene.addEntity(new Pigeons(8.0, 30, 5, 30));
      scene.addEntity(new Controller('player', document.getElementById('colour')));
      scene.addEntity(new LayerScroller());
      scene.addEntity(new Scores());
      scene.addEntity(new PlayerKiller(3));
      scene.addEntity(new SoundEffects());
      scene.on('player-killed', onPlayerKilled);

      initializeParticles(scene);
    };

    var initializeParticles = function(scene) {
      var config = {
        types: {
          'star': {
            burst: 15,
            maxCount: 45,
            material: new Material(255,255,255),
            width: 10,
            height: 10
          },
          'pigeon': {
            burst: 15,
            maxCount: 45,
            material: new Material(255,255,255),
            width: 10,
            height: 10
          },
          'explosion': {
            burst: 50,
            maxCount: 50,
            material: new Material(255,255,255),
            width: 10,
            height: 10,
            lifetime: 300
          }
        }
      };
      config.types.explosion.material.setImage(scene.resources.get('img/star-particle.png'));
      config.types.star.material.setImage(scene.resources.get('img/star-particle.png'));
      config.types.pigeon.material.setImage(scene.resources.get('img/pigeon-particle.png'));
      var particleEngine = new Particles(8.0, config);
      scene.addEntity(particleEngine);
      scene.addEntity(new ParticleEmitter());
    };

    var onPlayerKilled = function() {
      setTimeout(self.stop, 3000);
    };
  };
});

define('app',['require','./src/game'],function(require) {
  var Game = require('./src/game');

  var game = new Game();
  
  var startGame = function() {
    game.start();
    $('#hud').show();
    $('#game-container').show();
    $('#game-start').hide();
    $('#game-over').hide();
  };

  $(document).ready(function() {
    $('#start-action').click(startGame);
    $('#restart-game-action').click(startGame);
  });

  var onGameEnded = function() {
    $('#game-over').show();
    $('#hud').hide();
    $('#game-container').hide();
  };

  game.on('game-ended', onGameEnded);
});
