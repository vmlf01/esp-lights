var chai = require("chai");
var should = chai.should();
chai.use(require('chai-things'));

var lights = require('../app/lights');

describe('Lights', function () {

  it('should have all public inteface methods', function (done) {
    var publicMethods = ['init', 'toggle', 'getStatus'];
    publicMethods.should.all.be.function;

    done();
  });

  describe('init', function () {

    it('should init requested number of lights', function (done) {
      lights.init(5, function (err, status) {
        should.not.exist(err);

        status.should.have.length(5);

        done();
      });
    });

    it('should init all lights to off', function (done) {
      lights.init(3, function (err, status) {
        status.should.all.equal(false);

        done();
      });

    });

  });

  describe('toggle', function () {

    beforeEach(function (done) {
      lights.init(3, done);
    });

    it('should toogle light status', function (done) {
      lights.toggle(1, function (err, status) {
        status[1].should.be.true;

        lights.toggle(1, function (err, status) {
          status[1].should.be.false;

          done();
        });
      });
    });

    it('should return error when light index does not exist', function (done) {
      lights.toggle(10, function (err, status) {
        err.should.exist;

        done();
      });
    });

  });

  describe('reset', function () {

    beforeEach(function (done) {
      lights.init(3, function () {
        lights.toggle(2, done);
      });
    });

    it('should reset all light status to off', function (done) {
      lights.getStatus(2, function (err, status) {
        status.should.be.true;

        lights.reset(function (err, status) {
          status.should.have.length(3);
          status.should.all.equal(false);

          done();
        });
      });
    });

  });

  describe('getStatus', function () {

    beforeEach(function (done) {
      lights.init(3, done);
    });

    it('should return all light status if first argument is callback', function (done) {
      lights.getStatus(function (err, status) {
        status.should.have.length(3);

        done();
      });
    });

    it('should return individual light status', function (done) {
      lights.getStatus(1, function (err, status) {
        status.should.be.false;

        done();
      });
    });

    it('should return error when light index does not exist', function (done) {
      lights.getStatus(10, function (err, status) {
        err.should.exist;

        done();
      });
    });

  });
});
