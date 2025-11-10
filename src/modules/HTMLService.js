export default class HTMLService {
  constructor(gymLogService) {
    this.headerTitle = document.getElementById('header-title');

    this.btnBack = document.getElementById('btn-back');
    this.btnReset = document.getElementById('reset');

    this.imgLogoApp = document.getElementById('logo-app');
    this.btnEditRoutineList = document.getElementById('btn-new-routine');
    this.btnEditExerciseList = document.getElementById('btn-exercise-list');

    this.pages = document.querySelectorAll('.page');
    this.footerButtons = document.getElementById('footer-buttons')

    this.routineListContainer = document.getElementById('routine-list');
    this.exerciseListContainer = document.getElementById('exercise-list');
    this.exerciseDetailsContainer = document.getElementById('exercise-details');

    this.newRoutineButton = document.getElementById('btn-new-routine');

    this.exerciseEditorForm = document.getElementById('exercise-editor-form');
    this.exerciseEditorList = document.getElementById('exercise-editor-list');
    this.btnCancelEdit = document.getElementById('btn-cancel-edit');

    this.btnGotoExerciseEditor = document.getElementById('btn-goto-exercise-editor');
    this.exerciseEditorForm = document.getElementById('exercise-editor-form');
    this.exerciseEditorList = document.getElementById('exercise-editor-list');
    this.btnCancelEdit = document.getElementById('btn-cancel-edit');

    // MODAL
    this.editRoutineModal = document.getElementById('edit-routine-modal');
    this.editRoutineForm = document.getElementById('edit-routine-form');
    this.btnCancelEditRoutine = document.getElementById('btn-cancel-edit-routine');

    this.editIconModal = document.getElementById('edit-icon-modal');
    this.routineIdForIconEdit = null;

    // MODAL Add Exercises
    this.addExerciseDetailsModal = document.getElementById('add-exercise-details-modal');
    this.addExerciseDetailsForm = document.getElementById('add-exercise-details-form');
    this.btnCancelAddExercise = document.getElementById('btn-cancel-add-exercise');
    this.exerciseFilterButtons = document.getElementById('exercise-filter-buttons');
    this.exerciseSelect = document.getElementById('exercise-select');
    this.exerciseLibraryCache = [];

    this.gymLogService = gymLogService;
    this.navigate('screen-1', 'Minhas Rotinas');

    this.#renderRoutines();

    this.currentPageId = 'screen-1';
    this.currentRoutineContext = null;

    this.btnBack.addEventListener('click', () => {
      this.#handleGoBack();
    });

    this.btnReset.addEventListener('click', async () => {
      await this.gymLogService.resetWorkoutState();
      this.navigate('screen-1', 'Minhas Rotinas');
    });

    this.btnGotoExerciseEditor.addEventListener('click', () => {
      this.navigate('screen-4', 'Editor de Exercícios');
      this.#loadExerciseEditor();
    });

    this.exerciseEditorForm.addEventListener('submit', (event) => {
      event.preventDefault();
      this.#handleSaveExercise();
    });

    this.newRoutineButton.addEventListener('click', () => {
      this.#handleCreateRoutine();
    });

    this.btnCancelEdit.addEventListener('click', () => {
      this.#clearExerciseForm();
    });

    this.editRoutineForm.addEventListener('submit', (event) => {
      event.preventDefault();
      this.#handleSubmitEditRoutine();
    });

    this.btnCancelEditRoutine.addEventListener('click', () => {
      this.editRoutineModal.close();
    });

    this.editIconModal.addEventListener('click', (event) => {
      const clickedContainer = event.target.closest('.icon-box');
      if (!clickedContainer) return;
      const newIconSrc = clickedContainer.dataset.src;
      this.#handleSubmitEditIcon(newIconSrc);
      this.#drawExerciseList();
    });

    this.addExerciseDetailsForm.addEventListener('submit', (event) => {
      event.preventDefault();
      this.#handleSubmitAddExercise();
    });

    this.btnCancelAddExercise.addEventListener('click', () => {
      this.addExerciseDetailsModal.close();
    });

    this.exerciseFilterButtons.addEventListener('click', (event) => {
      if (event.target.tagName !== 'BUTTON') return; 
      this.#handleFilterClick(event);
    });
  }



  async #handleSubmitEditIcon(iconSrc) {
    if (!this.routineIdForIconEdit) {
      console.error("Erro: ID da rotina não definido para edição de ícone.");
      return;
    }
    const changes = { icon: iconSrc };
    await this.gymLogService.updateRoutine(this.routineIdForIconEdit, changes);
    this.editIconModal.close();
    this.routineIdForIconEdit = null;
    document.getElementById('icon-routine').src = `./src/assets/${iconSrc}`
  }

  // ##################################
  //     Navigation Handler
  // ##################################

  navigate(pageId, title) {
    this.pages.forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
      targetPage.classList.add('active');
    }

    this.headerTitle.textContent = title;
    this.currentPageId = pageId;

    if (pageId === 'screen-1') {
      this.imgLogoApp.classList.remove('hidden');
      this.footerButtons.classList.remove('hidden');
      this.btnBack.classList.add('hidden');
      this.btnEditRoutineList.classList.remove('hidden');
      this.btnEditExerciseList.classList.add('hidden');
    }
    if (pageId === 'screen-2') {
      this.imgLogoApp.classList.add('hidden');
      this.footerButtons.classList.add('hidden');
      this.btnBack.classList.remove('hidden');
      this.btnEditRoutineList.classList.add('hidden');
      this.btnEditExerciseList.classList.remove('hidden');
    }
    if (pageId === 'screen-3' || pageId === 'screen-4') {
      this.imgLogoApp.classList.add('hidden');
      this.footerButtons.classList.add('hidden');
      this.btnBack.classList.remove('hidden');
      this.btnEditRoutineList.classList.add('hidden');
      this.btnEditExerciseList.classList.add('hidden');
    }
  }

  // ##################################
  //     Routines Load and Draw
  // ##################################

  async #renderRoutines() {
    const routines = await this.gymLogService.getAllRoutines();
    this.routineListContainer.innerHTML = '';

    routines.forEach(routine => {
      const routineCard = document.createElement('div');
      routineCard.className = 'routine-card';
      routineCard.innerHTML = `
        <div class="routine-card-main-content">
          <img src="./src/assets/${routine.icon}" alt="${routine.title}">
          <div class="routine-card-content">
            <h3 class="routine-card-title">${routine.title}</h3>
            <p class="routine-card-subtitle">${routine.description}</p>
          </div>
          <i data-lucide="chevron-right" class="routine-btn"></i>
        </div>
        `;
      routineCard.querySelector('.routine-card-main-content').addEventListener('click', () => {
        this.currentRoutineContext = {
          id: routine.id,
          title: routine.title,
          description: routine.description,
          icon: routine.icon
        };
        this.navigate('screen-2', routine.title, routine.id);
        this.#loadExercises(routine.id);
      });

      this.routineListContainer.appendChild(routineCard);
    });

    lucide.createIcons();
  }

  async #handleCreateRoutine() {
    const title = "Treino Novo"
    if (title) {
      await this.gymLogService.createNewRoutine(title);
      this.#renderRoutines();
    }
  }

  async #handleEditRoutine(routineId) {
    const routine = await this.gymLogService.getRoutineById(routineId);
    if (!routine) {
      alert("Erro: Rotina não encontrada.");
      return;
    }

    this.editRoutineForm.querySelector('#edit-routine-id').value = routine.id;
    this.editRoutineForm.querySelector('#edit-routine-title').value = routine.title;
    this.editRoutineForm.querySelector('#edit-routine-description').value = routine.description;

    this.editRoutineModal.showModal();
  }

  async #handleSubmitEditRoutine() {
    const formData = new FormData(this.editRoutineForm);
    const routineId = parseInt(formData.get('id'), 10);
    const changes = {
      title: formData.get('title'),
      description: formData.get('description')
    };

    await this.gymLogService.updateRoutine(routineId, changes);

    this.headerTitle.textContent = changes.title;
    this.currentRoutineContext.title = changes.title;
    this.currentRoutineContext.description = changes.description;

    this.editRoutineModal.close();

    this.#drawExerciseList();

  }

  async #handleDeleteRoutine(routineId, routineTitle) {
    const confirmation = confirm(`Tem certeza que deseja excluir a rotina "${routineTitle}"?\n\nTODOS os dados desta rotina serão perdidos.`);
    if (confirmation) {
      await this.gymLogService.deleteRoutineAndData(routineId);
      alert(`Rotina "${routineTitle}" deletada com sucesso.`);
      this.navigate('screen-1', 'Minhas Rotinas');
      this.#renderRoutines();
    }
  }

  // ##################################
  //     Exercises Load and Draw
  // ##################################

  async #loadExercises(routineId) {
    const exercisesFromDB = await this.gymLogService.getExercicesByRoutineId(routineId);

    this.currentExercisePlan = exercisesFromDB.map(exercise => {
      return {
        ...exercise
      };
    });
    this.#drawExerciseList();
  }

  #drawExerciseList() {
    this.exerciseListContainer.innerHTML = '';
    const routineDecription = document.createElement('div');
    routineDecription.className = 'routine-description';
    routineDecription.innerHTML = `
      <img id="icon-routine" src="./src/assets/${this.currentRoutineContext.icon}" alt="${this.currentRoutineContext.title}">
      <h1>${this.currentRoutineContext.description}</h1>
      `;
    routineDecription.querySelector('#icon-routine').addEventListener('click', () => {
      this.routineIdForIconEdit = this.currentRoutineContext.id;
      this.editIconModal.showModal();
    })

    this.exerciseListContainer.appendChild(routineDecription);

    if (!this.currentExercisePlan || this.currentExercisePlan.length === 0) {
      const emptyStateDiv = document.createElement('div');
      emptyStateDiv.className = 'empty-state-container';
      emptyStateDiv.innerHTML = `<p class="empty-list-message">Nenhum exercício cadastrado nesta rotina.</p>`;
      this.exerciseListContainer.appendChild(emptyStateDiv);
    } else {
      const groupedExercises = new Map();
      this.currentExercisePlan.forEach(exercise => {
        const type = exercise.type || 'Outros';
        if (!groupedExercises.has(type)) {
          groupedExercises.set(type, []);
        }
        groupedExercises.get(type).push(exercise);
      });

      groupedExercises.forEach((exercisesInGroup, type) => {

        const titleEl = document.createElement('h2');
        titleEl.className = 'exercise-group-title';
        titleEl.textContent = type;
        this.exerciseListContainer.appendChild(titleEl);

        const hrEl = document.createElement('hr');
        hrEl.className = 'exercise-group-divider';
        this.exerciseListContainer.appendChild(hrEl);

        exercisesInGroup.forEach(exercise => {
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
            this.navigate('screen-3', this.currentRoutineContext.title);
          });

          this.exerciseListContainer.appendChild(exerciseCard);
        });
      });
    }

    const addExercisesDiv = document.createElement('div');
    addExercisesDiv.className = 'add-new-exercises';
    addExercisesDiv.innerHTML = `
      <button class="btn" id="btn-add-exercise-to-routine">
        <i data-lucide="plus"></i> Adicionar Exercício
      </button>
    `;
    this.exerciseListContainer.appendChild(addExercisesDiv);


    this.exerciseListContainer.querySelector('#btn-add-exercise-to-routine').addEventListener('click', () => {
      this.#openAddExerciseModal();
    });

    const routineActionsDiv = document.createElement('div');
    routineActionsDiv.className = 'routine-actions-container';
    routineActionsDiv.innerHTML = `
    <button class="btn-icon btn-edit-routine" id="btn-edit-current-routine">
      <i data-lucide="edit-3"></i> Editar Rotina
    </button>
    <button class="btn-icon btn-delete-routine" id="btn-delete-current-routine">
      <i data-lucide="trash-2"></i> Excluir Rotina
    </button>
    `;

    routineActionsDiv.querySelector('#btn-edit-current-routine').addEventListener('click', () => {
      this.#handleEditRoutine(this.currentRoutineContext.id);
    });
    routineActionsDiv.querySelector('#btn-delete-current-routine').addEventListener('click', () => {
      this.#handleDeleteRoutine(this.currentRoutineContext.id, this.currentRoutineContext.title);
    });

    this.exerciseListContainer.appendChild(routineActionsDiv);

    lucide.createIcons();
  }

  async #openAddExerciseModal() {
    this.exerciseLibraryCache = await this.gymLogService.getAllExercises();
    this.#populateExerciseSelect('all'); 
    this.#updateFilterButtons('all');
    this.addExerciseDetailsForm.querySelector('#add-exercise-routine-id').value = this.currentRoutineContext.id;
    this.addExerciseDetailsModal.showModal();
  }

  #handleFilterClick(event) {
    const filterType = event.target.dataset.type;
    this.#updateFilterButtons(filterType);
    this.#populateExerciseSelect(filterType);
  }

  #populateExerciseSelect(filterType) {
    this.exerciseSelect.innerHTML = ''; 
    const filteredList = this.exerciseLibraryCache.filter(ex => {
      return filterType === 'all' || ex.type === filterType;
    });

    if (filteredList.length === 0) {
      this.exerciseSelect.innerHTML = '<option value="">Nenhum exercício encontrado</option>';
      return;
    }
    filteredList.forEach(ex => {
      const option = document.createElement('option');
      option.value = ex.id;
      option.textContent = ex.description;
      this.exerciseSelect.appendChild(option);
    });
  }

  #updateFilterButtons(activeType) {
    const buttons = this.exerciseFilterButtons.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
      if (btn.dataset.type === activeType) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  async #handleSubmitAddExercise() {
    const formData = new FormData(this.addExerciseDetailsForm);
    const selectedExerciseId = parseInt(this.exerciseSelect.value, 10);
    if (!selectedExerciseId) {
      alert("Por favor, selecione um exercício.");
      return;
    }

    const planDetails = {
      routineId: parseInt(formData.get('routineId'), 10),
      exerciseId: selectedExerciseId,
      targetSets: parseInt(formData.get('targetSets'), 10),
      targetReps: formData.get('targetReps'),
      targetWeight: parseFloat(formData.get('targetWeight'))
    };

    await this.gymLogService.addExerciseToRoutinePlan(planDetails);
    this.addExerciseDetailsModal.close();
    this.navigate('screen-2', this.currentRoutineContext.title);
    this.#loadExercises(this.currentRoutineContext.id);
  }

  // ##################################
  //     Exercises Details Mngmt
  // ##################################

  async #loadExerciseDetails(planId) {
    const plan = this.currentExercisePlan.find(ex => ex.planId === planId);
    const sets = await this.gymLogService.getSetsForExercise(planId);

    this.currentActiveExercise = {
      plan: plan,
      sets: sets
    };

    this.#drawExerciseDetails();
  }

  #drawExerciseDetails() {
    if (!this.currentActiveExercise) return;

    const { plan, sets } = this.currentActiveExercise;
    this.exerciseDetailsContainer.innerHTML = '';

    const exerciseTitle = document.createElement('h1');
    exerciseTitle.className = 'exercise-detail-title';
    exerciseTitle.innerText = plan.description;
    this.exerciseDetailsContainer.appendChild(exerciseTitle);

    sets.forEach(set => {
      const setCard = document.createElement('div');
      setCard.className = set.isDone ? 'set-card done' : 'set-card';
      const iconName = set.isDone ? 'check-circle-2' : 'circle';
      setCard.innerHTML = `
        <div class="set-info">
          <span class="set-number">${set.setNumber}.</span>
          <div class="set-reps">${plan.targetReps}</div> reps.
          <div class="set-weight">${plan.targetWeight}</div>kg
        </div>
        <button class="btn-check-set" data-set-number="${set.setNumber}">
        <i data-lucide="${iconName}"></i>
        </button>
        `;


      setCard.querySelector('.btn-check-set').addEventListener('click', () => {
        this.#handleSetCheck(set.id);
      });

      this.exerciseDetailsContainer.appendChild(setCard);
    });

    const finishButton = document.createElement('button');
    finishButton.className = 'btn';
    finishButton.textContent = 'Finalizar Exercício';

    finishButton.addEventListener('click', () => {
      this.#handleFinishExercise(plan.planId);
    });

    this.exerciseDetailsContainer.appendChild(finishButton);

    lucide.createIcons();
  }

  async #handleSetCheck(setId) {
    const set = this.currentActiveExercise.sets.find(s => s.id === setId);
    if (!set) return;

    const newIsDone = !set.isDone;

    try {
      await this.gymLogService.updateSetState(setId, newIsDone);
      set.isDone = newIsDone;
      this.#drawExerciseDetails();

    } catch (error) {
      console.error("Erro ao atualizar o set:", error);
    }
  }

  async #handleFinishExercise(planId) {
    try {
      await this.gymLogService.updateExerciseState(planId, true);
      this.#handleGoBack();

    } catch (error) {
      console.error("Erro ao finalizar o exercício:", error);
    }
  }

  // ##################################
  //     Exercise List Manager
  // ##################################

  async #loadExerciseEditor() {
    const exercises = await this.gymLogService.getAllExercises();
    this.exerciseEditorList.innerHTML = '';

    if (exercises.length === 0) {
      this.exerciseEditorList.innerHTML = '<p>Nenhum exercício na biblioteca.</p>';
      return;
    }

    exercises.forEach(ex => {
      const item = document.createElement('div');
      item.className = 'editor-list-item';
      item.innerHTML = `
      <div class="item-info">
        <strong>${ex.description}</strong>
        <span>(Tipo: ${ex.type} | ID: ${ex.id})</span>
      </div>
      <div class="item-actions">
        <button class="btn-edit" data-id="${ex.id}">
          <i data-lucide="square-pen" class="btn-edit-exercise"></i>
        </button>
        <button class="btn-delete" data-id="${ex.id}">
          <i data-lucide="trash" class="btn-delete-exercise"></i>
        </button>
      </div>
    `;

      item.querySelector('.btn-delete').addEventListener('click', async () => {
        await this.gymLogService.deleteExercise(ex.id);
        this.#loadExerciseEditor();
      });

      item.querySelector('.btn-edit').addEventListener('click', () => {
        this.exerciseEditorForm.querySelector('h3').textContent = 'Editar Exercício';
        this.exerciseEditorForm.querySelector('#exercise-id').value = ex.id;
        this.exerciseEditorForm.querySelector('#exercise-description').value = ex.description;
        this.exerciseEditorForm.querySelector('#exercise-type').value = ex.type;
        window.scrollTo(0, 0);
      });

      this.exerciseEditorList.appendChild(item);

      lucide.createIcons();
    });
  }

  async #handleSaveExercise() {
    const formData = new FormData(this.exerciseEditorForm);
    const exercise = {
      description: formData.get('description'),
      type: formData.get('type')
    };

    const id = formData.get('id');
    if (id) {
      exercise.id = parseInt(id, 10);
    }

    await this.gymLogService.saveExercise(exercise);

    this.#clearExerciseForm();
    this.#loadExerciseEditor();
  }

  #clearExerciseForm() {
    this.exerciseEditorForm.querySelector('h3').textContent = 'Novo Exercício';
    this.exerciseEditorForm.reset();
    this.exerciseEditorForm.querySelector('#exercise-id').value = '';
  }

  #handleGoBack() {
    if (this.currentPageId === 'screen-2' || this.currentPageId === 'screen-4') {
      this.navigate('screen-1', 'Minhas Rotinas');
      this.#renderRoutines();
    }
    else if (this.currentPageId === 'screen-3') {
      if (this.currentRoutineContext) {
        this.navigate('screen-2', this.currentRoutineContext.title, this.currentRoutineContext.id);
        this.#loadExercises(this.currentRoutineContext.id);
      } else {
        console.error("Contexto da rotina perdido. Voltando para o início.");
        this.navigate('screen-1', 'Minhas Rotinas');
        this.#renderRoutines();
      }
    }
  }

}