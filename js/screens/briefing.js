(function(){
  window.Game = window.Game || {};

  function difficultyPips(level){
    var out = '';
    for(var i = 1; i <= 5; i++){ out += (i <= level ? '●' : '○'); }
    return out;
  }

  Game.registerScreen('briefing', {
    render: function(state, params){
      var caseId = params.caseId;
      var d = Game.Cases[caseId];
      var npc = Game.Data.NPCS[d.characterKey];

      var meta =
        '<div class="brief-meta">' +
          '<div class="brief-meta-item"><div class="brief-meta-label">Dificultad</div><div class="brief-meta-value difficulty">' + difficultyPips(d.difficulty) + '</div></div>' +
          '<div class="brief-meta-item"><div class="brief-meta-label">Tiempo disponible</div><div class="brief-meta-value">' + d.initialHours + 'h</div></div>' +
          '<div class="brief-meta-item"><div class="brief-meta-label">Créditos disponibles</div><div class="brief-meta-value">' + d.initialCredits + '</div></div>' +
          '<div class="brief-meta-item"><div class="brief-meta-label">Recompensa</div><div class="brief-meta-value" style="font-size:15px;">' + d.rewardLabel + '</div></div>' +
        '</div>';

      return '' +
        '<h2 class="screen-title">' + d.title.toUpperCase() + '</h2>' +
        '<div class="panel dialogue">' +
          (npc ? Game.PixelArt.spriteHTML(npc.grid, npc.palette, 'width:72px;height:84px;flex:none;') : '') +
          '<div class="textbox">' +
            '<span class="speaker">' + d.characterName.toUpperCase() + '</span>' +
            d.briefing.map(function(p){ return '<p>' + p + '</p>'; }).join('') +
            '<p style="color:#8fa2ad;font-size:16px;"><b>Objetivo:</b> ' + d.objective + '</p>' +
            meta +
            '<button class="btn" style="margin-top:14px;" onclick="Game.Engine.acceptCase(\'' + caseId + '\')">ACEPTAR CASO</button>' +
          '</div>' +
        '</div>';
    }
  });
})();
