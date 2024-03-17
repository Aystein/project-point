const RESOLUTION = 1024;
const STROKE_RADIUS = 32;

const GRID = RESOLUTION / 4;

const OFF = RESOLUTION / 48;

export async function createDefaultTexture() {
    const canvas = new OffscreenCanvas(RESOLUTION, RESOLUTION * 2);
    const ctx = canvas.getContext("2d");

    // clear
    ctx.fillStyle = "rgba(255, 255, 255, 0)"
    ctx.fillRect(0, 0, RESOLUTION, RESOLUTION);
    
    // basic circle
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(GRID, GRID, GRID - OFF, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(125, 125, 125, 1)";
    ctx.lineWidth = OFF * 2;
    ctx.stroke();

    // Other shape
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(GRID * 3, GRID, GRID - OFF, 0, Math.PI * 2);
    ctx.setLineDash([100, 70]);
    ctx.fill();
    ctx.strokeStyle = "rgba(125, 125, 125, 1)";
    ctx.lineWidth = OFF * 2;
    ctx.stroke()
    ctx.closePath();
    
    ctx.beginPath();
    // ctx.strokeStyle = 'black';
    ctx.lineWidth = OFF;
    ctx.setLineDash([0, 0]);
    // ctx.reset();
    ctx.moveTo(GRID * 3 - GRID / 2, GRID - GRID / 2);
    ctx.lineTo(GRID * 3 + GRID / 2, GRID + GRID / 2);
    ctx.closePath();
    ctx.stroke();
    
    
    ctx.strokeStyle = "rgba(125, 125, 125, 1)";
    

    // Hover circle
    ctx.setLineDash([0, 0]);
    ctx.lineWidth = STROKE_RADIUS;
    ctx.strokeStyle = "black";
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(GRID, GRID * 3, GRID - STROKE_RADIUS / 2 - OFF, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Other shape
    ctx.lineWidth = STROKE_RADIUS;
    ctx.strokeStyle = "black";
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(GRID * 3, GRID * 3, GRID - STROKE_RADIUS / 2 - OFF, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();


    // Focus + Context circle
    ctx.lineWidth = STROKE_RADIUS;
    ctx.strokeStyle = "black";
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(GRID, GRID * 3, GRID - STROKE_RADIUS / 2 - OFF, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();


    const bitmap = await createImageBitmap(await canvas.convertToBlob());

    return bitmap;
}