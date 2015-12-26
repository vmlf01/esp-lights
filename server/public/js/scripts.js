// Empty JS for your own code to be here
(function () {
  var isConnectionOpen = false;
  var wsConnection = null;
  var isGameInProgress = false;

  $(document).ready(function () {

    $("#newgameButton").click(function () {
      console.log('CLICK NEW GAME!');
      sendResetRequest();
    });

  });

  window.joinGame = joinGame;

  function joinGame () {
    updateGameTitle('Joining game, please hold...', false);

    $(".light").click(handleLightClick);

    createWebSocketConnection();
  }

  function updateGameTitle(text) {
    $("#gameTitle").text(text);
  }

  function handleLightClick (light) {
    if (isGameInProgress) {
      var lightElem = $(light.currentTarget);
      var lightIndex = lightElem[0].id.slice(-1);
      console.log('CLICK LIGHT!', lightIndex);
      sendToggleRequest(lightIndex);
    }
  }

  function createWebSocketConnection() {
    var protocol = 'ws:';
    if (location.protocol === 'https:') {
      protocol = 'wss:'
    }
    var connectionString = protocol + '//' + location.host + '/';
    console.log('Connecting to', connectionString);

    wsConnection = new WebSocket(connectionString);
    wsConnection.onopen = connectionOpened;
    wsConnection.onclose = connectionClosed;
    wsConnection.onmessage = handleIncomingMessage;
  }

  function connectionOpened () {
    setConnectionStatus(true);
  }

  function connectionClosed () {
    setConnectionStatus(false);
  }

  function handleIncomingMessage (msg) {
    var data = JSON.parse(msg.data);
    console.log('incoming message', data);
    if (data.type === 'status') {
      isGameInProgress = !data.isFinished;
      updateLightsDisplay(data.lights);
      updateConnectionDisplay();
    }
  }

  function setConnectionStatus (isOpen) {
    isConnectionOpen = isOpen;
    updateConnectionDisplay();
  }

  function updateConnectionDisplay () {
    if (isConnectionOpen) {
      if (isGameInProgress) {
        updateGameTitle('Go!');
      }
      else {
        updateGameTitle('Game finished!');
      }
    }
    else {
      updateGameTitle('Hold on, lost connection!!!');
      setTimeout(function () {
        joinGame();
      }, 2000);
    }
  }

  function updateLightsDisplay (lights) {
    lights.forEach(function (light) {
      if (light.isOn) {
        $("#light" + light.index).addClass("on");
      }
      else {
        $("#light" + light.index).removeClass("on");
      }
    });
  }

  function sendResetRequest() {
    isGameInProgress = false;
    updateGameTitle();
    $.get('reset');
  }

  function sendToggleRequest(lightIndex) {
    $.get('toggle/' + lightIndex);
  }

})();
