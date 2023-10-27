const RESOLUTION = 512;

export async function createDefaultTexture() {
    const canvas = new OffscreenCanvas(RESOLUTION, RESOLUTION);
    const ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.fillStyle = "rgba(255, 255, 255, 0)"
    ctx.fillRect(0, 0, RESOLUTION, RESOLUTION);
    
    ctx.strokeStyle = "black";
    ctx.lineWidth = 32;
    ctx.fillStyle = "white";
    ctx.moveTo(RESOLUTION / 4, RESOLUTION / 4);
    ctx.arc(RESOLUTION / 4, RESOLUTION / 4, RESOLUTION / 4 - 4, 0, Math.PI * 2);
    ctx.fill();
    //ctx.stroke();

    const bitmap = await createImageBitmap(await canvas.convertToBlob());

    return bitmap;
}