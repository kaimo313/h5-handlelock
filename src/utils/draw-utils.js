// 获取canvas 的坐标：canvas 显示大小缩放为实际大小的 50%。为了让图形在 Retina 屏上清晰
export function getCanvasPoint(canvas, x, y) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: 2 * (x - rect.left),
        y: 2 * (y - rect.top)
    };
}
// 计算连点之间的距离
export function distance(p1, p2) {
    let x = p2.x - p1.x,
        y = p2.y - p1.y;
    return Math.sqrt(x * x + y * y);
}

// 画实心圆
export function drawSolidCircle(ctx, color, x, y, r) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

// 画空心圆
export function drawHollowCircle(ctx, color, x, y, r) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.stroke();
}

// 画线段
export function drawLine(ctx, color, x1, y1, x2, y2) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}
