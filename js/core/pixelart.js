(function(){
  window.Game = window.Game || {};

  function svgFromGrid(grid, palette, extraStyle){
    var rows = grid.length, cols = grid[0].length;
    var rects = '';
    for(var r = 0; r < rows; r++){
      var row = grid[r];
      for(var c = 0; c < cols; c++){
        var ch = row[c];
        if(!ch || ch === '.') continue;
        var color = palette[ch];
        if(!color) continue;
        rects += '<rect x="' + c + '" y="' + r + '" width="1" height="1" fill="' + color + '"/>';
      }
    }
    return '<svg viewBox="0 0 ' + cols + ' ' + rows + '" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;width:100%;height:100%;' + (extraStyle || '') + '">' + rects + '</svg>';
  }

  function spriteHTML(grid, palette, boxStyle){
    return '<div style="' + (boxStyle || '') + '">' + svgFromGrid(grid, palette) + '</div>';
  }

  function iconHTML(iconDef, size){
    if(!iconDef) return '';
    return svgFromGrid(iconDef.grid, iconDef.palette, 'width:' + size + 'px;height:' + size + 'px;');
  }

  Game.PixelArt = {
    svgFromGrid: svgFromGrid,
    spriteHTML: spriteHTML,
    iconHTML: iconHTML
  };
})();
