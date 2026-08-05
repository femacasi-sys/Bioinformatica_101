(function(){
  window.Game = window.Game || {};
  Game.UI = Game.UI || {};

  Game.UI._renderBlockPipeline = function(state, params){
    var caseId   = params.caseId;
    var d        = Game.Cases[caseId];
    var progress = Game.Engine.getCaseProgress(caseId);
    var locked   = progress.blocks.allCorrect === true;
    var verified = !!progress.blocks.results && Object.keys(progress.blocks.results).length > 0;

    var poolById = {};
    d.blocks.pool.forEach(function(b){ poolById[b.id] = b; });

    var linesHTML = d.blocks.slots.map(function(slot){
      var placedId = progress.blocks.placed[slot.id];
      var placed   = placedId ? poolById[placedId] : null;
      var slotCls  = 'code-slot';
      if(locked){
        slotCls += ' correct locked';
      }else if(verified && progress.blocks.results[slot.id] === true){
        slotCls += ' correct';
      }else if(verified && progress.blocks.results[slot.id] === false){
        slotCls += ' incorrect';
      }
      var dropAttrs = locked ? '' :
        ' ondragover="Game.UI._blockDragOver(event)"' +
        ' ondragleave="Game.UI._blockDragLeave(event)"' +
        ' ondrop="Game.UI._blockDrop(event,\'' + caseId + '\',\'' + slot.id + '\')"';
      return '<div class="code-line">' +
        '<span class="code-fixed">' + slot.prefix + '</span>' +
        '<span class="' + slotCls + '" data-slot="' + slot.id + '"' + dropAttrs + '>' +
          (placed ? placed.label : '____________') +
        '</span>' +
        '<span class="code-fixed">' + slot.suffix + '</span>' +
      '</div>';
    }).join('');

    var fixedLineHTML = '<div class="code-line"><span class="code-fixed">' + d.blocks.fixedLine + '</span></div>';

    var poolHTML = locked ? '' :
      '<div class="block-pool">' +
        d.blocks.pool.map(function(b){
          return '<div class="code-block" draggable="true" data-block-id="' + b.id + '"' +
            ' ondragstart="Game.UI._blockDragStart(event)" ondragend="Game.UI._blockDragEnd(event)">' +
            b.label +
          '</div>';
        }).join('') +
      '</div>';

    var feedback = '';
    if(verified && !locked){
      feedback = '<p style="color:var(--alert);font-size:15px;margin:8px 0 0;">Hay bloques incorrectos o vacíos — revisá las líneas marcadas en rojo y volvé a verificar.</p>';
    }else if(locked){
      feedback = '<p style="color:var(--phosphor);font-size:15px;margin:8px 0 0;">Pipeline completo. Ejecutalo para continuar.</p>';
    }

    var verifyBtn = locked ? '' :
      '<button class="btn secondary" style="margin-top:10px;" onclick="Game.UI._verifyBlocks(\'' + caseId + '\')">VERIFICAR PIPELINE</button>';

    var canRun = Game.Engine.canRunCustomPipeline(caseId);
    var runPanel = locked ?
      '<div class="panel">' +
        '<button class="btn" id="run-btn" ' + (!canRun ? 'disabled' : '') + ' onclick="Game.UI._executeCustomPipeline(\'' + caseId + '\')">EJECUTAR PIPELINE</button>' +
        '<div class="run-log" id="run-log" style="display:none;">' +
          '<div id="run-log-text">Esperando ejecución...</div>' +
          '<div id="run-log-hint" style="color:#8fa2ad;font-size:13px;margin-top:4px;"></div>' +
          '<div class="progress-track"><div class="progress-fill" id="run-progress-fill"></div></div>' +
        '</div>' +
      '</div>' : '';

    return '' +
      Game.UI.statusBar(caseId) +
      Game.UI.backButton() +
      '<h3 class="stage-label">ETAPA 3 · CONSTRUCCIÓN DEL PIPELINE</h3>' +
      '<div class="panel">' +
        '<p style="margin-top:0;color:#8fa2ad;font-size:16px;">' + d.blocks.intro + '</p>' +
        '<div class="code-editor">' + linesHTML + fixedLineHTML + '</div>' +
        poolHTML +
        verifyBtn + feedback +
      '</div>' +
      runPanel;
  };

  Game.UI._blockDragStart = function(e){
    Game.UI._draggedBlockId = e.currentTarget.getAttribute('data-block-id');
    e.currentTarget.classList.add('dragging');
    if(e.dataTransfer){ e.dataTransfer.setData('text/plain', Game.UI._draggedBlockId); e.dataTransfer.effectAllowed = 'copy'; }
  };
  Game.UI._blockDragEnd = function(e){
    e.currentTarget.classList.remove('dragging');
  };
  Game.UI._blockDragOver = function(e){
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };
  Game.UI._blockDragLeave = function(e){
    e.currentTarget.classList.remove('drag-over');
  };
  Game.UI._blockDrop = function(e, caseId, slotId){
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if(!Game.UI._draggedBlockId) return;
    Game.Engine.placeBlock(caseId, slotId, Game.UI._draggedBlockId);
    Game.Engine.render();
  };

  Game.UI._verifyBlocks = function(caseId){
    Game.Engine.verifyBlocks(caseId);
    Game.Engine.render();
  };

  Game.UI._executeCustomPipeline = function(caseId){
    var d = Game.Cases[caseId];
    var btn = document.getElementById('run-btn');
    var log = document.getElementById('run-log');
    var logText = document.getElementById('run-log-text');
    var logHint = document.getElementById('run-log-hint');
    var fill = document.getElementById('run-progress-fill');
    if(btn) btn.disabled = true;
    if(log) log.style.display = 'block';

    var lines = d.blocks.execLines;
    lines.forEach(function(line, i){
      setTimeout(function(){
        if(logText) logText.textContent = line.text;
        if(logHint) logHint.textContent = line.hint || '';
        if(fill) fill.style.width = Math.round(((i + 1) / lines.length) * 100) + '%';
      }, i * 600);
    });

    setTimeout(function(){
      Game.Engine.runCustomPipeline(caseId);
      Game.Engine.goTo('alineamiento', { caseId: caseId });
    }, lines.length * 600 + 300);
  };
})();
