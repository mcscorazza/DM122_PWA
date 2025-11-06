import HTMLService from "./HMTLService.js";
import GymLogService from "./GymLogService.js"

class App {
  constructor() {
    this.#registerServiceWorker();
    const gymLogService = new GymLogService();
    window.HTMLService = new HTMLService(gymLogService);
  }
  #registerServiceWorker() {
    navigator.serviceWorker
      .register('./sw.js', { type: 'module' })
      .then(console.log(`🚩 [app.js] SW registered`))
      .catch(console.log(`🚩 [app.js] SW failed to register`));
  }
}

new App();

