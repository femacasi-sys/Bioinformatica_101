(function(){
  window.Game = window.Game || {};

  var PARAM_INFO_MB = {
    shannon: {
      label: 'Indice de Shannon',
      text: 'Medida de diversidad alfa (dentro de una muestra) que combina riqueza de taxas y equitatividad de abundancias. A mayor valor, microbioma más diverso. Valores bajos en pacientes comparado con controles sanos indican disbiosis (microbioma empobrecido). En adultos sanos el índice intestinal suele estar entre 3 y 4.'
    },
    chao1: {
      label: 'Chao1 (riqueza estimada)',
      text: 'Estimador de riqueza de taxas que corrige por la presencia de taxas raros detectados sólo una vez (singletons). A diferencia de Shannon, no considera las abundancias relativas — solo cuenta cuántas taxas distintas hay. Valores bajos en Crohn indican que el microbioma tiene menos taxas diferentes, no solo menos diversidad en distribución.'
    },
    log2fc: {
      label: 'Log2 Fold Change',
      text: 'Logaritmo en base 2 de la razón de abundancia entre grupos (Crohn / Sano). Un valor de -3.2 significa que la abundancia es 2^3.2 ≈ 9 veces menor en enfermos. Valores negativos = taxón depleted (menos abundante en enfermos). Valores positivos = taxón enriched (más abundante en enfermos). Un mismo taxón puede ser depletado en una enfermedad y enriquecido en otra.'
    },
    padj: {
      label: 'p-adj (FDR)',
      text: 'Valor p ajustado por corrección de Benjamini-Hochberg para múltiples comparaciones (False Discovery Rate). Al comparar cientos de taxas simultáneamente, los falsos positivos se acumulan. El FDR controla qué proporción de los resultados significativos son esperados por azar. Valores <0.05 se consideran estadísticamente significativos en metagenómica.'
    },
    direccion: {
      label: 'Direccion (Enriched/Depleted)',
      text: 'Indica si el taxón es más abundante en enfermos (Enriched) o menos abundante en enfermos (Depleted) respecto a controles sanos. En enfermedades inflamatorias como Crohn, las bacterias productoras de butirato — un ácido graso de cadena corta antiinflamatorio que nutre el epitelio intestinal — tienden a aparecer como Depleted, contribuyendo a la inflamación crónica.'
    }
  };

  var PARAM_KEYS_DIV  = ['shannon', 'chao1'];
  var PARAM_KEYS_DIFF = ['log2fc', 'padj', 'direccion'];

  Game.registerCase({
    id: 'caso3',
    implemented: true,
    characterKey: 'microbiologa',
    characterName: 'Dra. Marín · Microbióloga',
    title: 'Microbioma: sanos vs. enfermos',
    briefing: [
      "Estamos colaborando con el servicio de gastroenterología en un estudio de microbioma intestinal: 10 controles sanos vs. 10 pacientes con enfermedad de Crohn activa. Hicimos secuenciación amplicon del gen 16S rRNA (región V3-V4) en un MiSeq 2x300.",
      "Los datos ya pasaron por el pipeline QIIME2 + DADA2. Necesito que uses las herramientas disponibles y me digas cuál es el género bacteriano más significativamente alterado en los pacientes con Crohn. Ese dato va al informe para el equipo clínico para guiar una posible intervención probiótica."
    ],
    sampleLabel: 'microbioma_crohn_v2.tsv',
    sampleData: "Estudio: IBD vs. controles sanos (n=20)\nRegion 16S: V3-V4 (amplicon ~460 bp)\nPlataforma: Illumina MiSeq 2x300\nReads/muestra (media): 45.231  |  OTUs detectados: 847\nPipeline: QIIME2 v2023.9 + DADA2 + DESeq2",
    maxHours: 8,
    tools: [
      { id: 'quick', name: 'Diversidad alfa (Shannon / Chao1)', costBudget: 50,  costHours: 1 },
      { id: 'full',  name: 'Abundancia diferencial (DESeq2)',   costBudget: 150, costHours: 3 }
    ],
    results: {
      quick: {
        groups: [
          { grupo: 'Sanos (n=10)',  shannon: '3.82', shannonSd: '±0.31', chao1: '284', chao1Sd: '±42' },
          { grupo: 'Crohn (n=10)', shannon: '2.94', shannonSd: '±0.45', chao1: '198', chao1Sd: '±38' }
        ],
        note: 'Diferencias estadisticamente significativas: Shannon p=0.004 / Chao1 p=0.007 (Mann-Whitney U)'
      },
      full: [
        { taxon: 'Faecalibacterium prausnitzii', filo: 'Firmicutes',      dir: 'Depleted',  log2fc: '-3.2', padj: '<0.0001', main: true  },
        { taxon: 'Roseburia intestinalis',        filo: 'Firmicutes',      dir: 'Depleted',  log2fc: '-2.4', padj: '0.002',   main: false },
        { taxon: 'Butyrivibrio fibrisolvens',     filo: 'Firmicutes',      dir: 'Depleted',  log2fc: '-1.9', padj: '0.008',   main: false },
        { taxon: 'Ruminococcus gnavus',           filo: 'Firmicutes',      dir: 'Enriched',  log2fc: '+2.8', padj: '0.0003',  main: false },
        { taxon: 'Bacteroides fragilis',          filo: 'Bacteroidetes',   dir: 'Enriched',  log2fc: '+1.9', padj: '0.001',   main: false },
        { taxon: 'Escherichia/Shigella',          filo: 'Proteobacteria',  dir: 'Enriched',  log2fc: '+1.7', padj: '0.003',   main: false },
        { taxon: 'Clostridium difficile',         filo: 'Firmicutes',      dir: 'Enriched',  log2fc: '+1.4', padj: '0.012',   main: false },
        { taxon: 'Lachnospiraceae UCG-004',       filo: 'Firmicutes',      dir: 'Depleted',  log2fc: '-1.3', padj: '0.018',   main: false },
        { taxon: 'Akkermansia muciniphila',       filo: 'Verrucomicrobia', dir: 'Enriched',  log2fc: '+1.1', padj: '0.024',   main: false }
      ]
    },
    verdictQuestion: '¿Qué género bacteriano está más significativamente depleted en los pacientes con Crohn y constituye el principal biomarcador de disbiosis en este estudio?',
    candidates: [
      { id: 'faecalibacterium', name: 'Faecalibacterium (F. prausnitzii)' },
      { id: 'ruminococcus',     name: 'Ruminococcus gnavus' },
      { id: 'bacteroides',      name: 'Bacteroides fragilis' },
      { id: 'roseburia',        name: 'Roseburia intestinalis' }
    ],
    correctAnswer: 'faecalibacterium',
    consequence: {
      correctFull:  "Correcto. Faecalibacterium prausnitzii muestra el mayor log2FC negativo (-3.2) y el p-adj más significativo (<0.0001). Es un productor clave de butirato y su depleción es uno de los hallazgos más robustos y replicados en enfermedad de Crohn. El equipo clínico ya tiene el informe para evaluar una intervención probiótica.",
      correctQuick: "Identificaste que hay disbiosis, pero el análisis de diversidad alfa solo muestra que el microbioma es menos diverso — no te dice cuál taxón es el responsable. Sin DESeq2 no podés señalar a F. prausnitzii con evidencia cuantitativa. Tu dirección era correcta, pero la evidencia es insuficiente para un informe clínico formal.",
      incorrect:    "Ese género no es el biomarcador principal de depleción en Crohn. Faecalibacterium prausnitzii, con log2FC=-3.2 y p<0.0001, es el más significativamente depleted. Confundir taxones enriquecidos en enfermedad (Ruminococcus, Bacteroides) con los depletados es un error frecuente al interpretar resultados de abundancia diferencial."
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

      // Dataset panel
      var dataPanel =
        '<div class="panel">' +
          '<div class="seq-label">' + d.sampleLabel + '</div>' +
          '<div class="terminal">' + d.sampleData + '</div>' +
        '</div>';

      // Tools panel
      var timeWarning = hoursLeft <= 0
        ? '<p style="color:var(--alert);margin-top:10px;">Sin tiempo disponible para nuevos análisis.</p>' : '';

      var toolsPanel =
        '<div class="panel blast-panel">' +
          '<div class="blast-header">QIIME2 / DESeq2 — Herramientas de Análisis de Microbioma</div>' +
          '<div class="blast-db-subtitle">Seleccioná el análisis a ejecutar sobre el dataset:</div>' +
          '<div class="blast-db-row">' +
            '<div class="blast-db-card' + (quickUsed ? ' db-used' : '') + '">' +
              '<div class="blast-db-name">Diversidad Alfa</div>' +
              '<div class="blast-db-desc">Shannon + Chao1 por grupo · Detecta disbiosis global en el dataset</div>' +
              '<div class="blast-db-cost">' + quickTool.costBudget + ' créditos · ' + quickTool.costHours + 'h</div>' +
              '<button class="btn secondary" ' + (!canQuick ? 'disabled' : '') +
                ' onclick="Game.UI._runMicrobiome(\'' + caseId + '\',\'quick\')">' +
                (quickUsed ? 'YA EJECUTADO' : 'ANALIZAR') +
              '</button>' +
            '</div>' +
            '<div class="blast-db-card' + (fullUsed ? ' db-used' : '') + '">' +
              '<div class="blast-db-name">Abundancia Diferencial</div>' +
              '<div class="blast-db-desc">DESeq2 por taxa · Identifica qué bacterias cambian y cuánto</div>' +
              '<div class="blast-db-cost">' + fullTool.costBudget + ' créditos · ' + fullTool.costHours + 'h</div>' +
              '<button class="btn" ' + (!canFull ? 'disabled' : '') +
                ' onclick="Game.UI._runMicrobiome(\'' + caseId + '\',\'full\')">' +
                (fullUsed ? 'YA EJECUTADO' : 'ANALIZAR') +
              '</button>' +
            '</div>' +
          '</div>' +
          timeWarning +
        '</div>';

      // Results
      var resultsHTML = '';
      if(progress.toolsRun.length){
        resultsHTML += '<h2 class="screen-title" style="font-size:10px;margin-top:18px;">RESULTADOS</h2>';

        progress.toolsRun.forEach(function(toolId){
          var dbLabel = toolId === 'quick' ? 'Diversidad Alfa (QIIME2)' : 'Abundancia Diferencial (DESeq2)';
          var data    = d.results[toolId];
          var infoBtns, infoBoxes, tableHTML;

          if(toolId === 'quick'){
            infoBtns = PARAM_KEYS_DIV.map(function(k){
              return '<button class="btn-info" onclick="Game.UI._toggleInfo(\'' + toolId + '_' + k + '\')">' +
                PARAM_INFO_MB[k].label + ' [?]' + '</button>';
            }).join('');
            infoBoxes = PARAM_KEYS_DIV.map(function(k){
              return '<div id="info_' + toolId + '_' + k + '" class="info-box" style="display:none;">' +
                '<span class="info-box-title">' + PARAM_INFO_MB[k].label + '</span>' +
                PARAM_INFO_MB[k].text + '</div>';
            }).join('');
            var divRows = data.groups.map(function(g){
              return '<tr><td>' + g.grupo + '</td>' +
                '<td>' + g.shannon + '</td><td class="cell-accession">' + g.shannonSd + '</td>' +
                '<td>' + g.chao1   + '</td><td class="cell-accession">' + g.chao1Sd   + '</td></tr>';
            }).join('');
            tableHTML =
              '<div style="overflow-x:auto;">' +
                '<table class="results">' +
                  '<thead><tr><th>Grupo</th><th>Shannon (media)</th><th>Shannon (SD)</th><th>Chao1 (media)</th><th>Chao1 (SD)</th></tr></thead>' +
                  '<tbody>' + divRows + '</tbody>' +
                '</table>' +
              '</div>' +
              '<div class="info-box" style="display:block;margin-top:8px;border-left-color:var(--phosphor);">' + data.note + '</div>';

          } else {
            infoBtns = PARAM_KEYS_DIFF.map(function(k){
              return '<button class="btn-info" onclick="Game.UI._toggleInfo(\'' + toolId + '_' + k + '\')">' +
                PARAM_INFO_MB[k].label + ' [?]' + '</button>';
            }).join('');
            infoBoxes = PARAM_KEYS_DIFF.map(function(k){
              return '<div id="info_' + toolId + '_' + k + '" class="info-box" style="display:none;">' +
                '<span class="info-box-title">' + PARAM_INFO_MB[k].label + '</span>' +
                PARAM_INFO_MB[k].text + '</div>';
            }).join('');
            var taxRows = data.map(function(r){
              var dirClass = r.dir === 'Depleted' ? 'taxon-depleted' : 'taxon-enriched';
              return '<tr>' +
                '<td' + (r.main ? ' class="hit-main"' : '') + '>' + r.taxon + '</td>' +
                '<td class="cell-accession">' + r.filo + '</td>' +
                '<td class="' + dirClass + '">' + r.dir + '</td>' +
                '<td>' + r.log2fc + '</td>' +
                '<td>' + r.padj + '</td>' +
              '</tr>';
            }).join('');
            tableHTML =
              '<div style="overflow-x:auto;">' +
                '<table class="results">' +
                  '<thead><tr><th>Taxon</th><th>Filo</th><th>Direccion</th><th>Log2FC</th><th>p-adj</th></tr></thead>' +
                  '<tbody>' + taxRows + '</tbody>' +
                '</table>' +
              '</div>';
          }

          resultsHTML +=
            '<div class="panel result-block">' +
              '<div class="result-db-label">' + dbLabel + '</div>' +
              '<div class="info-btn-row">' + infoBtns + '</div>' +
              infoBoxes + tableHTML +
            '</div>';
        });
      }

      return '' +
        Game.UI.statusBar(state, true, caseId) +
        '<h2 class="screen-title">PANEL DE ANÁLISIS DE MICROBIOMA</h2>' +
        dataPanel + toolsPanel + resultsHTML +
        '<button class="btn" onclick="Game.Engine.goTo(\'veredicto\',{caseId:\'' + caseId + '\'})">PASAR A DIAGNÓSTICO</button>';
    }
  });

  // Helper específico: no requiere validación de secuencia FASTA
  Game.UI = Game.UI || {};
  Game.UI._runMicrobiome = function(caseId, toolId){
    var ok = Game.Engine.runTool(caseId, toolId);
    if(!ok){
      alert('No tenés suficientes recursos (créditos u horas) para ejecutar este análisis.');
      return;
    }
    Game.Engine.goTo('laboratorio', { caseId: caseId });
  };

})();
