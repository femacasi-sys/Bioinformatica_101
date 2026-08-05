(function(){
  window.Game = window.Game || {};

  Game.registerScreen('consecuencia', {
    render: function(state, params){
      var caseId = params.caseId;
      var d = Game.Cases[caseId];
      var meta = d.resultsMeta;
      var progress = Game.Engine.getCaseProgress(caseId);
      var npc = Game.Data.NPCS[d.characterKey];

      var text;
      if(!progress.decision.correct){
        text = d.consequence.incorrect;
      }else if(d.microbiome){
        text = progress.hipotesis.biomarkerCorrect ? d.consequence.correctFull : d.consequence.correctPartial;
      }else if(d.blocks){
        text = progress.interpretacion.queried.length === 3 ? d.consequence.correctFull : d.consequence.correctPartial;
      }else{
        text = d.consequence.correct;
      }
      var creditsUsed = d.initialCredits - progress.credits;
      var hoursUsed = d.initialHours - progress.hours;
      var summaryExtra = d.microbiome
        ? '<div>Biomarcador elegido: <b style="color:' + (progress.hipotesis.biomarkerCorrect ? 'var(--phosphor)' : 'var(--alert)') + ';">' +
            (progress.hipotesis.biomarkerCorrect ? 'Correcto' : 'Incorrecto') + '</b></div>' +
          '<div>Taxones explorados: <b>' + progress.dashboard.exploredTaxa.length + '</b></div>' +
          '<div>Intentos de organización del estudio: <b>' + progress.organizacion.attempts + '</b></div>'
        : d.blocks
        ? '<div>Bases de datos consultadas: <b>' + progress.interpretacion.queried.length + '/3</b></div>' +
          '<div>Intentos de armado del pipeline: <b>' + progress.blocks.attempts + '</b></div>'
        : '<div>Herramienta: <b>' + meta.qualityShort[progress.pipeline.quality] + '</b></div>' +
          '<div>Intentos de ordenamiento del pipeline: <b>' + progress.pipeline.orderAttempts + '</b></div>';

      return '' +
        Game.UI.statusBar(caseId) +
        '<h3 class="stage-label">INFORME ENVIADO</h3>' +
        '<div class="panel dialogue">' +
          (npc ? Game.PixelArt.spriteHTML(npc.grid, npc.palette, 'width:72px;height:84px;flex:none;') : '') +
          '<div class="textbox">' +
            '<span class="speaker">' + d.characterName.toUpperCase() + '</span>' +
            '<p>' + text + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="panel" style="text-align:center;">' +
          Game.UI.stars(progress.stars) +
          '<div class="summary-list" style="text-align:left;max-width:320px;margin:10px auto;">' +
            summaryExtra +
            '<div>Errores en preparación: <b>' + progress.desktop.errors + '</b></div>' +
            '<div>Tiempo usado: <b>' + hoursUsed + 'h</b> de ' + d.initialHours + 'h</div>' +
            '<div>Créditos usados: <b>' + creditsUsed + '</b> de ' + d.initialCredits + '</div>' +
            '<div>Reputación actual: <b>' + state.reputation + '%</b></div>' +
            '<div>Experiencia acumulada: <b>' + state.experience + '</b></div>' +
          '</div>' +
          '<button class="btn secondary" onclick="Game.UI._replayCase(\'' + caseId + '\')">JUGAR ESTE CASO DE NUEVO</button>' +
          '<button class="btn secondary" onclick="Game.Engine.goTo(\'inicio\')">ELEGIR OTRO CASO</button>' +
        '</div>';
    }
  });

  Game.UI = Game.UI || {};
  Game.UI._replayCase = function(caseId){
    Game.Engine.resetCase(caseId);
    Game.Engine.goTo('briefing', { caseId: caseId });
  };
})();
