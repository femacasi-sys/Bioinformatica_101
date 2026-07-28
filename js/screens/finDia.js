(function(){
  window.Game = window.Game || {};

  Game.registerScreen('finDia', {
    render: function(state, params){
      return '' +
        Game.UI.statusBar(state, false) +
        '<h2 class="screen-title">FIN DEL DÍA ' + state.day + '</h2>' +
        '<div class="panel">' +
          '<p>Guardaste tu progreso. Presupuesto del laboratorio: <b>' + state.budget + ' créditos</b>.</p>' +
          '<p style="color:#8fa2ad;">Volvé al laboratorio para ver si hay nuevos casos disponibles.</p>' +
          '<button class="btn" onclick="Game.Engine.goTo(\'hub\')">VOLVER AL LABORATORIO</button>' +
        '</div>';
    }
  });
})();
