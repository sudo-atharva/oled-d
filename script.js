// OLED Menu Builder - script.js

document.addEventListener('DOMContentLoaded', () => {
  // --- Tab Switching ---
  const tabMenuBuilder = document.getElementById('tabMenuBuilder');
  const tabScreenEditor = document.getElementById('tabScreenEditor');
  const tabExportCode = document.getElementById('tabExportCode');
  const menuBuilderPage = document.getElementById('menuBuilderPage');
  const screenEditorPage = document.getElementById('screenEditorPage');
  const exportCodePage = document.getElementById('exportCodePage');

  function setTab(tab) {
    menuBuilderPage.classList.remove('active');
    screenEditorPage.classList.remove('active');
    exportCodePage.classList.remove('active');
    tabMenuBuilder.classList.remove('active');
    tabScreenEditor.classList.remove('active');
    tabExportCode.classList.remove('active');
    if (tab === 'menu') {
      menuBuilderPage.classList.add('active');
      tabMenuBuilder.classList.add('active');
    } else if (tab === 'screen') {
      screenEditorPage.classList.add('active');
      tabScreenEditor.classList.add('active');
      renderScreenList();
      drawScreenCanvas();
    } else if (tab === 'export') {
      exportCodePage.classList.add('active');
      tabExportCode.classList.add('active');
      generateExportCode();
    }
  }
  tabMenuBuilder.onclick = () => setTab('menu');
  tabScreenEditor.onclick = () => setTab('screen');
  tabExportCode.onclick = () => setTab('export');

  // --- Menu Builder State ---
  const menuList = document.getElementById('menuList');
  const addMenuItemBtn = document.getElementById('addMenuItemBtn');
  const oledCanvas = document.getElementById('oledCanvas');
  const ctx = oledCanvas.getContext('2d');
  const prevItemBtn = document.getElementById('prevItem');
  const nextItemBtn = document.getElementById('nextItem');
  const iconUpload = document.getElementById('iconUpload');
  const fontOptions = [
    { value: 'u8g2_font_ncenB14_tr', label: 'ncenB14', css: 'bold 16px serif' },
    { value: 'u8g2_font_6x10_tr', label: '6x10', css: '10px monospace' },
    { value: 'u8g2_font_courB08_tr', label: 'courB08', css: 'bold 12px Courier' },
    { value: 'u8g2_font_helvB12_tr', label: 'helvB12', css: 'bold 14px Helvetica' }
  ];
  let menuItems = [];
  let selectedIndex = 0;
  let scrollOffset = 0;
  const ITEM_HEIGHT = 22;
  const VISIBLE_ITEMS = 3;
  let iconUploadIndex = null;

  function addMenuItem(label = `Menu Item ${menuItems.length + 1}`) {
    menuItems.push({
      label,
      iconImg: null,
      font: fontOptions[0].value
    });
    renderMenu();
    drawMenuItems();
  }
  addMenuItemBtn.onclick = () => addMenuItem();

  function renderMenu() {
    menuList.innerHTML = '';
    menuItems.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'menu-item' + (idx === selectedIndex ? ' selected' : '');
      div.innerHTML = `
        <div class="icon">${item.iconImg ? `<img src="${item.iconImg}" />` : 'ico'}</div>
        <div class="label">${item.label}</div>
        <select class="font-select">${fontOptions.map(f => `<option value="${f.value}"${item.font === f.value ? ' selected' : ''}>${f.label}</option>`).join('')}</select>
        <span class="icon-upload" title="Upload Icon" data-idx="${idx}">&#128247;</span>
        <div class="actions">
          <button class="delete" title="Delete">&#128465;</button>
        </div>
        ${idx === selectedIndex ? '<span class="selected-badge">Selected</span>' : ''}
      `;
      // Font select
      div.querySelector('.font-select').onchange = e => {
        item.font = e.target.value;
        drawMenuItems();
      };
      // Icon upload
      div.querySelector('.icon-upload').onclick = () => {
        iconUploadIndex = idx;
        iconUpload.click();
      };
      // Delete
      div.querySelector('.delete').onclick = () => {
        menuItems.splice(idx, 1);
        if (selectedIndex >= menuItems.length) selectedIndex = menuItems.length - 1;
        renderMenu();
        drawMenuItems();
      };
      menuList.appendChild(div);
    });
  }
  iconUpload.onchange = e => {
    const file = e.target.files[0];
    if (!file || iconUploadIndex === null) return;
    const reader = new FileReader();
    reader.onload = ev => {
      menuItems[iconUploadIndex].iconImg = ev.target.result;
      renderMenu();
      drawMenuItems();
    };
    reader.readAsDataURL(file);
  };

  // --- OLED Canvas Drawing ---
  function drawMenuItems() {
    ctx.clearRect(0, 0, oledCanvas.width, oledCanvas.height);
    const centerY = oledCanvas.height / 2;
    let startIdx = selectedIndex - Math.floor(VISIBLE_ITEMS / 2);
    if (menuItems.length <= VISIBLE_ITEMS) startIdx = 0;
    // Circular navigation
    while (startIdx < 0) startIdx += menuItems.length;
    // Draw items
    for (let i = 0; i < VISIBLE_ITEMS; i++) {
      let idx = (startIdx + i) % menuItems.length;
      const y = centerY - ITEM_HEIGHT + i * ITEM_HEIGHT;
      const item = menuItems[idx];
      // Selection outline (fixed in center)
      if (i === Math.floor(VISIBLE_ITEMS / 2)) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, y - 2, oledCanvas.width - 4, ITEM_HEIGHT + 4);
      }
      // Icon
      if (item.iconImg) {
        const img = new window.Image();
        img.src = item.iconImg;
        ctx.drawImage(img, 8, y + 2, 18, 18);
      }
      // Font
      const fontObj = fontOptions.find(f => f.value === item.font) || fontOptions[0];
      ctx.font = fontObj.css;
      ctx.textAlign = 'left';
      ctx.fillStyle = i === Math.floor(VISIBLE_ITEMS / 2) ? '#fff' : '#aaa';
      ctx.fillText(item.label, 32, y + 16);
    }
  }
  prevItemBtn.onclick = () => {
    selectedIndex = (selectedIndex - 1 + menuItems.length) % menuItems.length;
    drawMenuItems();
    renderMenu();
  };
  nextItemBtn.onclick = () => {
    selectedIndex = (selectedIndex + 1) % menuItems.length;
    drawMenuItems();
    renderMenu();
  };

  // --- Screen Editor State ---
  const screenList = document.getElementById('screenList');
  const addScreenBtn = document.getElementById('addScreenBtn');
  const screenCanvas = document.getElementById('screenCanvas');
  const screenCtx = screenCanvas.getContext('2d');
  const clearScreenBtn = document.getElementById('clearScreenBtn');
  const importImageBtn = document.getElementById('importImageBtn');
  const importImageInput = document.getElementById('importImageInput');
  const screenDataType = document.getElementById('screenDataType');
  const screenFont = document.getElementById('screenFont');
  let screens = [];
  let selectedScreenIndex = 0;
  let isDrawing = false;

  function createEmptyScreen(name = "Screen", w = 128, h = 64) {
    return {
      name,
      w,
      h,
      data: Array.from({length: h}, () => Array(w).fill(0)),
      dataType: screenDataType.value,
      font: screenFont.value
    };
  }
  function renderScreenList() {
    screenList.innerHTML = '';
    screens.forEach((screen, idx) => {
      const li = document.createElement('li');
      li.innerHTML = `<input value="${screen.name}" data-idx="${idx}" class="screenNameInput"> ` +
        `<button class="selectScreenBtn" data-idx="${idx}" ${idx===selectedScreenIndex?'disabled':''}>Select</button> ` +
        `<button class="deleteScreenBtn" data-idx="${idx}">&#128465;</button>`;
      if(idx===selectedScreenIndex) li.style.fontWeight = 'bold';
      screenList.appendChild(li);
    });
  }
  function drawScreenCanvas() {
    if (!screens.length) return;
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
  addScreenBtn.onclick = () => {
    screens.push(createEmptyScreen(`Screen${screens.length+1}`));
    selectedScreenIndex = screens.length-1;
    renderScreenList();
    drawScreenCanvas();
  };
  screenList.onclick = e => {
    if(e.target.classList.contains('selectScreenBtn')){
      selectedScreenIndex = parseInt(e.target.dataset.idx);
      renderScreenList();
      drawScreenCanvas();
      screenDataType.value = screens[selectedScreenIndex].dataType;
      screenFont.value = screens[selectedScreenIndex].font;
    } else if(e.target.classList.contains('deleteScreenBtn')){
      const idx = parseInt(e.target.dataset.idx);
      screens.splice(idx,1);
      if(selectedScreenIndex>=screens.length) selectedScreenIndex = screens.length-1;
      renderScreenList();
      drawScreenCanvas();
    }
  };
  screenList.oninput = e => {
    if(e.target.classList.contains('screenNameInput')){
      const idx = parseInt(e.target.dataset.idx);
      screens[idx].name = e.target.value;
    }
  };
  screenCanvas.onmousedown = e => {
    isDrawing = true;
    const rect = screenCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX-rect.left));
    const y = Math.floor((e.clientY-rect.top));
    togglePixel(x,y);
  };
  screenCanvas.onmousemove = e => {
    if(isDrawing){
      const rect = screenCanvas.getBoundingClientRect();
      const x = Math.floor((e.clientX-rect.left));
      const y = Math.floor((e.clientY-rect.top));
      togglePixel(x,y);
    }
  };
  document.onmouseup = ()=>{isDrawing=false;};
  function togglePixel(x,y){
    if (!screens.length) return;
    const screen = screens[selectedScreenIndex];
    if(x>=0&&x<screen.w&&y>=0&&y<screen.h){
      screen.data[y][x] = 1-screen.data[y][x];
      drawScreenCanvas();
    }
  }
  clearScreenBtn.onclick = () => {
    if (!screens.length) return;
    const screen = screens[selectedScreenIndex];
    for(let y=0;y<screen.h;y++) for(let x=0;x<screen.w;x++) screen.data[y][x]=0;
    drawScreenCanvas();
  };
  importImageBtn.onclick = () => {importImageInput.click();};
  importImageInput.onchange = e => {
    const file = e.target.files[0];
    if(!file || !screens.length) return;
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
  };
  screenDataType.onchange = () => {
    if (!screens.length) return;
    screens[selectedScreenIndex].dataType = screenDataType.value;
  };
  screenFont.onchange = () => {
    if (!screens.length) return;
    screens[selectedScreenIndex].font = screenFont.value;
  };

  // --- Export Code ---
  const exportFormat = document.getElementById('exportFormat');
  const exportDataType = document.getElementById('exportDataType');
  const exportedCode = document.getElementById('exportedCode');
  const copyExportedCodeBtn = document.getElementById('copyExportedCodeBtn');
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
  exportFormat.onchange = generateExportCode;
  exportDataType.onchange = generateExportCode;
  copyExportedCodeBtn.onclick = () => {
    exportedCode.select();
    document.execCommand('copy');
    copyExportedCodeBtn.textContent = 'Copied!';
    setTimeout(() => { copyExportedCodeBtn.textContent = 'Copy Code'; }, 1200);
  };
  function downloadFile(filename, content) {
    const blob = new Blob([content], {type:'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
  }
  downloadCBtn.onclick = () => {
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
  };
  downloadHBtn.onclick = () => {
    let h = '';
    const dtype = exportDataType.value;
    screens.forEach((screen, idx) => {
      const arr = screenToCArray(screen, dtype);
      h += `extern ${dtype} ${screen.name.replace(/\W/g,'_')}[${arr.length}];\n`;
    });
    downloadFile('screens.h', h);
  };

  // --- Init ---
  // Add a default menu item and screen for demo
  addMenuItem('Big Knob');
  addMenuItem('Park Sensor');
  addMenuItem('Turbo Gauge');
  screens.push(createEmptyScreen('Screen1'));
  renderMenu();
  drawMenuItems();
  renderScreenList();
  drawScreenCanvas();
  setTab('menu');
}); 