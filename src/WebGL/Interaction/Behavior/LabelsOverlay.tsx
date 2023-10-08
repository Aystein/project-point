import { scaleLinear } from 'd3-scale';
import {
  AnnotationLabelContainer,
  LabelContainer,
} from '../../../Store/interfaces';
import { useVisContext } from '../../VisualizationContext';
import { IRectangle, Rectangle } from '../../Math/Rectangle';

export function LabelTick({
  content,
  value,
  axis,
}: {
  content: string;
  value: number;
  axis: 'x' | 'y' | 'absolute';
}) {
  return (
    <div
      style={{
        position: 'absolute',
        transform: `translate(${axis === 'y' ? 'calc(-100% - 8px)' : '-50%'}, ${
          axis === 'x' ? 'calc(100% + 8px)' : '50%'
        })`,
        transformOrigin: 'right',
        pointerEvents: 'none',
        [axis === 'x' ? 'left' : 'bottom']: `${(value * 100).toFixed(2)}%`,
        [axis === 'x' ? 'bottom' : 'left']: 0,
        fontSize: 14,
        lineHeight: 1,
      }}
    >
      {content}
    </div>
  );
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

  return (
    <>
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
