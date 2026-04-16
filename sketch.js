// ─── константы и переменные ─────────────────────────────
const GRID_H    = 7;    
const GRID_W    = 10;   
const GLIF_SIZE = 8;    
const CELL_SIZE = 7;    
const GAP       = 20;   

let RAND        = 0.6;  
let glyphs      = [];   
let favorites   = [];   
let cursorX     = 0;    
let cursorY     = 0;

function setup() {
  // Уменьшил высоту холста, чтобы не было прокрутки
  createCanvas(800, 800); 
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
      let val = random() < RAND ? 1 : 0;
      glyph[row][col] = val;
      glyph[row][GLIF_SIZE - 1 - col] = val;
    }
  }
  return glyph;
}

function draw() { 
  background(0);

  // 1. Основная сетка
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      let ox = 30 + x * (GLIF_SIZE * CELL_SIZE + GAP);
      let oy = 60 + y * (GLIF_SIZE * CELL_SIZE + GAP);

      if (x === cursorX && y === cursorY) {
        fill(255); 
      } else {
        fill(25, 255, 255, 128); 
      }
      drawGlyph(glyphs[y][x], ox, oy, CELL_SIZE);
    }
  }

  // 2. Фавориты внизу (поднял выше)
  let favStartX = 30;
  let favStartY = 600;   
  let favCols   = 20;      
  let sCell     = 5;         
  let sGap      = 10;         

  fill(255, 200, 0); 
  for (let i = 0; i < favorites.length; i++) {
    let col = i % favCols; 
    let row = Math.floor(i / favCols);
    let fx = favStartX + col * (GLIF_SIZE * sCell + sGap);
    let fy = favStartY + row * (GLIF_SIZE * sCell + sGap);
    drawGlyph(favorites[i], fx, fy, sCell);
  }

  // 3. UI
  fill(255);
  textSize(14);
  text("density (Q/W): " + nf(RAND, 1, 2), 30, 30);
  text("Selected (S): " + favorites.length, 200, 30);
  fill(150);
  text("S: add | P: export PNG | E: export SVG", 350, 30);
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

async function keyPressed() {
  if (key === ' ') generateGlyphs();

  if (keyCode === RIGHT_ARROW) cursorX = min(cursorX + 1, GRID_W - 1);
  if (keyCode === LEFT_ARROW)  cursorX = max(cursorX - 1, 0);
  if (keyCode === DOWN_ARROW)  cursorY = min(cursorY + 1, GRID_H - 1);
  if (keyCode === UP_ARROW)    cursorY = max(cursorY - 1, 0);

  if (key === 's' || key === 'S') {
    let current = glyphs[cursorY][cursorX];
    favorites.push(JSON.parse(JSON.stringify(current)));
  }

  // Векторный экспорт
  if (key === 'e' || key === 'E') {
    await exportAllSVG(); 
  }

  // Растровый экспорт
  if (key === 'p' || key === 'P') {
    await exportAllPNG();
  }

  let step = 0.05;
  if (key === 'w' || key === 'W') { RAND = constrain(RAND + step, 0, 1); generateGlyphs(); }
  if (key === 'q' || key === 'Q') { RAND = constrain(RAND - step, 0, 1); generateGlyphs(); }

  // Блокировка скролла стрелками
  if ([UP_ARROW, DOWN_ARROW, 32].includes(keyCode)) {
    return false; 
  }
}

// ─── ВЕКТОРНЫЙ ЭКСПОРТ (SVG) С ВАЛИДАЦИЕЙ ДЛЯ ILLUSTRATOR ───

async function exportAllSVG() {
  if (favorites.length === 0) {
    alert("Сначала добавь глифы в избранное (клавиша S)");
    return;
  }

  for (let i = 0; i < favorites.length; i++) {
    let svgString = createSVGString(favorites[i]);
    
    // Создаем Blob с правильным MIME-типом
    let blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    let url = URL.createObjectURL(blob);
    let link = document.createElement('a');
    
    link.href = url;
    link.download = `exo_v2_${i}.svg`;
    link.click();
    
    URL.revokeObjectURL(url);

    // Пауза 150мс для стабильности загрузки в браузере
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  
  alert("Векторный экспорт завершен! Теперь их можно кидать в Illustrator.");
}

function createSVGString(glyph) {
  let s = 7.5; // масштаб пикселя
  let size = GLIF_SIZE * s;
  
  let lines = [];
  
  // Добавляем полные заголовки, чтобы Illustrator не ругался на валидацию
  lines.push('<?xml version="1.0" encoding="utf-8"?>');
  lines.push('<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">');
  lines.push(`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="${size}px" height="${size}px" viewBox="0 0 ${size} ${size}" enable-background="new 0 0 ${size} ${size}" xml:space="preserve">`);
  
  // Прозрачный фон (без заливки)
  //lines.push(`<rect width="${size}" height="${size}" fill="none"/>`);
  
  // Рисуем черные квадраты (используем HEX #000000 для лучшей совместимости)
  lines.push('<g fill="#000000">');
  for (let r = 0; r < GLIF_SIZE; r++) {
    for (let c = 0; c < GLIF_SIZE; c++) {
      if (glyph[r][c] === 1) {
        lines.push(`<rect x="${c * s}" y="${r * s}" width="${s}" height="${s}"/>`);
      }
    }
  }
  lines.push('</g>');
  lines.push('</svg>');
  
  return lines.join('\n');
}

// ─── ЭКСПОРТ PNG (РАСТР) ────────────────────────────────
async function exportAllPNG() {
  if (favorites.length === 0) return;
  let exportScale = 90; 
  let finalSize = GLIF_SIZE * exportScale;
  for (let i = 0; i < favorites.length; i++) {
    let output = createGraphics(finalSize, finalSize);
    output.noStroke(); output.clear(); output.fill(0); 
    let glyph = favorites[i];
    for (let r = 0; r < GLIF_SIZE; r++) {
      for (let c = 0; c < GLIF_SIZE; c++) {
        if (glyph[r][c] === 1) output.rect(c*exportScale, r*exportScale, exportScale, exportScale);
      }
    }
    saveCanvas(output, `glyph_${i}`, 'png');
    output.remove();
    await new Promise(r => setTimeout(r, 200)); 
  }
  alert("PNG экспорт завершен!");
}
