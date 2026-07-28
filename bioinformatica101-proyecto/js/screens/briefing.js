(function(){
  window.Game = window.Game || {};

  Game.registerScreen('briefing', {
    render: function(state, params){
      var caseId = params.caseId;
      var d = Game.Cases[caseId];
      var npc = Game.Data.NPCS[d.characterKey];

      return '' +
        Game.UI.statusBar(state, true, caseId) +
        '<h2 class="screen-title">' + d.title.toUpperCase() + '</h2>' +
        '<div class="panel dialogue">' +
          (npc ? Game.PixelArt.spriteHTML(npc.grid, npc.palette, 'width:72px;height:84px;flex:none;') : '') +
          '<div class="textbox">' +
            '<span class="speaker">' + d.characterName.toUpperCase() + '</span>' +
            d.briefing.map(function(p){ return '<p>' + p + '</p>'; }).join('') +
            '<button class="btn" onclick="Game.Engine.goTo(\'laboratorio\',{caseId:\'' + caseId + '\'})">IR AL LABORATORIO</button>' +
          '</div>' +
        '</div>';
    }
  });
})();
