(function(){
  window.Game = window.Game || {};

  var PARAM_INFO_RES = {
    mecanismo: {
      label: 'Mecanismo de resistencia',
      text: 'Cómo la enzima inactiva al antibiótico. Las betalactamasas hidrolizan el anillo betalactámico común a penicilinas, cefalosporinas y carbapenems. Se clasifican según el esquema de Ambler: clase A y D son serín-betalactamasas (inhibibles por avibactam); clase B son metalo-betalactamasas dependientes de zinc (NO inhibibles por avibactam) — la diferencia determina qué antibiótico de rescate funciona.'
    },
    clase: {
      label: 'Clase / espectro afectado',
      text: 'Familia de antibióticos que la enzima inactiva. Una betalactamasa de espectro estrecho (ej. TEM-1) solo afecta penicilinas. Una BLEE (betalactamasa de espectro extendido, ej. CTX-M-15) afecta también cefalosporinas. Una carbapenemasa (KPC, OXA-48, NDM-1) afecta además a los carbapenems, la última línea de betalactámicos — de ahí la urgencia clínica de distinguirlas.'
    },
    identidad: {
      label: '% Identidad',
      text: 'Porcentaje de nucleótidos idénticos entre la secuencia del aislado y el gen de referencia en la base de resistencia. Identidades ≥95% frente a un alelo conocido permiten asignar la variante específica (ej. KPC-3 y no KPC-2). Identidades más bajas frente a otras familias sirven para descartarlas como mecanismo principal.'
    },
    cobertura: {
      label: 'Cobertura',
      text: 'Porcentaje del gen de referencia cubierto por el alineamiento. Una cobertura completa (~100%) indica que se recuperó el gen entero, necesario para confirmar que la enzima es funcional y no un fragmento truncado o un pseudogen inactivo.'
    },
    evalue: {
      label: 'E-value',
      text: 'Probabilidad de obtener ese alineamiento por azar. Valores cercanos a 0 indican una coincidencia altamente significativa. Es el mismo criterio estadístico que en BLAST estándar: cuanto menor el E-value, más confiable la asignación del gen de resistencia.'
    }
  };
  var PARAM_KEYS_RES = ['mecanismo', 'clase', 'identidad', 'cobertura', 'evalue'];

  Game.registerCase({
    id: 'caso4',
    implemented: true,
    characterKey: 'microbiologa',
    characterName: 'Dra. Marín · Microbióloga',
    title: 'Resistencia a antibióticos en un aislado hospitalario',
    briefing: [
      "Un paciente en la UCI lleva cinco días con una infección por Klebsiella pneumoniae que no responde a meropenem, un carbapenem de última línea. El equipo clínico sospecha un mecanismo de resistencia transmisible y no puede seguir perdiendo tiempo con un antibiótico que no funciona.",
      "Extrajimos el gen sospechoso del aislado bacteriano. Buscalo contra las bases de datos de resistencia y decime qué enzima está inactivando el antibiótico — de esa identificación depende si el próximo esquema de tratamiento funciona."
    ],
    sampleLabel: 'aislado_kpn_uci_gen.fasta',
    sampleData: ">aislado_KPN_UCI_gen_resistencia\nATGTCACTGTATCGCCGTCTAGTTCTGCGCAGTGCTGCTGAGTTTCGCT\nGACGGCCTGCAAGAAGACAACGGGAGCAAGATCACCGTGAAGCAGTTGC\nTGGATCACGCGAGCGGCAAGGCGATGCTGGCCGTGGCCGAGATGCCACT",
    maxHours: 6,
    tools: [
      { id: 'quick', name: 'Base de datos local (ResFinder)',           costBudget: 50,  costHours: 1 },
      { id: 'full',  name: 'CARD — Comprehensive Antibiotic Resistance Database (NCBI)', costBudget: 150, costHours: 3 }
    ],
    results: {
      quick: [
        { gen: 'blaKPC-3',   mecanismo: 'Carbapenemasa (serín-betalactamasa, clase A de Ambler)', clase: 'Carbapenems, cefalosporinas', identidad: '96.8', cobertura: '99', evalue: '2e-88', main: true  },
        { gen: 'blaKPC-2',   mecanismo: 'Carbapenemasa, clase A de Ambler',                        clase: 'Carbapenems',                identidad: '93.4', cobertura: '97', evalue: '1e-79', main: false },
        { gen: 'blaOXA-48',  mecanismo: 'Carbapenemasa, clase D de Ambler',                         clase: 'Carbapenems (variable)',     identidad: '78.2', cobertura: '85', evalue: '4e-42', main: false },
        { gen: 'blaCTX-M-15',mecanismo: 'BLEE (betalactamasa de espectro extendido), clase A',      clase: 'Cefalosporinas',              identidad: '71.5', cobertura: '80', evalue: '2e-31', main: false },
        { gen: 'blaTEM-1',   mecanismo: 'Betalactamasa de espectro estrecho, clase A',              clase: 'Penicilinas',                 identidad: '64.3', cobertura: '75', evalue: '6e-19', main: false }
      ],
      full: [
        { gen: 'blaKPC-3 [Klebsiella pneumoniae]',   accession: 'WP_063864268.1', mecanismo: 'Carbapenemasa, clase A de Ambler — hidroliza carbapenems, cefalosporinas y aztreonam', clase: 'Carbapenems, cefalosporinas, aztreonam', identidad: '99.6', cobertura: '100', evalue: '0.0',   main: true  },
        { gen: 'blaKPC-2 [Klebsiella pneumoniae]',   accession: 'WP_004195524.1', mecanismo: 'Carbapenemasa, clase A de Ambler',        clase: 'Carbapenems',                identidad: '96.1', cobertura: '100', evalue: '0.0',   main: false },
        { gen: 'blaKPC-4',                            accession: 'WP_012966961.1', mecanismo: 'Carbapenemasa, clase A de Ambler',        clase: 'Carbapenems',                identidad: '91.4', cobertura: '99',  evalue: '2e-96', main: false },
        { gen: 'blaOXA-48 [Klebsiella pneumoniae]',  accession: 'WP_004153027.1', mecanismo: 'Carbapenemasa, clase D de Ambler',        clase: 'Carbapenems (variable)',     identidad: '79.8', cobertura: '94',  evalue: '3e-78', main: false },
        { gen: 'blaOXA-181',                          accession: 'WP_004179339.1', mecanismo: 'Carbapenemasa, clase D de Ambler',        clase: 'Carbapenems (variable)',     identidad: '77.2', cobertura: '92',  evalue: '5e-73', main: false },
        { gen: 'blaCTX-M-15 [Klebsiella pneumoniae]',accession: 'WP_000221252.1', mecanismo: 'BLEE, clase A de Ambler',                 clase: 'Cefalosporinas',              identidad: '72.9', cobertura: '89',  evalue: '4e-63', main: false },
        { gen: 'blaSHV-1 [Klebsiella pneumoniae]',   accession: 'WP_000027057.1', mecanismo: 'Betalactamasa de espectro estrecho, clase A', clase: 'Penicilinas',            identidad: '68.4', cobertura: '86',  evalue: '2e-57', main: false },
        { gen: 'blaTEM-1',                            accession: 'WP_000027045.1', mecanismo: 'Betalactamasa de espectro estrecho, clase A', clase: 'Penicilinas',            identidad: '64.9', cobertura: '82',  evalue: '9e-49', main: false },
        { gen: 'blaNDM-1 [Klebsiella pneumoniae]',   accession: 'WP_004201164.1', mecanismo: 'Metalo-betalactamasa (dependiente de zinc), clase B de Ambler — NO inhibible por avibactam', clase: 'Carbapenems, cefalosporinas', identidad: '55.3', cobertura: '71',  evalue: '1e-34', main: false }
      ]
    },
    verdictQuestion: '¿Qué gen es responsable de la falta de respuesta a carbapenems en este aislado?',
    candidates: [
      { id: 'kpc',    name: 'blaKPC-3 — Carbapenemasa de clase A (Ambler)' },
      { id: 'oxa48',  name: 'blaOXA-48 — Carbapenemasa de clase D (Ambler)' },
      { id: 'ndm1',   name: 'blaNDM-1 — Carbapenemasa de clase B, metalo-betalactamasa' },
      { id: 'ctxm15', name: 'blaCTX-M-15 — BLEE, no es carbapenemasa' }
    ],
    correctAnswer: 'kpc',
    consequence: {
      correctFull:  "Confirmaste blaKPC-3 con 99.6% de identidad y cobertura completa contra CARD. El equipo clínico descartó colistina y ajustó el esquema a ceftazidima-avibactam, activa frente a carbapenemasas de clase A como KPC. La paciente respondió favorablemente en 48 horas.",
      correctQuick: "Identificaste blaKPC-3 correctamente, pero la base local no distingue con precisión entre KPC-2, KPC-3 y KPC-4 — variantes con perfiles de resistencia ligeramente distintos. Para elegir el antibiótico de rescate con seguridad, el equipo clínico necesita la confirmación completa de CARD.",
      incorrect:    "Confundiste el mecanismo de resistencia. Tratar una carbapenemasa de clase A como si fuera clase B (metalo-betalactamasa) o como una simple BLEE lleva a elegir el antibiótico equivocado — el avibactam, por ejemplo, no inhibe a las metalo-betalactamasas como NDM-1. El esquema ajustado no funcionó y la infección progresó."
    },

    labRender: function(state, params){
      var caseId    = params.caseId;
      var d         = Game.Cases[caseId];
      var progress  = Game.Engine.getCaseProgress(caseId);
      var hoursLeft = d.maxHours - progress.hoursUsed;
      var quickTool = d.tools.filter(function(t){ return t.id === 'quick'; })[0];
      var fullTool  = d.tools.filter(function(t){ return t.id === 'full';  })[0];
      var quickUsed = progress.toolsRun.indexOf('quick') !== -1;
      var fullUsed  = progress.toolsRun.indexOf('full')  !== -1;
      var canQuick  = !quickUsed && state.budget >= quickTool.costBudget && hoursLeft >= quickTool.costHours;
      var canFull   = !fullUsed  && state.budget >= fullTool.costBudget  && hoursLeft >= fullTool.costHours;

      var seqPanel =
        '<div class="panel">' +
          '<div class="seq-label">' + d.sampleLabel + '</div>' +
          '<div class="terminal" id="seq-box">' + d.sampleData + '</div>' +
          '<button id="copy-seq-btn" class="btn secondary" onclick="Game.UI._copySeq()">COPIAR SECUENCIA</button>' +
        '</div>';

      var timeWarning = hoursLeft <= 0
        ? '<p style="color:var(--alert);margin-top:10px;">Sin tiempo disponible para nuevas búsquedas.</p>' : '';

      var resPanel =
        '<div class="panel blast-panel">' +
          '<div class="blast-header">Búsqueda de genes de resistencia (ResFinder / CARD)</div>' +
          '<label class="blast-label">Pegar secuencia FASTA del gen sospechoso:</label>' +
          '<textarea id="blast-input" class="blast-textarea" rows="5" ' +
            'placeholder="Copiá la secuencia del panel de arriba y pegala aquí..."></textarea>' +
          '<div class="blast-db-subtitle">Seleccioná la base de datos:</div>' +
          '<div class="blast-db-row">' +
            '<div class="blast-db-card' + (quickUsed ? ' db-used' : '') + '">' +
              '<div class="blast-db-name">ResFinder — Base local</div>' +
              '<div class="blast-db-desc">Genes de resistencia curados del laboratorio · Rápida y económica</div>' +
              '<div class="blast-db-cost">' + quickTool.costBudget + ' créditos · ' + quickTool.costHours + 'h</div>' +
              '<button class="btn secondary" ' + (!canQuick ? 'disabled' : '') +
                ' onclick="Game.UI._runBlast(\'' + caseId + '\',\'quick\')">' +
                (quickUsed ? 'YA EJECUTADA' : 'BUSCAR') +
              '</button>' +
            '</div>' +
            '<div class="blast-db-card' + (fullUsed ? ' db-used' : '') + '">' +
              '<div class="blast-db-name">CARD — NCBI</div>' +
              '<div class="blast-db-desc">Base completa de resistencia antimicrobiana · Amplia y exhaustiva</div>' +
              '<div class="blast-db-cost">' + fullTool.costBudget + ' créditos · ' + fullTool.costHours + 'h</div>' +
              '<button class="btn" ' + (!canFull ? 'disabled' : '') +
                ' onclick="Game.UI._runBlast(\'' + caseId + '\',\'full\')">' +
                (fullUsed ? 'YA EJECUTADA' : 'BUSCAR') +
              '</button>' +
            '</div>' +
          '</div>' +
          timeWarning +
        '</div>';

      var resultsHTML = '';
      if(progress.toolsRun.length){
        resultsHTML += '<h2 class="screen-title" style="font-size:10px;margin-top:18px;">RESULTADOS — GENES DE RESISTENCIA</h2>';

        progress.toolsRun.forEach(function(toolId){
          var rows    = d.results[toolId];
          var dbLabel = toolId === 'quick' ? 'ResFinder — Base local' : 'CARD — NCBI';

          var infoBtns = PARAM_KEYS_RES.map(function(k){
            return '<button class="btn-info" onclick="Game.UI._toggleInfo(\'' + toolId + '_' + k + '\')">' +
              PARAM_INFO_RES[k].label + ' [?]' + '</button>';
          }).join('');
          var infoBoxes = PARAM_KEYS_RES.map(function(k){
            return '<div id="info_' + toolId + '_' + k + '" class="info-box" style="display:none;">' +
              '<span class="info-box-title">' + PARAM_INFO_RES[k].label + '</span>' +
              PARAM_INFO_RES[k].text + '</div>';
          }).join('');

          var tableRows = rows.map(function(r){
            return '<tr>' +
              '<td' + (r.main ? ' class="hit-main"' : '') + '>' + r.gen + '</td>' +
              '<td style="font-size:15px;">' + r.mecanismo + '</td>' +
              '<td>' + r.clase + '</td>' +
              '<td>' + r.identidad + '%</td>' +
              '<td>' + r.cobertura + '%</td>' +
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
                    '<th>Gen</th><th>Mecanismo</th><th>Clase</th>' +
                    '<th>% Ident.</th><th>Cobertura</th><th>E-value</th>' +
                  '</tr></thead>' +
                  '<tbody>' + tableRows + '</tbody>' +
                '</table>' +
              '</div>' +
            '</div>';
        });
      }

      return '' +
        Game.UI.statusBar(state, true, caseId) +
        '<h2 class="screen-title">PANEL DE RESISTENCIA ANTIMICROBIANA</h2>' +
        seqPanel + resPanel + resultsHTML +
        '<button class="btn" onclick="Game.Engine.goTo(\'veredicto\',{caseId:\'' + caseId + '\'})">PASAR A DIAGNÓSTICO</button>';
    }
  });
})();
