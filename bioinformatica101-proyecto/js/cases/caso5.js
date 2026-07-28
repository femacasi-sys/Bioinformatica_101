(function(){
  window.Game = window.Game || {};

  // ---- enzima silvestre (basada conceptualmente en la PAL de Anabaena variabilis,
  // la familia de enzima usada en la terapia de reemplazo enzimático pegvaliase) ----
  var REF_SEQ = 'MTQNTVLQGKTLTIQEIAAVSKGKANFDLSKESLTPGGYTRQVLDHAK';

  // posiciones 0-indexadas del sitio activo (equivalente al triplete que forma
  // el cofactor MIO en las PAL reales, + un residuo catalítico adicional)
  var ACTIVE_SITE = [20, 21, 22, 35];

  function applyMutations(base, muts){
    var arr = base.split('');
    Object.keys(muts).forEach(function(idx){ arr[idx] = muts[idx]; });
    return arr.join('');
  }
  function mutatedPositions(seq, ref){
    var pos = [];
    for(var i = 0; i < ref.length; i++){ if(seq[i] !== ref[i]) pos.push(i); }
    return pos;
  }
  function wrapFasta(seq){ return seq.match(/.{1,24}/g).join('\n'); }

  var VARIANT_DEFS = [
    { id: 'a', label: 'Variante A', muts: { 5: 'I', 44: 'E' },
      nota: 'Cambios conservadores en regiones periféricas (V→I, D→E), lejos del sitio activo; no se espera efecto funcional.',
      actividad: 'Sin cambio', estabilidad: 'Conservada' },
    { id: 'b', label: 'Variante B', muts: { 24: 'G', 27: 'N' },
      nota: 'Sustituciones en el canal de acceso al sustrato, adyacentes al sitio activo pero sin tocarlo; se predice mayor afinidad por fenilalanina sin comprometer la geometría catalítica.',
      actividad: 'Aumentada', estabilidad: 'Conservada' },
    { id: 'c', label: 'Variante C', muts: { 21: 'E' },
      nota: 'Sustituye directamente un residuo del sitio catalítico. Pese a tener la mayor identidad global con la silvestre, se predice enzima inactiva.',
      actividad: 'Perdida', estabilidad: 'Reducida' }
  ];

  var VARIANTS = VARIANT_DEFS.map(function(def){
    var seq = applyMutations(REF_SEQ, def.muts);
    var mutPos = mutatedPositions(seq, REF_SEQ);
    var sitioActivo = mutPos.some(function(p){ return ACTIVE_SITE.indexOf(p) !== -1; });
    var identidad = (((REF_SEQ.length - mutPos.length) / REF_SEQ.length) * 100).toFixed(1);
    return {
      id: def.id, label: def.label, seq: seq, mutPos: mutPos,
      sitioActivo: sitioActivo, identidad: identidad,
      nota: def.nota, actividad: def.actividad, estabilidad: def.estabilidad
    };
  });

  var SAMPLE_FASTA = '>PAL_silvestre_referencia\n' + wrapFasta(REF_SEQ) + '\n' +
    VARIANTS.map(function(v){ return '>PAL_variante_' + v.id.toUpperCase() + '\n' + wrapFasta(v.seq); }).join('\n');

  var PARAM_INFO_QUICK = {
    identidad: {
      label: '% Identidad',
      text: 'Porcentaje de aminoácidos idénticos entre la variante y la enzima silvestre. Ojo: una identidad alta no garantiza que la variante funcione mejor — todo depende de en qué posiciones caen las diferencias, no solo de cuántas hay.'
    },
    cobertura: {
      label: 'Cobertura',
      text: 'Porcentaje de la proteína cubierto por la comparación. Con cobertura completa se compararon las variantes de punta a punta, sin fragmentos sin evaluar.'
    },
    score: {
      label: 'Score (bits)',
      text: 'Puntuación del alineamiento en bits, ponderada por una matriz de sustitución. A mayor score, cambios más conservadores o alineamiento más largo — no es un indicador de actividad funcional.'
    },
    evalue: {
      label: 'E-value',
      text: 'Significancia estadística de la comparación. Valores cercanos a 0 confirman que la variante es, sin dudas, la misma familia de enzima que la silvestre.'
    }
  };
  var PARAM_KEYS_QUICK = ['identidad', 'cobertura', 'score', 'evalue'];

  var PARAM_INFO_FULL = {
    identidad: PARAM_INFO_QUICK.identidad,
    sitioActivo: {
      label: 'Mutación en sitio activo',
      text: 'Indica si alguna sustitución de la variante cae exactamente sobre un residuo catalítico conocido (el triplete que forma el cofactor MIO en las PAL reales, más un residuo catalítico adicional). Una mutación ahí casi siempre inactiva la enzima, sin importar cuán alta sea la identidad global.'
    },
    actividad: {
      label: 'Actividad estimada',
      text: 'Predicción del efecto de las mutaciones sobre la eficiencia catalítica: pueden aumentarla (ej. mejor acceso del sustrato al sitio activo), no cambiarla (mutaciones neutras y alejadas) o eliminarla (mutaciones sobre residuos catalíticos esenciales).'
    },
    estabilidad: {
      label: 'Estabilidad estimada',
      text: 'Predicción de si la variante conserva un plegamiento estable. Mutaciones que rompen interacciones estructurales clave pueden desestabilizar la proteína incluso sin tocar el sitio activo.'
    }
  };
  var PARAM_KEYS_FULL = ['identidad', 'sitioActivo', 'actividad', 'estabilidad'];

  // ángulo áureo: reparte los residuos de forma pareja sobre una esfera
  // (distribución de Fibonacci), para que la proteína se lea como un
  // dominio globular plegado en vez de una hebra estirada tipo ADN.
  var GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
  var SPHERE_R = 40;
  var JITTER = 16; // px — rompe la regularidad de la espiral para que se lea como nube difusa, no como red

  // pseudo-aleatorio determinístico (mismo seed = mismo valor siempre, sin parpadeos entre renders)
  function prand(seed){
    var x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  function buildProteinTrack(label, sub, seq, refSeq, duration){
    var n = seq.length;
    var blocks = '';
    for(var i = 0; i < n; i++){
      var isActive = ACTIVE_SITE.indexOf(i) !== -1;
      var color, title;
      if(!refSeq){
        color = '#4d8dff';
        title = 'Posición ' + (i + 1) + ': ' + seq[i] + ' (referencia)' + (isActive ? ' · sitio activo' : '');
      } else if(seq[i] === refSeq[i]){
        color = 'var(--phosphor)';
        title = 'Posición ' + (i + 1) + ': ' + seq[i] + ' — conservado' + (isActive ? ' · sitio activo' : '');
      } else {
        color = 'var(--alert)';
        title = 'Posición ' + (i + 1) + ': ' + refSeq[i] + ' → ' + seq[i] + ' — mutado' + (isActive ? ' · SOBRE EL SITIO ACTIVO' : '');
      }

      var t     = n > 1 ? i / (n - 1) : 0;
      var yN    = 1 - t * 2;                          // de 1 a -1, polo a polo
      var rN    = Math.sqrt(Math.max(0, 1 - yN * yN)); // radio del paralelo a esa altura
      var theta = GOLDEN_ANGLE * i;
      var jx = (prand(i * 3 + 0) - 0.5) * 2 * JITTER;
      var jy = (prand(i * 3 + 1) - 0.5) * 2 * JITTER;
      var jz = (prand(i * 3 + 2) - 0.5) * 2 * JITTER;
      var x = (Math.cos(theta) * rN * SPHERE_R + jx).toFixed(1);
      var y = (yN * SPHERE_R + jy).toFixed(1);
      var z = (Math.sin(theta) * rN * SPHERE_R + jz).toFixed(1);
      var depthT  = (parseFloat(z) + SPHERE_R) / (2 * SPHERE_R); // 0 = al fondo, 1 = al frente
      var opacity = (0.5 + depthT * 0.5).toFixed(2);

      blocks += '<div class="protein3d-residue' + (isActive ? ' active-site' : '') + '" title="' + title + '" style="background:' + color +
        ';opacity:' + opacity + ';transform:translate3d(' + x + 'px,' + y + 'px,' + z + 'px);"></div>';
    }
    return '<div class="protein3d-track">' +
      '<div class="protein3d-track-label"><b>' + label + '</b>' + sub + '</div>' +
      '<div class="protein3d-stage"><div class="protein3d-spin" style="animation-duration:' + duration + 's;">' + blocks + '</div></div>' +
    '</div>';
  }

  Game.registerCase({
    id: 'caso5',
    implemented: true,
    characterKey: 'estructural',
    characterName: 'Dra. Rojas · Ingeniería de proteínas',
    title: 'Modelado de proteínas: la variante que mejora el corte de un sustrato tóxico',
    briefing: [
      "Un paciente con fenilcetonuria (PKU) no tolera la dieta estricta y mantiene niveles tóxicos de fenilalanina en sangre pese al tratamiento. La alternativa es terapia de reemplazo enzimático con fenilalanina amonio-liasa (PAL) — una enzima no humana que degrada la fenilalanina en sustancias inocuas. El laboratorio de I+D diseñó tres variantes candidatas y necesita saber cuál conviene avanzar a ensayo.",
      "Te paso la secuencia de la enzima silvestre (de la misma familia que la PAL de Anabaena variabilis, la base de la terapia aprobada pegvaliase) y las tres variantes candidatas. Modelalas, fijate dónde cae cada mutación respecto al sitio activo y decime cuál variante conviene avanzar — no alcanza con mirar el % de identidad."
    ],
    sampleLabel: 'pal_silvestre_y_variantes.fasta',
    sampleData: SAMPLE_FASTA,
    maxHours: 6,
    tools: [
      { id: 'quick', name: 'Modelado local (homología estructural)',        costBudget: 50,  costHours: 1 },
      { id: 'full',  name: 'Predicción funcional (modelado 3D + IA)',       costBudget: 150, costHours: 3 }
    ],
    results: {
      quick: VARIANTS.map(function(v, i){
        return {
          variante: v.label, identidad: v.identidad, cobertura: '100',
          mutaciones: v.mutPos.length,
          score: [181, 180, 189][i], evalue: ['4e-48', '5e-48', '1e-50'][i]
        };
      }),
      full: VARIANTS.map(function(v){
        return {
          variante: v.label, identidad: v.identidad,
          sitioActivo: v.sitioActivo ? 'Sí' : 'No',
          actividad: v.actividad, estabilidad: v.estabilidad, nota: v.nota
        };
      })
    },
    verdictQuestion: '¿Qué variante de PAL conviene avanzar a ensayo para tratar al paciente?',
    candidates: [
      { id: 'a',         name: 'Variante A — cambios periféricos conservadores, sin ganancia funcional' },
      { id: 'b',         name: 'Variante B — mutaciones en el canal del sustrato, junto al sitio activo' },
      { id: 'c',         name: 'Variante C — mayor identidad global, pero cambia un residuo catalítico' },
      { id: 'silvestre', name: 'Mantener la enzima silvestre sin modificar' }
    ],
    correctAnswer: 'b',
    consequence: {
      correctFull:  "Con la predicción funcional completa confirmaste que la Variante B mejora el acceso de la fenilalanina al sitio activo sin tocar los residuos catalíticos — mayor actividad, estabilidad conservada. El equipo de I+D avanzó la Variante B a ensayo preclínico. La Variante C, pese a tener mayor identidad global, hubiera sido inactiva: la trampa de guiarte solo por el % de identidad quedó evidenciada.",
      correctQuick: "Elegiste la Variante B, la decisión correcta, pero el modelado local no incluye la columna de \"mutación en sitio activo\" — sin ese dato no podés justificar por qué B es mejor que C pese a tener menor identidad. Para un informe de I+D farmacéutico defendible, necesitás la predicción funcional completa.",
      incorrect:    "El equipo de I+D avanzó una variante equivocada a ensayo. Guiarte solo por el % de identidad global es la trampa clásica: la Variante C es la más parecida a la silvestre pero pierde un residuo catalítico y queda inactiva; la Variante A no aporta ninguna mejora. El paciente sigue sin una terapia efectiva."
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
          '<button id="copy-seq-btn" class="btn secondary" onclick="Game.UI._copySeq()">COPIAR SECUENCIAS</button>' +
        '</div>';

      var timeWarning = hoursLeft <= 0
        ? '<p style="color:var(--alert);margin-top:10px;">Sin tiempo disponible para nuevos análisis.</p>' : '';

      var blastPanel =
        '<div class="panel blast-panel">' +
          '<div class="blast-header">Modelado y predicción funcional de variantes</div>' +
          '<label class="blast-label">Pegar secuencias de las variantes candidatas (multi-FASTA):</label>' +
          '<textarea id="blast-input" class="blast-textarea" rows="6" ' +
            'placeholder="Copiá las secuencias del panel de arriba y pegalas aquí..."></textarea>' +
          '<div class="blast-db-subtitle">Seleccioná el análisis:</div>' +
          '<div class="blast-db-row">' +
            '<div class="blast-db-card' + (quickUsed ? ' db-used' : '') + '">' +
              '<div class="blast-db-name">Modelado local</div>' +
              '<div class="blast-db-desc">Homología estructural vs. la silvestre · Rápido</div>' +
              '<div class="blast-db-cost">' + quickTool.costBudget + ' créditos · ' + quickTool.costHours + 'h</div>' +
              '<button class="btn secondary" ' + (!canQuick ? 'disabled' : '') +
                ' onclick="Game.UI._runProteinBlast(\'' + caseId + '\',\'quick\')">' +
                (quickUsed ? 'YA EJECUTADO' : 'MODELAR') +
              '</button>' +
            '</div>' +
            '<div class="blast-db-card' + (fullUsed ? ' db-used' : '') + '">' +
              '<div class="blast-db-name">Predicción funcional</div>' +
              '<div class="blast-db-desc">Modelado 3D + IA · Incluye impacto en sitio activo</div>' +
              '<div class="blast-db-cost">' + fullTool.costBudget + ' créditos · ' + fullTool.costHours + 'h</div>' +
              '<button class="btn" ' + (!canFull ? 'disabled' : '') +
                ' onclick="Game.UI._runProteinBlast(\'' + caseId + '\',\'full\')">' +
                (fullUsed ? 'YA EJECUTADO' : 'MODELAR') +
              '</button>' +
            '</div>' +
          '</div>' +
          timeWarning +
        '</div>';

      var resultsHTML = '';
      if(progress.toolsRun.length){
        resultsHTML += '<h2 class="screen-title" style="font-size:10px;margin-top:18px;">RESULTADOS DEL MODELADO</h2>';

        progress.toolsRun.forEach(function(toolId){
          var rows    = d.results[toolId];
          var dbLabel = toolId === 'quick' ? 'Modelado local — homología estructural' : 'Predicción funcional — modelado 3D + IA';
          var keys    = toolId === 'quick' ? PARAM_KEYS_QUICK : PARAM_KEYS_FULL;
          var info    = toolId === 'quick' ? PARAM_INFO_QUICK : PARAM_INFO_FULL;

          var infoBtns = keys.map(function(k){
            return '<button class="btn-info" onclick="Game.UI._toggleInfo(\'' + toolId + '_' + k + '\')">' +
              info[k].label + ' [?]' + '</button>';
          }).join('');
          var infoBoxes = keys.map(function(k){
            return '<div id="info_' + toolId + '_' + k + '" class="info-box" style="display:none;">' +
              '<span class="info-box-title">' + info[k].label + '</span>' +
              info[k].text + '</div>';
          }).join('');

          var tableHTML;
          if(toolId === 'quick'){
            var qRows = rows.map(function(r){
              return '<tr><td>' + r.variante + '</td><td>' + r.identidad + '%</td><td>' + r.cobertura + '%</td>' +
                '<td>' + r.mutaciones + '</td><td>' + r.score + '</td><td>' + r.evalue + '</td></tr>';
            }).join('');
            tableHTML =
              '<div style="overflow-x:auto;"><table class="results">' +
                '<thead><tr><th>Variante</th><th>% Ident.</th><th>Cobertura</th><th>Mutaciones</th><th>Score</th><th>E-value</th></tr></thead>' +
                '<tbody>' + qRows + '</tbody>' +
              '</table></div>';
          } else {
            var fRows = rows.map(function(r){
              var siteStyle = r.sitioActivo === 'Sí' ? 'color:var(--alert);' : 'color:var(--phosphor);';
              return '<tr><td>' + r.variante + '</td><td>' + r.identidad + '%</td>' +
                '<td style="' + siteStyle + '">' + r.sitioActivo + '</td>' +
                '<td>' + r.actividad + '</td><td>' + r.estabilidad + '</td>' +
                '<td style="font-size:14px;">' + r.nota + '</td></tr>';
            }).join('');
            tableHTML =
              '<div style="overflow-x:auto;"><table class="results">' +
                '<thead><tr><th>Variante</th><th>% Ident.</th><th>¿Sitio activo?</th><th>Actividad</th><th>Estabilidad</th><th>Nota</th></tr></thead>' +
                '<tbody>' + fRows + '</tbody>' +
              '</table></div>';
          }

          resultsHTML +=
            '<div class="panel result-block">' +
              '<div class="result-db-label">' + dbLabel + '</div>' +
              '<div class="info-btn-row">' + infoBtns + '</div>' +
              infoBoxes + tableHTML +
            '</div>';
        });

        var tracks = buildProteinTrack('Silvestre', 'Referencia', REF_SEQ, null, 16);
        VARIANTS.forEach(function(v, i){
          var sub = v.mutPos.length + ' mutaciones · ' +
            (v.sitioActivo ? '<span style="color:var(--alert);">sitio activo afectado</span>' : 'fuera del sitio activo') +
            ' · ' + v.identidad + '% ident.';
          tracks += buildProteinTrack(v.label, sub, v.seq, REF_SEQ, 16 + (i + 1) * 2);
        });

        resultsHTML +=
          '<div class="panel">' +
            '<div class="result-db-label" style="margin:-14px -14px 12px;">MODELO 3D — SILVESTRE VS. VARIANTES (PIXEL-ART)</div>' +
            '<p style="font-size:15px;color:#8fa2ad;margin:0 0 10px;">La referencia se muestra en azul. El anillo ámbar marca el sitio activo en las cuatro proteínas — fijate si el rojo (mutación) cae dentro o fuera de ese anillo.</p>' +
            '<div class="protein3d-row">' + tracks + '</div>' +
            '<div class="protein3d-legend">' +
              '<span><i style="background:#4d8dff"></i>Referencia (silvestre)</span>' +
              '<span><i style="background:var(--phosphor)"></i>Conservado</span>' +
              '<span><i style="background:var(--alert)"></i>Mutado</span>' +
              '<span><i class="active-site"></i>Sitio activo</span>' +
            '</div>' +
          '</div>';
      }

      return '' +
        Game.UI.statusBar(state, true, caseId) +
        '<h2 class="screen-title">PANEL DE MODELADO DE PROTEÍNAS</h2>' +
        seqPanel + blastPanel + resultsHTML +
        '<button class="btn" onclick="Game.Engine.goTo(\'veredicto\',{caseId:\'' + caseId + '\'})">PASAR A DIAGNÓSTICO</button>';
    }
  });

  // ---- helper específico: valida secuencia de aminoácidos en vez de nucleótidos ----
  Game.UI = Game.UI || {};
  Game.UI._runProteinBlast = function(caseId, toolId){
    var input = document.getElementById('blast-input');
    var text  = input ? input.value.trim() : '';

    if(!text){
      alert('Primero copiá las secuencias del panel de arriba y pegalas en el campo de texto.');
      return;
    }
    var seqOnly = text.replace(/^>.*$/mg, '').replace(/\s+/g, '').toUpperCase();
    if(!seqOnly || !/^[ACDEFGHIKLMNPQRSTVWYXBZJUO*-]+$/.test(seqOnly)){
      alert('Las secuencias no parecen proteínas válidas. Copiá el texto completo en formato FASTA (incluyendo las líneas que empiezan con ">").');
      return;
    }

    var ok = Game.Engine.runTool(caseId, toolId);
    if(!ok){
      alert('No tenés suficientes créditos u horas para ejecutar este análisis.');
      return;
    }
    Game.Engine.goTo('laboratorio', { caseId: caseId });
  };
})();
