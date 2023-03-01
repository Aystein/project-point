import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Button } from './Button';
import { Scatterplot } from '../WebGL/Scatterplot';
import { LassoSelectionPlugin } from '../WebGL/Plugins/LassoSelectionPlugin';
import { VisProvider } from "../WebGL/VisualizationContext";

const model = {
  oid: "spatial",
  id: 'test',
  spatial: [{x: 5, y: 5}, {x: 7, y: 7}, {x: 2, y: 8}, {x: 8, y: 2}],
  bounds: {
    minX: 0,
    maxX: 10,
    minY: 0,
    maxY: 10,
  },
}

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/WebGL',
  component: Scatterplot,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    model,
    xKey: 'x',
    yKey: 'y',
    color: ['#ff0000', '#00ff00'],
    size: [1, 2],
    opacity: [0.5, 1]
  },
} as ComponentMeta<typeof Scatterplot>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Scatterplot> = (args) => <div style={{
  width: 600,
  height: 400,
  resize: 'both',
  padding: 20,
  overflow: 'auto',
}}><VisProvider><Scatterplot {...args} /><LassoSelectionPlugin /></VisProvider></div>;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  model,
  xKey: 'x',
  yKey: 'y',
  color: ['#ff0000', '#00ff00', '#ffffff', 'ffffff'],
  size: [3, 3, 3, 4],
  opacity: [1, 0.5, 0.25, 0.8]
};
