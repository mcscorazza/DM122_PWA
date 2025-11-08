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
      exercises: "id, type",
      routineExercises: "++id, routineId, exerciseId, isDone",
      routineExerciseSets: "++id, planId, isDone"
    });

    db.on("populate", async () => {
      await db.routines.bulkPut([
        { title: "Treino A", description: "Peito/Tríceps", icon: "supino.png" },
      ]);
      await db.exercises.bulkPut([
        { id: 1, description: "Supino Reto", type: "Peito" },
        { id: 2, description: "Fly Maquina", type: "Peito" },
      ]);

      const planId1 = await db.routineExercises.put({
        routineId: 1,
        exerciseId: 1,
        targetSets: 3,
        targetReps: 12,
        targetWeight: 20,
        isDone: false
      });
      const planId2 = await db.routineExercises.put({
        routineId: 1,
        exerciseId: 2,
        targetSets: 3,
        targetReps: 12,
        targetWeight: 100,
        isDone: true
      });

      await db.routineExerciseSets.bulkPut([
        { planId: planId1, setNumber: 1, isDone: false },
        { planId: planId1, setNumber: 2, isDone: true },
        { planId: planId1, setNumber: 3, isDone: false },
      ]);
      await db.routineExerciseSets.bulkPut([
        { planId: planId2, setNumber: 1, isDone: true },
        { planId: planId2, setNumber: 2, isDone: false },
        { planId: planId2, setNumber: 3, isDone: true },
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
}
