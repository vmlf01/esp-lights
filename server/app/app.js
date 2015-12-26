'use strict';

function App(game, broadcaster) {

  game.on('change', handleGameStatusChange);
  broadcaster.on('connection', handleNewClientConnection);

  function handleGameStatusChange (lights) {
    broadcaster.broadcastStatus(game.isFinished(), lights);
  }

  function handleNewClientConnection (client) {
    game.getLights(function (err, lights) {
      broadcaster.broadcastStatusToClient(client, game.isFinished(), lights);
    });
  }

}

module.exports = App;
