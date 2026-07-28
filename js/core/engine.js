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

  var SAVE_KEY = 'bio101_save_v1';

  function defaultState(){
    return {
      player: null,
      budget: 1000,
      day: 1,
      reputation: {},
      caseProgress: {},
      completedCases: []
    };
  }

  var Engine = {
    state: null,
    currentScreen: null,
    currentParams: {},

    hasSave: function(){
      try{
        var raw = localStorage.getItem(SAVE_KEY);
        if(!raw) return false;
        var parsed = JSON.parse(raw);
        return !!(parsed && parsed.player);
      }catch(e){
        return false;
      }
    },

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

    resetProgress: function(){
      this.state = defaultState();
      this.save();
      this.goTo('inicio');
    },

    newGame: function(){
      this.state = defaultState();
      this.save();
      this.goTo('creacionPersonaje');
    },

    init: function(){
      this.load();
      this.goTo('inicio');
    },

    goTo: function(screenName, params){
      this.currentScreen = screenName;
      this.currentParams = params || {};
      this.render();
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
    caseStatus: function(caseId){
      var idx = Game.CaseOrder.indexOf(caseId);
      if(idx === -1) return 'desconocido';
      var progress = this.state.caseProgress[caseId];
      if(progress && progress.status === 'completed') return 'completado';
      if(idx === 0) return 'disponible';
      var prevId = Game.CaseOrder[idx - 1];
      var prevProgress = this.state.caseProgress[prevId];
      if(prevProgress && prevProgress.status === 'completed') return 'disponible';
      return 'bloqueado';
    },

    getCaseProgress: function(caseId){
      if(!this.state.caseProgress[caseId]){
        this.state.caseProgress[caseId] = { status: 'pending', toolsRun: [], hoursUsed: 0, correct: null };
      }
      return this.state.caseProgress[caseId];
    },

    runTool: function(caseId, toolId){
      var caseData = Game.Cases[caseId];
      var progress = this.getCaseProgress(caseId);
      var tool = caseData.tools.filter(function(t){ return t.id === toolId; })[0];
      if(!tool) return false;
      var hoursLeft = caseData.maxHours - progress.hoursUsed;
      if(this.state.budget < tool.costBudget || hoursLeft < tool.costHours) return false;
      this.state.budget -= tool.costBudget;
      progress.hoursUsed += tool.costHours;
      progress.toolsRun.push(toolId);
      this.save();
      return true;
    },

    submitVerdict: function(caseId, candidateId){
      var caseData = Game.Cases[caseId];
      var progress = this.getCaseProgress(caseId);
      var correct = candidateId === caseData.correctAnswer;
      progress.correct = correct;
      progress.status = 'completed';
      if(this.state.completedCases.indexOf(caseId) === -1){
        this.state.completedCases.push(caseId);
      }
      var repKey = caseData.characterKey;
      if(this.state.reputation[repKey] === undefined) this.state.reputation[repKey] = 50;
      if(correct){
        this.state.reputation[repKey] = Math.min(100, this.state.reputation[repKey] + 15);
        this.state.budget += 200;
      }else{
        this.state.reputation[repKey] = Math.max(0, this.state.reputation[repKey] - 20);
      }
      this.save();
      return correct;
    }
  };

  Game.Engine = Engine;
})();
