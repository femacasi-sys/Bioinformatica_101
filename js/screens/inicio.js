(function(){
  window.Game = window.Game || {};

  Game.registerScreen('inicio', {
    render: function(state, params){
      var rowsHTML = Game.CaseOrder.map(function(caseId){
        var caseData = Game.Cases[caseId];
        var progress = state.caseProgress[caseId];
        var status = progress && progress.stage === 'completed' ? 'COMPLETADO' : 'DISPONIBLE';
        var stars = (progress && progress.stars) ? Game.UI.stars(progress.stars) : '';
        return '<div class="case-row-like panel" style="cursor:pointer;margin-bottom:10px;" onclick="Game.Engine.goTo(\'briefing\',{caseId:\'' + caseId + '\'})">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">' +
            '<div>' +
              '<div style="font-size:19px;">' + caseData.title + '</div>' +
              '<div style="font-size:14px;color:#8fa2ad;">' + caseData.characterName + ' · ' + status + '</div>' +
            '</div>' +
            '<div>' + stars + '</div>' +
          '</div>' +
        '</div>';
      }).join('');

      return '' +
        '<div class="panel" style="text-align:center;">' +
          '<h2 class="screen-title">BIOINFORMÁTICA 101 · AVANZADO</h2>' +
          '<p style="color:#8fa2ad;">elegí un caso: briefing, preparación, pipeline, resultados y decisión</p>' +
        '</div>' +
        rowsHTML;
    }
  });
})();
