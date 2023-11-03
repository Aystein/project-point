import { scaleLinear } from 'd3-scale';
import {
  AnnotationLabelContainer,
  LabelContainer,
} from '../../../Store/interfaces';
import { useVisContext } from '../../VisualizationContext';
import { IRectangle, Rectangle } from '../../Math/Rectangle';

export function XTick({ content, value }: { content: string; value: number }) {
  const x = `${(value * 100).toFixed(2)}%`;
  const y = 8;

  return (
    <>
      <text
        x={x}
        y={y}
        text-anchor="middle"
        pointerEvents="none"
        style={{ userSelect: 'none' }}
        alignmentBaseline="hanging"
        fontSize="12"
      >
        {content}
      </text>
      <line x1={x} y1={0} x2={x} y2={6} stroke="black" />
    </>
  );
}

export function YTick({ content, value }: { content: string; value: number }) {
  const y = `${(value * 100).toFixed(2)}%`;
  const x = 32;

  return (
    <>
      <text
        x={x}
        y={y}
        text-anchor="end"
        pointerEvents="none"
        style={{ userSelect: 'none' }}
        alignmentBaseline="middle"
        fontSize="12"
      >
        {content}
      </text>
      <line x1={34} y1={y} x2={40} y2={y} stroke="black" />
    </>
  );
}

export function LabelTick({
  content,
  value,
  axis,
}: {
  content: string;
  value: number;
  axis: 'x' | 'y' | 'absolute';
}) {
  switch (axis) {
    case 'x':
      return <XTick content={content} value={value} />;
    case 'y':
      return <YTick content={content} value={value} />;
  }
}

export function ScaleLabels({
  axis,
  domain,
}: {
  domain: number[];
  axis: 'x' | 'y' | 'absolute';
}) {
  const scale = scaleLinear().domain(domain).range([0, 1]);
  const ticks = scale.ticks();

  const getStyle = () => {
    switch (axis) {
      case 'x': {
        return {
          position: 'absolute',
          top: 'calc(100% + 3px)',
          width: '100%',
          height: 40,
          pointerEvents: 'none',
        };
      }
      case 'y': {
        return {
          position: 'absolute',
          right: 'calc(100% + 3px)',
          height: '100%',
          width: 40,
          pointerEvents: 'none',
        };
      }
    }
  };

  return (
    <>
      <svg style={getStyle()}>
        {ticks.map((tick) => {
          return (
            <LabelTick
              key={tick}
              value={scale(tick)}
              content={tick.toString()}
              axis={axis}
            />
          );
        })}
      </svg>
    </>
  );
}

function SemanticLabels({
  container,
  area,
}: {
  container: AnnotationLabelContainer;
  area: Rectangle;
}) {
  const { scaledXDomain, scaledYDomain } = useVisContext();

  return container.labels.map((label) => {
    return (
      <div
        key={label.content}
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          left: `${(label.position.x * 100).toFixed(2)}%`,
          top: `${(label.position.y * 100).toFixed(2)}%`,
          width: `${(label.position.width * 100).toFixed(2)}%`,
          height: `${(label.position.height * 100).toFixed(2)}%`,
          textAnchor: 'middle',
          fontSize: 16,
          fontWeight: 500,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: 4,
        }}
      >
        {label.content}
      </div>
    );
  });
}

export function LabelsOverlay({
  labels,
  area,
}: {
  labels: LabelContainer[];
  area: IRectangle;
}) {
  if (!labels) return <></>;

  return (
    <>
      {labels.map((container) => {
        if (container.discriminator === 'positionedlabels') {
          return container.labels.map((label) => {
            return (
              <LabelTick
                key={label.position}
                content={label.content}
                value={label.position}
                axis={container.type}
              />
            );
          });
        }

        if (container.discriminator === 'scalelabels') {
          return (
            <ScaleLabels
              key={container.type}
              domain={container.labels.domain}
              axis={container.type}
            />
          );
        }

        if (container.discriminator === 'annotations') {
          return (
            <SemanticLabels
              key={container.type}
              area={Rectangle.deserialize(area)}
              container={container}
            />
          );
        }
      })}
    </>
  );
}
