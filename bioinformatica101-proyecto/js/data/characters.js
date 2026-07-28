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

  var SHAPE_LONG = [
    "............",
    "...hhhhhh...",
    "..hhhhhhhh..",
    ".hhhssssshh.",
    "hhssseesshh.",
    "hhssssssshh.",
    "hhssssssshh.",
    "hh.sssssss..",
    "hhccccccchh.",
    ".cccccaccc..",
    "cccccccccccc",
    "cccccccccccc",
    "............",
    "............"
  ];

  // ---- personajes no jugables (investigadores/as) ----
  Game.Data.NPCS = {
    directora: {
      name: 'Directora del laboratorio',
      grid: SHAPE_SHORT,
      palette: { h: '#c7cdd1', s: '#e8b98c', e: '#12181d', c: '#eef2ee', a: '#ffb627' }
    },
    microbiologa: {
      name: 'Dra. Marín · Microbióloga',
      grid: SHAPE_SHORT,
      palette: { h: '#3a2418', s: '#d9a878', e: '#12181d', c: '#eef2ee', a: '#2fb6a3' }
    },
    genetista: {
      name: 'Dr. Vega · Genetista',
      grid: SHAPE_SHORT,
      palette: { h: '#1a1a2e', s: '#f0c9a0', e: '#12181d', c: '#eef2ee', a: '#e94560' }
    },
    estructural: {
      name: 'Dra. Rojas · Ingeniería de proteínas',
      grid: SHAPE_LONG,
      palette: { h: '#4a1a5c', s: '#c98a5c', e: '#12181d', c: '#eef2ee', a: '#7ee3ff' }
    }
  };

  // ---- avatares jugables ----
  Game.Data.PLAYERS = [
    {
      id: 'alex',
      name: 'Alex',
      grid: SHAPE_SHORT,
      palette: { h: '#2b1c14', s: '#e8b98c', e: '#12181d', c: '#eef2ee', a: '#ffb627' }
    },
    {
      id: 'sam',
      name: 'Sam',
      grid: SHAPE_SHORT,
      palette: { h: '#d9b45c', s: '#f2d3ae', e: '#12181d', c: '#eef2ee', a: '#2fb6a3' }
    },
    {
      id: 'rio',
      name: 'Rio',
      grid: SHAPE_SHORT,
      palette: { h: '#141414', s: '#c98a5c', e: '#12181d', c: '#eef2ee', a: '#c96bd9' }
    },
    {
      id: 'noa',
      name: 'Noa',
      grid: SHAPE_LONG,
      palette: { h: '#8a3324', s: '#f2d3ae', e: '#12181d', c: '#eef2ee', a: '#4d8dff' }
    }
  ];
})();
