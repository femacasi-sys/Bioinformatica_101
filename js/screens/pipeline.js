(function(){
  window.Game = window.Game || {};

  Game.registerScreen('pipeline', {
    render: function(state, params){
      var caseId = params.caseId;
      var d = Game.Cases[caseId];
      if(d.blocks) return Game.UI._renderBlockPipeline(state, params);
      var progress = Game.Engine.getCaseProgress(caseId);
      var stepsById = {};
      d.pipeline.steps.forEach(function(s){ stepsById[s.id] = s; });

      var orderIds = progress.pipeline.order || d.pipeline.initialOrder;
      var locked = progress.pipeline.orderCorrect === true;

      var feedback = '';
      if(progress.pipeline.orderCorrect === false){
        feedback = '<p style="color:var(--alert);font-size:15px;margin:8px 0 0;">Ese orden no es el correcto — se perdió 1 hora revisando la corrida fallida. Reordená las tarjetas e intentá de nuevo.</p>';
      }else if(locked){
        feedback = '<p style="color:var(--phosphor);font-size:15px;margin:8px 0 0;">Orden correcto. Elegí el parámetro para poder ejecutar el pipeline.</p>';
      }

      var stepsHTML = orderIds.map(function(id){
        var step = stepsById[id];
        var cls = locked ? ' locked-correct' : '';
        return '<li class="step-card' + cls + '" draggable="' + (!locked) + '" data-id="' + id + '"' +
          (locked ? '' :
            ' ondragstart="Game.UI._dragStart(event)"' +
            ' ondragover="Game.UI._dragOver(event)"' +
            ' ondragleave="Game.UI._dragLeave(event)"' +
            ' ondrop="Game.UI._dragDrop(event)"' +
            ' ondragend="Game.UI._dragEnd(event)"') +
          '><span class="drag-handle">⠿</span> ' + step.label + '</li>';
      }).join('');

      var verifyBtn = locked ? '' :
        '<button class="btn secondary" style="margin-top:10px;" onclick="Game.UI._verifyOrder(\'' + caseId + '\')">VERIFICAR ORDEN</button>';

      var paramPanel = '';
      if(locked){
        var paramCards = d.pipeline.params.options.map(function(o){
          var sel = progress.pipeline.paramId === o.id;
          return '<div class="param-card' + (sel ? ' selected' : '') + '" onclick="Game.UI._pickParam(\'' + caseId + '\',\'' + o.id + '\')">' +
            '<div class="param-value">' + o.value + '</div>' +
            '<div class="param-hint">' + o.hint + '</div>' +
          '</div>';
        }).join('');
        paramPanel =
          '<div class="panel">' +
            '<div class="seq-label" style="color:#8fa2ad;font-size:15px;">' + d.pipeline.params.label + '</div>' +
            '<div class="param-options">' + paramCards + '</div>' +
          '</div>';
      }

      var canRun = Game.Engine.canRunPipeline(caseId);
      var runPanel = locked ?
        '<div class="panel">' +
          '<button class="btn" id="run-btn" ' + (!canRun ? 'disabled' : '') + ' onclick="Game.UI._executePipeline(\'' + caseId + '\')">EJECUTAR PIPELINE</button>' +
          '<div class="run-log" id="run-log" style="display:none;">' +
            '<div id="run-log-text">Esperando ejecución...</div>' +
            '<div class="progress-track"><div class="progress-fill" id="run-progress-fill"></div></div>' +
          '</div>' +
        '</div>' : '';

      return '' +
        Game.UI.statusBar(caseId) +
        Game.UI.backButton() +
        '<h3 class="stage-label">ETAPA 3 · CONSTRUCCIÓN DEL PIPELINE</h3>' +
        '<div class="panel">' +
          '<p style="margin-top:0;color:#8fa2ad;font-size:16px;">Arrastrá las tarjetas para ordenar el pipeline de análisis.</p>' +
          '<ul class="pipeline-steps" id="pipeline-order-list">' + stepsHTML + '</ul>' +
          verifyBtn + feedback +
        '</div>' +
        paramPanel + runPanel;
    }
  });

  Game.UI = Game.UI || {};

  Game.UI._dragStart = function(e){
    Game.UI._draggedId = e.currentTarget.getAttribute('data-id');
    e.currentTarget.classList.add('dragging');
    if(e.dataTransfer){ e.dataTransfer.setData('text/plain', Game.UI._draggedId); e.dataTransfer.effectAllowed = 'move'; }
  };
  Game.UI._dragOver = function(e){
    e.preventDefault();
    var target = e.currentTarget;
    if(target.getAttribute('data-id') !== Game.UI._draggedId) target.classList.add('drag-over');
  };
  Game.UI._dragLeave = function(e){
    e.currentTarget.classList.remove('drag-over');
  };
  Game.UI._dragDrop = function(e){
    e.preventDefault();
    var target = e.currentTarget;
    target.classList.remove('drag-over');
    var list = document.getElementById('pipeline-order-list');
    var draggedEl = list.querySelector('[data-id="' + Game.UI._draggedId + '"]');
    if(!draggedEl || draggedEl === target) return;
    var items = Array.prototype.slice.call(list.children);
    var draggedIdx = items.indexOf(draggedEl);
    var targetIdx = items.indexOf(target);
    if(draggedIdx < targetIdx){
      list.insertBefore(draggedEl, target.nextSibling);
    }else{
      list.insertBefore(draggedEl, target);
    }
  };
  Game.UI._dragEnd = function(e){
    e.currentTarget.classList.remove('dragging');
    var list = document.getElementById('pipeline-order-list');
    if(list){
      Array.prototype.forEach.call(list.querySelectorAll('.step-card'), function(el){ el.classList.remove('drag-over'); });
    }
  };

  Game.UI._verifyOrder = function(caseId){
    var list = document.getElementById('pipeline-order-list');
    var orderIds = Array.prototype.map.call(list.querySelectorAll('.step-card'), function(el){ return el.getAttribute('data-id'); });
    Game.Engine.setPipelineOrder(caseId, orderIds);
    Game.Engine.render();
  };

  Game.UI._pickParam = function(caseId, paramId){
    Game.Engine.setPipelineParam(caseId, paramId);
    Game.Engine.render();
  };

  Game.UI._executePipeline = function(caseId){
    var btn = document.getElementById('run-btn');
    var log = document.getElementById('run-log');
    var logText = document.getElementById('run-log-text');
    var fill = document.getElementById('run-progress-fill');
    if(btn) btn.disabled = true;
    if(log) log.style.display = 'block';

    var lines = ['Loading pipeline...', 'Running análisis...', 'Finished.'];
    lines.forEach(function(line, i){
      setTimeout(function(){
        if(logText) logText.textContent = line;
        if(fill) fill.style.width = Math.round(((i + 1) / lines.length) * 100) + '%';
      }, i * 450);
    });

    setTimeout(function(){
      Game.Engine.runPipeline(caseId);
      Game.Engine.goTo('resultados', { caseId: caseId });
    }, lines.length * 450 + 250);
  };
})();
