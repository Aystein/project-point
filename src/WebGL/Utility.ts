/**
 * Calculates the default zoom factor by examining the bounds of the data set
 * and then dividing it by the height of the viewport.
 */
console.log('test')
/** export function getDefaultZoom(dataset: Dataset, width, height, xChannel: string, yChannel: string, workspace: IBaseProjection) {
    // Get rectangle that fits around data set
    let minX = 1000;
    let maxX = -1000;
    let minY = 1000;
    let maxY = -1000;
  
    const spatial = ADataset.getSpatialData(dataset, xChannel, yChannel, workspace);
  
    spatial.forEach((s) => {
      minX = Math.min(minX, s.x);
      maxX = Math.max(maxX, s.x);
      minY = Math.min(minY, s.y);
      maxY = Math.max(maxY, s.y);
    });
  
    const x = (maxX + minX) / 2;
    const y = (maxY + minY) / 2;
  
    // Get biggest scale
    const maxAbsX = Math.abs(maxX - x);
    const maxAbsY = Math.abs(maxY - y);
  
    const horizontal = width / maxAbsX;
    const vertical = height / maxAbsY;
  
    return { zoom: Math.min(horizontal / 2, vertical / 2), x, y };
  } */
