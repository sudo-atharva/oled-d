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
  const fontSelect = document.getElementById('fontSelect');
  const iconUpload = document.getElementById('iconUpload');
  const tabMenuBuilder = document.getElementById('tabMenuBuilder');
  const tabScreenEditor = document.getElementById('tabScreenEditor');
  const tabExportCode = document.getElementById('tabExportCode');
  const mainContent = document.querySelector('.mainContent');
  const screenEditorSection = document.getElementById('screenEditorSection');
  const exportCodeSection = document.getElementById('exportCodeSection');
  const exportedCode = document.getElementById('exportedCode');
  const copyExportedCodeBtn = document.getElementById('copyExportedCodeBtn');

  // State
  let menuItems = [];
  let selectedIndex = 0;
  let isScrolling = false;
  let scrollOffset = 0;
  const ITEM_HEIGHT = 18; // Make items taller for bigger font
  const VISIBLE_ITEMS = 5;
  const SCROLL_SPEED = 2;
  let currentFont = 'ncenB14';
  let currentFontCss = 'bold 16px serif';
  const fontMap = {
    'u8g2_font_ncenB14_tr': 'bold 16px serif',
    'u8g2_font_6x10_tr': '10px monospace',
    'u8g2_font_courB08_tr': 'bold 12px Courier',
    'u8g2_font_helvB12_tr': 'bold 14px Helvetica'
  };

  // Font selection logic
  fontSelect.addEventListener('change', (e) => {
    currentFont = e.target.value;
    currentFontCss = fontMap[currentFont] || 'bold 16px serif';
    drawMenuItems();
  });

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
      if (y >= -ITEM_HEIGHT && y <= oledCanvas.height) {
        // Draw selection box for center item
        if (index === selectedIndex) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.strokeRect(2, y - 2, oledCanvas.width - 4, ITEM_HEIGHT + 4);
          ctx.fillStyle = '#fff';
          // Draw icon if present
          if (item.iconImg) {
            ctx.drawImage(item.iconImg, 8, y + 2, 18, 18);
          }
          ctx.font = currentFontCss;
          ctx.textAlign = 'left';
          ctx.fillStyle = '#fff';
          ctx.fillText(item.label || `Menu Item ${index + 1}`, 32, y + 16);
        } else {
          ctx.font = '12px monospace';
          ctx.textAlign = 'left';
          ctx.fillStyle = '#aaa';
          if (item.iconImg) {
            ctx.drawImage(item.iconImg, 8, y + 2, 14, 14);
          }
          ctx.fillText(item.label || `Menu Item ${index + 1}`, 28, y + 12);
        }
      }
    });

    // Draw fixed outline in center
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, centerY - ITEM_HEIGHT / 2 - 2, oledCanvas.width - 4, ITEM_HEIGHT + 4);

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
      const targetOffset = selectedIndex * ITEM_HEIGHT;
      const startOffset = scrollOffset;
      const distance = targetOffset - startOffset;
      const duration = 300; // ms
      const startTime = performance.now();
      function animateScroll(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
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
      icon: null,
      iconImg: null
    });
    renderMenu();
    drawMenuItems();
  });

  // Icon upload logic
  let iconUploadIndex = null;
  menuList.addEventListener('click', (e) => {
    if (e.target.classList.contains('icon-upload-btn')) {
      iconUploadIndex = parseInt(e.target.dataset.index);
      iconUpload.click();
    }
  });
  iconUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && iconUploadIndex !== null) {
      const reader = new FileReader();
      reader.onload = function(ev) {
        const img = new Image();
        img.onload = function() {
          menuItems[iconUploadIndex].iconImg = img;
          renderMenu();
          drawMenuItems();
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Render menu list
  function renderMenu() {
    menuList.innerHTML = '';
    menuItems.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = `menu-item ${index === selectedIndex ? 'selected' : ''}`;
      div.innerHTML = `
        <div class="icon">${item.iconImg ? `<img src="${item.iconImg.src}" style="width:24px;height:24px;vertical-align:middle;">` : '📱'}</div>
        <div class="label">${item.label}</div>
        <div class="actions">
          <button class="icon-upload-btn" data-index="${index}">🖼️</button>
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

  function setActiveTab(tab) {
    tabMenuBuilder.classList.remove('active');
    tabScreenEditor.classList.remove('active');
    tabExportCode.classList.remove('active');
    mainContent.style.display = 'none';
    screenEditorSection.style.display = 'none';
    exportCodeSection.style.display = 'none';
    if (tab === 'menu') {
      tabMenuBuilder.classList.add('active');
      mainContent.style.display = '';
    } else if (tab === 'screen') {
      tabScreenEditor.classList.add('active');
      screenEditorSection.style.display = '';
    } else if (tab === 'export') {
      tabExportCode.classList.add('active');
      exportCodeSection.style.display = '';
      generateExportCode();
    }
  }

  tabMenuBuilder.addEventListener('click', () => setActiveTab('menu'));
  tabScreenEditor.addEventListener('click', () => setActiveTab('screen'));
  tabExportCode.addEventListener('click', () => setActiveTab('export'));

  // Export code logic
  function generateExportCode() {
    let code = `// OLED Menu Code (u8g2)
`;
    code += 'const char* menuItems[] = {\n';
    menuItems.forEach(item => {
      code += `  \"${item.label.replace(/"/g, '\\"')}\",\n`;
    });
    code += '};\n';
    code += `const uint8_t menuLength = ${menuItems.length};\n`;
    // Export icon bitmaps as C arrays (placeholder, real conversion needed)
    menuItems.forEach((item, idx) => {
      if (item.iconImg) {
        code += `// Icon for ${item.label}\n`;
        code += `const uint8_t icon_${idx}[] = {/* ...bitmap data... */};\n`;
      }
    });
    code += '\n// Add your menu rendering logic here using u8g2\n';
    exportedCode.value = code;
  }

  copyExportedCodeBtn.addEventListener('click', () => {
    exportedCode.select();
    document.execCommand('copy');
    copyExportedCodeBtn.textContent = 'Copied!';
    setTimeout(() => { copyExportedCodeBtn.textContent = 'Copy Code'; }, 1200);
  });

  // --- Screen Editor State ---
  const screenList = document.getElementById('screenList');
  const addScreenBtn = document.getElementById('addScreenBtn');
  const screenCanvas = document.getElementById('screenCanvas');
  const screenCtx = screenCanvas.getContext('2d');
  const clearScreenBtn = document.getElementById('clearScreenBtn');
  const importImageBtn = document.getElementById('importImageBtn');
  const importImageInput = document.getElementById('importImageInput');
  const screenDataType = document.getElementById('screenDataType');
  let screens = [];
  let selectedScreenIndex = 0;
  let screenPixelSize = 2; // for drawing
  let isDrawing = false;
  let drawColor = 1;

  function createEmptyScreen(name = "Screen", w = 128, h = 64) {
    return {
      name,
      w,
      h,
      data: Array.from({length: h}, () => Array(w).fill(0)),
    };
  }

  function renderScreenList() {
    screenList.innerHTML = '';
    screens.forEach((screen, idx) => {
      const li = document.createElement('li');
      li.style.marginBottom = '0.5rem';
      li.innerHTML = `<input value="${screen.name}" data-idx="${idx}" class="screenNameInput" style="width:90px;"> ` +
        `<button class="selectScreenBtn" data-idx="${idx}" ${idx===selectedScreenIndex?'disabled':''}>Select</button> ` +
        `<button class="deleteScreenBtn" data-idx="${idx}">🗑️</button>`;
      if(idx===selectedScreenIndex) li.style.fontWeight = 'bold';
      screenList.appendChild(li);
    });
  }

  function drawScreenCanvas() {
    const screen = screens[selectedScreenIndex];
    screenCtx.clearRect(0,0,screenCanvas.width,screenCanvas.height);
    for(let y=0;y<screen.h;y++){
      for(let x=0;x<screen.w;x++){
        if(screen.data[y][x]){
          screenCtx.fillStyle = '#fff';
          screenCtx.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  addScreenBtn.addEventListener('click',()=>{
    screens.push(createEmptyScreen(`Screen${screens.length+1}`));
    selectedScreenIndex = screens.length-1;
    renderScreenList();
    drawScreenCanvas();
  });
  screenList.addEventListener('click',e=>{
    if(e.target.classList.contains('selectScreenBtn')){
      selectedScreenIndex = parseInt(e.target.dataset.idx);
      renderScreenList();
      drawScreenCanvas();
    } else if(e.target.classList.contains('deleteScreenBtn')){
      const idx = parseInt(e.target.dataset.idx);
      screens.splice(idx,1);
      if(selectedScreenIndex>=screens.length) selectedScreenIndex = screens.length-1;
      renderScreenList();
      drawScreenCanvas();
    }
  });
  screenList.addEventListener('input',e=>{
    if(e.target.classList.contains('screenNameInput')){
      const idx = parseInt(e.target.dataset.idx);
      screens[idx].name = e.target.value;
    }
  });
  screenCanvas.addEventListener('mousedown',e=>{
    isDrawing = true;
    const rect = screenCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX-rect.left));
    const y = Math.floor((e.clientY-rect.top));
    togglePixel(x,y);
  });
  screenCanvas.addEventListener('mousemove',e=>{
    if(isDrawing){
      const rect = screenCanvas.getBoundingClientRect();
      const x = Math.floor((e.clientX-rect.left));
      const y = Math.floor((e.clientY-rect.top));
      togglePixel(x,y);
    }
  });
  document.addEventListener('mouseup',()=>{isDrawing=false;});
  function togglePixel(x,y){
    const screen = screens[selectedScreenIndex];
    if(x>=0&&x<screen.w&&y>=0&&y<screen.h){
      screen.data[y][x] = 1-screen.data[y][x];
      drawScreenCanvas();
    }
  }
  clearScreenBtn.addEventListener('click',()=>{
    const screen = screens[selectedScreenIndex];
    for(let y=0;y<screen.h;y++) for(let x=0;x<screen.w;x++) screen.data[y][x]=0;
    drawScreenCanvas();
  });
  importImageBtn.addEventListener('click',()=>{importImageInput.click();});
  importImageInput.addEventListener('change',e=>{
    const file = e.target.files[0];
    if(!file) return;
    const img = new Image();
    img.onload = ()=>{
      const screen = screens[selectedScreenIndex];
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = screen.w;
      tempCanvas.height = screen.h;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(img,0,0,screen.w,screen.h);
      const imgData = tempCtx.getImageData(0,0,screen.w,screen.h).data;
      for(let y=0;y<screen.h;y++){
        for(let x=0;x<screen.w;x++){
          const i = (y*screen.w+x)*4;
          const v = (imgData[i]+imgData[i+1]+imgData[i+2])/3;
          screen.data[y][x] = v>128?0:1;
        }
      }
      drawScreenCanvas();
    };
    const reader = new FileReader();
    reader.onload = e=>{img.src = e.target.result;};
    reader.readAsDataURL(file);
  });
  // --- Export Code Enhancements ---
  const exportFormat = document.getElementById('exportFormat');
  const exportDataType = document.getElementById('exportDataType');
  const downloadCBtn = document.getElementById('downloadCBtn');
  const downloadHBtn = document.getElementById('downloadHBtn');
  function screenToCArray(screen, dtype) {
    let arr = [];
    let bits = dtype==='uint8_t'?8:16;
    for(let y=0;y<screen.h;y++){
      for(let x=0;x<screen.w;x+=bits){
        let v = 0;
        for(let b=0;b<bits;b++){
          if(x+b<screen.w && screen.data[y][x+b]) v |= (1<<(bits-1-b));
        }
        arr.push(v);
      }
    }
    return arr;
  }
  function generateExportCode() {
    const dtype = exportDataType.value;
    let code = `// OLED Menu Code (u8g2)\n`;
    code += 'const char* menuItems[] = {\n';
    menuItems.forEach(item => {
      code += `  \"${item.label.replace(/\"/g, '\\\"')}\",\n`;
    });
    code += '};\n';
    code += `const uint8_t menuLength = ${menuItems.length};\n`;
    // Export screens
    screens.forEach((screen, idx) => {
      const arr = screenToCArray(screen, dtype);
      code += `// Screen: ${screen.name}\n`;
      code += `${dtype} ${screen.name.replace(/\W/g,'_')}[${arr.length}] = {`;
      code += arr.join(',');
      code += '};\n';
    });
    code += '\n// Add your menu and screen rendering logic here using u8g2\n';
    exportedCode.value = code;
  }
  exportFormat.addEventListener('change', generateExportCode);
  exportDataType.addEventListener('change', generateExportCode);
  // Download .c/.h files
  function downloadFile(filename, content) {
    const blob = new Blob([content], {type:'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
  }
  downloadCBtn.addEventListener('click',()=>{
    let c = '';
    const dtype = exportDataType.value;
    screens.forEach((screen, idx) => {
      const arr = screenToCArray(screen, dtype);
      c += `// Screen: ${screen.name}\n`;
      c += `${dtype} ${screen.name.replace(/\W/g,'_')}[${arr.length}] = {`;
      c += arr.join(',');
      c += '};\n';
    });
    downloadFile('screens.c', c);
  });
  downloadHBtn.addEventListener('click',()=>{
    let h = '';
    const dtype = exportDataType.value;
    screens.forEach((screen, idx) => {
      const arr = screenToCArray(screen, dtype);
      h += `extern ${dtype} ${screen.name.replace(/\W/g,'_')}[${arr.length}];\n`;
    });
    downloadFile('screens.h', h);
  });

  // Initialize
  initOLED();
  renderMenu();
  drawMenuItems();
}); 