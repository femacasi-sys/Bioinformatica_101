(function(){
  window.Game = window.Game || {};
  Game.Screens = Game.Screens || {};
  Game.Cases = Game.Cases || {};
  Game.CaseOrder = Game.CaseOrder || [];

  Game.registerScreen = function(name, def){
    Game.Screens[name] = def;
  };

  Game.registerCase = function(caseData){
    Game.Cases[caseData.id] = caseData;
    Game.CaseOrder.push(caseData.id);
  };

  var SAVE_KEY = 'bio101_avanzado_save_v1';

  function defaultState(){
    return {
      reputation: 50,
      experience: 0,
      caseProgress: {}
    };
  }

  function freshProgress(){
    return {
      stage: 'briefing',
      accepted: false,
      credits: 0,
      hours: 0,
      desktop: { opened: [], sampleId: null, toolId: null, errors: 0 },
      pipeline: { order: null, orderCorrect: null, orderAttempts: 0, paramId: null, ran: false, quality: null },
      blocks: { placed: {}, results: {}, allCorrect: false, attempts: 0 },
      alignment: { selectedRegion: null, found: false, attempts: 0 },
      interpretacion: { queried: [] },
      organizacion: { placed: {}, results: {}, allCorrect: false, attempts: 0, firstAnalysis: null },
      dashboard: { exploredTaxa: [], activeTab: 'alfa', selectedTaxon: null },
      hipotesis: { findings: [], biomarkerId: null, biomarkerCorrect: null },
      resultados: { explored: [], selected: null },
      decision: { candidateId: null, correct: null },
      stars: null
    };
  }

  var Engine = {
    state: null,
    currentScreen: null,
    currentParams: {},

    load: function(){
      try{
        var raw = localStorage.getItem(SAVE_KEY);
        this.state = raw ? JSON.parse(raw) : defaultState();
      }catch(e){
        this.state = defaultState();
      }
    },

    save: function(){
      try{
        localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
      }catch(e){
        console.warn('No se pudo guardar el progreso:', e);
      }
    },

    init: function(){
      this.load();
      this.goTo('inicio', {}, { replace: true });
    },

    goTo: function(screenName, params, opts){
      opts = opts || {};
      this.currentScreen = screenName;
      this.currentParams = params || {};
      var histState = { screen: this.currentScreen, params: this.currentParams };
      if(opts.replace){
        history.replaceState(histState, '');
      }else{
        history.pushState(histState, '');
      }
      this.render();
    },

    goBack: function(){
      history.back();
    },

    render: function(){
      var def = Game.Screens[this.currentScreen];
      var root = document.getElementById('screen');
      if(!def){
        root.innerHTML = '<p>Pantalla no encontrada: ' + this.currentScreen + '</p>';
        return;
      }
      root.innerHTML = def.render(this.state, this.currentParams);
      if(def.mount) def.mount(this.state, this.currentParams);
    },

    // ---- progreso de casos ----
    getCaseProgress: function(caseId){
      if(!this.state.caseProgress[caseId]){
        this.state.caseProgress[caseId] = freshProgress();
      }
      var progress = this.state.caseProgress[caseId];
      // Backfill de sub-objetos agregados en versiones posteriores del motor,
      // para que una partida guardada con una versión anterior (sin blocks/
      // alignment/interpretacion) no rompa el render al llegar a esas etapas.
      var defaults = freshProgress();
      if(!progress.blocks) progress.blocks = defaults.blocks;
      if(!progress.alignment) progress.alignment = defaults.alignment;
      if(!progress.interpretacion) progress.interpretacion = defaults.interpretacion;
      if(!progress.organizacion) progress.organizacion = defaults.organizacion;
      if(!progress.dashboard) progress.dashboard = defaults.dashboard;
      if(!progress.hipotesis) progress.hipotesis = defaults.hipotesis;
      return progress;
    },

    resetCase: function(caseId){
      this.state.caseProgress[caseId] = freshProgress();
      this.save();
    },

    // ---- Etapa 1: aceptar caso ----
    acceptCase: function(caseId){
      var caseData = Game.Cases[caseId];
      var progress = this.getCaseProgress(caseId);
      if(!progress.accepted){
        progress.accepted = true;
        progress.credits = caseData.initialCredits;
        progress.hours = caseData.initialHours;
        progress.stage = 'preparacion';
        this.save();
      }
      this.goTo('preparacion', { caseId: caseId });
    },

    // ---- Etapa 2: escritorio virtual ----
    openObject: function(caseId, objId){
      var progress = this.getCaseProgress(caseId);
      if(progress.desktop.opened.indexOf(objId) === -1){
        progress.desktop.opened.push(objId);
        this.save();
      }
    },

    _applyPenalty: function(progress, penalty){
      if(!penalty) return;
      if(penalty.credits) progress.credits = Math.max(0, progress.credits - penalty.credits);
      if(penalty.hours) progress.hours = Math.max(0, progress.hours - penalty.hours);
    },

    pickSample: function(caseId, sampleId){
      var caseData = Game.Cases[caseId];
      var progress = this.getCaseProgress(caseId);
      var sample = caseData.desktop.samples.filter(function(s){ return s.id === sampleId; })[0];
      if(!sample) return;
      progress.desktop.sampleId = sampleId;
      if(!sample.correct){
        progress.desktop.errors += 1;
        this._applyPenalty(progress, sample.penalty);
      }
      this.save();
    },

    pickTool: function(caseId, toolId){
      var caseData = Game.Cases[caseId];
      var progress = this.getCaseProgress(caseId);
      var tool = caseData.desktop.tools.filter(function(t){ return t.id === toolId; })[0];
      if(!tool) return;
      progress.desktop.toolId = toolId;
      if(!tool.correct){
        progress.desktop.errors += 1;
        this._applyPenalty(progress, tool.penalty);
      }
      this.save();
    },

    canAdvancePreparacion: function(caseId){
      var caseData = Game.Cases[caseId];
      var progress = this.getCaseProgress(caseId);
      var requiredOpened = caseData.desktop.objects
        .filter(function(o){ return o.required; })
        .every(function(o){ return progress.desktop.opened.indexOf(o.id) !== -1; });
      var sample = caseData.desktop.samples.filter(function(s){ return s.id === progress.desktop.sampleId; })[0];
      var tool = caseData.desktop.tools.filter(function(t){ return t.id === progress.desktop.toolId; })[0];
      return requiredOpened && !!(sample && sample.correct) && !!(tool && tool.correct);
    },

    goToPipeline: function(caseId){
      var progress = this.getCaseProgress(caseId);
      if(Game.Cases[caseId].microbiome){
        progress.stage = 'organizacion';
        this.save();
        this.goTo('organizacion', { caseId: caseId });
        return;
      }
      progress.stage = 'pipeline';
      this.save();
      this.goTo('pipeline', { caseId: caseId });
    },

    // ---- Etapa 3: pipeline ----
    setPipelineOrder: function(caseId, orderIds){
      var caseData = Game.Cases[caseId];
      var progress = this.getCaseProgress(caseId);
      var correctOrder = caseData.pipeline.steps.map(function(s){ return s.id; });
      var isCorrect = orderIds.length === correctOrder.length &&
        orderIds.every(function(id, i){ return id === correctOrder[i]; });
      progress.pipeline.order = orderIds;
      progress.pipeline.orderAttempts += 1;
      progress.pipeline.orderCorrect = isCorrect;
      if(!isCorrect){
        progress.hours = Math.max(0, progress.hours - 1);
      }
      this.save();
      return isCorrect;
    },

    setPipelineParam: function(caseId, paramId){
      var progress = this.getCaseProgress(caseId);
      progress.pipeline.paramId = paramId;
      this.save();
    },

    canRunPipeline: function(caseId){
      var progress = this.getCaseProgress(caseId);
      return progress.pipeline.orderCorrect === true && !!progress.pipeline.paramId;
    },

    runPipeline: function(caseId){
      var caseData = Game.Cases[caseId];
      var progress = this.getCaseProgress(caseId);
      if(!this.canRunPipeline(caseId)) return false;
      var param = caseData.pipeline.params.options.filter(function(o){ return o.id === progress.pipeline.paramId; })[0];
      progress.credits = Math.max(0, progress.credits - caseData.pipeline.runCost.credits);
      progress.hours = Math.max(0, progress.hours - caseData.pipeline.runCost.hours);
      progress.pipeline.ran = true;
      progress.pipeline.quality = param ? param.quality : 'poor';
      progress.stage = 'resultados';
      this.save();
      return true;
    },

    // ---- Etapa 3 (variante): pipeline de bloques (drag & drop, caso2) ----
    placeBlock: function(caseId, slotId, blockId){
      var progress = this.getCaseProgress(caseId);
      progress.blocks.placed[slotId] = blockId;
      progress.blocks.allCorrect = false;
      this.save();
    },

    verifyBlocks: function(caseId){
      var caseData = Game.Cases[caseId];
      var progress = this.getCaseProgress(caseId);
      var results = {};
      var allCorrect = true;
      caseData.blocks.slots.forEach(function(slot){
        var ok = progress.blocks.placed[slot.id] === slot.correctBlockId;
        results[slot.id] = ok;
        if(!ok) allCorrect = false;
      });
      progress.blocks.results = results;
      progress.blocks.allCorrect = allCorrect;
      progress.blocks.attempts += 1;
      this.save();
      return allCorrect;
    },

    canRunCustomPipeline: function(caseId){
      return this.getCaseProgress(caseId).blocks.allCorrect === true;
    },

    runCustomPipeline: function(caseId){
      var caseData = Game.Cases[caseId];
      var progress = this.getCaseProgress(caseId);
      if(!this.canRunCustomPipeline(caseId)) return false;
      progress.credits = Math.max(0, progress.credits - caseData.blocks.runCost.credits);
      progress.hours = Math.max(0, progress.hours - caseData.blocks.runCost.hours);
      progress.stage = 'alineamiento';
      this.save();
      return true;
    },

    // ---- Etapa 4 (variante): visor de alineamiento (caso2) ----
    selectAlignmentRegion: function(caseId, regionId){
      var caseData = Game.Cases[caseId];
      var progress = this.getCaseProgress(caseId);
      var region = caseData.alignment.regions.filter(function(r){ return r.id === regionId; })[0];
      if(!region) return;
      progress.alignment.selectedRegion = regionId;
      progress.alignment.attempts += 1;
      if(region.hasVariant) progress.alignment.found = true;
      this.save();
    },

    canAdvanceAlignment: function(caseId){
      return this.getCaseProgress(caseId).alignment.found === true;
    },

    // ---- Etapa 5 (variante): interpretación clínica (caso2) ----
    queryDatabase: function(caseId, dbId){
      var caseData = Game.Cases[caseId];
      var progress = this.getCaseProgress(caseId);
      if(progress.interpretacion.queried.indexOf(dbId) !== -1) return true;
      var db = caseData.interpretacion.databases.filter(function(x){ return x.id === dbId; })[0];
      if(!db) return false;
      if(progress.credits < db.cost.credits || progress.hours < db.cost.hours) return false;
      progress.credits = Math.max(0, progress.credits - db.cost.credits);
      progress.hours = Math.max(0, progress.hours - db.cost.hours);
      progress.interpretacion.queried.push(dbId);
      this.save();
      return true;
    },

    canAdvanceInterpretacion: function(caseId){
      return this.getCaseProgress(caseId).interpretacion.queried.length > 0;
    },

    // ---- Etapa 2 (microbioma): organización del estudio (caso3) ----
    placeSample: function(caseId, sampleId, groupId){
      var progress = this.getCaseProgress(caseId);
      progress.organizacion.placed[sampleId] = groupId;
      progress.organizacion.allCorrect = false;
      this.save();
    },

    verifySorting: function(caseId){
      var caseData = Game.Cases[caseId];
      var progress = this.getCaseProgress(caseId);
      var results = {};
      var allCorrect = true;
      caseData.microbiome.samples.forEach(function(sample){
        var ok = progress.organizacion.placed[sample.id] === sample.group;
        results[sample.id] = ok;
        if(!ok) allCorrect = false;
      });
      progress.organizacion.results = results;
      progress.organizacion.allCorrect = allCorrect;
      progress.organizacion.attempts += 1;
      this.save();
      return allCorrect;
    },

    setFirstAnalysis: function(caseId, analysisId){
      var progress = this.getCaseProgress(caseId);
      progress.organizacion.firstAnalysis = analysisId;
      progress.dashboard.activeTab = analysisId === 'beta' ? 'heatmap' : analysisId;
      this.save();
    },

    canAdvanceOrganizacion: function(caseId){
      var progress = this.getCaseProgress(caseId);
      return progress.organizacion.allCorrect === true && !!progress.organizacion.firstAnalysis;
    },

    // ---- Etapa 3 (microbioma): dashboard de resultados (caso3) ----
    setActiveTab: function(caseId, tabId){
      var progress = this.getCaseProgress(caseId);
      progress.dashboard.activeTab = tabId;
      this.save();
    },

    selectTaxon: function(caseId, taxonId){
      var progress = this.getCaseProgress(caseId);
      if(progress.dashboard.exploredTaxa.indexOf(taxonId) === -1){
        progress.dashboard.exploredTaxa.push(taxonId);
      }
      progress.dashboard.selectedTaxon = taxonId;
      this.save();
    },

    canAdvanceDashboard: function(caseId){
      return this.getCaseProgress(caseId).dashboard.exploredTaxa.length >= 2;
    },

    // ---- Etapa 4 (microbioma): construcción de la hipótesis (caso3) ----
    toggleFinding: function(caseId, findingId){
      var progress = this.getCaseProgress(caseId);
      var idx = progress.hipotesis.findings.indexOf(findingId);
      if(idx === -1) progress.hipotesis.findings.push(findingId);
      else progress.hipotesis.findings.splice(idx, 1);
      this.save();
    },

    pickBiomarker: function(caseId, biomarkerId){
      var caseData = Game.Cases[caseId];
      var progress = this.getCaseProgress(caseId);
      progress.hipotesis.biomarkerId = biomarkerId;
      progress.hipotesis.biomarkerCorrect = biomarkerId === caseData.microbiome.correctBiomarkerId;
      this.save();
    },

    canAdvanceHipotesis: function(caseId){
      var progress = this.getCaseProgress(caseId);
      return progress.hipotesis.findings.length > 0 && !!progress.hipotesis.biomarkerId;
    },

    // ---- Etapa 4: resultados ----
    selectHit: function(caseId, hitId){
      var progress = this.getCaseProgress(caseId);
      if(progress.resultados.explored.indexOf(hitId) === -1){
        progress.resultados.explored.push(hitId);
      }
      progress.resultados.selected = hitId;
      this.save();
    },

    // ---- Etapa 5: decisión ----
    submitDecision: function(caseId, candidateId){
      var caseData = Game.Cases[caseId];
      var progress = this.getCaseProgress(caseId);
      var correct = candidateId === caseData.correctAnswer;
      var firstTime = progress.decision.correct === null;
      progress.decision.candidateId = candidateId;
      progress.decision.correct = correct;
      progress.stage = 'completed';
      progress.stars = this.calculateStars(caseId);
      if(firstTime){
        if(correct){
          this.state.reputation = Math.min(100, this.state.reputation + 15);
          this.state.experience += progress.stars * 20;
        }else{
          this.state.reputation = Math.max(0, this.state.reputation - 20);
        }
      }
      this.save();
      return correct;
    },

    // Puntaje de 1 a 5: una mala decisión final limita el máximo posible,
    // porque en un caso real un diagnóstico equivocado pesa más que el
    // camino prolijo que se haya hecho para llegar a él.
    calculateStars: function(caseId){
      var caseData = Game.Cases[caseId];
      var progress = this.getCaseProgress(caseId);
      if(caseData.microbiome){
        if(progress.decision.correct === false){
          return progress.desktop.errors === 0 ? 2 : 1;
        }
        var starsMicrobiome = 5;
        if(progress.desktop.errors > 0) starsMicrobiome -= 1;
        if(progress.organizacion.attempts > 1) starsMicrobiome -= 1;
        if(!progress.hipotesis.biomarkerCorrect) starsMicrobiome -= 1;
        return Math.max(1, starsMicrobiome);
      }
      if(caseData.blocks){
        if(progress.decision.correct === false){
          return progress.desktop.errors === 0 ? 2 : 1;
        }
        var starsBlocks = 5;
        if(progress.desktop.errors > 0) starsBlocks -= 1;
        if(progress.blocks.attempts > 1) starsBlocks -= 1;
        if(progress.interpretacion.queried.length < 3) starsBlocks -= 1;
        return Math.max(1, starsBlocks);
      }
      if(progress.decision.correct === false){
        return progress.desktop.errors === 0 ? 2 : 1;
      }
      var stars = 5;
      if(progress.desktop.errors > 0) stars -= 1;
      if(progress.pipeline.orderAttempts > 1) stars -= 1;
      if(progress.pipeline.quality !== 'optimal') stars -= 1;
      return Math.max(1, stars);
    }
  };

  window.addEventListener('popstate', function(e){
    if(e.state && e.state.screen){
      Engine.currentScreen = e.state.screen;
      Engine.currentParams = e.state.params || {};
      Engine.render();
    }
  });

  Game.Engine = Engine;
})();
