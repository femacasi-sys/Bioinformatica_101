(function(){
  window.Game = window.Game || {};

  var UI = {
    _selectedCharacter: null,

    statusBar: function(state, showHours, caseId){
      var hoursHTML = '';
      if(showHours && caseId){
        var caseData = Game.Cases[caseId];
        var progress = Game.Engine.getCaseProgress(caseId);
        var hoursLeft = Math.max(caseData.maxHours - progress.hoursUsed, 0);
        hoursHTML = '<div class="chip">' + Game.PixelArt.iconHTML(Game.Data.ICONS.clock, 18) + ' ' + hoursLeft + 'h restantes</div>';
      }
      return '<div class="statusbar">' +
        '<div class="chip">' + Game.PixelArt.iconHTML(Game.Data.ICONS.coin, 18) + ' ' + state.budget + '</div>' +
        hoursHTML +
        '<div class="chip push">Día ' + state.day + '</div>' +
        '</div>';
    },

    selectCharacter: function(id){
      this._selectedCharacter = id;
      var cards = document.querySelectorAll('.char-card');
      cards.forEach(function(c){
        c.classList.toggle('selected', c.getAttribute('data-id') === id);
      });
    },

    confirmCharacter: function(){
      if(!this._selectedCharacter){
        alert('Elegí un avatar antes de continuar.');
        return;
      }
      var char = Game.Data.PLAYERS.filter(function(p){ return p.id === Game.UI._selectedCharacter; })[0];
      Game.Engine.state.player = { name: char.name, characterId: this._selectedCharacter };
      Game.Engine.save();
      this._selectedCharacter = null;
      Game.Engine.goTo('hub');
    }
  };

  Game.UI = UI;
})();
