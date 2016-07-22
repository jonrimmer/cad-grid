(function () {
    function rgba_big_endian(r, g, b, a) {
        return (r << 24) | (g << 16) | (r << 8) | a;
    }
    function rgba_little_endian(r, g, b, a) {
        return (a << 24) | (b << 16) | (g << 8) | r;
    }
    var offsetX = 0;
    var offsetY = 0;
    var scale = 1;
    var gridX = 10;
    var gridY = 10;
    var canvas = document.getElementById('c');
    var size = canvas.getBoundingClientRect();
    var width = size.width;
    var height = size.height;
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    var imageData = ctx.getImageData(0, 0, size.width, size.height);
    var data = imageData.data;
    var data32 = new Uint32Array(data.buffer);
    // Determine whether Uint32 is little- or big-endian.
    data[1] = 0x0a0b0c0d;
    var isLittleEndian = true;
    if (data[4] === 0x0a && data[5] === 0x0b && data[6] === 0x0c &&
        data[7] === 0x0d) {
        isLittleEndian = false;
    }
    var rgba = isLittleEndian ? rgba_little_endian : rgba_big_endian;
    var black = rgba(0, 0, 0, 255);
    var white = rgba(255, 255, 255, 255);
    var screenXtoDomain = function (x) { return ((offsetX + (x / scale)) + 0.5) | 0; };
    var screenYtoDomain = function (y) { return ((offsetY + (y / scale)) + 0.5) | 0; };
    var domainXtoScreen = function (x) { return (((x - offsetX) * scale) + 0.5) | 0; };
    var domainYtoScreen = function (y) { return (((y - offsetY) * scale) + 0.5) | 0; };
    function drawGrid() {
        data32.fill(black, 0, data32.length);
        // Draw vertical grid lines
        var gx = screenXtoDomain(0);
        gx = Math.ceil(gx / gridX) * gridX;
        var x = domainXtoScreen(gx);
        while (x < width) {
            for (var y_1 = 0, i = x; y_1 < height; y_1++, i += width) {
                data32[i] = white;
            }
            var nx = x;
            while (nx == x) {
                gx += gridX;
                nx = domainXtoScreen(gx);
            }
            x = nx;
        }
        // Draw horizontal grid lines
        var gy = screenYtoDomain(0);
        gy = Math.ceil(gy / gridY) * gridY;
        var y = domainYtoScreen(gy);
        while (y < height) {
            var o = y * width;
            data32.fill(white, o, o + width);
            var ny = y;
            while (ny == y) {
                gy += gridY;
                ny = domainYtoScreen(gy);
            }
            y = ny;
        }
        ctx.putImageData(imageData, 0, 0);
    }
    drawGrid();
    canvas.addEventListener('wheel', function (ev) {
        if (ev.deltaY < 0) {
            scale *= 1.1;
        }
        else {
            scale *= 0.9;
        }
        drawGrid();
    });
})();
