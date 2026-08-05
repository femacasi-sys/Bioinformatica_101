(function(){
  window.Game = window.Game || {};

  Game.registerScreen('decision', {
    render: function(state, params){
      var caseId = params.caseId;
      var d = Game.Cases[caseId];
      var npc = Game.Data.NPCS[d.characterKey];

      var optionsHTML = d.candidates.map(function(c){
        return '<button class="choice" onclick="Game.UI._submitDecision(\'' + caseId + '\',\'' + c.id + '\')">' + c.name + '</button>';
      }).join('');

      return '' +
        Game.UI.statusBar(caseId) +
        Game.UI.backButton() +
        '<h3 class="stage-label">ETAPA 5 · DECISIÓN FINAL</h3>' +
        '<div class="panel dialogue">' +
          (npc ? Game.PixelArt.spriteHTML(npc.grid, npc.palette, 'width:72px;height:84px;flex:none;') : '') +
          '<div class="textbox">' +
            '<span class="speaker">' + d.characterName.toUpperCase() + '</span>' +
            '<p>¿Entonces? ¿Qué debemos informar?</p>' +
            '<p style="color:#8fa2ad;font-size:16px;">' + d.decisionQuestion + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="panel">' + optionsHTML + '</div>';
    }
  });

  Game.UI = Game.UI || {};
  Game.UI._submitDecision = function(caseId, candidateId){
    Game.Engine.submitDecision(caseId, candidateId);
    Game.Engine.goTo('consecuencia', { caseId: caseId });
  };
})();
