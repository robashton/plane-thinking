define(['./material', './world', './canvasrenderstage', './webglrenderstage'], 
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
