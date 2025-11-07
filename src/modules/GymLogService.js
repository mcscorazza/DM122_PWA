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
      routineExercises: "++id, routineId, exerciseId"
    });
    db.on("populate", async () => {
      db.routines.bulkPut([
        { title: "Treino A", description: "Peito/Tríceps", icon: "supino.png" },
        { title: "Treino B", description: "Costas/Bíceps", icon: "biceps.png" },
        { title: "Treino C", description: "Perna/Ombro", icon: "leg-press.png" },
      ]);
      db.exercises.bulkPut([
        { id: 1, description: "Supino Reto", type: "Peito" },
        { id: 2, description: "Fly Maquina", type: "Peito" },
        { id: 3, description: "Rosca Direta com Barra W", type: "Biceps" },
        { id: 4, description: "Rosca Martelo com Alteres", type: "Biceps" },
      ]);
      db.routineExercises.bulkPut([
        { routineId: 1, exerciseId: 1, targetSets: 3, targetReps: 12, targetWeight: 20 },
        { routineId: 1, exerciseId: 2, targetSets: 3, targetReps: 12, targetWeight: 40 },
        { routineId: 1, exerciseId: 3, targetSets: 3, targetReps: 12, targetWeight: 25 },
        { routineId: 1, exerciseId: 4, targetSets: 3, targetReps: 12, targetWeight: 8 }
      ])
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

    if (plannedItems.length === 0) {
      return [];
    }

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
        exerciseId: plan.exerciseId,
        description: details ? details.description : 'Exercício não encontrado',
        type: details ? details.type : 'N/A'
      };
    });

    return fullExercises;
  }


}
