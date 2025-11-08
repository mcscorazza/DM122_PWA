export default class HTMLService {
  constructor(gymLogService) {
    this.headerTitle = document.getElementById('header-title');

    this.btnBack = document.getElementById('btn-back');

    this.imgLogoApp = document.getElementById('logo-app');
    this.btnEditRoutineList = document.getElementById('btn-routine-list');
    this.btnEditExerciseList = document.getElementById('btn-exercise-list');

    this.pages = document.querySelectorAll('.page');

    this.routineListContainer = document.getElementById('routine-list');
    this.exerciseListContainer = document.getElementById('exercise-list');
    this.exerciseDetailsContainer = document.getElementById('exercise-details');
    
    this.gymLogService = gymLogService;
    this.navigate('screen-1', 'Minhas Rotinas');

    this.#renderRoutines();

    this.currentPageId = 'screen-1';
    this.currentRoutineContext = null;
    this.currentExercisePlan = [];
    this.currentActiveExercise = null;

    this.btnBack.addEventListener('click', () => {
      this.#handleGoBack();
    });

    this.btnEditRoutineList.addEventListener('click', () => { console.log("Editar lista de Rotinas") });
  }

  navigate(pageId, title, contextId = null) {
    this.pages.forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
      targetPage.classList.add('active');
    }

    this.headerTitle.textContent = title;
    this.currentPageId = pageId;

    if (pageId === 'screen-1') {
      this.imgLogoApp.classList.remove('hidden');
      this.btnBack.classList.add('hidden');
      this.btnEditRoutineList.classList.remove('hidden');
      this.btnEditExerciseList.classList.add('hidden');
    }
    if (pageId === 'screen-2') {
      this.imgLogoApp.classList.add('hidden');
      this.btnBack.classList.remove('hidden');
      this.btnEditRoutineList.classList.add('hidden');
      this.btnEditExerciseList.classList.remove('hidden');
    }
    if (pageId === 'screen-3') {
      this.imgLogoApp.classList.add('hidden');
      this.btnBack.classList.remove('hidden');
      this.btnEditRoutineList.classList.add('hidden');
      this.btnEditExerciseList.classList.add('hidden');
    }
  }

  async #renderRoutines() {
    const routines = await this.gymLogService.getAllRoutines();
    console.log(routines);
    this.routineListContainer.innerHTML = '';

    routines.forEach(routine => {
      const routineCard = document.createElement('div');
      routineCard.className = 'routine-card';
      routineCard.innerHTML = `
        <img src="./src/assets/${routine.icon}" alt="${routine.title}">
        <div class="routine-card-content">
          <h3 class="routine-card-title">${routine.title}</h3>
          <p class="routine-card-subtitle">${routine.description}</p>
        </div>
        <i data-lucide="chevron-right" class="routine-btn"></i>
      `;
      routineCard.addEventListener('click', async () => {
        this.currentRoutineContext = {
          id: routine.id,
          title: routine.title
        };

        this.navigate('screen-2', routine.title, routine.id);
        this.#loadAndRenderExercises(routine.id);
      });
      this.routineListContainer.appendChild(routineCard);
    });

    lucide.createIcons();
  }

  async #loadAndRenderExercises(routineId) {
    const exercisesFromDB = await this.gymLogService.getExercicesByRoutineId(routineId);
    this.currentExercisePlan = exercisesFromDB.map(exercise => {
      return {
        ...exercise,
        isDone: false
      };
    });
    this.#drawExerciseList();
  }

  #drawExerciseList() {
    this.exerciseListContainer.innerHTML = '';
    if (this.currentExercisePlan.length === 0) {
      this.exerciseListContainer.innerHTML = '<p class="empty-list-message">Nenhum exercício cadastrado.</p>';
      return;
    }
    this.currentExercisePlan.forEach(exercise => {
      const exerciseCard = document.createElement('div');
      const iconName = exercise.isDone ? 'check-square-2' : 'square';
      const cardClasses = exercise.isDone ? 'exercise-card done' : 'exercise-card';
      const titleClasses = exercise.isDone ? 'exercise-card-title done' : 'exercise-card-title';
    
      exerciseCard.className = cardClasses; 
      exerciseCard.innerHTML = `
        <i data-lucide="${iconName}" class="exercise-check-icon"></i>
        <div class="exercise-card-content">
        <h3 class="${titleClasses}">${exercise.description}</h3>
        </div>
        <i data-lucide="chevron-right" class="exercise-btn"></i>
        `;

      exerciseCard.addEventListener('click', () => {
        this.#loadExerciseDetails(exercise.planId);
        this.navigate('screen-3', exercise.description, exercise.planId);
      });
      
      this.exerciseListContainer.appendChild(exerciseCard);
    });

    const finishButton = document.createElement('button');
    finishButton.className = 'btn-finish-workout';
    finishButton.textContent = 'Finalizar Treino';
    finishButton.onclick = () => {
      console.log("Treino finalizado!");
      this.navigate('screen-1', 'Minhas Rotinas');
      this.#renderRoutines();
    };
  
    this.exerciseListContainer.appendChild(finishButton);

    lucide.createIcons();
  }

  #loadExerciseDetails(planId) {
    const exercisePlan = this.currentExercisePlan.find(ex => ex.planId === planId);
    if (!exercisePlan) {
      console.error("Plano do exercício não encontrado!", planId);
      return;
    }
    
    const setsList = [];
    for (let i = 0; i < exercisePlan.targetSets; i++) {
      setsList.push({
        setNumber: i + 1,
        targetReps: exercisePlan.targetReps,
        targetWeight: exercisePlan.targetWeight,
        isDone: false // Cada set começa como "não feito"
      });
    }
    this.currentActiveExercise = {
      plan: exercisePlan,
      sets: setsList
    };

    console.table(setsList);
    this.#drawExerciseDetails();
  }

  #drawExerciseDetails() {
    if (!this.currentActiveExercise) return;
    const { plan, sets } = this.currentActiveExercise;
    this.exerciseDetailsContainer.innerHTML = '';
    
    sets.forEach(set => {
      const setCard = document.createElement('div');
      setCard.className = set.isDone ? 'set-card done' : 'set-card';
      const iconName = set.isDone ? 'check-circle-2' : 'circle';
      setCard.innerHTML = `
        <div class="set-info">
        <span class="set-number">Série ${set.setNumber}</span>
        <span class="set-details">${set.targetReps} reps @ ${set.targetWeight} kg</span>
        </div>
        <button class="btn-check-set" data-set-number="${set.setNumber}">
        <i data-lucide="${iconName}"></i>
        </button>
        `;


      setCard.querySelector('.btn-check-set').addEventListener('click', () => {
        this.#toggleSetDone(set.setNumber);
      });

      this.exerciseDetailsContainer.appendChild(setCard);
    });

    const finishButton = document.createElement('button');
    finishButton.className = 'btn-finish-exercise'; // Para estilizar
    finishButton.textContent = 'Finalizar Exercício';
    
    finishButton.addEventListener('click', () => {
      const planId = this.currentActiveExercise.plan.planId;
      this.markExerciseAsDone(planId); 
    });

    this.exerciseDetailsContainer.appendChild(finishButton);
    
    lucide.createIcons();
  }

  markExerciseAsDone(planId) {
    const exercise = this.currentExercisePlan.find(ex => ex.planId === planId);
    if (exercise) {
      exercise.isDone = true;
    }
    
    this.#handleGoBack();
  }

  #toggleSetDone(setNumber) {
    if (!this.currentActiveExercise) return;
    const set = this.currentActiveExercise.sets.find(s => s.setNumber === setNumber);
  
    if (set) {
      set.isDone = !set.isDone;
    }
    console.table(this.currentActiveExercise.sets)
    this.#drawExerciseDetails();
  }


  #handleGoBack() {
    if (this.currentPageId === 'screen-2') {
      this.navigate('screen-1', 'Minhas Rotinas');
      this.#renderRoutines();
    }
    else if (this.currentPageId === 'screen-3') {
      if (this.currentRoutineContext) {
        this.navigate('screen-2', this.currentRoutineContext.title, this.currentRoutineContext.id);
        this.#loadAndRenderExercises(this.currentRoutineContext.id);
      } else {
        console.error("Contexto da rotina perdido. Voltando para o início.");
        this.navigate('screen-1', 'Minhas Rotinas');
        this.#renderRoutines();
      }
    }
  }

  async addRoutine() {
    const routine = {
      title: "Treino X",
      description: "TESTE",
      icon: "supino.png"
    };
    await this.gymLogService.save(routine)

    this.#renderRoutines();
  }
}