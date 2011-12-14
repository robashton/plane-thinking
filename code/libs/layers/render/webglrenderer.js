define(['./rendertarget', './screenrendertarget', './effectbuilder'], 
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
