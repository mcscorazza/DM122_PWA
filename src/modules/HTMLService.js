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

    this.gymLogService = gymLogService;
    this.navigate('screen-1', 'Minhas Rotinas');

    this.#renderRoutines();

    this.currentPageId = 'screen-1';
    this.currentRoutineContext = null;


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
        this.#renderExercises(routine.id);
      });
      this.routineListContainer.appendChild(routineCard);
    });

    lucide.createIcons();
  }

  async #renderExercises(routineId) {
    const exercises = await this.gymLogService.getExercicesByRoutineId(routineId);
    this.exerciseListContainer.innerHTML = '';
    if (exercises.length === 0) {
      this.exerciseListContainer.innerHTML = '<p>Nenhum exercício cadastrado.</p>';
      return;
    }
    exercises.forEach(exercise => {
      const exerciseCard = document.createElement('div');
      exerciseCard.className = 'exercise-card';

      exerciseCard.innerHTML = `
      <div class="exercise-card-content">
      <h3 class="exercise-card-title">${exercise.description}</h3>
      <p class="exercise-card-subtitle">
            Séries: ${exercise.targetSets} | Reps: ${exercise.targetReps} | Peso: ${exercise.targetWeight}kg
          </p>
      </div>
      <i data-lucide="chevron-right" class="exercise-btn"></i>
      `;

      exerciseCard.addEventListener('click', () => {
        this.navigate('screen-3', exercise.description, exercise.planId);
      });

      this.exerciseListContainer.appendChild(exerciseCard);
    });

    lucide.createIcons();
  }

  #handleGoBack() {
    if (this.currentPageId === 'screen-2') {
      this.navigate('screen-1', 'Minhas Rotinas');
      this.#renderRoutines();
    }
    else if (this.currentPageId === 'screen-3') {
      if (this.currentRoutineContext) {
        this.navigate('screen-2', this.currentRoutineContext.title, this.currentRoutineContext.id);
        this.#renderExercises(this.currentRoutineContext.id);
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