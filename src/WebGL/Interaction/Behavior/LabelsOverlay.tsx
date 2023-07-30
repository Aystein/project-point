import { scaleLinear } from 'd3-scale';
import { LabelContainer } from '../../../Store/ModelSlice';

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
        transform: `translate(${axis === 'y' ? 'calc(-100% - 8px)' : '-50%'}, ${axis === 'x' ? 'calc(100% + 8px)' : '50%'})`,
        transformOrigin: 'right',
        pointerEvents: 'none',
        [axis === 'x' ? 'left' : 'bottom']: `${Math.round(value * 100)}%`,
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
            value={scale(tick)}
            content={tick.toString()}
            axis={axis}
          />
        );
      })}
    </>
  );
}

export function LabelsOverlay({ labels }: { labels: LabelContainer[] }) {
  if (!labels) return <></>;

  return (
    <>
      {labels.map((container) => {
        if (container.discriminator === 'positionedlabels') {
          return container.labels.map((label) => {
            return (
              <LabelTick
                content={label.content}
                value={label.position}
                axis={container.type}
              />
            );
          });
        }

        if (container.discriminator === 'scalelabels') {
          return <ScaleLabels
            domain={container.labels.domain}
            axis={container.type}
          />;
        }
      })}
    </>
  );
}
