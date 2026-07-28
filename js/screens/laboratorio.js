(function(){
  window.Game = window.Game || {};

  var PARAM_INFO = {
    identidad: {
      label: '% Identidad',
      text: 'Porcentaje de nucleótidos idénticos entre tu secuencia query y el hit de la base de datos. Para genes housekeeping como el 16S rRNA, un valor ≥97% indica la misma especie; entre 95-97% apunta al mismo género. Por debajo de 90% la coincidencia es distante y poco confiable para identificación.'
    },
    cobertura: {
      label: 'Cobertura (Query cover)',
      text: 'Porcentaje de la secuencia query que está cubierta por el alineamiento. Un 100% indica que toda tu secuencia fue alineada con el hit. Coberturas menores al 80% pueden señalar alineamientos parciales o fragmentos no representativos, lo que reduce la confianza en el resultado.'
    },
    score: {
      label: 'Score (bits)',
      text: 'Puntuación del alineamiento expresada en bits. Mide la calidad total del alineamiento y está normalizada para poder comparar entre búsquedas en bases de datos de distinto tamaño. A mayor score, mejor y más confiable la coincidencia encontrada.'
    },
    evalue: {
      label: 'E-value',
      text: 'Valor esperado: indica cuántos alineamientos similares o mejores se esperarían encontrar solo por azar en una base de datos del tamaño usado. Valores cercanos a 0 (como 0.0 o 1e-100) indican coincidencias altamente significativas. Valores por encima de 0.01 no son confiables para identificación de especies.'
    },
    accession: {
      label: 'Accession',
      text: 'Identificador único de la secuencia de referencia en el repositorio GenBank/RefSeq del NCBI. Con este código podés recuperar el registro completo: la secuencia original, sus anotaciones funcionales, el organismo de origen y los autores que lo depositaron.'
    }
  };

  var PARAM_KEYS = ['identidad','cobertura','score','evalue','accession'];

  Game.registerScreen('laboratorio', {
    render: function(state, params){
      var d = Game.Cases[params.caseId];
      if(d && d.labRender) return d.labRender(state, params);

      var caseId  = params.caseId;
      var d       = Game.Cases[caseId];
      var progress = Game.Engine.getCaseProgress(caseId);
      var hoursLeft = d.maxHours - progress.hoursUsed;

      var quickTool = d.tools.filter(function(t){ return t.id === 'quick'; })[0];
      var fullTool  = d.tools.filter(function(t){ return t.id === 'full';  })[0];
      var quickUsed = progress.toolsRun.indexOf('quick') !== -1;
      var fullUsed  = progress.toolsRun.indexOf('full')  !== -1;
      var canQuick  = !quickUsed && state.budget >= quickTool.costBudget && hoursLeft >= quickTool.costHours;
      var canFull   = !fullUsed  && state.budget >= fullTool.costBudget  && hoursLeft >= fullTool.costHours;

      // ---- Panel: secuencia ----
      var seqPanel =
        '<div class="panel">' +
          '<div class="seq-label">' + d.sampleLabel + '</div>' +
          '<div class="terminal" id="seq-box">' + d.sampleData + '</div>' +
          '<button id="copy-seq-btn" class="btn secondary" onclick="Game.UI._copySeq()">COPIAR SECUENCIA</button>' +
        '</div>';

      // ---- Panel: BLAST ----
      var timeWarning = hoursLeft <= 0
        ? '<p style="color:var(--alert);margin-top:10px;">Sin tiempo disponible para nuevas búsquedas.</p>'
        : '';

      var blastPanel =
        '<div class="panel blast-panel">' +
          '<div class="blast-header">BLAST — Basic Local Alignment Search Tool</div>' +
          '<label class="blast-label">Pegar secuencia FASTA:</label>' +
          '<textarea id="blast-input" class="blast-textarea" rows="5" ' +
            'placeholder="Copiá la secuencia del panel de arriba y pegala aquí..."></textarea>' +
          '<div class="blast-db-subtitle">Seleccioná la base de datos:</div>' +
          '<div class="blast-db-row">' +
            '<div class="blast-db-card' + (quickUsed ? ' db-used' : '') + '">' +
              '<div class="blast-db-name">Base de datos local</div>' +
              '<div class="blast-db-desc">Secuencias curadas del laboratorio · Rápida y económica</div>' +
              '<div class="blast-db-cost">' + quickTool.costBudget + ' créditos · ' + quickTool.costHours + 'h</div>' +
              '<button class="btn secondary" ' + (!canQuick ? 'disabled' : '') +
                ' onclick="Game.UI._runBlast(\'' + caseId + '\',\'quick\')">' +
                (quickUsed ? 'YA EJECUTADA' : 'BUSCAR') +
              '</button>' +
            '</div>' +
            '<div class="blast-db-card' + (fullUsed ? ' db-used' : '') + '">' +
              '<div class="blast-db-name">NCBI — Nucleotide (nt)</div>' +
              '<div class="blast-db-desc">Base de datos completa de referencia · Amplia y exhaustiva</div>' +
              '<div class="blast-db-cost">' + fullTool.costBudget + ' créditos · ' + fullTool.costHours + 'h</div>' +
              '<button class="btn" ' + (!canFull ? 'disabled' : '') +
                ' onclick="Game.UI._runBlast(\'' + caseId + '\',\'full\')">' +
                (fullUsed ? 'YA EJECUTADA' : 'BUSCAR') +
              '</button>' +
            '</div>' +
          '</div>' +
          timeWarning +
        '</div>';

      // ---- Resultados ----
      var resultsHTML = '';
      if(progress.toolsRun.length){
        resultsHTML += '<h2 class="screen-title" style="font-size:10px;margin-top:18px;">RESULTADOS BLAST</h2>';

        progress.toolsRun.forEach(function(toolId){
          var rows    = d.results[toolId];
          var dbLabel = toolId === 'quick' ? 'Base de datos local' : 'NCBI — Nucleotide (nt)';

          var infoBtns = PARAM_KEYS.map(function(k){
            return '<button class="btn-info" onclick="Game.UI._toggleInfo(\'' + toolId + '_' + k + '\')">' +
              PARAM_INFO[k].label + ' [?]' +
            '</button>';
          }).join('');

          var infoBoxes = PARAM_KEYS.map(function(k){
            return '<div id="info_' + toolId + '_' + k + '" class="info-box" style="display:none;">' +
              '<span class="info-box-title">' + PARAM_INFO[k].label + '</span>' +
              PARAM_INFO[k].text +
            '</div>';
          }).join('');

          var tableRows = rows.map(function(r){
            return '<tr>' +
              '<td' + (r.main ? ' class="hit-main"' : '') + '>' + r.organismo + '</td>' +
              '<td class="cell-accession">' + r.accession + '</td>' +
              '<td>' + r.identidad + '%</td>' +
              '<td>' + r.cobertura + '%</td>' +
              '<td>' + r.score + '</td>' +
              '<td>' + r.evalue + '</td>' +
            '</tr>';
          }).join('');

          resultsHTML +=
            '<div class="panel result-block">' +
              '<div class="result-db-label">' + dbLabel + '</div>' +
              '<div class="info-btn-row">' + infoBtns + '</div>' +
              infoBoxes +
              '<div style="overflow-x:auto;">' +
                '<table class="results">' +
                  '<thead><tr>' +
                    '<th>Organismo</th>' +
                    '<th>Accession</th>' +
                    '<th>% Ident.</th>' +
                    '<th>Cobertura</th>' +
                    '<th>Score</th>' +
                    '<th>E-value</th>' +
                  '</tr></thead>' +
                  '<tbody>' + tableRows + '</tbody>' +
                '</table>' +
              '</div>' +
            '</div>';
        });
      }

      return '' +
        Game.UI.statusBar(state, true, caseId) +
        '<h2 class="screen-title">PANEL DE ANÁLISIS</h2>' +
        seqPanel +
        blastPanel +
        resultsHTML +
        '<button class="btn" onclick="Game.Engine.goTo(\'veredicto\',{caseId:\'' + caseId + '\'})">PASAR A DIAGNÓSTICO</button>';
    }
  });

  // ---- helpers de UI específicos de esta pantalla ----
  Game.UI = Game.UI || {};

  Game.UI._copySeq = function(){
    var box  = document.getElementById('seq-box');
    var btn  = document.getElementById('copy-seq-btn');
    var text = box ? box.textContent : '';

    var done = function(){
      if(btn){
        btn.textContent = 'COPIADA!';
        setTimeout(function(){ btn.textContent = 'COPIAR SECUENCIA'; }, 2000);
      }
    };

    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(done).catch(function(){
        Game.UI._fallbackCopy(text); done();
      });
    } else {
      Game.UI._fallbackCopy(text); done();
    }
  };

  Game.UI._fallbackCopy = function(text){
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    try{ document.execCommand('copy'); }catch(e){}
    document.body.removeChild(ta);
  };

  Game.UI._runBlast = function(caseId, toolId){
    var input = document.getElementById('blast-input');
    var text  = input ? input.value.trim() : '';

    if(!text){
      alert('Primero copiá la secuencia del panel de arriba y pegala en el campo de texto.');
      return;
    }
    var seqOnly = text.replace(/^>.*$/mg, '').replace(/\s+/g, '').toUpperCase();
    if(!seqOnly || !/^[ATGCNRYSWKMBDHV-]+$/.test(seqOnly)){
      alert('La secuencia no parece válida. Copiá el texto completo en formato FASTA (incluyendo la línea que empieza con ">").');
      return;
    }

    var ok = Game.Engine.runTool(caseId, toolId);
    if(!ok){
      alert('No tenés suficientes créditos u horas para ejecutar esta búsqueda.');
      return;
    }
    Game.Engine.goTo('laboratorio', { caseId: caseId });
  };

  Game.UI._toggleInfo = function(id){
    var el = document.getElementById('info_' + id);
    if(el) el.style.display = (el.style.display === 'none' ? 'block' : 'none');
  };

})();
