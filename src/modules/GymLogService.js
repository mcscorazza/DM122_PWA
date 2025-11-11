import Dexie from "https://cdn.jsdelivr.net/npm/dexie@4.2.1/+esm";

const DB_KEY = "PWA::GYMLOG:DB";

export default class GymLogService {
  #db = [];

  constructor() {
    this.#initializeDB();
  }

  #initializeDB() {
    console.log(`🚩 [GymLogService.js] initializing DB`);
    const db = new Dexie(DB_KEY);

    db.version(1).stores({
      routines: "++id",
      exercises: "++id, type",
      routineExercises: "++id, routineId, exerciseId, isDone",
      routineExerciseSets: "++id, planId, isDone"
    });

    db.on("populate", async () => {
      await db.routines.bulkPut([
        { title: "Treino A", description: "Peito | Tríceps", icon: "supino.png" },
        { title: "Treino B", description: "Costas | Bíceps", icon: "biceps.png" },
        { title: "Treino C", description: "Pernas | Ombro", icon: "leg-press.png" },
      ]);
      await db.exercises.bulkPut([
        { description: "Supino Reto", type: "Peito" },
        { description: "Fly Maquina", type: "Peito" },
        { description: "Rosca Direta com Barra W", type: "Biceps" },
        { description: "Rosca Martelo com Halteres", type: "Biceps" },
        { description: "Levantamento Lateral", type: "Ombro" },
        { description: "Remada Baixa", type: "Costas" },
        { description: "Puxador Peito", type: "Costas" },
      ]);

      const planId1 = await db.routineExercises.put(
        { routineId: 1, exerciseId: 1, targetSets: 3, targetReps: 12, targetWeight: 20, isDone: false }
      );
      const planId2 = await db.routineExercises.put(
        { routineId: 1, exerciseId: 2, targetSets: 3, targetReps: 12, targetWeight: 20, isDone: false }
      );
      const planId3 = await db.routineExercises.put(
        { routineId: 1, exerciseId: 3, targetSets: 3, targetReps: 12, targetWeight: 20, isDone: false }
      );
      const planId4 = await db.routineExercises.put(
        { routineId: 1, exerciseId: 4, targetSets: 3, targetReps: 12, targetWeight: 20, isDone: false }
      );

      await db.routineExerciseSets.bulkPut([
        { planId: planId1, setNumber: 1, isDone: false },
        { planId: planId1, setNumber: 2, isDone: false },
        { planId: planId1, setNumber: 3, isDone: false },
      ]);
      await db.routineExerciseSets.bulkPut([
        { planId: planId2, setNumber: 1, isDone: false },
        { planId: planId2, setNumber: 2, isDone: false },
        { planId: planId2, setNumber: 3, isDone: false },
      ]);
      await db.routineExerciseSets.bulkPut([
        { planId: planId3, setNumber: 1, isDone: false },
        { planId: planId3, setNumber: 2, isDone: false },
        { planId: planId3, setNumber: 3, isDone: false },
      ]);
      await db.routineExerciseSets.bulkPut([
        { planId: planId4, setNumber: 1, isDone: false },
        { planId: planId4, setNumber: 2, isDone: false },
        { planId: planId4, setNumber: 3, isDone: false },
      ]);
    });
    db.open();
    this.#db = db;
  }

  async save({ title, description, icon }) {
    const routineRecord = {
      title,
      description,
      icon,
    };
    try {
      const savedId = await this.#db.routines.put(routineRecord);
      console.log(`🚩 [GymLogService.js] routine ${title} saved`);
      return { id: savedId, ...routineRecord };
    } catch (error) {
      console.error(`Error when adding routine: ${title}`, error);
    }
  }

  async getAllRoutines() {
    return this.#db.routines.toArray();
  }

  async getRoutineById(routineId) {
    return this.#db.routines.get(routineId);
  }

  async delete(routineId) {
    await this.#db.routines.delete(routineId);
    console.log(`[TodoService.js] Routine with ID ${routineId} has been deleted`);
    return true;
  }

  async getExercicesByRoutineId(routineId) {
    const plannedItems = await this.#db.routineExercises
      .where('routineId')
      .equals(routineId)
      .toArray();
    if (plannedItems.length === 0) return [];
    const exerciseIds = plannedItems.map(item => item.exerciseId);
    const exerciseDetails = await this.#db.exercises
      .where('id')
      .anyOf(exerciseIds)
      .toArray();
    const exerciseMap = new Map(exerciseDetails.map(ex => [ex.id, ex]));

    const fullExercises = plannedItems.map(plan => {
      const details = exerciseMap.get(plan.exerciseId);
      return {
        planId: plan.id,
        routineId: plan.routineId,
        targetSets: plan.targetSets,
        targetReps: plan.targetReps,
        targetWeight: plan.targetWeight,
        isDone: plan.isDone,
        exerciseId: plan.exerciseId,
        description: details ? details.description : 'Exercício não encontrado',
        type: details ? details.type : 'N/A'
      };
    });
    return fullExercises;
  }

  async getSetsForExercise(planId) {
    return this.#db.routineExerciseSets
      .where('planId')
      .equals(planId)
      .sortBy('setNumber');
  }

  async updateSetState(setId, isDone) {
    return this.#db.routineExerciseSets.update(setId, { isDone: isDone });
  }
  async updateExerciseState(planId, isDone) {
    return this.#db.routineExercises.update(planId, { isDone: isDone });
  }

  async resetWorkoutState() {
    console.log(`🚩 Resetando estado de TODOS os treinos...`);
    try {
      await this.#db.routineExercises.toCollection().modify(exercise => {
        if (exercise.isDone === true) {
          exercise.isDone = false;
        }
      });

      await this.#db.routineExerciseSets.toCollection().modify(set => {
        if (set.isDone === true) {
          set.isDone = false;
        }
      });

      console.log(`🚩 Todos os estados foram resetados.`);

    } catch (error) {
      console.error("Falha no reset geral do DB:", error);
    }
  }


  // ##################################  
  //      Routines List Management
  // ##################################  
  async createNewRoutine(title) {
    const newRoutine = {
      title: title,
      description: "Descrição...",
      icon: "default.png",
    };
    try {
      const newId = await this.#db.routines.put(newRoutine);
      console.log(`🚩 Nova rotina "${title}" criada com ID ${newId}`);
      return newId;
    } catch (error) {
      console.error("Erro ao criar rotina:", error);
    }
  }

  async updateRoutine(routineId, changes) {
    try {
      await this.#db.routines.update(routineId, changes);
      console.log(`🚩 Rotina ${routineId} atualizada.`);
    } catch (error) {
      console.error("Erro ao atualizar rotina:", error);
    }
  }

  async deleteRoutineAndData(routineId) {
    try {
      const plansToDelete = await this.#db.routineExercises
        .where('routineId')
        .equals(routineId)
        .toArray();

      const planIds = plansToDelete.map(plan => plan.id);

      if (planIds.length > 0) {
        await this.#db.routineExerciseSets
          .where('planId')
          .anyOf(planIds)
          .delete();
        console.log(`🚩 Sets deletados para a rotina ${routineId}`);

        await this.#db.routineExercises
          .where('id')
          .anyOf(planIds)
          .delete();
        console.log(`🚩 Exercícios do plano deletados para a rotina ${routineId}`);
      }

      await this.#db.routines.delete(routineId);
      console.log(`🚩 Rotina ${routineId} deletada com sucesso.`);

    } catch (error) {
      console.error("Erro ao deletar rotina em cascata:", error);
    }
  }

  async addExerciseToRoutinePlan(planDetails) {
    try {
      await this.#db.transaction(
        'rw',
        this.#db.routineExercises, 
        this.#db.routineExerciseSets, 
        async () => {
        
        const planData = {
          routineId: planDetails.routineId,
          exerciseId: planDetails.exerciseId,
          targetSets: planDetails.targetSets,
          targetReps: planDetails.targetReps,
          targetWeight: planDetails.targetWeight,
          isDone: false
        };
        const newPlanId = await this.#db.routineExercises.put(planData);
        const setsToCreate = [];
        for (let i = 0; i < planDetails.targetSets; i++) {
          setsToCreate.push({
            planId: newPlanId,
            setNumber: i + 1,
            isDone: false
          });
        }
        await this.#db.routineExerciseSets.bulkPut(setsToCreate);
        console.log(`🚩 Exercício ${planDetails.exerciseId} adicionado ao plano ${newPlanId} com ${setsToCreate.length} sets.`);
      });

    } catch (error) {
      console.error("Erro ao adicionar exercício ao plano:", error);
    }
  }

  async deleteExerciseFromPlan(planId) {
    try {
      await this.#db.transaction(
        'rw',
        this.#db.routineExercises,
        this.#db.routineExerciseSets,
        async () => {
        await this.#db.routineExerciseSets
                      .where('planId')
                      .equals(planId)
                      .delete();
                      
        await this.#db.routineExercises.delete(planId);
      });
      console.log(`🚩 Exercício do plano (ID: ${planId}) e seus sets foram deletados.`);
    } catch (error) {
      console.error("Erro ao deletar exercício do plano:", error);
    }
  }

  // ##################################
  //      Exercise List Management
  // ##################################

  async getAllExercises() {
    return this.#db.exercises.toArray();
  }
  async saveExercise(exercise) {
    try {
      const savedId = await this.#db.exercises.put(exercise);
      console.log(`🚩 Exercício salvo com ID: ${savedId}`);
      return savedId;
    } catch (error) {
      console.error("Erro ao salvar exercício:", error);
    }
  }
  async deleteExercise(exerciseId) {
    try {
      await this.#db.exercises.delete(exerciseId);
      console.log(`🚩 Exercício ${exerciseId} deletado.`);
    } catch (error) {
      console.error("Erro ao deletar exercício:", error);
    }
  }

}
