(function(){
  window.Game = window.Game || {};

  Game.registerScreen('interpretacion', {
    render: function(state, params){
      var caseId   = params.caseId;
      var d        = Game.Cases[caseId];
      var progress = Game.Engine.getCaseProgress(caseId);
      var variant  = d.alignment.regions.filter(function(r){ return r.hasVariant; })[0];

      var cardsHTML = d.interpretacion.databases.map(function(db){
        var queried = progress.interpretacion.queried.indexOf(db.id) !== -1;
        var canAfford = progress.credits >= db.cost.credits && progress.hours >= db.cost.hours;
        return '<div class="db-card' + (queried ? ' queried' : '') + '">' +
          '<div class="pick-title">' + db.label + '</div>' +
          '<div class="pick-sub">' + db.desc + '</div>' +
          '<div class="pick-sub">' + db.cost.credits + ' créditos · ' + db.cost.hours + 'h</div>' +
          (queried ?
            '<div class="db-result">' + db.result + '</div>' :
            '<button class="btn secondary" ' + (!canAfford ? 'disabled' : '') +
              ' onclick="Game.UI._queryDatabase(\'' + caseId + '\',\'' + db.id + '\')">CONSULTAR</button>'
          ) +
        '</div>';
      }).join('');

      var canAdvance = Game.Engine.canAdvanceInterpretacion(caseId);

      return '' +
        Game.UI.statusBar(caseId) +
        Game.UI.backButton() +
        '<h3 class="stage-label">ETAPA 5 · INTERPRETACIÓN CLÍNICA</h3>' +
        '<div class="panel">' +
          '<p style="margin-top:0;color:#8fa2ad;font-size:16px;">Variante confirmada: <b style="color:var(--paper);">' + variant.variantNotation + '</b>. Consultá las bases necesarias para respaldar tu informe — cada consulta consume créditos y horas.</p>' +
        '</div>' +
        '<div class="db-row">' + cardsHTML + '</div>' +
        '<button class="btn" ' + (!canAdvance ? 'disabled' : '') +
          ' onclick="Game.Engine.goTo(\'decision\',{caseId:\'' + caseId + '\'})">PASAR A INFORME FINAL</button>';
    }
  });

  Game.UI = Game.UI || {};
  Game.UI._queryDatabase = function(caseId, dbId){
    var ok = Game.Engine.queryDatabase(caseId, dbId);
    if(!ok){
      alert('No tenés suficientes créditos u horas para esta consulta.');
      return;
    }
    Game.Engine.render();
  };
})();
