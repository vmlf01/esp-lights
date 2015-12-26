'use strict';

function App(game, broadcaster) {

  game.on('change', handleGameStatusChange);
  broadcaster.on('connection', handleNewClientConnection);

  function handleGameStatusChange (lights) {
    broadcaster.broadcastStatus(lights);
  }

  function handleNewClientConnection (client) {
    game.getLights(function (err, lights) {
      broadcaster.broadcastStatusToClient(client, lights);
    });
  }

}

module.exports = App;
