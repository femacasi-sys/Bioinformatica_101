(function(){
  window.Game = window.Game || {};

  Game.registerCase({
    id: 'brote_salmonella',
    characterKey: 'microbiologa',
    characterName: 'Dra. Marín · Microbióloga',
    title: 'Brote alimentario en un comedor escolar',
    difficulty: 2,
    objective: 'Identificar el microorganismo responsable del brote a partir del cultivo aislado, para que salud pública actúe sobre el comedor antes de que aparezcan más casos.',
    rewardLabel: '+reputación · +experiencia según desempeño',
    initialCredits: 120,
    initialHours: 8,
    briefing: [
      "Tres estudiantes de una escuela fueron internados con gastroenteritis severa en las últimas 48 horas. Sospechamos de una bacteria transmitida por alimentos, probablemente en el menú de ayer.",
      "Te dejé el expediente clínico y te mandé por correo la secuencia del cultivo aislado de una de las muestras. Armá vos el análisis: elegí bien la muestra, la herramienta, y no te olvides de filtrar los resultados con criterio — salud pública está esperando para actuar sobre el comedor."
    ],
    decisionQuestion: '¿Qué organismo identificás como responsable del brote y vas a informar a salud pública?',

    // ---- Etapa 2: escritorio virtual ----
    desktop: {
      objects: [
        {
          id: 'expediente', label: 'Expediente', emoji: '🗂', required: true,
          content: 'Paciente 1: F, 9 años. Inicio de síntomas: ayer 20:00hs. Fiebre 38.9°C, diarrea, dolor abdominal.\n' +
            'Paciente 2: M, 8 años. Inicio: ayer 21:30hs. Mismos síntomas + vómitos.\n' +
            'Paciente 3: F, 9 años. Inicio: hoy 02:00hs. Cuadro más leve, en observación.\n\n' +
            'Los tres almorzaron en el comedor escolar el mismo día. Menú: milanesa con puré, ensalada, postre de huevo.'
        },
        {
          id: 'correo', label: 'Correo', emoji: '📧', required: true,
          content: 'De: Dra. Marín\nAsunto: Cultivo aislado — urgente\n\n' +
            'Te paso la secuencia del cultivo aislado de la muestra del Paciente 1. Bajala y usala en el laboratorio.\n\n' +
            '>muestra_clinica_01\nATGAGTGAAACAATTGCGCTGGTTGATCTGGCAAAACGTATTCCGGCA\nGGCACCTTTAAAGGCAGCGTAGGTGATATTCTGGCCATTGATGGTAAA\nAGCACCCTGGTTGGTAAAGATGCGGAAAAAGTGAAACAGGCACTGGTT'
        },
        {
          id: 'manual', label: 'Manual', emoji: '📚', required: false,
          content: '% Identidad: qué tan parecida es tu secuencia al hit de referencia.\n' +
            'Cobertura: qué porción de tu secuencia quedó alineada.\n' +
            'E-value: probabilidad de que la coincidencia sea azar. Cuanto más chico, más confiable.\n' +
            'Un E-value laxo (ej. 10) deja pasar coincidencias débiles que no significan relación real entre organismos.'
        }
      ],
      samples: [
        { id: 'clinica01', label: 'Muestra clínica 01', correct: true,
          sub: 'Aislado de cultivo bacteriano del Paciente 1, tomado en las primeras 24h.' },
        { id: 'control_neg', label: 'Control negativo', correct: false,
          sub: 'Control negativo del kit de extracción, sin ADN bacteriano.', penalty: { hours: 1 } },
        { id: 'clinica_dudosa', label: 'Muestra clínica 02 (dudosa)', correct: false,
          sub: 'Etiquetada por el técnico como posible contaminación cruzada.', penalty: { credits: 20 } }
      ],
      tools: [
        { id: 'blast_local', label: 'BLAST — base local', correct: true,
          sub: 'Alineamiento contra secuencias bacterianas curadas del laboratorio.' },
        { id: 'alphafold', label: 'AlphaFold', correct: false,
          sub: 'Predicción de estructura 3D de proteínas — no identifica especies a partir de ADN.', penalty: { hours: 1, credits: 10 } }
      ]
    },

    // ---- Etapa 3: pipeline ----
    pipeline: {
      steps: [
        { id: 'cargar',   label: 'Cargar la secuencia FASTA del cultivo aislado' },
        { id: 'db',       label: 'Seleccionar la base de datos de referencia' },
        { id: 'ejecutar', label: 'Ejecutar el alineamiento BLAST' },
        { id: 'filtrar',  label: 'Filtrar los resultados por E-value' }
      ],
      initialOrder: ['ejecutar', 'cargar', 'filtrar', 'db'],
      params: {
        label: '¿Qué E-value de corte usás para filtrar hits confiables?',
        options: [
          { id: 'e10',  value: '10',     hint: 'Deja pasar casi cualquier coincidencia, incluso al azar.', quality: 'poor' },
          { id: 'e001', value: '0.01',   hint: 'Filtro moderado, uso general en la mayoría de laboratorios.', quality: 'partial' },
          { id: 'e20',  value: '1e-20',  hint: 'Solo conserva coincidencias estadísticamente muy significativas.', quality: 'optimal' }
        ]
      },
      runCost: { credits: 30, hours: 2 }
    },

    // ---- Etapa 4: resultados (varían según el E-value elegido en etapa 3) ----
    resultsMeta: {
      qualityLabel: {
        optimal: 'E-value estricto — hits de alta confianza',
        partial: 'E-value moderado — hay coincidencias ambiguas para revisar',
        poor: 'E-value laxo — la lista incluye bastante ruido de fondo'
      },
      qualityShort: { optimal: 'E-value estricto', partial: 'E-value moderado', poor: 'E-value laxo' },
      detailFields: [
        { key: 'identidad', label: 'Identidad' },
        { key: 'cobertura', label: 'Cobertura' },
        { key: 'evalue', label: 'E-value' }
      ]
    },
    results: (function(){
      var salmonella = { id: 'salmonella', name: 'Salmonella enterica serovar Typhimurium', badge: '99.8%',
        details: { identidad: '99.8%', cobertura: '100%', evalue: '0.0' },
        description: 'Coincidencia casi perfecta contra la cepa de referencia LT2. Es la serovariedad más asociada a brotes alimentarios por huevo y derivados.' };
      var enteritidis = { id: 'salmonella_enteritidis', name: 'Salmonella enterica serovar Enteritidis', badge: '96.5%',
        details: { identidad: '96.5%', cobertura: '99%', evalue: '2e-95' },
        description: 'Coincidencia significativa pero con menor identidad que Typhimurium — mismo género, distinta serovariedad.' };
      var bongori = { id: 'bongori', name: 'Salmonella bongori', badge: '93.1%',
        details: { identidad: '93.1%', cobertura: '97%', evalue: '4e-80' },
        description: 'Especie hermana de S. enterica, rara vez asociada a enfermedad humana.' };
      var citrobacter = { id: 'citrobacter', name: 'Citrobacter freundii', badge: '88.4%', badgeClass: 'neutral',
        details: { identidad: '88.4%', cobertura: '91%', evalue: '0.004' },
        description: 'Coincidencia moderada — comparte genes conservados con Salmonella pero no es el mismo género. Puede confundir si no se revisa la identidad con atención.' };
      var ecoli = { id: 'ecoli', name: 'Escherichia coli', badge: '85.1%', badgeClass: 'neg',
        details: { identidad: '85.1%', cobertura: '88%', evalue: '1.2' },
        description: 'Coincidencia débil por homología de genes housekeeping compartidos entre Enterobacteriaceae — no indica relación cercana real.' };
      var klebsiella = { id: 'klebsiella', name: 'Klebsiella pneumoniae', badge: '79.8%', badgeClass: 'neg',
        details: { identidad: '79.8%', cobertura: '80%', evalue: '3.4' },
        description: 'Coincidencia muy débil, típica del ruido que aparece al no filtrar por significancia estadística.' };
      return {
        optimal: [salmonella, enteritidis, bongori],
        partial: [salmonella, enteritidis, bongori, citrobacter],
        poor: [salmonella, enteritidis, bongori, citrobacter, ecoli, klebsiella]
      };
    })(),

    // ---- Etapa 5: decisión ----
    candidates: [
      { id: 'salmonella',  name: 'Salmonella enterica (serovar Typhimurium)' },
      { id: 'ecoli',       name: 'Escherichia coli' },
      { id: 'listeria',    name: 'Listeria monocytogenes' },
      { id: 'citrobacter', name: 'Citrobacter freundii' }
    ],
    correctAnswer: 'salmonella',
    consequence: {
      correct: "Confirmamos Salmonella enterica serovar Typhimurium. Salud pública retiró el lote de huevo sospechoso del comedor y no hubo casos nuevos. Tu informe fue claro, a tiempo y bien respaldado por la evidencia — así se hace.",
      incorrect: "El comedor actuó sobre tu informe y retiró el producto equivocado. Dos días después aparecieron dos casos nuevos y el equipo de salud pública tuvo que reabrir la investigación desde cero."
    }
  });
})();
