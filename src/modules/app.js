import HTMLService from "./HTMLService.js";
import GymLogService from "./GymLogService.js"


class App {
  constructor() {
    lucide.createIcons();
    this.#registerServiceWorker();
    const gymLogService = new GymLogService();
    const htmlService = new HTMLService(gymLogService);
  }

  #registerServiceWorker() {
    navigator.serviceWorker
    .register('./sw.js', { type: 'module' })
    .then(() => {
      console.log(`🚩 [app.js] SW registered`);
    })
    .catch((error) => {
      console.log(`🚩 [app.js] SW failed to register:`, error);
    });
  }
}

new App();

