(function(){
  window.Game = window.Game || {};

  var PARAM_INFO_VEP = {
    consecuencia: {
      label: 'Consecuencia molecular',
      text: 'Efecto de la variante sobre el ARN o la proteína. "Frameshift" (cambio de marco de lectura) altera toda la proteína desde ese punto e introduce un codón de parada prematuro — habitualmente patogénica. "Missense" cambia un aminoácido — puede ser patogénica, benigna o VUS según el residuo y la función. "Sinónima" no cambia el aminoácido — generalmente benigna.'
    },
    clasificacion: {
      label: 'Clasificación clínica (ACMG)',
      text: 'Sistema de 5 categorías del American College of Medical Genetics. "Patogénica" o "Probablemente patogénica" requieren acción clínica. "VUS" (Variante de Significancia Incierta) indica evidencia insuficiente — no actuar sin datos adicionales. "Benigna" o "Probablemente benigna" no causan la enfermedad. La clasificación se revisa periódicamente a medida que acumula evidencia.'
    },
    frecuencia: {
      label: 'Frecuencia poblacional (gnomAD)',
      text: 'Proporción de individuos sanos en la población general (gnomAD: >140.000 genomas) que poseen esa variante. Las variantes patogénicas de enfermedades graves suelen ser muy raras (<0.01%). Variantes frecuentes (>1%) raramente son patogénicas de alta penetrancia. Una frecuencia muy baja es necesaria pero no suficiente para clasificar como patogénica.'
    },
    clinvar: {
      label: 'ClinVar ID',
      text: 'Identificador de registro en ClinVar, base de datos pública del NCBI que agrega interpretaciones clínicas enviadas por laboratorios acreditados. Cada "RCV" corresponde a una combinación variante-condición clínica. Incluye criterios ACMG utilizados, referencias bibliográficas y fecha de última revisión. Es la referencia principal en genética clínica.'
    }
  };

  var PARAM_KEYS_VEP = ['consecuencia', 'clasificacion', 'frecuencia', 'clinvar'];

  Game.registerCase({
    id: 'caso2',
    implemented: true,
    characterKey: 'genetista',
    characterName: 'Dr. Vega · Genetista',
    title: 'Variante genética hereditaria',
    briefing: [
      "Paciente 42: mujer de 35 años con historia familiar de cáncer de mama hereditario — madre y tía materna afectadas antes de los 45. Ordenamos secuenciación del exón 11 de BRCA1, región donde se concentra la mayoría de las variantes patogénicas conocidas del gen.",
      "El análisis primario detectó al menos una variante candidata. Necesito que la anotes contra ClinVar y me digas si es patogénica, una VUS o un polimorfismo benigno. La paciente aguarda los resultados para decidir junto con el equipo clínico sobre medidas preventivas."
    ],
    sampleLabel: 'secuencia_brca1_exon11_pac042.fasta',
    sampleData: ">BRCA1_exon11_pac042\nGAAATTTCCAGATCCTGAAATTCAGGATCCTTTGAGAAAGAAAACATAAT\nGCATTTACCTGATAAATCTTTAAAGTACTCCAGTTCAAAGCATCCCTTCA\nAACTTGCAAATCCTGGCAAGACAGATCTCTTCAGCATCTGAATATCAGAG",
    maxHours: 6,
    tools: [
      { id: 'quick', name: 'Anotación rápida (ClinVar local)',       costBudget: 50,  costHours: 1 },
      { id: 'full',  name: 'Análisis completo (VEP + ClinVar NCBI)', costBudget: 150, costHours: 3 }
    ],
    results: {
      quick: [
        { variante: 'BRCA1:c.5266dupC (p.Gln1756fs*74)', consecuencia: 'Frameshift',  clasificacion: 'Patogénica',       condicion: 'Cancer hereditario mama/ovario',  frecuencia: '0.00008', clinvar: 'RCV000017661', main: true  },
        { variante: 'BRCA1:c.5261A>G (p.Tyr1754Cys)',    consecuencia: 'Missense',    clasificacion: 'VUS',              condicion: 'Pendiente de reclasificacion',    frecuencia: '0.00012', clinvar: 'RCV000038211', main: false },
        { variante: 'BRCA1:c.5251_5252del (p.Gln1751fs)', consecuencia: 'Frameshift', clasificacion: 'Patogénica',       condicion: 'Cancer hereditario',              frecuencia: '0.00003', clinvar: 'RCV000017523', main: false },
        { variante: 'BRCA1:c.5266_5267insT (p.Gln1756fs)', consecuencia: 'Frameshift', clasificacion: 'Prob. patogénica', condicion: 'Cancer mama familiar',            frecuencia: '0.00005', clinvar: 'RCV000055012', main: false },
        { variante: 'BRCA1:c.5234G>A (p.Glu1745Lys)',    consecuencia: 'Missense',    clasificacion: 'Benigna',          condicion: 'Polimorfismo — sin relevancia',   frecuencia: '0.01200', clinvar: 'RCV000055289', main: false }
      ],
      full: [
        { variante: 'BRCA1:c.5266dupC (p.Gln1756fs*74)',   consecuencia: 'Frameshift',  clasificacion: 'Patogénica',       condicion: 'Sindrome hereditario mama/ovario (OMIM:604370)', frecuencia: '0.00008', clinvar: 'RCV000017661', main: true  },
        { variante: 'BRCA1:c.5261A>G (p.Tyr1754Cys)',      consecuencia: 'Missense',    clasificacion: 'VUS',              condicion: 'Variante de significancia incierta',             frecuencia: '0.00012', clinvar: 'RCV000038211', main: false },
        { variante: 'BRCA1:c.5251_5252del (p.Gln1751fs)',  consecuencia: 'Frameshift',  clasificacion: 'Patogénica',       condicion: 'Cancer hereditario (OMIM:604370)',               frecuencia: '0.00003', clinvar: 'RCV000017523', main: false },
        { variante: 'BRCA1:c.5266_5267insT (p.Gln1756fs)', consecuencia: 'Frameshift',  clasificacion: 'Prob. patogénica', condicion: 'Predisposicion cancer mama familiar',            frecuencia: '0.00005', clinvar: 'RCV000055012', main: false },
        { variante: 'BRCA1:c.5234G>A (p.Glu1745Lys)',      consecuencia: 'Missense',    clasificacion: 'Benigna',          condicion: 'Polimorfismo — sin relevancia clinica',           frecuencia: '0.01200', clinvar: 'RCV000055289', main: false },
        { variante: 'BRCA1:c.5279A>T (p.Lys1760Ile)',      consecuencia: 'Missense',    clasificacion: 'VUS',              condicion: 'Sin evidencia clinica suficiente',                frecuencia: '0.00031', clinvar: 'RCV000098234', main: false },
        { variante: 'BRCA2:c.5946delT (p.Ser1982fs)',       consecuencia: 'Frameshift',  clasificacion: 'Patogénica',       condicion: 'Cancer hereditario mama/ovario (OMIM:612555)',   frecuencia: '0.00004', clinvar: 'RCV000023528', main: false },
        { variante: 'BRCA2:c.8023A>G (p.Thr2675Ala)',       consecuencia: 'Missense',    clasificacion: 'Benigna',          condicion: 'Polimorfismo poblacional',                        frecuencia: '0.02340', clinvar: 'RCV000045671', main: false }
      ]
    },
    verdictQuestion: '¿Cuál es la clasificación clínica correcta de la variante principal detectada en este paciente?',
    candidates: [
      { id: 'patogenica',    name: 'Patogénica — BRCA1:c.5266dupC causa la enfermedad' },
      { id: 'vus',           name: 'VUS — Significancia incierta, no actuar aún' },
      { id: 'benigna',       name: 'Benigna — polimorfismo sin relevancia clínica' },
      { id: 'sin_variantes', name: 'Sin variantes — la secuencia no muestra alteraciones' }
    ],
    correctAnswer: 'patogenica',
    consequence: {
      correctFull:  "Confirmaste BRCA1:c.5266dupC como variante patogénica. Con el análisis VEP completo tenés la referencia OMIM, la frecuencia gnomAD y la notación proteica para el informe clínico formal. La paciente fue derivada a consejería genética y al programa de seguimiento preventivo.",
      correctQuick: "Identificaste la variante correctamente, pero el análisis rápido no incluye la referencia OMIM ni la frecuencia poblacional confirmada. En genética clínica, un informe sin esos datos puede ser cuestionado. Para comunicar resultados con respaldo formal, siempre complementá con el análisis completo.",
      incorrect:    "Tu clasificación incorrecta dejó sin acción clínica una variante patogénica conocida. La paciente no recibió derivación al programa preventivo. En genética clínica, un error de interpretación tiene consecuencias directas sobre la salud del paciente y de los familiares en riesgo."
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
        ? '<p style="color:var(--alert);margin-top:10px;">Sin tiempo disponible para nuevos análisis.</p>' : '';

      var vepPanel =
        '<div class="panel blast-panel">' +
          '<div class="blast-header">VEP — Variant Effect Predictor / ClinVar</div>' +
          '<label class="blast-label">Pegar secuencia FASTA del paciente:</label>' +
          '<textarea id="blast-input" class="blast-textarea" rows="5" ' +
            'placeholder="Copiá la secuencia del panel de arriba y pegala aquí..."></textarea>' +
          '<div class="blast-db-subtitle">Seleccioná la base de datos:</div>' +
          '<div class="blast-db-row">' +
            '<div class="blast-db-card' + (quickUsed ? ' db-used' : '') + '">' +
              '<div class="blast-db-name">ClinVar — Base local</div>' +
              '<div class="blast-db-desc">Subset curado del laboratorio · Variantes frecuentes, rapida</div>' +
              '<div class="blast-db-cost">' + quickTool.costBudget + ' créditos · ' + quickTool.costHours + 'h</div>' +
              '<button class="btn secondary" ' + (!canQuick ? 'disabled' : '') +
                ' onclick="Game.UI._runBlast(\'' + caseId + '\',\'quick\')">' +
                (quickUsed ? 'YA EJECUTADA' : 'ANOTAR') +
              '</button>' +
            '</div>' +
            '<div class="blast-db-card' + (fullUsed ? ' db-used' : '') + '">' +
              '<div class="blast-db-name">VEP + ClinVar — NCBI</div>' +
              '<div class="blast-db-desc">Base completa con prediccion funcional · Exhaustiva</div>' +
              '<div class="blast-db-cost">' + fullTool.costBudget + ' créditos · ' + fullTool.costHours + 'h</div>' +
              '<button class="btn" ' + (!canFull ? 'disabled' : '') +
                ' onclick="Game.UI._runBlast(\'' + caseId + '\',\'full\')">' +
                (fullUsed ? 'YA EJECUTADA' : 'ANOTAR') +
              '</button>' +
            '</div>' +
          '</div>' +
          timeWarning +
        '</div>';

      var resultsHTML = '';
      if(progress.toolsRun.length){
        resultsHTML += '<h2 class="screen-title" style="font-size:10px;margin-top:18px;">RESULTADOS VEP / CLINVAR</h2>';
        progress.toolsRun.forEach(function(toolId){
          var rows    = d.results[toolId];
          var dbLabel = toolId === 'quick' ? 'ClinVar local' : 'VEP + ClinVar — NCBI';

          var infoBtns = PARAM_KEYS_VEP.map(function(k){
            return '<button class="btn-info" onclick="Game.UI._toggleInfo(\'' + toolId + '_' + k + '\')">' +
              PARAM_INFO_VEP[k].label + ' [?]' + '</button>';
          }).join('');

          var infoBoxes = PARAM_KEYS_VEP.map(function(k){
            return '<div id="info_' + toolId + '_' + k + '" class="info-box" style="display:none;">' +
              '<span class="info-box-title">' + PARAM_INFO_VEP[k].label + '</span>' +
              PARAM_INFO_VEP[k].text +
            '</div>';
          }).join('');

          var tableRows = rows.map(function(r){
            var clsStyle = r.clasificacion === 'Patogénica' || r.clasificacion === 'Prob. patogénica'
              ? 'color:var(--alert);'
              : r.clasificacion === 'Benigna' ? 'color:#8fa2ad;' : 'color:var(--amber);';
            return '<tr>' +
              '<td' + (r.main ? ' class="hit-main"' : '') + '>' + r.variante + '</td>' +
              '<td>' + r.consecuencia + '</td>' +
              '<td style="' + clsStyle + '">' + r.clasificacion + '</td>' +
              '<td style="font-size:15px;">' + r.condicion + '</td>' +
              '<td class="cell-accession">' + r.frecuencia + '</td>' +
              '<td class="cell-accession">' + r.clinvar + '</td>' +
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
                    '<th>Gen / Variante</th><th>Consecuencia</th><th>Clasificacion</th>' +
                    '<th>Condicion asociada</th><th>Frecuencia</th><th>ClinVar ID</th>' +
                  '</tr></thead>' +
                  '<tbody>' + tableRows + '</tbody>' +
                '</table>' +
              '</div>' +
            '</div>';
        });
      }

      return '' +
        Game.UI.statusBar(state, true, caseId) +
        '<h2 class="screen-title">PANEL DE ANÁLISIS GENÉTICO</h2>' +
        seqPanel + vepPanel + resultsHTML +
        '<button class="btn" onclick="Game.Engine.goTo(\'veredicto\',{caseId:\'' + caseId + '\'})">PASAR A DIAGNÓSTICO</button>';
    }
  });
})();
