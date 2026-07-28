(function(){
  window.Game = window.Game || {};
  Game.Data = Game.Data || {};

  Game.Data.ICONS = {
    coin: {
      grid: [
        "........",
        "..oooo..",
        ".oyyyyo.",
        "oyyyyyyo",
        "oyyyyyyo",
        ".oyyyyo.",
        "..oooo..",
        "........"
      ],
      palette: { o: '#8a6a10', y: '#ffb627' }
    },
    clock: {
      grid: [
        "oooooooo",
        "o.aaaa.o",
        "o..aa..o",
        "o.a..a.o",
        "o.a..a.o",
        "o..aa..o",
        "o.aaaa.o",
        "oooooooo"
      ],
      palette: { o: '#8fa2ad', a: '#4dff9f' }
    },
    flask: {
      grid: [
        "..oo....",
        "..oo....",
        "..oo....",
        ".oooo...",
        "o....o..",
        "o.gg.o..",
        "o.gg.o..",
        "o.gg.o..",
        ".oooo...",
        "........"
      ],
      palette: { o: '#8fa2ad', g: '#4dff9f' }
    }
  };
})();
