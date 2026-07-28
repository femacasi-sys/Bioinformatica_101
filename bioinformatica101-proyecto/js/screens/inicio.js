(function(){
  window.Game = window.Game || {};

  Game.registerScreen('inicio', {
    render: function(state, params){
      var hasSave = Game.Engine.hasSave();
      return '' +
        '<div class="panel" style="text-align:center;">' +
          '<h2 class="screen-title">BIOINFORMÁTICA 101</h2>' +
          '<p style="color:#8fa2ad;">un juego de casos reales de laboratorio</p>' +
          (hasSave
            ? '<button class="btn" onclick="Game.Engine.goTo(\'hub\')">CONTINUAR (' + state.player.name + ')</button>' +
              '<br><button class="btn secondary" onclick="Game.Engine.newGame()">NUEVA PARTIDA</button>'
            : '<button class="btn" onclick="Game.Engine.goTo(\'creacionPersonaje\')">COMENZAR</button>'
          ) +
        '</div>';
    }
  });
})();
