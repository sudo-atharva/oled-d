// OLED Menu Builder Web App - Starter Logic

document.addEventListener('DOMContentLoaded', () => {
  // Landing and navigation
  const landingOverlay = document.getElementById('landingOverlay');
  const createProjectBtn = document.getElementById('createProjectBtn');
  const openProjectBtn = document.getElementById('openProjectBtn');
  const templateBtn = document.getElementById('templateBtn');
  const editorHeader = document.getElementById('editorHeader');
  const editorMain = document.getElementById('editorMain');
  const backToHomeBtn = document.getElementById('backToHomeBtn');
  const projectTitle = document.getElementById('projectTitle');

  // OLED/menu logic
  const menuList = document.getElementById('menuList');
  const addMenuItemBtn = document.getElementById('addMenuItemBtn');
  const oledCanvas = document.getElementById('oledCanvas');
  const ctx = oledCanvas.getContext('2d');
  const oledMenuPreview = document.getElementById('oledMenuPreview');

  let menuItems = [];

  // Navigation logic
  function showEditor(projectName = 'Untitled Project') {
    landingOverlay.style.display = 'none';
    editorHeader.style.display = '';
    editorMain.style.display = 'flex';
    projectTitle.textContent = projectName;
  }
  function showLanding() {
    landingOverlay.style.display = 'flex';
    editorHeader.style.display = 'none';
    editorMain.style.display = 'none';
  }
  createProjectBtn.addEventListener('click', () => {
    menuItems = [];
    renderMenu();
    drawOLED();
    showEditor('Untitled Project');
  });
  backToHomeBtn.addEventListener('click', showLanding);
  // (Future) openProjectBtn, templateBtn logic

  // Menu logic
  function renderMenu() {
    menuList.innerHTML = '';
    menuItems.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'menu-item';
      div.textContent = item.label || `Menu Item ${idx + 1}`;
      menuList.appendChild(div);
    });
    renderOledMenuPreview();
  }
  addMenuItemBtn.addEventListener('click', () => {
    menuItems.push({ label: '' });
    renderMenu();
    drawOLED();
  });

  function drawOLED() {
    ctx.clearRect(0, 0, oledCanvas.width, oledCanvas.height);
    // Draw border
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(0, 0, oledCanvas.width, oledCanvas.height);
    // Placeholder: draw menu items (future)
  }

  function renderOledMenuPreview() {
    oledMenuPreview.innerHTML = menuItems.length
      ? menuItems.map((item, idx) => `<div>${item.label || `Menu Item ${idx + 1}`}</div>`).join('')
      : '<em>No menu items yet.</em>';
  }

  // Initial state
  showLanding();
}); 