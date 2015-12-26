// Empty JS for your own code to be here
(function () {
  $(document).ready(function () {

    $("#newgameButton").click(function () {
      console.log('CLICK NEW GAME!');
    });

    $(".light").click(function (light) {
      var lightElem = $(light.currentTarget);
      var lightIndex = lightElem[0].id.slice(-1);
      console.log('CLICK LIGHT!', lightIndex);

      if (lightElem.hasClass("on")) {
        lightElem.removeClass("on");
      }
      else {
        lightElem.addClass("on");
      }
    });

    updateLightsDisplay([
      {
        index: 0,
        isOn: true
      },
      {
        index: 1,
        isOn: true
      },
      {
        index: 2,
        isOn: false
      },
      {
        index: 3,
        isOn: true
      }
    ]);

  });

  function updateLightsDisplay(lights) {
    lights.forEach(function (light) {
      if (light.isOn) {
        $("#light" + light.index).addClass("on");
      }
      else {
        $("#light" + light.index).removeClass("on");
      }
    });
  }

})();
