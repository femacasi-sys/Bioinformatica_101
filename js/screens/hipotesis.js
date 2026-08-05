(function(){
  window.Game = window.Game || {};

  Game.registerScreen('hipotesis', {
    render: function(state, params){
      var caseId   = params.caseId;
      var d        = Game.Cases[caseId];
      var progress = Game.Engine.getCaseProgress(caseId);

      var findingsHTML = d.findingsOptions.map(function(f){
        var checked = progress.hipotesis.findings.indexOf(f.id) !== -1;
        return '<div class="finding-item' + (checked ? ' checked' : '') + '" onclick="Game.UI._toggleFinding(\'' + caseId + '\',\'' + f.id + '\')">' +
          '<span class="finding-box">' + (checked ? '✓' : '') + '</span>' +
          '<span>' + f.text + '</span>' +
        '</div>';
      }).join('');

      var biomarkerHTML = d.microbiome.taxa.map(function(t){
        var picked = progress.hipotesis.biomarkerId === t.id;
        var cls = picked ? (progress.hipotesis.biomarkerCorrect ? ' correct-picked' : ' wrong') : '';
        return '<div class="pick-card' + cls + '" onclick="Game.UI._pickBiomarker(\'' + caseId + '\',\'' + t.id + '\')">' +
          '<div class="pick-title">' + t.name + '</div>' +
          '<div class="pick-sub">Log2FC ' + (t.log2fc > 0 ? '+' : '') + t.log2fc + ' · p-adj ' + t.padj + '</div>' +
        '</div>';
      }).join('');

      var biomarkerFeedback = '';
      if(progress.hipotesis.biomarkerId){
        biomarkerFeedback = progress.hipotesis.biomarkerCorrect
          ? '<p style="color:var(--phosphor);font-size:14px;margin:8px 0 0;">Es el taxón con mayor magnitud de cambio y significancia — buen candidato a biomarcador.</p>'
          : '<p style="color:var(--alert);font-size:14px;margin:8px 0 0;">Es un hallazgo real, pero no es el que mejor explica la pérdida de función protectora en este estudio. Revisá el volcano plot y la abundancia diferencial.</p>';
      }

      var canAdvance = Game.Engine.canAdvanceHipotesis(caseId);

      return '' +
        Game.UI.statusBar(caseId) +
        Game.UI.backButton() +
        '<h3 class="stage-label">ETAPA 4 · CONSTRUCCIÓN DE LA HIPÓTESIS</h3>' +
        '<div class="panel">' +
          '<div class="seq-label" style="color:#8fa2ad;font-size:15px;">¿Qué hallazgos son relevantes para el informe?</div>' +
          findingsHTML +
        '</div>' +
        '<div class="panel">' +
          '<div class="seq-label" style="color:#8fa2ad;font-size:15px;">¿Cuál es el mejor biomarcador de disbiosis en este estudio?</div>' +
          '<div class="sample-row">' + biomarkerHTML + '</div>' +
          biomarkerFeedback +
        '</div>' +
        '<button class="btn" ' + (!canAdvance ? 'disabled' : '') +
          ' onclick="Game.Engine.goTo(\'decision\',{caseId:\'' + caseId + '\'})">CONTINUAR A DECISIÓN FINAL</button>';
    }
  });

  Game.UI = Game.UI || {};
  Game.UI._toggleFinding = function(caseId, findingId){
    Game.Engine.toggleFinding(caseId, findingId);
    Game.Engine.render();
  };
  Game.UI._pickBiomarker = function(caseId, biomarkerId){
    Game.Engine.pickBiomarker(caseId, biomarkerId);
    Game.Engine.render();
  };
})();
