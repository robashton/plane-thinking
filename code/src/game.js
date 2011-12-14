define(function(require) {

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
