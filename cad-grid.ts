(function() {
  function rgba_big_endian(r, g, b , a) {
    return (r << 24) | (g << 16) | (r << 8) | a; 
  }

  function rgba_little_endian(r, g, b, a) {
    return (a << 24) | (b << 16) | (g << 8) | r;
  }

  let offsetX = 0;
  let offsetY = 0;
  let scale = 1;
  let gridX = 10;
  let gridY = 10;

  const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('c');
  const size = canvas.getBoundingClientRect();
  let width = size.width;
  let height = size.height;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');


  const imageData = ctx.getImageData(0, 0, size.width, size.height);
  const data = imageData.data;
  const data32 = new Uint32Array(data.buffer);

  // Determine whether Uint32 is little- or big-endian.
  data[1] = 0x0a0b0c0d;

  let isLittleEndian = true;

  if (data[4] === 0x0a && data[5] === 0x0b && data[6] === 0x0c &&
      data[7] === 0x0d) {
      isLittleEndian = false;
  }

  const rgba = isLittleEndian ? rgba_little_endian : rgba_big_endian;

  let black = rgba(0, 0, 0, 255);
  let white = rgba(255, 255, 255, 255);


  const screenXtoDomain = x => ((offsetX + (x / scale)) + 0.5) | 0;
  const screenYtoDomain = y => ((offsetY + (y / scale)) + 0.5) | 0;
  const domainXtoScreen = x => (((x - offsetX) * scale) + 0.5) | 0;
  const domainYtoScreen = y => (((y - offsetY) * scale) + 0.5) | 0;

  function drawGrid() {
    data32.fill(black, 0, data32.length);

    // Draw vertical grid lines

    let gx = screenXtoDomain(0);

    gx = Math.ceil(gx / gridX) * gridX;

    let x = domainXtoScreen(gx);

    while (x < width) {
      for (let y = 0, i = x; y < height; y++, i += width) {
        data32[i] = white;
      }

      let nx = x;
      while (nx == x) {
        gx += gridX;
        nx = domainXtoScreen(gx);
      }

      x = nx;
    }

    // Draw horizontal grid lines

    let gy = screenYtoDomain(0);

    gy = Math.ceil(gy / gridY) * gridY;

    let y = domainYtoScreen(gy);

    while (y < height) {
      let o = y * width;
      data32.fill(white, o, o + width);
      
      let ny = y;
      while (ny == y) {
        gy += gridY;
        ny = domainYtoScreen(gy);
      }
      y = ny;
    }

    ctx.putImageData(imageData, 0, 0);
  }

  drawGrid();

  canvas.addEventListener('wheel', (ev: WheelEvent) => {
    if (ev.deltaY < 0) {
      scale *= 1.1;
    }
    else {
      scale *= 0.9;
    }

    drawGrid();
  });
})();