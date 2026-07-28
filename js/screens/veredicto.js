(function(){
  window.Game = window.Game || {};

  Game.registerScreen('veredicto', {
    render: function(state, params){
      var caseId = params.caseId;
      var d = Game.Cases[caseId];
      var optionsHTML = d.candidates.map(function(cand){
        return '<button class="choice" onclick="Game.UI._submitVerdict(\'' + caseId + '\',\'' + cand.id + '\')">' + cand.name + '</button>';
      }).join('');

      var question = d.verdictQuestion || '¿Qué organismo identificás como responsable del caso?';

      return '' +
        Game.UI.statusBar(state, true, caseId) +
        '<h2 class="screen-title">INFORME DE DIAGNÓSTICO</h2>' +
        '<div class="panel">' +
          '<p style="margin-top:0;">' + question + '</p>' +
          optionsHTML +
        '</div>';
    }
  });

  Game.UI = Game.UI || {};
  Game.UI._submitVerdict = function(caseId, candidateId){
    Game.Engine.submitVerdict(caseId, candidateId);
    Game.Engine.goTo('consecuencia', { caseId: caseId });
  };
})();
