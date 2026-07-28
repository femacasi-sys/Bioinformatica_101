(function(){
  window.Game = window.Game || {};

  var STATUS_LABELS = {
    disponible: 'DISPONIBLE',
    bloqueado: 'BLOQUEADO',
    completado: 'COMPLETADO'
  };

  Game.registerScreen('hub', {
    render: function(state, params){
      var rows = Game.CaseOrder.map(function(caseId){
        var caseData = Game.Cases[caseId];
        var status = Game.Engine.caseStatus(caseId);
        var clickable = (status === 'disponible' && caseData.implemented !== false);
        var label = STATUS_LABELS[status] || status.toUpperCase();
        if(status !== 'bloqueado' && caseData.implemented === false){
          label += ' · PRÓXIMAMENTE';
        }
        return '<div class="case-row' + (clickable ? ' clickable' : '') + '"' +
          (clickable ? ' onclick="Game.Engine.goTo(\'briefing\',{caseId:\'' + caseId + '\'})"' : '') + '>' +
          '<div>' +
            '<div class="case-title">' + caseData.title + '</div>' +
            '<div class="case-sub">' + caseData.characterName + '</div>' +
          '</div>' +
          '<div class="case-status status-' + status + '">' + label + '</div>' +
        '</div>';
      }).join('');

      var repHTML = Object.keys(state.reputation).map(function(key){
        var npc = Game.Data.NPCS[key];
        var val = state.reputation[key];
        return '<div class="repbar-wrap"><span>' + (npc ? npc.name : key) + '</span>' +
          '<span class="repbar"><span style="width:' + val + '%"></span></span>' +
          '<span>' + val + '%</span></div>';
      }).join('');

      return '' +
        Game.UI.statusBar(state, false) +
        '<h2 class="screen-title">LABORATORIO — ' + state.player.name.toUpperCase() + '</h2>' +
        '<div class="panel">' + rows + '</div>' +
        (repHTML ? '<div class="panel">' + repHTML + '</div>' : '') +
        '<div class="footer-note"><a onclick="Game.Engine.resetProgress()">Reiniciar progreso (demo)</a></div>';
    }
  });
})();
