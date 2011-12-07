var Game = function () {
  var self = this;
  var element = document.getElementById('game');
  var world = new World(element.width, element.height);
  var canvasRenderStage = new CanvasRenderStage(element, 8.0);
  var webglRenderStage = new WebglRenderStage(element);

  var doLogic = function () {
    world.doLogic();
  };

  var renderScene = function () {
    clearRenderingTarget();
    world.render(canvasRenderStage);
    webglRenderStage.renderScene(canvasRenderStage.colourTarget(), canvasRenderStage.depthTarget());
  };

  var clearRenderingTarget = function () {
    canvasRenderStage.fillRect(0, 0, 0, element.width, element.height, new Material(0,0,0));
  };

  self.start = function () {
    setInterval(doLogic, 1000 / 30);
    setInterval(renderScene, 1000 / 30);
  };

  var populateWorldWithJunk = function () {
    for (var x = 0; x < 1000; x++) {
      world.addEntity(0, randomPointInWidth(), randomPointInHeight(), randomWidth(), randomHeight(), new Material(255,0,0));
    };
    for (var x = 0; x < 200; x++) {
      world.addEntity(1, randomPointInWidth(), randomPointInHeight(), randomWidth(), randomHeight(), new Material(0,0,255));
    };
    for (var x = 0; x < 50; x++) {
      world.addEntity(2, randomPointInWidth(), randomPointInHeight(), randomWidth(), randomHeight(), new Material(255,0,255));
    };
    for (var x = 0; x < 25; x++) {
      world.addEntity(3, randomPointInWidth(), randomPointInHeight(), randomWidth(), randomHeight(), new Material(255,30,30));
    };
  };

  var randomPointInWidth = function () {
    return Math.random() * element.width;
  };

  var randomPointInHeight = function () {
    return Math.random() * element.height;
  };

  var randomWidth = function () {
    return Math.random() * 30;
  };

  var randomHeight = function () {
    return Math.random() * 30;
  };

  populateWorldWithJunk();
};
