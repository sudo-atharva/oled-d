// OLED Menu Builder Web App - Enhanced Logic

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const landingOverlay = document.getElementById('landingOverlay');
  const appContainer = document.getElementById('appContainer');
  const createProjectBtn = document.getElementById('createProjectBtn');
  const menuList = document.getElementById('menuList');
  const addMenuItemBtn = document.getElementById('addMenuItemBtn');
  const oledCanvas = document.getElementById('oledCanvas');
  const ctx = oledCanvas.getContext('2d');
  const prevItemBtn = document.getElementById('prevItem');
  const nextItemBtn = document.getElementById('nextItem');
  const selectedIndexSpan = document.getElementById('selectedIndex');
  const totalItemsSpan = document.getElementById('totalItems');

  // State
  let menuItems = [];
  let selectedIndex = 0;
  let isScrolling = false;
  let scrollOffset = 0;
  const ITEM_HEIGHT = 12;
  const VISIBLE_ITEMS = 5;
  const SCROLL_SPEED = 2;

  // Initialize OLED display
  function initOLED() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, oledCanvas.width, oledCanvas.height);
    
    // Draw border
    ctx.strokeStyle = '#333';
    ctx.strokeRect(0, 0, oledCanvas.width, oledCanvas.height);
  }

  // Draw menu items on OLED
  function drawMenuItems() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, oledCanvas.width, oledCanvas.height);

    const centerY = oledCanvas.height / 2;
    const startY = centerY - (ITEM_HEIGHT * (VISIBLE_ITEMS / 2));

    menuItems.forEach((item, index) => {
      const y = startY + (index * ITEM_HEIGHT) - scrollOffset;
      
      // Only draw if visible
      if (y >= -ITEM_HEIGHT && y <= oledCanvas.height) {
        // Draw selection box for center item
        if (index === selectedIndex) {
          ctx.fillStyle = '#fff';
          ctx.fillRect(2, y - 2, oledCanvas.width - 4, ITEM_HEIGHT + 2);
          ctx.fillStyle = '#000';
        } else {
          ctx.fillStyle = '#fff';
        }

        // Draw menu item text
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(item.label || `Menu Item ${index + 1}`, oledCanvas.width / 2, y + 8);
      }
    });

    // Update info display
    selectedIndexSpan.textContent = selectedIndex;
    totalItemsSpan.textContent = menuItems.length;
  }

  // Handle menu navigation
  function navigateMenu(direction) {
    if (isScrolling) return;
    
    const newIndex = selectedIndex + direction;
    if (newIndex >= 0 && newIndex < menuItems.length) {
      selectedIndex = newIndex;
      isScrolling = true;
      
      // Animate scroll
      const targetOffset = selectedIndex * ITEM_HEIGHT;
      const startOffset = scrollOffset;
      const distance = targetOffset - startOffset;
      const duration = 300; // ms
      const startTime = performance.now();

      function animateScroll(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        scrollOffset = startOffset + (distance * easeProgress);
        
        drawMenuItems();
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          isScrolling = false;
        }
      }

      requestAnimationFrame(animateScroll);
    }
  }

  // Event Listeners
  prevItemBtn.addEventListener('click', () => navigateMenu(-1));
  nextItemBtn.addEventListener('click', () => navigateMenu(1));

  // Add menu item
  addMenuItemBtn.addEventListener('click', () => {
    menuItems.push({
      label: `Menu Item ${menuItems.length + 1}`,
      icon: null
    });
    renderMenu();
    drawMenuItems();
  });

  // Render menu list
  function renderMenu() {
    menuList.innerHTML = '';
    menuItems.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = `menu-item ${index === selectedIndex ? 'selected' : ''}`;
      div.innerHTML = `
        <div class="icon">${item.icon || '📱'}</div>
        <div class="label">${item.label}</div>
        <div class="actions">
          <button class="edit">✏️</button>
          <button class="delete">🗑️</button>
        </div>
        ${index === selectedIndex ? '<span class="selected-badge">Selected</span>' : ''}
      `;
      menuList.appendChild(div);
    });
  }

  // Navigation
  createProjectBtn.addEventListener('click', () => {
    landingOverlay.style.display = 'none';
    appContainer.style.display = 'block';
    menuItems = [];
    selectedIndex = 0;
    scrollOffset = 0;
    initOLED();
    renderMenu();
    drawMenuItems();
  });

  // Initialize
  initOLED();
}); 