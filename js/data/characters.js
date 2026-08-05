(function(){
  window.Game = window.Game || {};
  Game.Data = Game.Data || {};

  var SHAPE_SHORT = [
    "............",
    "...hhhhhh...",
    "..hhhhhhhh..",
    ".hhhssssshh.",
    ".hssseesshh.",
    ".hssssssshh.",
    ".hssssssshh.",
    "..sssssss...",
    ".ccccccccc..",
    ".cccccaccc..",
    "cccccccccccc",
    "cccccccccccc",
    "............",
    "............"
  ];

  Game.Data.NPCS = {
    microbiologa: {
      name: 'Dra. Marín · Microbióloga',
      grid: SHAPE_SHORT,
      palette: { h: '#3a2418', s: '#d9a878', e: '#12181d', c: '#eef2ee', a: '#2fb6a3' }
    },
    genetista: {
      name: 'Dr. Vega · Genetista',
      grid: SHAPE_SHORT,
      palette: { h: '#1a1a2e', s: '#f0c9a0', e: '#12181d', c: '#eef2ee', a: '#e94560' }
    }
  };
})();
