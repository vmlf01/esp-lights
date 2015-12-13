var lights = {};

var lightsStatus = [];

lights.init = function (numberOfLights, cb) {
  lightsStatus = new Array(numberOfLights);
  lights.reset(cb);
};

lights.toggle = function (lightIndex, cb) {
  if (isValidIndex(lightIndex)) {
    lightsStatus[lightIndex] = !lightsStatus[lightIndex];
    return cb(null, lightsStatus.slice());
  }
  else {
    return cb(new Error('Invalid light index => ' + lightIndex), lightsStatus);
  }
};

lights.getStatus = function (lightIndex, cb) {
  if (typeof(lightIndex) === typeof(Function)) {
    cb = lightIndex;
    return cb(null, lightsStatus.slice());
  }
  else if (isValidIndex(lightIndex)) {
    return cb(null, lightsStatus[lightIndex]);
  }
  else {
    return cb(new Error('Invalid light index => ' + lightIndex), lightsStatus);
  }
};

lights.reset = function (cb) {
  for (var i = 0; i < lightsStatus.length; i++) {
    lightsStatus[i] = false;
  }

  return cb(null, lightsStatus.slice());
}

function isValidIndex (index) {
  return Number.isInteger(index) && index < lightsStatus.length;
}

module.exports = lights;
