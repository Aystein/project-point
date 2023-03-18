import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Scatterplot } from '../WebGL/Scatter/Scatterplot';
import { VisProvider } from "../WebGL/VisualizationContext";
import { ZoomBehavior } from '../WebGL/Behavior/ZoomBehavior';
import { PanBehavior } from '../WebGL/Behavior/PanBehavior';

const model = {
  oid: "spatial",
  id: 'test',
  spatial: [],
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
} as ComponentMeta<typeof Scatterplot>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Scatterplot> = (args) => <div style={{
  width: 600,
  height: 400,
  resize: 'both',
  padding: 20,
  overflow: 'auto',
}}>
  <VisProvider>
    <Scatterplot {...args} />
    <ZoomBehavior />
    <PanBehavior />
  </VisProvider>

  <button>Interpolate</button>
</div>;


const x = Array.from({ length: 100000 }, () => {
  return Math.random() * 10;
})

const x2 = Array.from({ length: 100000 }, () => {
  return 0;
})

const y = Array.from({ length: 100000 }, () => {
  return Math.random() * 10;
})

export const Primary = () => {
  const [args, setArgs] = React.useState({
    model,
    x,
    x2,
    interpolate: { channel: 'x2', duration: 2 },
    y
  })
  
  // Sets the hooks for both the label and primary props
  const [value, setValue] = React.useState('Secondary');
  const [isPrimary, setIsPrimary] = React.useState(false);

  // Sets a click handler to change the label's value
  const handleClick = () => {
    if (args.interpolate.channel === 'x2') {
      setArgs({
        ...args,
        interpolate: { channel: 'x', duration: 2 }
      })
    } else {
      setArgs({
        ...args,
        interpolate: { channel: 'x2', duration: 2 }
      })
    }
  };
  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start'
  }}>
    <div style={{width:400, height: 300}}>
    <VisProvider>

  <ZoomBehavior />
  <PanBehavior />
</VisProvider></div>

  <button onClick={handleClick}>Interpolate</button>

</div>
};


export const Test = () => {
  return <div>test</div>
}

