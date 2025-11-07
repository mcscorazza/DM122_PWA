export default class HTMLService {
  constructor(gymLogService) {
    this.headerTitle = document.getElementById('header-title');
    this.btnHeaderBack = document.getElementById('btn-header-back');
    this.btnHeaderEdit = document.getElementById('btn-header-edit');
    this.pages = document.querySelectorAll('.page');

    this.routineListContainer = document.getElementById('routine-list');

    this.gymLogService = gymLogService;
    this.navigate('screen-1', 'Minhas Rotinas');

    this.getRoutines();
  }

  navigate(pageId, title, routineId = null) {
    this.pages.forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
      targetPage.classList.add('active');
    }
    this.headerTitle.textContent = title;
    if (pageId === 'screen-1') {
      this.btnHeaderBack.classList.add('hidden');
      this.btnHeaderEdit.classList.remove('hidden');
    } else {
      this.btnHeaderBack.classList.remove('hidden');
      this.btnHeaderEdit.classList.add('hidden');
    }
  }

  async getRoutines() {
    const routines = await this.gymLogService.getAll();
    console.log(routines);
    this.routineListContainer.innerHTML = '';

    routines.forEach(routine => {
      const routineCard = document.createElement('div');
      routineCard.className = 'routine-card';
      routineCard.innerHTML = `
        <img src="./src/assets/${routine.icon}" alt="${routine.title}">
        <div class="routine-card-content">
          <h3 class="routine-card-title">${routine.title}</h3>
          <p class="routine-card-subtitle">${routine.description}</p>
        </div>
        <i data-lucide="chevron-right" class="routine-btn"></i>
      `;
      this.routineListContainer.appendChild(routineCard);
    });

    lucide.createIcons();
  }
}