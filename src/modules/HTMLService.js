export default class HTMLService {
  constructor(gymLogService) {
    this.gymLogService = gymLogService;

    // Main Page
    this.pages = document.querySelectorAll('.page');

    // Context variables
    this.currentPageId = 'screen-1';
    this.currentRoutineContext = null;

    // Header elements
    this.imgLogoApp = document.getElementById('logo-app');
    this.btnBack = document.getElementById('btn-back');
    this.headerTitle = document.getElementById('header-title');
    this.btnEditRoutineList = document.getElementById('btn-new-routine');
    this.btnEditWorkoutList = document.getElementById('btn-edit-workout-list');

    // Footer Buttons
    this.btnReset = document.getElementById('reset');
    this.newRoutineButton = document.getElementById('btn-new-routine');
    this.footerButtons = document.getElementById('footer-buttons')

    // Routines Elements
    this.routineListContainer = document.getElementById('routine-list');

    // Workout List Elements
    this.workoutListContainer = document.getElementById('workout-list');
    this.workoutDetailsContainer = document.getElementById('workout-details');

    // Exercises Library Management Elements
    this.exerciseEditorForm = document.getElementById('exercise-editor-form');
    this.exerciseEditorList = document.getElementById('exercise-editor-list');
    this.btnCancelEdit = document.getElementById('btn-cancel-edit');
    this.btnGotoExerciseEditor = document.getElementById('btn-goto-exercise-editor');
    this.exerciseEditorList = document.getElementById('exercise-editor-list');
    this.btnCancelEdit = document.getElementById('btn-cancel-edit');

    // MODAL Edit Routine Elements 
    this.editRoutineModal = document.getElementById('edit-routine-modal');
    this.editRoutineForm = document.getElementById('edit-routine-form');
    this.btnCancelEditRoutine = document.getElementById('btn-cancel-edit-routine');
    this.editIconModal = document.getElementById('edit-icon-modal');
    this.routineIdForIconEdit = null;

    // MODAL Management Exercises Elements
    this.addExerciseDetailsModal = document.getElementById('add-exercise-details-modal');
    this.addExerciseDetailsForm = document.getElementById('add-exercise-details-form');
    this.btnCancelAddExercise = document.getElementById('btn-cancel-add-exercise');
    this.exerciseFilterButtons = document.getElementById('exercise-filter-buttons');
    this.exerciseSelect = document.getElementById('exercise-select');
    this.exerciseLibraryCache = [];

    // MODAL Confirmation Elements
    this.confirmModal = document.getElementById('confirm-modal');
    this.confirmModalTitle = document.getElementById('confirm-modal-title');
    this.confirmModalMessage = document.getElementById('confirm-modal-message');
    this.confirmModalPromptView = document.getElementById('confirm-modal-prompt-view');
    this.confirmModalSuccessView = document.getElementById('confirm-modal-success-view');
    this.confirmModalSuccessMessage = document.getElementById('confirm-modal-success-message');
    this.confirmModalActions = document.getElementById('confirm-modal-actions');
    this.confirmModalCallback = null;
    this.confirmModalErrorView = document.getElementById('confirm-modal-error-view');
    this.confirmModalErrorMessage = document.getElementById('confirm-modal-error-message');

    // Header Back Btn Event
    this.btnBack.addEventListener('click', () => {
      this.#handleGoBack();
    });

    // Footer Reset Btn Event
    this.btnReset.addEventListener('click', async () => {
      this.#handleGeneralReset()
    });

    // Open Exercise Library Management
    this.btnGotoExerciseEditor.addEventListener('click', () => {
      this.navigate('screen-4', 'Editor de Exercícios');
      this.#loadExerciseEditor();
    });

    // Exercise Library Save Event
    this.exerciseEditorForm.addEventListener('submit', (event) => {
      event.preventDefault();
      this.#handleSaveExercise();
    });

    // Create new Routine Event
    this.newRoutineButton.addEventListener('click', () => {
      this.#handleCreateRoutine();
    });


    this.btnEditWorkoutList.addEventListener('click', () => {
      this.#handleEditRoutine(this.currentRoutineContext.id);
    })

    this.btnCancelEdit.addEventListener('click', () => {
      this.#clearExerciseForm();
    });

    // Edit Routine Save Btn Event
    this.editRoutineForm.addEventListener('submit', (event) => {
      event.preventDefault();
      this.#handleSubmitEditRoutine();
    });

    // Edit Routine Cancel Btn Event
    this.btnCancelEditRoutine.addEventListener('click', () => {
      this.editRoutineModal.close();
    });

    // Add Exercise Save Btn Event
    this.addExerciseDetailsForm.addEventListener('submit', (event) => {
      event.preventDefault();
      this.#handleSubmitAddExercise();
    });

    // Add Exercise Cancel Btn Event
    this.btnCancelAddExercise.addEventListener('click', () => {
      this.addExerciseDetailsModal.close();
    });

    // Filter Buttons Event
    this.exerciseFilterButtons.addEventListener('click', (event) => {
      if (event.target.tagName !== 'BUTTON') return;
      this.#handleFilterClick(event);
    });

    // Change Icon Click Event
    this.editIconModal.addEventListener('click', (event) => {
      const clickedContainer = event.target.closest('.icon-box');
      if (!clickedContainer) return;
      const newIconSrc = clickedContainer.dataset.src;
      this.#handleSubmitEditIcon(newIconSrc);
      this.#drawExerciseList();
    });

    // Generic Confirm Modal Handler
    this.confirmModal.addEventListener('click', (event) => {
      const action = event.target.dataset.action;
      if (action === 'confirm') {
        if (this.confirmModalCallback) {
          this.confirmModalCallback();
        }
      } else if (action === 'cancel') {
        this.confirmModal.close();
        this.confirmModalCallback = null;
      }
    });

    // Operations in load constructor
    this.navigate('screen-1', 'Minhas Rotinas');
    this.#renderRoutines();
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
      this.btnEditWorkoutList.classList.add('hidden');
    }
    if (pageId === 'screen-2') {
      this.imgLogoApp.classList.add('hidden');
      this.footerButtons.classList.add('hidden');
      this.btnBack.classList.remove('hidden');
      this.btnEditRoutineList.classList.add('hidden');
      this.btnEditWorkoutList.classList.remove('hidden');
    }
    if (pageId === 'screen-3' || pageId === 'screen-4') {
      this.imgLogoApp.classList.add('hidden');
      this.footerButtons.classList.add('hidden');
      this.btnBack.classList.remove('hidden');
      this.btnEditRoutineList.classList.add('hidden');
      this.btnEditWorkoutList.classList.add('hidden');
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
      this.#showSuccessAlert("Nova rotina de Treinos criada com sucesso!")
      this.#renderRoutines();
    }
  }

  async #handleEditRoutine(routineId) {
    const routine = await this.gymLogService.getRoutineById(routineId);
    if (!routine) {
      this.#showErrorAlert("Erro: Rotina não encontrada.");
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
    this.#showSuccessAlert("Rotina atualizada!");
    this.#drawExerciseList();
  }

  async #handleDeleteRoutine(routineId, routineTitle) {
    const deleteAction = async () => {
      try {
        this.confirmModalPromptView.style.display = 'none';
        this.confirmModalActions.style.display = 'none';
        await this.gymLogService.deleteRoutineAndData(routineId);
        this.confirmModalSuccessMessage.textContent = `Rotina "${routineTitle}" deletada!`;
        this.confirmModalSuccessView.style.display = 'block';
        lucide.createIcons();

        setTimeout(() => {
          this.confirmModal.close();
          this.navigate('screen-1', 'Minhas Rotinas');
          this.#renderRoutines();
          this.confirmModalCallback = null;
        }, 2000);

      } catch (error) {
        console.error("Erro ao deletar rotina:", error);
        this.confirmModal.close();
        this.#showErrorAlert("Ocorreu um erro ao deletar a rotina. Tente novamente.");
        this.confirmModalCallback = null;
      }
    };
    this.#showConfirmModal(
      `Excluir Rotina`,
      `Tem certeza que deseja excluir a rotina "${routineTitle}"?`,
      deleteAction
    );
  }

  async #handleGeneralReset() {
    const resetAction = async () => {
      try {
        this.confirmModalPromptView.style.display = 'none';
        this.confirmModalActions.style.display = 'none';
        await this.gymLogService.resetWorkoutState();
        this.confirmModalSuccessMessage.textContent = 'Progresso de todos os treinos foi resetado!';
        this.confirmModalSuccessView.style.display = 'block';
        lucide.createIcons();
        setTimeout(() => {
          this.confirmModal.close();
          this.confirmModalCallback = null;
          this.navigate('screen-1', 'Minhas Rotinas');
          this.#renderRoutines();
          this.currentExercisePlan = [];
          this.currentActiveExercise = null;
          this.currentRoutineContext = null;
        }, 2000);

      } catch (error) {
        console.error("Erro ao fazer o reset geral:", error);
        this.confirmModal.close();
        this.confirmModalCallback = null;
        this.#showErrorAlert("Ocorreu um erro ao resetar o progresso.");
      }
    };
    this.#showConfirmModal(
      'Resetar Progresso',
      'Isso irá resetar o progresso de TODOS os treinos. Deseja continuar?',
      resetAction
    );
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
    if (this.currentRoutineContext) {
      this.currentRoutineContext.icon = iconSrc;
    }
    this.#showSuccessAlert("Ícone atualizado com sucesso!");
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
    this.workoutListContainer.innerHTML = '';
    const routineDecription = document.createElement('div');
    routineDecription.className = 'routine-description';
    routineDecription.innerHTML = `
      <img id="icon-routine" src="./src/assets/${this.currentRoutineContext.icon}" alt="${this.currentRoutineContext.title}">
      <h2>${this.currentRoutineContext.description}</h2>
      `;
    routineDecription.querySelector('#icon-routine').addEventListener('click', () => {
      this.routineIdForIconEdit = this.currentRoutineContext.id;
      this.editIconModal.showModal();
    })

    this.workoutListContainer.appendChild(routineDecription);

    if (!this.currentExercisePlan || this.currentExercisePlan.length === 0) {
      const emptyStateDiv = document.createElement('div');
      emptyStateDiv.className = 'empty-state-container';
      emptyStateDiv.innerHTML = `<p class="empty-list-message">Nenhum exercício cadastrado nesta rotina.</p>`;
      this.workoutListContainer.appendChild(emptyStateDiv);
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
        this.workoutListContainer.appendChild(titleEl);

        const hrEl = document.createElement('hr');
        hrEl.className = 'exercise-group-divider';
        this.workoutListContainer.appendChild(hrEl);

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

          this.workoutListContainer.appendChild(exerciseCard);
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
    this.workoutListContainer.appendChild(addExercisesDiv);


    this.workoutListContainer.querySelector('#btn-add-exercise-to-routine').addEventListener('click', () => {
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

    this.workoutListContainer.appendChild(routineActionsDiv);

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
      this.#showErrorAlert("Por favor, selecione um exercício.");
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
    this.workoutDetailsContainer.innerHTML = '';

    const exerciseTitle = document.createElement('h1');
    exerciseTitle.className = 'exercise-detail-title';
    exerciseTitle.innerText = plan.description;

    this.workoutDetailsContainer.appendChild(exerciseTitle);

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

      this.workoutDetailsContainer.appendChild(setCard);
    });

    const finishButton = document.createElement('button');
    finishButton.className = 'btn';
    finishButton.textContent = 'Finalizar Exercício';

    finishButton.addEventListener('click', () => {
      this.#handleFinishExercise(plan.planId);
    });
    this.workoutDetailsContainer.appendChild(finishButton);


    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-delete';
    deleteButton.textContent = 'Excluir Exercício da Rotina';
    deleteButton.addEventListener('click', () => {
      this.#handleDeleteExerciseFromPlan(plan.planId, plan.description);
    });
    this.workoutDetailsContainer.appendChild(deleteButton);

    lucide.createIcons();
  }

  async #handleDeleteExerciseFromPlan(planId, exerciseDescription) {
    const deleteAction = async () => {
      try {

        this.confirmModalPromptView.style.display = 'none';
        this.confirmModalActions.style.display = 'none';
        await this.gymLogService.deleteExerciseFromPlan(planId);
        this.confirmModalSuccessMessage.textContent = `Exercício "${exerciseDescription}" removido!`;
        this.confirmModalSuccessView.style.display = 'block';
        lucide.createIcons();
        setTimeout(() => {
          this.confirmModal.close();
          this.confirmModalCallback = null;
          if (this.currentRoutineContext) {
            this.navigate('screen-2', this.currentRoutineContext.title);
            this.#loadExercises(this.currentRoutineContext.id); // Recarrega a screen-2
          } else {
            this.navigate('screen-1', 'Minhas Rotinas');
            this.#renderRoutines();
          }
        }, 2000);

      } catch (error) {
        console.error("Erro ao deletar exercício do plano:", error);
        this.confirmModal.close();
        this.confirmModalCallback = null;
        this.#showErrorAlert("Ocorreu um erro ao remover o exercício.");
      }
    };

    this.#showConfirmModal(
      `Excluir Exercício`,
      `Tem certeza que deseja excluir "${exerciseDescription}" desta rotina?`,
      deleteAction
    );
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
        <button class="btn-edit btn-mini" data-id="${ex.id}">
          <i data-lucide="square-pen"></i>
        </button>
        <button class="btn-delete btn-mini" data-id="${ex.id}">
          <i data-lucide="trash"></i>
        </button>
      </div>
    `;

      item.querySelector('.btn-delete').addEventListener('click', async () => {
        this.#handleDeleteExercise(ex);
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

  async #handleDeleteExercise(exercise) {
    const { id, description } = exercise;
    const deleteAction = async () => {
      try {
        this.confirmModalPromptView.style.display = 'none';
        this.confirmModalActions.style.display = 'none';
        await this.gymLogService.deleteExercise(id);
        this.confirmModalSuccessMessage.textContent = `Exercício "${description}" deletado!`;
        this.confirmModalSuccessView.style.display = 'block';
        lucide.createIcons();
        setTimeout(() => {
          this.confirmModal.close();
          this.confirmModalCallback = null;
          this.#loadExerciseEditor();
        }, 2000);

      } catch (error) {
        console.error("Erro ao deletar exercício:", error);
        this.#showErrorAlert("Ocorreu um erro ao deletar o exercício.");
        this.confirmModalCallback = null;
      }
    };

    this.#showConfirmModal(
      `Excluir Exercício`,
      `Tem certeza que deseja excluir "${description}" da biblioteca?`,
      deleteAction
    );
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

  #showConfirmModal(title, message, onConfirm) {
    this.confirmModalTitle.textContent = title;
    this.confirmModalMessage.textContent = message;
    this.confirmModalCallback = onConfirm;
    this.confirmModalErrorView.style.display = 'none';

    this.confirmModalActions.style.display = 'flex';
    this.confirmModalPromptView.style.display = 'block';
    this.confirmModalSuccessView.style.display = 'none';

    this.confirmModal.querySelector('[data-action="confirm"]').style.display = 'block';
    this.confirmModal.querySelector('[data-action="cancel"]').textContent = 'Cancelar';
    this.confirmModal.showModal();
  }

  #showSuccessAlert(message) {
    this.confirmModalPromptView.style.display = 'none';
    this.confirmModalActions.style.display = 'none';
    this.confirmModalSuccessMessage.textContent = message;
    this.confirmModalSuccessView.style.display = 'block';
    lucide.createIcons();
    this.confirmModal.showModal();
    setTimeout(() => {
      this.confirmModal.close();
    }, 2000);
  }

  #showErrorAlert(message) {
    this.confirmModalPromptView.style.display = 'none';
    this.confirmModalSuccessView.style.display = 'none';
    this.confirmModalErrorMessage.textContent = message;
    this.confirmModalErrorView.style.display = 'block';
    lucide.createIcons();
    const confirmBtn = this.confirmModal.querySelector('[data-action="confirm"]');
    confirmBtn.style.display = 'none';
    const cancelBtn = this.confirmModal.querySelector('[data-action="cancel"]');
    cancelBtn.textContent = 'Fechar';
    this.confirmModalActions.style.display = 'flex';
    if (!this.confirmModal.open) {
      this.confirmModal.showModal();
    }
  }
}