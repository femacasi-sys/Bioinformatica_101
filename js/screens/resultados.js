(function(){
  window.Game = window.Game || {};

  Game.registerScreen('resultados', {
    render: function(state, params){
      var caseId = params.caseId;
      var d = Game.Cases[caseId];
      var meta = d.resultsMeta;
      var progress = Game.Engine.getCaseProgress(caseId);
      var hits = d.results[progress.pipeline.quality] || d.results.poor;
      var selected = hits.filter(function(h){ return h.id === progress.resultados.selected; })[0];

      var rowsHTML = hits.map(function(h){
        var isSel = progress.resultados.selected === h.id;
        return '<li class="hit-row' + (isSel ? ' selected' : '') + '" onclick="Game.UI._selectHit(\'' + caseId + '\',\'' + h.id + '\')">' +
          '<span class="hit-name">' + h.name + '</span>' +
          '<span class="hit-pct' + (h.badgeClass ? ' ' + h.badgeClass : '') + '">' + h.badge + '</span>' +
        '</li>';
      }).join('');

      var detailHTML = '';
      if(selected){
        var fieldsHTML = meta.detailFields.map(function(f){
          return '<div>' + f.label + '<b>' + selected.details[f.key] + '</b></div>';
        }).join('');
        detailHTML =
          '<div class="hit-detail">' +
            '<span class="hit-detail-title">' + selected.name + '</span>' +
            '<div class="hit-detail-grid">' + fieldsHTML + '</div>' +
            '<p style="margin:0;">' + selected.description + '</p>' +
          '</div>';
      }else{
        detailHTML = '<p style="color:#8fa2ad;font-size:15px;">Hacé clic sobre un resultado para ver el detalle.</p>';
      }

      var canAdvance = progress.resultados.explored.length > 0;

      return '' +
        Game.UI.statusBar(caseId) +
        Game.UI.backButton() +
        '<h3 class="stage-label">ETAPA 4 · INTERPRETACIÓN DE RESULTADOS</h3>' +
        '<div class="panel">' +
          '<div class="seq-label" style="color:#8fa2ad;font-size:15px;">' + meta.qualityLabel[progress.pipeline.quality] + '</div>' +
          '<ul class="hit-list">' + rowsHTML + '</ul>' +
          detailHTML +
        '</div>' +
        '<button class="btn" ' + (!canAdvance ? 'disabled' : '') +
          ' onclick="Game.Engine.goTo(\'decision\',{caseId:\'' + caseId + '\'})">PASAR A DECISIÓN FINAL</button>';
    }
  });

  Game.UI = Game.UI || {};
  Game.UI._selectHit = function(caseId, hitId){
    Game.Engine.selectHit(caseId, hitId);
    Game.Engine.render();
  };
})();
