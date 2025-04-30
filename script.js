// OLED Menu Builder Web App - Starter Logic

document.addEventListener('DOMContentLoaded', () => {
  const menuList = document.getElementById('menuList');
  const addMenuItemBtn = document.getElementById('addMenuItemBtn');
  const oledCanvas = document.getElementById('oledCanvas');
  const ctx = oledCanvas.getContext('2d');

  let menuItems = [];

  function renderMenu() {
    menuList.innerHTML = '';
    menuItems.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'menu-item';
      div.textContent = item.label || `Menu Item ${idx + 1}`;
      menuList.appendChild(div);
    });
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

  // Initial render
  renderMenu();
  drawOLED();
}); 