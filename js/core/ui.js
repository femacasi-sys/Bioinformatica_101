(function(){
  window.Game = window.Game || {};

  var UI = {
    statusBar: function(caseId){
      var progress = Game.Engine.getCaseProgress(caseId);
      return '<div class="statusbar">' +
        '<div class="chip">' + Game.PixelArt.iconHTML(Game.Data.ICONS.coin, 18) + ' ' + progress.credits + '</div>' +
        '<div class="chip">' + Game.PixelArt.iconHTML(Game.Data.ICONS.clock, 18) + ' ' + progress.hours + 'h</div>' +
        '<div class="chip push">Reputación ' + Game.Engine.state.reputation + '%</div>' +
      '</div>';
    },

    backButton: function(){
      return '<div class="nav-row"><a onclick="Game.Engine.goBack()">&larr; VOLVER</a></div>';
    },

    stars: function(count, max){
      max = max || 5;
      var out = '<span class="stars">';
      for(var i = 1; i <= max; i++){
        out += '<span class="' + (i <= count ? 'filled' : '') + '">' + (i <= count ? '★' : '☆') + '</span>';
      }
      return out + '</span>';
    }
  };

  Game.UI = UI;
})();
