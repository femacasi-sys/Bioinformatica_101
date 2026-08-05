(function(){
  window.Game = window.Game || {};

  Game.registerCase({
    id: 'biomarcador_microbioma',
    characterKey: 'microbiologa',
    characterName: 'Dra. Marín · Microbióloga',
    title: 'Microbioma: biomarcador de disbiosis en Crohn',
    difficulty: 3,
    objective: 'Identificar el género bacteriano más significativamente alterado en pacientes con Crohn, como biomarcador para evaluar una intervención probiótica.',
    rewardLabel: '+reputación · +experiencia según desempeño',
    initialCredits: 140,
    initialHours: 9,
    briefing: [
      "Estamos colaborando con gastroenterología en un estudio de microbioma intestinal: 20 pacientes en total, 10 controles sanos y 10 con enfermedad de Crohn activa confirmada por colonoscopía. Hicimos secuenciación amplicon del gen 16S rRNA (región V3-V4).",
      "Te dejé el protocolo del estudio y te mandé por correo el resumen del dataset, ya procesado con el software de limpieza y filtrado de secuencias. Necesito que organices las muestras, explores el dashboard de resultados y me digas cuál es el género bacteriano más alterado en los pacientes con Crohn — ese dato va al informe para evaluar una intervención probiótica."
    ],

    // ---- Etapa 2: escritorio virtual (preparación) ----
    desktop: {
      objects: [
        {
          id: 'expediente', label: 'Protocolo', emoji: '🗂', required: true,
          content: 'Estudio: IBD vs. controles sanos (n=20).\n' +
            '10 controles sanos, 10 pacientes con Crohn activa (diagnóstico confirmado por colonoscopía).\n' +
            'Región 16S: V3-V4 (amplicon ~460bp). Plataforma: secuenciador de nueva generación (lecturas pareadas 2x300).'
        },
        {
          id: 'correo', label: 'Correo', emoji: '📧', required: true,
          content: 'De: equipo de secuenciación\nAsunto: Dataset procesado\n\n' +
            'Reads/muestra (media): 45.231 | OTUs detectados: 847\n' +
            'Software: limpieza y filtrado de secuencias + análisis estadístico de abundancia\n' +
            'El dataset ya está demultiplexado y filtrado por calidad. Te dejamos un subconjunto de 8 muestras representativas (4 sanas + 4 Crohn) para organizar antes de correr el análisis comparativo.'
        },
        {
          id: 'manual', label: 'Manual', emoji: '📚', required: false,
          content: 'Diversidad alfa (Shannon): mide qué tan diverso es el microbioma DENTRO de cada muestra — dice SI hay disbiosis, no QUÉ bacteria es responsable.\n' +
            'Abundancia diferencial: compara cada taxón entre grupos — dice QUÉ bacteria específica cambió y cuánto (log2FC, p-adj).\n' +
            'Un taxón enriquecido y significativo no es automáticamente el biomarcador más relevante: importa también la magnitud del cambio y su rol biológico conocido.'
        }
      ],
      samples: [
        { id: 'dataset_completo', label: 'microbioma_crohn_v2.tsv', correct: true,
          sub: 'Dataset completo, 20 muestras (10 sanos + 10 Crohn), ya filtrado por calidad.' },
        { id: 'dataset_piloto', label: 'microbioma_piloto_v1.tsv', correct: false,
          sub: 'Corrida piloto con solo 6 muestras — subestimada para conclusiones robustas.', penalty: { hours: 1 } },
        { id: 'dataset_contaminado', label: 'microbioma_lote3_raw.tsv', correct: false,
          sub: 'Lote con contaminación de kit detectada por el equipo de secuenciación, marcado para descarte.', penalty: { credits: 20 } }
      ],
      tools: [
        { id: 'qiime2_local', label: 'Software de diversidad y abundancia', correct: true,
          sub: 'Pipeline estándar de diversidad y abundancia diferencial para 16S.' },
        { id: 'blast_organismo', label: 'BLAST de identificación de especie', correct: false,
          sub: 'Sirve para un organismo aislado, no para comparar comunidades microbianas completas.', penalty: { hours: 1, credits: 15 } }
      ]
    },

    // ---- Etapa 3 (microbioma): organización del estudio + elección del primer análisis ----
    microbiome: {
      samples: [
        { id: 's1', label: 'Muestra_H01', group: 'control', desc: 'Control sano, sin síntomas gastrointestinales.' },
        { id: 's2', label: 'Muestra_H02', group: 'control', desc: 'Control sano, cohorte de referencia.' },
        { id: 's3', label: 'Muestra_H03', group: 'control', desc: 'Control sano, sin tratamiento farmacológico.' },
        { id: 's4', label: 'Muestra_H04', group: 'control', desc: 'Control sano, colonoscopía normal.' },
        { id: 's5', label: 'Muestra_P01', group: 'crohn', desc: 'Crohn activa, confirmada por colonoscopía.' },
        { id: 's6', label: 'Muestra_P02', group: 'crohn', desc: 'Crohn activa, en tratamiento con corticoides.' },
        { id: 's7', label: 'Muestra_P03', group: 'crohn', desc: 'Crohn activa, brote reciente.' },
        { id: 's8', label: 'Muestra_P04', group: 'crohn', desc: 'Crohn activa, afectación ileocecal.' }
      ],
      analysisOptions: [
        { id: 'alfa', label: 'Diversidad alfa', hint: '¿Hay disbiosis? Compara la diversidad DENTRO de cada muestra.' },
        { id: 'beta', label: 'Diversidad beta', hint: '¿Los grupos se separan como comunidades? En este dashboard se explora junto al heatmap.' },
        { id: 'diferencial', label: 'Abundancia diferencial', hint: '¿QUÉ taxón específico cambió, y cuánto?' }
      ],
      alphaDiversity: {
        control: [4.1, 4.3, 3.9, 4.0],
        crohn:   [2.6, 2.9, 2.4, 2.8]
      },
      taxa: [
        { id: 'faecalibacterium', name: 'Faecalibacterium prausnitzii', log2fc: -3.2, padj: 0.0001, direction: 'depleted',
          abundanceControl: [12, 13, 11, 12], abundanceCrohn: [2, 3, 2, 2],
          description: 'Productor clave de butirato, un ácido graso antiinflamatorio. Su depleción es uno de los hallazgos más robustos y replicados en enfermedad de Crohn.' },
        { id: 'ruminococcus', name: 'Ruminococcus gnavus', log2fc: 2.8, padj: 0.0003, direction: 'enriched',
          abundanceControl: [1.0, 1.2, 0.8, 1.0], abundanceCrohn: [4.0, 4.5, 3.8, 4.2],
          description: 'Más abundante en pacientes con Crohn, con alta significancia — pero un taxón enriquecido no explica por sí solo la pérdida de función protectora que se busca en este informe.' },
        { id: 'roseburia', name: 'Roseburia intestinalis', log2fc: -2.4, padj: 0.002, direction: 'depleted',
          abundanceControl: [8.0, 7.5, 8.2, 7.8], abundanceCrohn: [2.5, 3.0, 2.2, 2.8],
          description: 'Otro productor de butirato depletado en Crohn, pero con menor magnitud de cambio y significancia que Faecalibacterium.' },
        { id: 'bacteroides', name: 'Bacteroides fragilis', log2fc: 1.9, padj: 0.008, direction: 'enriched',
          abundanceControl: [15.0, 14.0, 15.5, 14.8], abundanceCrohn: [20.0, 21.0, 19.5, 20.5],
          description: 'Más abundante en pacientes con Crohn, pero el aumento es menor y no es el hallazgo principal del estudio.' },
        { id: 'lachno', name: 'Lachnospiraceae UCG-004', log2fc: -1.3, padj: 0.03, direction: 'depleted',
          abundanceControl: [5.0, 5.2, 4.8, 5.1], abundanceCrohn: [3.0, 3.2, 2.8, 3.1],
          description: 'Depleción menor, con significancia más débil — aparece al usar un umbral menos estricto que el óptimo.' },
        { id: 'akker', name: 'Akkermansia muciniphila', log2fc: 1.1, padj: 0.07, direction: 'enriched',
          abundanceControl: [2.0, 2.1, 1.9, 2.0], abundanceCrohn: [2.8, 2.9, 2.7, 3.0],
          description: 'Cambio leve, cerca del límite de significancia (p-adj > 0.05) — típico ruido que aparece al revisar todos los taxones sin filtrar.' }
      ],
      correctBiomarkerId: 'faecalibacterium'
    },

    findingsOptions: [
      { id: 'f1', text: 'La diversidad alfa (Shannon) es menor en los pacientes con Crohn' },
      { id: 'f2', text: 'Faecalibacterium prausnitzii está depletado con alta significancia (log2FC -3.2, p-adj < 0.001)' },
      { id: 'f3', text: 'Ruminococcus gnavus está enriquecido en Crohn con alta significancia' },
      { id: 'f4', text: 'No se detectaron diferencias significativas entre los grupos' },
      { id: 'f5', text: 'Esto confirma que Faecalibacterium causa la enfermedad de Crohn' }
    ],

    // ---- Etapa 5: decisión final (siguiente experimento) ----
    decisionQuestion: '¿Cuál es el siguiente paso más apropiado para validar este hallazgo antes de una intervención clínica?',
    candidates: [
      { id: 'validar_cohorte',      name: 'Validar el hallazgo en una cohorte independiente' },
      { id: 'ensayo_probioticos',   name: 'Iniciar directamente un ensayo con probióticos de Faecalibacterium' },
      { id: 'ampliar_muestra',      name: 'Ampliar la muestra actual sin cambiar el diseño' },
      { id: 'repetir_secuenciacion', name: 'Repetir la secuenciación de las mismas 20 muestras' }
    ],
    correctAnswer: 'validar_cohorte',
    consequence: {
      correctFull: "Elegiste validar el hallazgo en una cohorte independiente, el paso metodológicamente correcto antes de cualquier intervención clínica — y tu hipótesis sobre Faecalibacterium prausnitzii como biomarcador principal era la correcta. El estudio queda listo para escalar hacia un ensayo de probióticos bien fundamentado.",
      correctPartial: "Elegiste validar el hallazgo en una cohorte independiente, la decisión metodológica correcta — pero tu hipótesis inicial sobre cuál era el biomarcador principal no era la más sólida. La validación en cohorte lo va a poner en evidencia igual, aunque el informe preliminar quedó menos preciso de lo que podría haber sido.",
      incorrect: "Saltar directo a una intervención clínica, repetir la secuenciación sin cambiar el diseño, o ampliar la muestra sin validar primero son errores metodológicos frecuentes en microbioma — el equipo tuvo que frenar el proyecto y revisar el análisis desde cero antes de avanzar."
    }
  });
})();
