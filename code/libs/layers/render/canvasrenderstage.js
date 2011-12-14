define(function() {
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


