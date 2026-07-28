(function(){
  window.Game = window.Game || {};

  Game.registerScreen('consecuencia', {
    render: function(state, params){
      var caseId = params.caseId;
      var d = Game.Cases[caseId];
      var progress = Game.Engine.getCaseProgress(caseId);
      var npc = Game.Data.NPCS[d.characterKey];

      var text, deltaClass, deltaLabel;
      if(progress.correct){
        var usedFull = progress.toolsRun.indexOf('full') !== -1;
        text = usedFull ? d.consequence.correctFull : d.consequence.correctQuick;
        deltaClass = 'pos';
        deltaLabel = '+ Reputación · + Presupuesto';
      }else{
        text = d.consequence.incorrect;
        deltaClass = 'neg';
        deltaLabel = '- Reputación';
      }

      return '' +
        Game.UI.statusBar(state, false) +
        '<h2 class="screen-title">RESPUESTA DE ' + d.characterName.toUpperCase() + '</h2>' +
        '<div class="panel dialogue">' +
          (npc ? Game.PixelArt.spriteHTML(npc.grid, npc.palette, 'width:72px;height:84px;flex:none;') : '') +
          '<div class="textbox">' +
            '<p>' + text + '</p>' +
            '<div class="result-delta ' + deltaClass + '">' + deltaLabel + '</div>' +
            '<button class="btn" style="margin-top:14px;" onclick="Game.Engine.goTo(\'finDia\',{caseId:\'' + caseId + '\'})">TERMINAR EL DÍA</button>' +
          '</div>' +
        '</div>';
    }
  });
})();
