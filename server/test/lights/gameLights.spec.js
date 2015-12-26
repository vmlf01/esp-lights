'use strict';

var chai = require('chai');
var should = chai.should();
chai.use(require('chai-things'));

var lights = require('../../app/lights');

var game;

describe('Lights', function () {

  beforeEach(function () {
    game = new lights.GameLights([
      new lights.Light(),
      new lights.Light(),
      new lights.Light()
    ]);
  });

  beforeEach(function () {
    game.init();
  });

  it('should have all public inteface methods', function (done) {
    var publicMethods = ['init', 'toggle', 'getLights', 'isFinished'];

    publicMethods.should.all.satisfy(function (f) {
      return game.should.respondTo(f);
    });

    done();
  });

  it('should throw an error when using less than 2 lights', function () {
    (function () { new lights.GameLights([ new lights.Light()]); }).should.throw(Error);
  });

  describe('init', function () {

    it('should init with requested lights', function (done) {
      game.getLights(function (err, lights) {
        lights.should.have.length(3);

        done();
      });
    });

    it('should init with some lights on and some lights off', function (done) {
      game.getLights(function (err, lights) {
        lights.should.contain.some.to.satisfy(function (l) {
          return l.isOn;
        });

        lights.should.contain.some.to.satisfy(function (l) {
          return !l.isOn;
        });

        done();
      });
    });

    it('should emit change event', function (done) {
      game.once('change', function (lights) {
        lights.should.have.length(3);

        done();
      });
      game.init();
    });

    it('should start with game not finished', function (done) {
      game.init();
      game.isFinished().should.equal(false);

      done();
    });

  });

  describe('toggle', function () {

    it('should toogle light status', function (done) {
      game.getLights(1, function (err, light) {
        var initialStatus = light.isOn;
        game.toggle(1, function (err, status) {
          status[1].isOn.should.not.be.equal(initialStatus);

          done();
        });
      });
    });

    it('should return error when toggle light index does not exist', function (done) {
      game.toggle(10, function (err, status) {
        should.exist(err);

        done();
      });
    });

    it('should not throw without callback specified', function (done) {
      game.toggle.bind(game, 0).should.not.throw();

      done();
    });

    it('should emit change event', function (done) {
      game.once('change', function (lights) {
        lights.should.have.length(3);

        done();
      });

      game.toggle(1);
    });

    it('should end game when all lights status are the same', function (done) {


      done();
    });

  });

  describe('getLights', function () {

    it('should return all light status if first argument is callback', function (done) {
      game.getLights(function (err, status) {
        status.should.have.length(3);

        done();
      });
    });

    it('should return individual light status', function (done) {
      game.getLights(1, function (err, status) {

        status.isOn.should.be.a('boolean');

        done();
      });
    });

    it('should return error when light index does not exist', function (done) {
      game.getLights(10, function (err, status) {
        should.exist(err);

        done();
      });
    });

  });

});
