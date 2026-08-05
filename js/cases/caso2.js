(function(){
  window.Game = window.Game || {};

  Game.registerCase({
    id: 'variante_brca1',
    characterKey: 'genetista',
    characterName: 'Dr. Vega · Genetista',
    title: 'Variante genética hereditaria en BRCA1',
    difficulty: 3,
    objective: 'Recorrer el pipeline completo — de las lecturas crudas a la interpretación clínica — para clasificar la variante detectada en BRCA1 y decidir si la paciente necesita derivación a consejería genética preventiva.',
    rewardLabel: '+reputación · +experiencia según desempeño',
    initialCredits: 150,
    initialHours: 10,
    briefing: [
      "Paciente 42: mujer de 35 años con historia familiar de cáncer de mama hereditario — madre y tía materna afectadas antes de los 45. Ordenamos secuenciación del exón 11 de BRCA1, región donde se concentra la mayoría de las variantes patogénicas conocidas del gen.",
      "Te dejé el expediente con el árbol familiar y te mandé por correo las lecturas crudas del secuenciador (Paciente_07.fastq). A partir de acá el análisis es todo tuyo: armá el pipeline, corré el alineamiento, encontrá la variante y anotala clínicamente. La paciente espera tu informe para decidir junto al equipo clínico sobre medidas preventivas."
    ],
    decisionQuestion: '¿Cuál es la clasificación clínica correcta de la variante principal detectada en esta paciente?',

    // ---- Etapa 2: escritorio virtual (preparación) ----
    desktop: {
      objects: [
        {
          id: 'expediente', label: 'Expediente', emoji: '🗂', required: true,
          content: 'Paciente 42, F, 35 años.\n' +
            'Historia familiar: madre (cáncer de mama, dx. 41 años), tía materna (cáncer de mama, dx. 44 años).\n' +
            'Sin diagnóstico oncológico propio. Estudio solicitado: panel BRCA1/BRCA2 por antecedentes familiares.'
        },
        {
          id: 'correo', label: 'Correo', emoji: '📧', required: true,
          content: 'De: Dr. Vega\nAsunto: Paciente con sospecha de cáncer hereditario\n\n' +
            'Te paso las lecturas crudas del secuenciador para el exón 11 de BRCA1.\n\n' +
            'Adjuntos:\n' +
            '  Paciente_07.fastq\n' +
            '  HistoriaClinica.pdf\n' +
            '  Pedigree.png\n\n' +
            'No hay variante "detectada" todavía — eso es justamente lo que tenés que construir vos con el pipeline.'
        },
        {
          id: 'manual', label: 'Manual', emoji: '📚', required: false,
          content: 'Un pipeline de variantes tiene un orden fijo: cargar las lecturas, cargar la referencia, alinear, llamar variantes y recién ahí anotar.\n' +
            'Clasificación ACMG: Patogénica / Probablemente patogénica / VUS / Probablemente benigna / Benigna.\n' +
            'Frecuencia poblacional (gnomAD): las variantes patogénicas de enfermedades graves suelen ser muy raras (<0.01%).'
        }
      ],
      samples: [
        { id: 'paciente07', label: 'Paciente_07.fastq', correct: true,
          sub: 'Lecturas crudas de secuenciación del exón 11 de BRCA1 de esta paciente.' },
        { id: 'control_sano', label: 'Control sano (cohorte)', correct: false,
          sub: 'Muestra de referencia de la cohorte sana — no corresponde a esta paciente.', penalty: { hours: 1 } },
        { id: 'paciente07_error', label: 'Paciente_07_run1.fastq (corrida fallida)', correct: false,
          sub: 'Corrida descartada por baja calidad de secuenciación (Q<20).', penalty: { credits: 25 } }
      ],
      tools: [
        { id: 'pipeline_variantes', label: 'Pipeline de variantes (align + call + annotate)', correct: true,
          sub: 'Flujo completo para pasar de lecturas crudas a variante anotada clínicamente.' },
        { id: 'blast_especies', label: 'BLAST de identificación de especie', correct: false,
          sub: 'Sirve para identificar organismos, no para llamar variantes en un genoma humano.', penalty: { hours: 1, credits: 15 } }
      ]
    },

    // ---- Etapa 3: pipeline de bloques (arrastrar y completar el código) ----
    blocks: {
      intro: 'Completá el pipeline arrastrando cada bloque a la línea correcta del código.',
      slots: [
        { id: 'input',     prefix: 'input = ',                          suffix: '',                correctBlockId: 'fastq' },
        { id: 'reference', prefix: 'reference = ',                      suffix: '',                correctBlockId: 'ref' },
        { id: 'alignment', prefix: 'alignment = ',                      suffix: '(input, reference)', correctBlockId: 'alignFn' },
        { id: 'variants',  prefix: 'variants = ',                       suffix: '(alignment)',     correctBlockId: 'callFn' }
      ],
      fixedLine: 'report = annotate(variants)',
      pool: [
        { id: 'fastq',   label: 'Paciente_07.fastq' },
        { id: 'ref',     label: 'BRCA1_reference.fasta' },
        { id: 'alignFn', label: 'align()' },
        { id: 'callFn',  label: 'call_variants()' },
        { id: 'blastFn', label: 'blast()' },
        { id: 'plotFn',  label: 'plot()' }
      ],
      execLines: [
        { text: 'Loading FASTQ...',    hint: 'Cargando las lecturas crudas de secuenciación del paciente.' },
        { text: 'Reference loaded...', hint: 'Se cargó BRCA1_reference.fasta, la secuencia de referencia del gen.' },
        { text: 'Aligning reads...',   hint: 'Alineando cada lectura contra la referencia para ubicar su posición exacta.' },
        { text: 'Calling variants...', hint: 'Comparando paciente y referencia para detectar diferencias.' },
        { text: 'Finished.',           hint: '' }
      ],
      runCost: { credits: 40, hours: 2 }
    },

    // ---- Etapa 4: visor de alineamiento ----
    alignment: {
      regions: [
        { id: 'r1', ref: 'ATGGATCTGATCGATCGATCGATCG',  pat: 'ATGGATCTGATCGATCGATCGATCG',  hasVariant: false },
        { id: 'r2', ref: 'ATCGATCTAGCATGGATCTGATCGA',  pat: 'ATCGATCTAGCATGGATCTGATCGA',  hasVariant: false },
        { id: 'r3', ref: 'TCGATCGATCGATCGATCTAGCATG',  pat: 'TCGATCGATCCGATCGATCTAGCATG', hasVariant: true, mismatchIndex: 9, variantNotation: 'c.5266dupC' },
        { id: 'r4', ref: 'GATCTGATCGATCGATCGATCGATC',  pat: 'GATCTGATCGATCGATCGATCGATC',  hasVariant: false }
      ]
    },

    // ---- Etapa 5: interpretación clínica ----
    interpretacion: {
      databases: [
        { id: 'clinvar', label: 'ClinVar', desc: 'Interpretaciones clínicas enviadas por laboratorios acreditados.', cost: { credits: 20, hours: 1 }, result: 'Patogénica — RCV000017661' },
        { id: 'gnomad',  label: 'gnomAD',  desc: 'Frecuencia poblacional en más de 140.000 genomas de referencia.', cost: { credits: 15, hours: 1 }, result: 'Frecuencia muy baja: 0.00008% — consistente con enfermedad grave rara.' },
        { id: 'omim',    label: 'OMIM',    desc: 'Catálogo de enfermedades genéticas y su base molecular.',          cost: { credits: 15, hours: 1 }, result: 'Asociada a síndrome hereditario de cáncer de mama y ovario (OMIM:604370).' }
      ]
    },

    // ---- Etapa 6: decisión ----
    candidates: [
      { id: 'patogenica',    name: 'Patogénica — BRCA1:c.5266dupC causa la enfermedad' },
      { id: 'vus',           name: 'VUS — Significancia incierta, no actuar aún' },
      { id: 'benigna',       name: 'Benigna — polimorfismo sin relevancia clínica' },
      { id: 'sin_variantes', name: 'Sin variantes — la secuencia no muestra alteraciones' }
    ],
    correctAnswer: 'patogenica',
    consequence: {
      correctFull:    "Confirmaste BRCA1:c.5266dupC como variante patogénica y respaldaste el informe consultando ClinVar, gnomAD y OMIM. La paciente fue derivada a consejería genética y al programa de seguimiento preventivo — con la frecuencia poblacional y la referencia clínica que un caso así necesita.",
      correctPartial: "Identificaste correctamente BRCA1:c.5266dupC como patogénica, pero tu informe no consultó las tres bases disponibles. La derivación se hizo igual, pero un informe de genética clínica sin ese respaldo completo puede ser cuestionado por el equipo tratante.",
      incorrect:      "Tu clasificación dejó sin acción clínica una variante patogénica conocida. La paciente no recibió derivación al programa preventivo — en genética clínica, un error de interpretación tiene consecuencias directas sobre la salud de la paciente y de sus familiares en riesgo."
    }
  });
})();
