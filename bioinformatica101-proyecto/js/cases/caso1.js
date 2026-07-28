(function(){
  window.Game = window.Game || {};

  Game.registerCase({
    id: 'caso1',
    implemented: true,
    characterKey: 'microbiologa',
    characterName: 'Dra. Marín · Microbióloga',
    title: 'Brote alimentario en un comedor escolar',
    briefing: [
      "Tres estudiantes de una escuela fueron internados con gastroenteritis severa en las últimas 48 horas. Sospechamos de una bacteria transmitida por alimentos, probablemente en el menú de ayer.",
      "Te envío la secuencia obtenida de un cultivo aislado de una de las muestras clínicas. Necesito que identifiques el organismo lo antes posible: salud pública está esperando para actuar sobre el comedor."
    ],
    sampleLabel: 'muestra_clinica_01.fasta',
    sampleData: ">muestra_clinica_01\nATGAGTGAAACAATTGCGCTGGTTGATCTGGCAAAACGTATTCCGGCA\nGGCACCTTTAAAGGCAGCGTAGGTGATATTCTGGCCATTGATGGTAAA\nAGCACCCTGGTTGGTAAAGATGCGGAAAAAGTGAAACAGGCACTGGTT",
    maxHours: 6,
    tools: [
      { id: 'quick', name: 'Búsqueda en base de datos local', costBudget: 50, costHours: 1 },
      { id: 'full',  name: 'Búsqueda en base de datos NCBI', costBudget: 150, costHours: 3 }
    ],
    results: {
      quick: [
        { organismo: 'Salmonella enterica',    accession: 'CP034479.1', identidad: '95.2', cobertura: '98', score: 312, evalue: '1e-40', main: true  },
        { organismo: 'Salmonella bongori',      accession: 'FR877557.1', identidad: '91.8', cobertura: '95', score: 267, evalue: '3e-32', main: false },
        { organismo: 'Citrobacter freundii',    accession: 'CP013049.1', identidad: '88.4', cobertura: '91', score: 231, evalue: '2e-28', main: false },
        { organismo: 'Escherichia coli',        accession: 'AE005174.2', identidad: '85.1', cobertura: '88', score: 198, evalue: '4e-22', main: false },
        { organismo: 'Klebsiella pneumoniae',   accession: 'CP010377.1', identidad: '82.3', cobertura: '83', score: 175, evalue: '8e-18', main: false }
      ],
      full: [
        { organismo: 'Salmonella enterica subsp. enterica serovar Typhimurium str. LT2', accession: 'AE006468.2', identidad: '99.8', cobertura: '100', score: 456, evalue: '0.0',    main: true  },
        { organismo: 'Salmonella enterica subsp. enterica serovar Enteritidis PT4',      accession: 'AM933172.1', identidad: '98.2', cobertura: '100', score: 441, evalue: '0.0',    main: false },
        { organismo: 'Salmonella enterica subsp. enterica serovar Typhi Ty2',            accession: 'AL513382.1', identidad: '96.5', cobertura: '99',  score: 398, evalue: '0.0',    main: false },
        { organismo: 'Salmonella bongori N268-08',                                       accession: 'HE999759.1', identidad: '93.1', cobertura: '97',  score: 352, evalue: '1e-98',  main: false },
        { organismo: 'Citrobacter freundii ATCC 8090',                                   accession: 'CP013049.1', identidad: '89.4', cobertura: '94',  score: 298, evalue: '1e-78',  main: false },
        { organismo: 'Escherichia coli O157:H7 str. Sakai',                              accession: 'AE005174.2', identidad: '87.6', cobertura: '91',  score: 271, evalue: '2e-66',  main: false },
        { organismo: 'Enterobacter cloacae subsp. cloacae ATCC 13047',                   accession: 'CP001918.1', identidad: '83.2', cobertura: '87',  score: 234, evalue: '5e-54',  main: false },
        { organismo: 'Klebsiella pneumoniae KPNIH1',                                     accession: 'CP006700.1', identidad: '79.8', cobertura: '83',  score: 198, evalue: '3e-43',  main: false },
        { organismo: 'Cronobacter sakazakii ATCC BAA-894',                               accession: 'CP000783.1', identidad: '76.3', cobertura: '79',  score: 165, evalue: '8e-31',  main: false }
      ]
    },
    candidates: [
      { id: 'salmonella',  name: 'Salmonella enterica' },
      { id: 'ecoli',       name: 'Escherichia coli O157:H7' },
      { id: 'listeria',    name: 'Listeria monocytogenes' },
      { id: 'citrobacter', name: 'Citrobacter freundii' }
    ],
    correctAnswer: 'salmonella',
    consequence: {
      correctFull:  "Confirmamos Salmonella enterica serovar Typhimurium. Salud pública ya retiró el lote de huevo sospechoso del comedor. Tu identificación fue clara y bien respaldada — así se hace.",
      correctQuick: "Confirmamos Salmonella enterica. Acertaste, pero el resultado de la base local dejaba a Citrobacter freundii bastante cerca. Con datos así de ajustados, conviene confirmar en NCBI antes de firmar el informe.",
      incorrect:    "El comedor actuó sobre tu informe y retiró el producto equivocado. Dos días después hubo dos casos nuevos. El equipo de salud pública tuvo que reabrir la investigación desde cero."
    }
  });
})();
