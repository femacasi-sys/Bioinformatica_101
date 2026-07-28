(function(){
  window.Game = window.Game || {};

  Game.registerScreen('creacionPersonaje', {
    render: function(state, params){
      var cardsHTML = Game.Data.PLAYERS.map(function(p){
        return '<div class="char-card" data-id="' + p.id + '" onclick="Game.UI.selectCharacter(\'' + p.id + '\')">' +
          Game.PixelArt.spriteHTML(p.grid, p.palette, 'width:64px;height:74px;margin:0 auto;') +
          '<div style="text-align:center;margin-top:6px;">' + p.name + '</div>' +
        '</div>';
      }).join('');

      return '' +
        '<h2 class="screen-title">CREÁ TU PERSONAJE</h2>' +
        '<div class="panel">' +
          '<label style="display:block;margin-bottom:8px;">Elegí tu avatar:</label>' +
          '<div id="charGrid" class="char-grid">' + cardsHTML + '</div>' +
          '<button class="btn" style="margin-top:16px;" onclick="Game.UI.confirmCharacter()">CONFIRMAR</button>' +
        '</div>';
    },
    mount: function(state, params){
      Game.UI._selectedCharacter = null;
    }
  });
})();
