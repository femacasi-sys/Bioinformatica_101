(function(){
  window.Game = window.Game || {};

  var COLOR = { phosphor: '#4dff9f', amber: '#ffb627', alert: '#ff5d5d', line: '#2c3e4c', muted: '#8fa2ad', paper: '#eef2ee' };

  function lerp(a, b, t){ return a + (b - a) * t; }

  // t en [-1,1]: -1 = alert (bajo), 0 = gris neutro, 1 = phosphor (alto)
  function divergingColor(t){
    var mid = [92, 107, 116];
    var neg = [255, 93, 93];
    var pos = [77, 255, 159];
    var c = t < 0
      ? [lerp(mid[0], neg[0], -t), lerp(mid[1], neg[1], -t), lerp(mid[2], neg[2], -t)]
      : [lerp(mid[0], pos[0], t), lerp(mid[1], pos[1], t), lerp(mid[2], pos[2], t)];
    return 'rgb(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ')';
  }

  function directionColor(direction){
    return direction === 'enriched' ? COLOR.phosphor : COLOR.alert;
  }
  function directionLabel(direction){
    return direction === 'enriched' ? 'Enriquecido en Crohn' : 'Depleted en Crohn';
  }

  function directionLegend(){
    return '<div style="display:flex;gap:16px;margin-top:8px;font-size:13px;color:' + COLOR.muted + ';">' +
      '<span><span style="display:inline-block;width:10px;height:10px;background:' + COLOR.phosphor + ';border-radius:2px;margin-right:6px;"></span>Enriquecido en Crohn</span>' +
      '<span><span style="display:inline-block;width:10px;height:10px;background:' + COLOR.alert + ';border-radius:2px;margin-right:6px;"></span>Depleted en Crohn</span>' +
    '</div>';
  }

  // ---------- Diversidad alfa ----------
  function renderAlpha(d){
    var control = d.microbiome.alphaDiversity.control;
    var crohn = d.microbiome.alphaDiversity.crohn;
    var mean = function(arr){ return arr.reduce(function(a, b){ return a + b; }, 0) / arr.length; };
    var meanControl = mean(control), meanCrohn = mean(crohn);
    var maxVal = Math.max.apply(null, control.concat(crohn)) + 0.7;

    var W = 420, H = 260, padL = 40, padT = 20, padB = 34;
    var plotW = W - padL - 20, plotH = H - padT - padB;
    var barW = 90, gap = 60;
    var x0 = padL + (plotW - (barW * 2 + gap)) / 2;
    var yScale = function(v){ return padT + plotH - (v / maxVal) * plotH; };

    function bar(x, meanVal, samples, color, label){
      var barTop = yScale(meanVal);
      var barH = (padT + plotH) - barTop;
      var dots = samples.map(function(v, i){
        var jitter = (i - (samples.length - 1) / 2) * (barW / (samples.length + 1));
        var cx = x + barW / 2 + jitter;
        var cy = yScale(v);
        return '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="' + COLOR.paper + '" stroke="' + color + '" stroke-width="2"/>';
      }).join('');
      return '<rect x="' + x + '" y="' + barTop + '" width="' + barW + '" height="' + Math.max(barH, 0) + '" fill="' + color + '" opacity="0.25" rx="3"/>' +
        '<line x1="' + x + '" y1="' + barTop + '" x2="' + (x + barW) + '" y2="' + barTop + '" stroke="' + color + '" stroke-width="3"/>' +
        dots +
        '<text x="' + (x + barW / 2) + '" y="' + (barTop - 8) + '" text-anchor="middle" font-size="15" fill="' + color + '">' + meanVal.toFixed(1) + '</text>' +
        '<text x="' + (x + barW / 2) + '" y="' + (padT + plotH + 22) + '" text-anchor="middle" font-size="13" fill="' + COLOR.muted + '">' + label + '</text>';
    }

    var axis = '<line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (padT + plotH) + '" stroke="' + COLOR.line + '"/>' +
      '<line x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (W - 20) + '" y2="' + (padT + plotH) + '" stroke="' + COLOR.line + '"/>';
    var ticks = [0, 1, 2, 3, 4, 5].filter(function(t){ return t <= maxVal; }).map(function(t){
      var y = yScale(t);
      return '<text x="' + (padL - 8) + '" y="' + (y + 4) + '" text-anchor="end" font-size="11" fill="' + COLOR.muted + '">' + t + '</text>' +
        '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - 20) + '" y2="' + y + '" stroke="' + COLOR.line + '" stroke-width="0.5" opacity="0.4"/>';
    }).join('');

    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:' + W + 'px;height:auto;display:block;">' +
      ticks + axis +
      bar(x0, meanControl, control, COLOR.phosphor, 'Control') +
      bar(x0 + barW + gap, meanCrohn, crohn, COLOR.amber, 'Crohn') +
    '</svg>';

    return '<div class="panel">' +
      '<div class="seq-label" style="color:#8fa2ad;font-size:15px;">Diversidad alfa (índice de Shannon) por grupo</div>' +
      '<p style="font-size:14px;color:#8fa2ad;margin:6px 0 12px;">Cada punto es una muestra; la línea marca la media del grupo. Una diversidad menor en Crohn sugiere disbiosis, pero todavía no dice qué taxón es responsable.</p>' +
      svg +
    '</div>';
  }

  // ---------- Heatmap ----------
  function renderHeatmap(d, progress, caseId){
    var taxa = d.microbiome.taxa;
    var samples = d.microbiome.samples;
    var cw = 44, ch = 30, labelW = 190, headerH = 26, padTop = 6;
    var W = labelW + samples.length * cw + 16;
    var H = headerH + taxa.length * ch + padTop;

    var header = samples.map(function(s, i){
      var x = labelW + i * cw + cw / 2;
      return '<text x="' + x + '" y="' + (headerH - 8) + '" text-anchor="middle" font-size="11" fill="' + COLOR.muted + '">' + s.label.replace('Muestra_', '') + '</text>';
    }).join('');

    var dividerX = labelW + 4 * cw;
    var divider = '<line x1="' + dividerX + '" y1="' + headerH + '" x2="' + dividerX + '" y2="' + (headerH + taxa.length * ch) + '" stroke="' + COLOR.line + '" stroke-width="1.5" stroke-dasharray="3,3"/>';

    var rows = taxa.map(function(taxon, ri){
      var values = taxon.abundanceControl.concat(taxon.abundanceCrohn);
      var min = Math.min.apply(null, values), max = Math.max.apply(null, values);
      var mid = (min + max) / 2, halfRange = (max - min) / 2 || 1;
      var y = headerH + padTop + ri * ch;
      var selected = progress.dashboard.selectedTaxon === taxon.id;
      var cells = values.map(function(v, ci){
        var t = Math.max(-1, Math.min(1, (v - mid) / halfRange));
        var x = labelW + ci * cw;
        return '<rect x="' + x + '" y="' + y + '" width="' + (cw - 3) + '" height="' + (ch - 4) + '" rx="2" fill="' + divergingColor(t) + '"/>';
      }).join('');
      return '<g style="cursor:pointer;" onclick="Game.UI._selectTaxon(\'' + caseId + '\',\'' + taxon.id + '\')">' +
        '<rect x="0" y="' + y + '" width="' + (labelW - 8) + '" height="' + (ch - 4) + '" fill="' + (selected ? 'rgba(77,255,159,0.12)' : 'transparent') + '"/>' +
        '<text x="6" y="' + (y + (ch - 4) / 2 + 4) + '" font-size="13" fill="' + (selected ? COLOR.phosphor : COLOR.paper) + '">' + taxon.name + '</text>' +
        cells +
      '</g>';
    }).join('');

    var legendSwatches = [];
    for(var i = 0; i <= 10; i++){
      var t = (i / 10) * 2 - 1;
      legendSwatches.push('<rect x="' + (i * 10) + '" y="0" width="10" height="10" fill="' + divergingColor(t) + '"/>');
    }
    var legend = '<svg viewBox="0 0 110 10" xmlns="http://www.w3.org/2000/svg" style="width:110px;height:10px;vertical-align:middle;">' + legendSwatches.join('') + '</svg>';

    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:' + W + 'px;height:auto;display:block;">' +
      header + divider + rows +
    '</svg>';

    return '<div class="panel">' +
      '<div class="seq-label" style="color:#8fa2ad;font-size:15px;">Abundancia relativa por muestra (normalizada por taxón)</div>' +
      '<p style="font-size:14px;color:#8fa2ad;margin:6px 0 12px;">Cada fila es un taxón, cada columna una muestra (izquierda: control, derecha: Crohn). Hacé clic en una fila para ver el detalle. ' +
        'Menor ' + legend + ' Mayor' +
      '</p>' +
      svg +
    '</div>';
  }

  // ---------- Volcano plot ----------
  function renderVolcano(d, progress, caseId){
    var taxa = d.microbiome.taxa;
    var W = 460, H = 300, padL = 46, padR = 90, padT = 20, padB = 40;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var xMax = Math.max.apply(null, taxa.map(function(t){ return Math.abs(t.log2fc); })) + 0.8;
    var yMax = Math.max.apply(null, taxa.map(function(t){ return -Math.log10(t.padj); })) + 0.6;
    var xScale = function(v){ return padL + plotW / 2 + (v / xMax) * (plotW / 2); };
    var yScale = function(v){ return padT + plotH - (v / yMax) * plotH; };
    var thresholdY = yScale(-Math.log10(0.05));

    var axis = '<line x1="' + xScale(0) + '" y1="' + padT + '" x2="' + xScale(0) + '" y2="' + (padT + plotH) + '" stroke="' + COLOR.line + '"/>' +
      '<line x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (W - padR) + '" y2="' + (padT + plotH) + '" stroke="' + COLOR.line + '"/>' +
      '<line x1="' + padL + '" y1="' + thresholdY + '" x2="' + (W - padR) + '" y2="' + thresholdY + '" stroke="' + COLOR.muted + '" stroke-width="1" stroke-dasharray="4,4"/>' +
      '<text x="' + (W - padR + 4) + '" y="' + (thresholdY + 4) + '" font-size="10" fill="' + COLOR.muted + '">p-adj=0.05</text>' +
      '<text x="' + (padL + plotW / 2) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="11" fill="' + COLOR.muted + '">log2FC</text>';

    var points = taxa.map(function(t){
      var x = xScale(t.log2fc), y = yScale(-Math.log10(t.padj));
      var color = directionColor(t.direction);
      var selected = progress.dashboard.selectedTaxon === t.id;
      var r = selected ? 8 : 6;
      return '<g style="cursor:pointer;" onclick="Game.UI._selectTaxon(\'' + caseId + '\',\'' + t.id + '\')">' +
        '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + color + '" stroke="' + (selected ? COLOR.paper : 'none') + '" stroke-width="2"/>' +
        '<text x="' + (x + 10) + '" y="' + (y + 4) + '" font-size="11" fill="' + COLOR.muted + '">' + t.name.split(' ')[0] + '</text>' +
      '</g>';
    }).join('');

    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:' + W + 'px;height:auto;display:block;">' +
      axis + points +
    '</svg>';

    return '<div class="panel">' +
      '<div class="seq-label" style="color:#8fa2ad;font-size:15px;">Volcano plot — magnitud de cambio vs. significancia</div>' +
      '<p style="font-size:14px;color:#8fa2ad;margin:6px 0 12px;">Eje X: log2FC (cuánto cambió). Eje Y: -log10(p-adj) (cuán significativo — más arriba es más confiable). Hacé clic en un punto para ver el detalle.</p>' +
      svg + directionLegend() +
    '</div>';
  }

  // ---------- Abundancia diferencial ----------
  function renderDiffBar(d, progress, caseId){
    var taxa = d.microbiome.taxa.slice().sort(function(a, b){ return a.log2fc - b.log2fc; });
    var W = 460, rowH = 34, padL = 175, padR = 46, padTop = 10;
    var maxAbs = Math.max.apply(null, taxa.map(function(t){ return Math.abs(t.log2fc); })) + 0.5;
    var plotW = W - padL - padR;
    var xScale = function(v){ return padL + plotW / 2 + (v / maxAbs) * (plotW / 2); };
    var zeroX = xScale(0);
    var H = padTop * 2 + taxa.length * rowH;

    var rows = taxa.map(function(t, i){
      var y = padTop + i * rowH;
      var x = xScale(t.log2fc);
      var barX = Math.min(x, zeroX), barW = Math.abs(x - zeroX);
      var color = directionColor(t.direction);
      var selected = progress.dashboard.selectedTaxon === t.id;
      var labelAnchor = t.log2fc >= 0 ? 'start' : 'end';
      var labelX = x + (t.log2fc >= 0 ? 8 : -8);
      return '<g style="cursor:pointer;" onclick="Game.UI._selectTaxon(\'' + caseId + '\',\'' + t.id + '\')">' +
        '<rect x="0" y="' + y + '" width="' + (W - 20) + '" height="' + (rowH - 6) + '" fill="' + (selected ? 'rgba(77,255,159,0.10)' : 'transparent') + '"/>' +
        '<text x="6" y="' + (y + (rowH - 6) / 2 + 4) + '" font-size="13" fill="' + (selected ? COLOR.phosphor : COLOR.paper) + '">' + t.name + '</text>' +
        '<rect x="' + barX + '" y="' + (y + 4) + '" width="' + Math.max(barW, 2) + '" height="' + (rowH - 14) + '" rx="3" fill="' + color + '"/>' +
        '<text x="' + labelX + '" y="' + (y + (rowH - 6) / 2 + 4) + '" font-size="12" text-anchor="' + labelAnchor + '" fill="' + color + '">' + (t.log2fc > 0 ? '+' : '') + t.log2fc.toFixed(1) + '</text>' +
      '</g>';
    }).join('');

    var zeroLine = '<line x1="' + zeroX + '" y1="0" x2="' + zeroX + '" y2="' + H + '" stroke="' + COLOR.line + '" stroke-width="1"/>';

    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:' + W + 'px;height:auto;display:block;">' +
      zeroLine + rows +
    '</svg>';

    return '<div class="panel">' +
      '<div class="seq-label" style="color:#8fa2ad;font-size:15px;">Abundancia diferencial (log2FC) por taxón</div>' +
      '<p style="font-size:14px;color:#8fa2ad;margin:6px 0 12px;">Barras a la izquierda: depleted en Crohn. Barras a la derecha: enriquecido en Crohn. Ordenado de mayor a menor depleción.</p>' +
      svg + directionLegend() +
    '</div>';
  }

  function renderTaxonDetail(d, progress){
    var taxon = d.microbiome.taxa.filter(function(t){ return t.id === progress.dashboard.selectedTaxon; })[0];
    if(!taxon){
      return '<p style="color:#8fa2ad;font-size:15px;">Hacé clic sobre un taxón (fila del heatmap, punto del volcano plot o barra de abundancia diferencial) para ver el detalle.</p>';
    }
    return '<div class="hit-detail">' +
      '<span class="hit-detail-title">' + taxon.name + '</span>' +
      '<div class="hit-detail-grid">' +
        '<div>Dirección<b style="color:' + directionColor(taxon.direction) + ';">' + directionLabel(taxon.direction) + '</b></div>' +
        '<div>Log2FC<b>' + (taxon.log2fc > 0 ? '+' : '') + taxon.log2fc + '</b></div>' +
        '<div>p-adj<b>' + taxon.padj + '</b></div>' +
      '</div>' +
      '<p style="margin:0;">' + taxon.description + '</p>' +
    '</div>';
  }

  Game.registerScreen('dashboard', {
    render: function(state, params){
      var caseId = params.caseId;
      var d = Game.Cases[caseId];
      var progress = Game.Engine.getCaseProgress(caseId);
      var active = progress.dashboard.activeTab || 'alfa';

      var tabs = [
        { id: 'alfa', label: 'Diversidad alfa' },
        { id: 'heatmap', label: 'Heatmap' },
        { id: 'volcano', label: 'Volcano plot' },
        { id: 'diferencial', label: 'Abundancia diferencial' }
      ];
      var tabsHTML = tabs.map(function(t){
        return '<button class="tab-btn' + (active === t.id ? ' active' : '') + '" onclick="Game.UI._setActiveTab(\'' + caseId + '\',\'' + t.id + '\')">' + t.label + '</button>';
      }).join('');

      var content, showDetail;
      if(active === 'heatmap'){ content = renderHeatmap(d, progress, caseId); showDetail = true; }
      else if(active === 'volcano'){ content = renderVolcano(d, progress, caseId); showDetail = true; }
      else if(active === 'diferencial'){ content = renderDiffBar(d, progress, caseId); showDetail = true; }
      else { content = renderAlpha(d); showDetail = false; }

      var detailPanel = showDetail ?
        '<div class="panel">' + renderTaxonDetail(d, progress) +
          '<p style="font-size:13px;color:#8fa2ad;margin:8px 0 0;">Taxones explorados: ' + progress.dashboard.exploredTaxa.length + ' (mínimo 2 para continuar).</p>' +
        '</div>' : '';

      var canAdvance = Game.Engine.canAdvanceDashboard(caseId);

      return '' +
        Game.UI.statusBar(caseId) +
        Game.UI.backButton() +
        '<h3 class="stage-label">ETAPA 3 · EXPLORACIÓN DE RESULTADOS</h3>' +
        '<div class="tab-row">' + tabsHTML + '</div>' +
        content +
        detailPanel +
        '<button class="btn" ' + (!canAdvance ? 'disabled' : '') +
          ' onclick="Game.Engine.goTo(\'hipotesis\',{caseId:\'' + caseId + '\'})">CONTINUAR A HIPÓTESIS</button>';
    }
  });

  Game.UI = Game.UI || {};
  Game.UI._setActiveTab = function(caseId, tabId){
    Game.Engine.setActiveTab(caseId, tabId);
    Game.Engine.render();
  };
  Game.UI._selectTaxon = function(caseId, taxonId){
    Game.Engine.selectTaxon(caseId, taxonId);
    Game.Engine.render();
  };
})();
