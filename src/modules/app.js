import HTMLService from "./HMTLService.js";

class App {
  constructor() {
    new HTMLService();
    this.#registerServiceWorker();

  }
  #registerServiceWorker() {
    navigator.serviceWorker
      .register('./sw.js', { type: 'module' })
      .then(console.log(`🚩 [app.js] SW registered`))
      .catch(console.log(`🚩 [app.js] SW failed to register`));
  }
}

new App();

