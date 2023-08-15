This project is the work in progress for the practical part of my masters thesis.

The engine code is based on https://github.com/piellardj/water-webgpu.


## Loading a dataset
<img width="275" alt="image" src="https://github.com/Aystein/project-point/assets/9071970/231d7902-a07d-4849-8642-3e8fbdff098e">


The data format is **CSV**. Use the file picker to select a csv file from your computer. After selecting the parsing begins. You can press the save button to store a direct copy of the csv file inside the browser file system. This is handy if you want to use a dataset multiple times.


## Settings
<img width="220" alt="image" src="https://github.com/Aystein/project-point/assets/9071970/d78f11a6-be90-48dc-b5e9-6bf978cd8b47">

The GPU simulation uses euler integration. The basic principle is that for each frame, a number of physic iterations are computed. A single iteration uses the time delta specified in the time settings. During one frame the specified number of substeps will happen.

The radius scaling is a normalized scaling factor between 0 and 1 that determines the actual point radius used in the GPU computation. This is handy when the points are too close together to see a correlation.




## Short explanations of the available tools

### Spaghetti layout
1. Click an axis
2. Select spaghetti as layout
3. Select a column
4. The selected axis will be the primary axis where the unique line attributes will be shown and the other axis is the time axis

<img width="990" alt="image" src="https://github.com/Aystein/project-point/assets/9071970/687cc0cf-b9c1-4cbf-a130-a3c84b77e1a6">



### UMAP layout
1. Either click an axis or the UMAP symbol on the top (this determines if UMAP will be 1 dimensional or 2 dimensional)
2. Select UMAP as layout
3. Select a set of features you want to project

<img width="616" alt="image" src="https://github.com/Aystein/project-point/assets/9071970/dda2968a-368f-4b88-a74a-ecc514e2fe56">



## Group layout
1. Click an axis
2. Select group by as layout
3. Select a column
4. The points are grouped along the axis



<img width="547" alt="image" src="https://github.com/Aystein/project-point/assets/9071970/468089b3-7c47-4e59-bc34-089598212b8f">
