(function(){
  window.Game = window.Game || {};

  function buildDiff(region){
    var refDisp = region.ref;
    var patDisp = region.pat;
    if(region.hasVariant){
      var idx = region.mismatchIndex;
      refDisp = region.ref.slice(0, idx) + '-' + region.ref.slice(idx);
    }
    var bar = '';
    for(var i = 0; i < patDisp.length; i++){
      bar += (refDisp[i] === patDisp[i]) ? '|' : ' ';
    }
    var refHTML = '';
    var patHTML = '';
    for(var j = 0; j < patDisp.length; j++){
      var mismatch = refDisp[j] !== patDisp[j];
      refHTML += mismatch ? '<span class="align-mismatch">' + (refDisp[j] === undefined ? '-' : refDisp[j]) + '</span>' : refDisp[j];
      patHTML += mismatch ? '<span class="align-mismatch">' + patDisp[j] + '</span>' : patDisp[j];
    }
    return { refHTML: refHTML, bar: bar, patHTML: patHTML };
  }

  Game.registerScreen('alineamiento', {
    render: function(state, params){
      var caseId   = params.caseId;
      var d        = Game.Cases[caseId];
      var progress = Game.Engine.getCaseProgress(caseId);
      var found    = progress.alignment.found;

      var regionsHTML = d.alignment.regions.map(function(region){
        var isSelected = progress.alignment.selectedRegion === region.id;
        var cls = 'align-region' + (isSelected ? ' selected' : '') + (region.hasVariant && found ? ' found' : '');
        var body = '';
        if(isSelected){
          var diff = buildDiff(region);
          body =
            '<div class="align-row">Referencia&nbsp;&nbsp;' + diff.refHTML + '</div>' +
            '<div class="align-row align-bar">' + '            ' + diff.bar + '</div>' +
            '<div class="align-row">Paciente&nbsp;&nbsp;&nbsp;&nbsp;' + diff.patHTML + '</div>';
          if(region.hasVariant){
            body += '<p style="color:var(--phosphor);font-size:15px;margin:8px 0 0;">Variante detectada: <b>' + region.variantNotation + '</b></p>';
          }else{
            body += '<p style="color:#8fa2ad;font-size:14px;margin:8px 0 0;">Esta región coincide exactamente con la referencia — probá otra.</p>';
          }
        }
        return '<div class="' + cls + '" onclick="Game.UI._selectAlignmentRegion(\'' + caseId + '\',\'' + region.id + '\')">' +
          '<div class="align-region-label">Región ' + region.id.toUpperCase() + (region.hasVariant && found ? ' ✓' : '') + '</div>' +
          '<div class="terminal">' + body + '</div>' +
        '</div>';
      }).join('');

      var confirmPanel = found ?
        '<div class="panel" style="border-color:var(--phosphor);">' +
          '<p style="margin-top:0;">Variante detectada: <b style="color:var(--phosphor);">' +
            d.alignment.regions.filter(function(r){ return r.hasVariant; })[0].variantNotation +
          '</b></p>' +
          '<button class="btn" onclick="Game.Engine.goTo(\'interpretacion\',{caseId:\'' + caseId + '\'})">CONTINUAR A INTERPRETACIÓN CLÍNICA</button>' +
        '</div>' : '';

      return '' +
        Game.UI.statusBar(caseId) +
        Game.UI.backButton() +
        '<h3 class="stage-label">ETAPA 4 · INTERPRETACIÓN DEL ALINEAMIENTO</h3>' +
        '<div class="panel">' +
          '<p style="margin-top:0;color:#8fa2ad;font-size:16px;">El pipeline alineó las lecturas contra la referencia. Recorré las regiones y encontrá la única que muestra una diferencia entre el paciente y la referencia.</p>' +
        '</div>' +
        regionsHTML +
        confirmPanel;
    }
  });

  Game.UI = Game.UI || {};
  Game.UI._selectAlignmentRegion = function(caseId, regionId){
    Game.Engine.selectAlignmentRegion(caseId, regionId);
    Game.Engine.render();
  };
})();
