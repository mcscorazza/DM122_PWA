import HTMLService from "./HMTLService.js";
import GymLogService from "./GymLogService.js"

class App {
  constructor() {
    this.#registerServiceWorker();
    const gymLogService = new GymLogService();
    window.HTMLService = new HTMLService(gymLogService);
    this.navigate('screen-1', 'Minhas Rotinas');
  }
  #registerServiceWorker() {
    navigator.serviceWorker
      .register('./sw.js', { type: 'module' })
      .then(console.log(`🚩 [app.js] SW registered`))
      .catch(console.log(`🚩 [app.js] SW failed to register`));
  }
  navigate(pageId, title, routineId = null) {
  pages.forEach(page => page.classList.remove('active'));

  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  headerTitle.textContent = title;

  if (pageId === 'screen-1') {
    btnHeaderBack.classList.add('hidden');
    btnHeaderEdit.classList.remove('hidden');
  } else {
    btnHeaderBack.classList.remove('hidden');
    btnHeaderEdit.classList.add('hidden');
  }
}
}

new App();

