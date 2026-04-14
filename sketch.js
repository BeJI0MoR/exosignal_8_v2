// ─── константы и переменные ─────────────────────────────
const GRID_H    = 7;    
const GRID_W    = 10;   
const GLIF_SIZE = 8;    
const CELL_SIZE = 7;    
const GAP       = 20;   

let RAND        = 0.6;  // Плотность (меняется через Q/W)
let glyphs      = [];   // Сетка генерации
let favorites   = [];   // Список избранного
let cursorX     = 0;    
let cursorY     = 0;

function setup() {
  createCanvas(800, 850); 
  noStroke();
  generateGlyphs();
} 

function generateGlyphs() {
  glyphs = [];
  for (let y = 0; y < GRID_H; y++) {
    glyphs[y] = [];
    for (let x = 0; x < GRID_W; x++) {
      glyphs[y][x] = createGlyph();
    }
  }
}

function createGlyph() {
  let glyph = [];
  for (let row = 0; row < GLIF_SIZE; row++) {
    glyph[row] = [];
    for (let col = 0; col < Math.ceil(GLIF_SIZE / 2); col++) {
      // Чистый рандом на основе текущей плотности RAND
      let val = random() < RAND ? 1 : 0;
      glyph[row][col] = val;
      // Зеркальное отражение по горизонтали
      glyph[row][GLIF_SIZE - 1 - col] = val;
    }
  }
  return glyph;
}

function draw() { 
  background(0);

  // 1. Рисуем основную сетку
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      let ox = 30 + x * (GLIF_SIZE * CELL_SIZE + GAP);
      let oy = 60 + y * (GLIF_SIZE * CELL_SIZE + GAP);

      if (x === cursorX && y === cursorY) {
        fill(255); // Активный глиф — белый
      } else {
        // Цвет морской волны для остальных
        fill(25, 255, 255, 128); 
      }
      drawGlyph(glyphs[y][x], ox, oy, CELL_SIZE);
    }
  }

  // 2. Рисуем фаворитов внизу
  let favStartX = 30;
  let favStartY = 620;   
  let favCols   = 15;      
  let sCell     = 3;         
  let sGap      = 15;         

  fill(255, 200, 0); // Золотистый цвет для фаворитов
  for (let i = 0; i < favorites.length; i++) {
    let col = i % favCols; 
    let row = Math.floor(i / favCols);
    let fx = favStartX + col * (GLIF_SIZE * sCell + sGap);
    let fy = favStartY + row * (GLIF_SIZE * sCell + sGap);
    drawGlyph(favorites[i], fx, fy, sCell);
  }

  // 3. Информационная панель (UI)
  fill(255);
  textSize(16);
  textAlign(LEFT);
  text("density (Q/W): " + nf(RAND, 1, 2), 30, 30);
  text("Выбрано (S): " + favorites.length, 250, 30);
  fill(150);
  textSize(12);
  text("STRELI: nav | SPACE: gen | E: export PNG", 450, 30);
}

function drawGlyph(glyph, ox, oy, size) {
  for (let row = 0; row < GLIF_SIZE; row++) {
    for (let col = 0; col < GLIF_SIZE; col++) {
      if (glyph[row][col] === 1) {
        rect(ox + col * size, oy + row * size, size, size);
      }
    }
  }
}

function keyPressed() {
  if (key === ' ') generateGlyphs();

  // Навигация
  if (keyCode === RIGHT_ARROW) cursorX = min(cursorX + 1, GRID_W - 1);
  if (keyCode === LEFT_ARROW)  cursorX = max(cursorX - 1, 0);
  if (keyCode === DOWN_ARROW)  cursorY = min(cursorY + 1, GRID_H - 1);
  if (keyCode === UP_ARROW)    cursorY = max(cursorY - 1, 0);

  // Сохранение в фавориты
  if (key === 's' || key === 'S') {
    let current = glyphs[cursorY][cursorX];
    favorites.push(JSON.parse(JSON.stringify(current)));
  }

  // Экспорт выбранных
  if (key === 'e' || key === 'E') exportAll();

  // Плотность
  let step = 0.05;
  if (key === 'w' || key === 'W') {
    RAND = constrain(RAND + step, 0, 1);
    generateGlyphs();
  }
  if (key === 'q' || key === 'Q') {
    RAND = constrain(RAND - step, 0, 1);
    generateGlyphs();
  }
}

function exportAll() {
  let exportScale = 90; 
  let finalSize = GLIF_SIZE * exportScale;

  for (let i = 0; i < favorites.length; i++) {
    let output = createGraphics(finalSize, finalSize);
    output.noStroke();
    output.clear(); 
    output.fill(0); // Черный цвет для FontLab/Fontself
    let glyph = favorites[i];
    for (let row = 0; row < GLIF_SIZE; row++) {
      for (let col = 0; col < GLIF_SIZE; col++) {
        if (glyph[row][col] === 1) {
          output.rect(col * exportScale, row * exportScale, exportScale, exportScale);
        }
      }
    }
    saveCanvas(output, `glyph_${i}`, 'png');
    output.remove();
  }
}