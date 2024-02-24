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
    

    // Hover circle
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