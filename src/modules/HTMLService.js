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
    this.addWorkoutDetailsModal = document.getElementById('_add-workout-details-modal');
    this.addWorkoutDetailsForm = document.getElementById('_add-workout-details-form');
    this.btnCancelAddExercise = document.getElementById('btn-cancel-add-workout');
    this.exerciseFilterButtons = document.getElementById('exercise-filter-buttons');
    this.workoutSelect = document.getElementById('exercise-select');
    this.exerciseLibraryCache = [];

    // MODAL Confirmation Elements
    this.confirmModal = document.getElementById('confirm-modal');
    this.confirmModalTitle = document.getElementById('confirm-modal-title');
    this.confirmModalMessage = document.getElementById('confirm-modal-message');
    this.confirmModalPromptView = document.getElementById('confirm-modal-prompt-view');
    this.confirmModalSuccessView = document.getElementById('confirm-modal-success-view');
    this.confirmModalSuccessMessage = document.getElementById('confirm-modal-success-message');
    this.confirmModalActions = document.getElementById('confirm-modal-actions');
    this.confirmModalErrorView = document.getElementById('confirm-modal-error-view');
    this.confirmModalErrorMessage = document.getElementById('confirm-modal-error-message');
    this.confirmModalCallback = null;

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

    // Edit Workout List Event
    this.btnEditWorkoutList.addEventListener('click', () => {
      this.#handleEditRoutine(this.currentRoutineContext.id);
    })

    // Cancel Edit Button Event
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

    // Add Workout Save Btn Event
    this.addWorkoutDetailsForm.addEventListener('submit', (event) => {
      event.preventDefault();
      this.#handleSubmitAddWorkout();
    });

    // Add Exercise Cancel Btn Event
    this.btnCancelAddExercise.addEventListener('click', () => {
      this.addWorkoutDetailsModal.close();
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
      this.#drawWorkoutList();
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

  // ###########################################
  //     Routines Load and Draw - Screen 1
  // ###########################################

  async #renderRoutines() {
    const routines = await this.gymLogService.getAllRoutines();
    this.routineListContainer.innerHTML = '';

    routines.forEach(routine => {
      const routineCard = document.createElement('div');
      routineCard.className = 'routine-card';
      routineCard.innerHTML = `
        <div class="routine-card-main-content">
          <img class="routine-icon-image" src="./src/assets/${routine.icon}" alt="${routine.title}">
          <div class="routine-card-content">
            <h3 class="routine-card-title">${routine.title}</h3>
            <p class="routine-card-subtitle">${routine.description}</p>
          </div>
          <i data-lucide="chevron-right" class="routine-icon"></i>
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
        this.#loadWorkouts(routine.id);
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
    this.#drawWorkoutList();
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
          this.currentWorkoutPlan = [];
          this.currentActiveWorkout = null;
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
    document.getElementById('workout-icon-routine').src = `./src/assets/${iconSrc}`
    if (this.currentRoutineContext) {
      this.currentRoutineContext.icon = iconSrc;
    }
    this.#showSuccessAlert("Ícone atualizado com sucesso!");
  }

  // #########################################
  //     Workout Load and Draw - Screen 2
  // #########################################

  async #loadWorkouts(routineId) {
    const workoutsFromDB = await this.gymLogService.getWorkoutsByRoutineId(routineId);
    this.currentWorkoutPlan = workoutsFromDB.map(workout => {
      return {
        ...workout
      };
    });
    this.#drawWorkoutList();
  }

  #drawWorkoutList() {
    this.workoutListContainer.innerHTML = '';
    const routineDecription = document.createElement('div');
    routineDecription.className = 'workout-routine-description';
    routineDecription.innerHTML = `
      <img id="workout-icon-routine" src="./src/assets/${this.currentRoutineContext.icon}" alt="${this.currentRoutineContext.title}">
      <h2>${this.currentRoutineContext.description}</h2>
      `;
    routineDecription.querySelector('#workout-icon-routine').addEventListener('click', () => {
      this.routineIdForIconEdit = this.currentRoutineContext.id;
      this.editIconModal.showModal();
    })

    this.workoutListContainer.appendChild(routineDecription);

    if (!this.currentWorkoutPlan || this.currentWorkoutPlan.length === 0) {
      const emptyStateDiv = document.createElement('div');
      emptyStateDiv.className = 'empty-state-container';
      emptyStateDiv.innerHTML = `<p class="empty-list-message">Nenhum exercício cadastrado nesta rotina.</p>`;
      this.workoutListContainer.appendChild(emptyStateDiv);
    } else {
      const groupedWorkouts = new Map();
      this.currentWorkoutPlan.forEach(workout => {
        const type = workout.type || 'Outros';
        if (!groupedWorkouts.has(type)) {
          groupedWorkouts.set(type, []);
        }
        groupedWorkouts.get(type).push(workout);
      });

      groupedWorkouts.forEach((workoutsInGroup, type) => {

        const titleEl = document.createElement('h2');
        titleEl.className = 'workout-group-title';
        titleEl.textContent = type;
        this.workoutListContainer.appendChild(titleEl);

        const hrEl = document.createElement('hr');
        hrEl.className = 'workout-group-divider';
        this.workoutListContainer.appendChild(hrEl);

        workoutsInGroup.forEach(workout => {
          const workoutCard = document.createElement('div');
          const iconName = workout.isDone ? 'check-square-2' : 'square';
          const cardClasses = workout.isDone ? 'workout-card done' : 'workout-card';
          const titleClasses = workout.isDone ? 'workout-card-title done' : 'workout-card-title';

          workoutCard.className = cardClasses;

          workoutCard.innerHTML = `
          <i data-lucide="${iconName}" class="workout-check-icon"></i>
          <div class="workout-card-content">
            <h3 class="${titleClasses}">${workout.description}</h3>
          </div>
          <i data-lucide="chevron-right" class="workout-btn"></i>
        `;

          workoutCard.addEventListener('click', () => {
            this.#loadWorkoutDetails(workout.planId);
            this.navigate('screen-3', this.currentRoutineContext.title);
          });

          this.workoutListContainer.appendChild(workoutCard);
        });
      });
    }

    const addWorkoutsDiv = document.createElement('div');
    addWorkoutsDiv.className = 'add-new-workout';
    addWorkoutsDiv.innerHTML = `
      <button class="btn" id="btn-add-workout-to-routine">
        <i data-lucide="plus"></i> Adicionar Exercício
      </button>
    `;
    this.workoutListContainer.appendChild(addWorkoutsDiv);


    this.workoutListContainer.querySelector('#btn-add-workout-to-routine').addEventListener('click', () => {
      this.#openAddWorkoutModal();
    });

    const routineActionsDiv = document.createElement('div');
    routineActionsDiv.className = 'routine-actions-container';
    routineActionsDiv.innerHTML = `
    <button class="btn btn-edit" id="btn-edit-current-routine">
      <i data-lucide="edit-3"></i> Editar Rotina
    </button>
    <button class="btn btn-delete" id="btn-delete-current-routine">
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

  async #openAddWorkoutModal() {
    this.exerciseLibraryCache = await this.gymLogService.getAllExercises();
    this.#populateWorkoutSelect('all');
    this.#updateFilterButtons('all');
    this.addWorkoutDetailsForm.querySelector('#_add-workout-routine-id').value = this.currentRoutineContext.id;
    this.addWorkoutDetailsModal.showModal();
  }

  #handleFilterClick(event) {
    const filterType = event.target.dataset.type;
    this.#updateFilterButtons(filterType);
    this.#populateWorkoutSelect(filterType);
  }

  #populateWorkoutSelect(filterType) {
    this.workoutSelect.innerHTML = '';
    const filteredList = this.exerciseLibraryCache.filter(ex => {
      return filterType === 'all' || ex.type === filterType;
    });

    if (filteredList.length === 0) {
      this.workoutSelect.innerHTML = '<option value="">Nenhum exercício encontrado</option>';
      return;
    }
    filteredList.forEach(ex => {
      const option = document.createElement('option');
      option.value = ex.id;
      option.textContent = ex.description;
      this.workoutSelect.appendChild(option);
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

  async #handleSubmitAddWorkout() {
    const formData = new FormData(this.addWorkoutDetailsForm);
    const selectedWorkoutId = parseInt(this.workoutSelect.value, 10);
    if (!selectedWorkoutId) {
      this.#showErrorAlert("Por favor, selecione um exercício.");
      return;
    }

    const planDetails = {
      routineId: parseInt(formData.get('routineId'), 10),
      workoutId: selectedWorkoutId,
      targetSets: parseInt(formData.get('targetSets'), 10),
      targetReps: formData.get('targetReps'),
      targetWeight: parseFloat(formData.get('targetWeight'))
    };

    await this.gymLogService.addWorkoutToRoutinePlan(planDetails);
    this.addWorkoutDetailsModal.close();
    this.navigate('screen-2', this.currentRoutineContext.title);
    this.#loadWorkouts(this.currentRoutineContext.id);
  }

  // #######################################
  //     Workout Details Mngmt - Screen 3
  // #######################################
  async #loadWorkoutDetails(planId) {
    const plan = this.currentWorkoutPlan.find(wk => wk.planId === planId);
    const sets = await this.gymLogService.getSetsForWorkout(planId);

    this.currentActiveWorkout = {
      plan: plan,
      sets: sets
    };

    this.#drawWorkoutDetails();
  }

  #drawWorkoutDetails() {
    if (!this.currentActiveWorkout) return;

    const { plan, sets } = this.currentActiveWorkout;
    this.workoutDetailsContainer.innerHTML = '';

    const workoutTitle = document.createElement('h1');
    workoutTitle.className = 'workout-detail-title';
    workoutTitle.innerText = plan.description;

    this.workoutDetailsContainer.appendChild(workoutTitle);

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
      this.#handleFinishWorkout(plan.planId);
    });
    this.workoutDetailsContainer.appendChild(finishButton);


    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-delete';
    deleteButton.textContent = 'Excluir Exercício da Rotina';
    deleteButton.addEventListener('click', () => {
      this.#handleDeleteWorkoutFromPlan(plan.planId, plan.description);
    });
    this.workoutDetailsContainer.appendChild(deleteButton);

    lucide.createIcons();
  }

  async #handleDeleteWorkoutFromPlan(planId, workoutDescription) {
    const deleteAction = async () => {
      try {

        this.confirmModalPromptView.style.display = 'none';
        this.confirmModalActions.style.display = 'none';
        await this.gymLogService.deleteWorkoutFromPlan(planId);
        this.confirmModalSuccessMessage.textContent = `Exercício "${workoutDescription}" removido!`;
        this.confirmModalSuccessView.style.display = 'block';
        lucide.createIcons();

        setTimeout(() => {
          this.confirmModal.close();
          this.confirmModalCallback = null;
          if (this.currentRoutineContext) {
            this.navigate('screen-2', this.currentRoutineContext.title);
            this.#loadWorkouts(this.currentRoutineContext.id);
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
      `Tem certeza que deseja excluir "${workoutDescription}" desta rotina?`,
      deleteAction
    );
  }

  async #handleSetCheck(setId) {
    const set = this.currentActiveWorkout.sets.find(s => s.id === setId);
    if (!set) return;

    const newIsDone = !set.isDone;

    try {
      await this.gymLogService.updateSetState(setId, newIsDone);
      set.isDone = newIsDone;
      this.#drawWorkoutDetails();

    } catch (error) {
      console.error("Erro ao atualizar o set:", error);
    }
  }

  async #handleFinishWorkout(planId) {
    try {
      await this.gymLogService.updateWorkoutState(planId, true);
      this.#handleGoBack();

    } catch (error) {
      console.error("Erro ao finalizar o exercício:", error);
    }
  }

  // #######################################
  //     Exercise List Manager - Screen 4
  // #######################################

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
        this.#loadWorkouts(this.currentRoutineContext.id);
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