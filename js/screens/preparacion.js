(function(){
  window.Game = window.Game || {};

  Game.registerScreen('preparacion', {
    render: function(state, params){
      var caseId = params.caseId;
      var d = Game.Cases[caseId];
      var progress = Game.Engine.getCaseProgress(caseId);
      var openObj = params.openObj || null;

      var iconsHTML = d.desktop.objects.map(function(o){
        var done = progress.desktop.opened.indexOf(o.id) !== -1;
        return '<div class="desktop-icon' + (done ? ' done' : '') + '" onclick="Game.UI._openObject(\'' + caseId + '\',\'' + o.id + '\')">' +
          (done ? '<span class="check">✓</span>' : '') +
          '<span class="emoji">' + o.emoji + '</span>' +
          '<span class="obj-name">' + o.label + (o.required ? '' : ' <span style="color:#5c6b74;">(opcional)</span>') + '</span>' +
        '</div>';
      }).join('');

      var openContent = '';
      if(openObj){
        var obj = d.desktop.objects.filter(function(o){ return o.id === openObj; })[0];
        if(obj){
          openContent = '<div class="panel">' +
            '<div class="seq-label" style="color:#8fa2ad;font-size:15px;margin-bottom:8px;">' + obj.label + '</div>' +
            '<div class="terminal">' + obj.content + '</div>' +
          '</div>';
        }
      }

      var checklist = '<div class="checklist">' +
        d.desktop.objects.filter(function(o){ return o.required; }).map(function(o){
          var ok = progress.desktop.opened.indexOf(o.id) !== -1;
          return '<div class="item' + (ok ? ' ok' : '') + '">' + (ok ? '✓' : '○') + ' ' + o.label + '</div>';
        }).join('') +
        '<div class="item' + (progress.desktop.sampleId && d.desktop.samples.filter(function(s){return s.id===progress.desktop.sampleId;})[0].correct ? ' ok' : '') + '">' +
          (progress.desktop.sampleId && d.desktop.samples.filter(function(s){return s.id===progress.desktop.sampleId;})[0].correct ? '✓' : '○') + ' Muestra correcta seleccionada</div>' +
        '<div class="item' + (progress.desktop.toolId && d.desktop.tools.filter(function(t){return t.id===progress.desktop.toolId;})[0].correct ? ' ok' : '') + '">' +
          (progress.desktop.toolId && d.desktop.tools.filter(function(t){return t.id===progress.desktop.toolId;})[0].correct ? '✓' : '○') + ' Herramienta correcta elegida</div>' +
      '</div>';

      var samplesHTML = '<div class="sample-row">' + d.desktop.samples.map(function(s){
        var picked = progress.desktop.sampleId === s.id;
        var cls = picked ? (s.correct ? ' correct-picked' : ' wrong') : '';
        return '<div class="pick-card' + cls + '" onclick="Game.UI._pickSample(\'' + caseId + '\',\'' + s.id + '\')">' +
          '<div class="pick-title">' + s.label + '</div>' +
          '<div class="pick-sub">' + s.sub + '</div>' +
        '</div>';
      }).join('') + '</div>';

      var toolsHTML = '<div class="tool-row">' + d.desktop.tools.map(function(t){
        var picked = progress.desktop.toolId === t.id;
        var cls = picked ? (t.correct ? ' correct-picked' : ' wrong') : '';
        return '<div class="pick-card' + cls + '" onclick="Game.UI._pickTool(\'' + caseId + '\',\'' + t.id + '\')">' +
          '<div class="pick-title">' + t.label + '</div>' +
          '<div class="pick-sub">' + t.sub + '</div>' +
        '</div>';
      }).join('') + '</div>';

      var canAdvance = Game.Engine.canAdvancePreparacion(caseId);

      return '' +
        Game.UI.statusBar(caseId) +
        Game.UI.backButton() +
        '<h3 class="stage-label">ETAPA 2 · PREPARACIÓN DEL ANÁLISIS</h3>' +
        '<div class="panel">' +
          '<p style="margin-top:0;color:#8fa2ad;font-size:16px;">Explorá el escritorio antes de avanzar. Elegir mal una muestra o una herramienta no termina el caso, pero cuesta tiempo o créditos.</p>' +
          '<div class="desktop-grid">' + iconsHTML + '</div>' +
        '</div>' +
        openContent +
        '<div class="panel">' +
          '<div class="seq-label" style="color:#8fa2ad;font-size:15px;">Elegí la muestra a analizar</div>' +
          samplesHTML +
        '</div>' +
        '<div class="panel">' +
          '<div class="seq-label" style="color:#8fa2ad;font-size:15px;">Elegí la herramienta a usar</div>' +
          toolsHTML +
        '</div>' +
        '<div class="panel">' +
          checklist +
          '<button class="btn" style="margin-top:12px;" ' + (!canAdvance ? 'disabled' : '') +
            ' onclick="Game.Engine.goToPipeline(\'' + caseId + '\')">CONTINUAR AL PIPELINE</button>' +
        '</div>';
    }
  });

  Game.UI = Game.UI || {};
  Game.UI._openObject = function(caseId, objId){
    Game.Engine.openObject(caseId, objId);
    Game.Engine.currentParams.openObj = objId;
    Game.Engine.render();
  };
  Game.UI._pickSample = function(caseId, sampleId){
    Game.Engine.pickSample(caseId, sampleId);
    Game.Engine.render();
  };
  Game.UI._pickTool = function(caseId, toolId){
    Game.Engine.pickTool(caseId, toolId);
    Game.Engine.render();
  };
})();
