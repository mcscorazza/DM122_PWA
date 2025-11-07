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
    });
    db.on("populate", async () => {
      db.routines.bulkPut([
        {
          title: "Treino A",
          description: "Peito/Tríceps",
          icon: "supino.png"
        },
        {
          title: "Treino B",
          description: "Costas/Bíceps",
          icon: "biceps.png"
        },
        {
          title: "Treino C",
          description: "Perna/Ombro",
          icon: "leg-press.png"
        },
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

  async getAll() {
    return this.#db.routines.toArray();
  }

  async delete(routineId) {
    await this.#db.routines.delete(routineId);
    console.log(`[TodoService.js] Routine with ID ${routineId} has been deleted`);
    return true;
  }
}
