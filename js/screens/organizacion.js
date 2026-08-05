(function(){
  window.Game = window.Game || {};

  var GROUP_LABELS = { control: 'Control (sanos)', crohn: 'Crohn (activa)' };

  Game.registerScreen('organizacion', {
    render: function(state, params){
      var caseId   = params.caseId;
      var d        = Game.Cases[caseId];
      var progress = Game.Engine.getCaseProgress(caseId);
      var locked   = progress.organizacion.allCorrect === true;
      var verified = !!progress.organizacion.results && Object.keys(progress.organizacion.results).length > 0;

      function chipHTML(sample){
        var cls = 'sort-chip';
        if(locked){
          cls += ' correct locked';
        }else if(verified && progress.organizacion.results[sample.id] === true){
          cls += ' correct';
        }else if(verified && progress.organizacion.results[sample.id] === false){
          cls += ' incorrect';
        }
        var dragAttrs = locked ? '' :
          ' draggable="true" ondragstart="Game.UI._sortDragStart(event)" ondragend="Game.UI._sortDragEnd(event)"';
        return '<div class="' + cls + '" data-sample-id="' + sample.id + '"' + dragAttrs + '>' +
          '<div class="pick-title">' + sample.label + '</div>' +
          '<div class="pick-sub">' + sample.desc + '</div>' +
        '</div>';
      }

      var unplaced = d.microbiome.samples.filter(function(s){ return !progress.organizacion.placed[s.id]; });
      var poolHTML = (locked || unplaced.length === 0) ? '' :
        '<div class="panel">' +
          '<div class="seq-label" style="color:#8fa2ad;font-size:15px;">Muestras sin clasificar</div>' +
          '<div class="sort-pool">' + unplaced.map(chipHTML).join('') + '</div>' +
        '</div>';

      function bucketHTML(groupId){
        var items = d.microbiome.samples.filter(function(s){ return progress.organizacion.placed[s.id] === groupId; });
        var dropAttrs = locked ? '' :
          ' ondragover="Game.UI._sortDragOver(event)"' +
          ' ondragleave="Game.UI._sortDragLeave(event)"' +
          ' ondrop="Game.UI._sortDrop(event,\'' + caseId + '\',\'' + groupId + '\')"';
        return '<div class="sort-bucket" data-group="' + groupId + '"' + dropAttrs + '>' +
          '<div class="seq-label" style="color:#8fa2ad;font-size:15px;">' + GROUP_LABELS[groupId] + '</div>' +
          items.map(chipHTML).join('') +
        '</div>';
      }

      var feedback = '';
      if(verified && !locked){
        feedback = '<p style="color:var(--alert);font-size:15px;margin:8px 0 0;">Hay muestras mal clasificadas o sin ubicar — revisá los bordes en rojo y volvé a verificar.</p>';
      }else if(locked){
        feedback = '<p style="color:var(--phosphor);font-size:15px;margin:8px 0 0;">Organización correcta. Elegí el primer análisis para continuar.</p>';
      }

      var verifyBtn = locked ? '' :
        '<button class="btn secondary" style="margin-top:10px;" onclick="Game.UI._verifySorting(\'' + caseId + '\')">VERIFICAR ORGANIZACIÓN</button>';

      var analysisPanel = '';
      if(locked){
        var cards = d.microbiome.analysisOptions.map(function(o){
          var sel = progress.organizacion.firstAnalysis === o.id;
          return '<div class="param-card' + (sel ? ' selected' : '') + '" onclick="Game.UI._setFirstAnalysis(\'' + caseId + '\',\'' + o.id + '\')">' +
            '<div class="param-value">' + o.label + '</div>' +
            '<div class="param-hint">' + o.hint + '</div>' +
          '</div>';
        }).join('');
        analysisPanel =
          '<div class="panel">' +
            '<div class="seq-label" style="color:#8fa2ad;font-size:15px;">¿Qué análisis corrés primero?</div>' +
            '<div class="param-options">' + cards + '</div>' +
          '</div>';
      }

      var canAdvance = Game.Engine.canAdvanceOrganizacion(caseId);
      var advanceBtn = locked ?
        '<button class="btn" ' + (!canAdvance ? 'disabled' : '') +
          ' onclick="Game.Engine.goTo(\'dashboard\',{caseId:\'' + caseId + '\'})">CONTINUAR AL DASHBOARD</button>' : '';

      return '' +
        Game.UI.statusBar(caseId) +
        Game.UI.backButton() +
        '<h3 class="stage-label">ETAPA 2 · ORGANIZACIÓN DEL ESTUDIO</h3>' +
        '<div class="panel">' +
          '<p style="margin-top:0;color:#8fa2ad;font-size:16px;">Arrastrá cada muestra al grupo correspondiente antes de correr cualquier análisis comparativo.</p>' +
        '</div>' +
        poolHTML +
        '<div class="sort-board">' + bucketHTML('control') + bucketHTML('crohn') + '</div>' +
        '<div class="panel">' + verifyBtn + feedback + '</div>' +
        analysisPanel +
        advanceBtn;
    }
  });

  Game.UI = Game.UI || {};

  Game.UI._sortDragStart = function(e){
    Game.UI._draggedSampleId = e.currentTarget.getAttribute('data-sample-id');
    e.currentTarget.classList.add('dragging');
    if(e.dataTransfer){ e.dataTransfer.setData('text/plain', Game.UI._draggedSampleId); e.dataTransfer.effectAllowed = 'move'; }
  };
  Game.UI._sortDragEnd = function(e){
    e.currentTarget.classList.remove('dragging');
  };
  Game.UI._sortDragOver = function(e){
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };
  Game.UI._sortDragLeave = function(e){
    e.currentTarget.classList.remove('drag-over');
  };
  Game.UI._sortDrop = function(e, caseId, groupId){
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if(!Game.UI._draggedSampleId) return;
    Game.Engine.placeSample(caseId, Game.UI._draggedSampleId, groupId);
    Game.Engine.render();
  };

  Game.UI._verifySorting = function(caseId){
    Game.Engine.verifySorting(caseId);
    Game.Engine.render();
  };

  Game.UI._setFirstAnalysis = function(caseId, analysisId){
    Game.Engine.setFirstAnalysis(caseId, analysisId);
    Game.Engine.render();
  };
})();
