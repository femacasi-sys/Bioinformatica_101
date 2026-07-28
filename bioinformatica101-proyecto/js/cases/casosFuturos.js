(function(){
  window.Game = window.Game || {};

  // Casos todavía no implementados: alcanza con id, title y characterName
  // para que el hub los muestre en la ruta de progresión.
  // Cuando se implementen, agregar el resto de los campos (como en caso1.js)
  // y cambiar implemented a true.

  var stubs = [
    { id: 'caso6', title: 'Evolución viral en un brote', characterName: 'Biólogo/a evolutivo/a' },
    { id: 'caso7', title: 'Biomarcadores de cáncer', characterName: 'Médica' },
    { id: 'caso8', title: 'Código de barras de ADN', characterName: 'Biólogo/a evolutivo/a' },
    { id: 'caso9', title: 'Genomas de cultivos', characterName: 'Agrónomo/a' },
    { id: 'caso10', title: 'Muestra ambiental', characterName: 'Microbiólogo/a' },
    { id: 'caso11', title: 'Caso integrador final', characterName: 'Todo el equipo' }
  ];

  stubs.forEach(function(s){
    Game.registerCase({
      id: s.id,
      implemented: false,
      characterKey: null,
      characterName: s.characterName,
      title: s.title
    });
  });
})();
