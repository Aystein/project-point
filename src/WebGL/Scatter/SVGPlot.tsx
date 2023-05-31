import { SpatialModel } from '../../Store/ModelSlice'
import { useVisContext } from '../VisualizationContext'

type ColumnTemp = {
  values: number[]
  domain: number[]
}

interface GlobalConfig {
  pointSize: number
}

export function SVGPlot({
  n,
  x,
  x2,
  y,
  model,
  globalConfig = { pointSize: 16 },
  hover,
}: {
  n: number
  x: number[]
  x2: string | ColumnTemp
  y: number[]
  model: SpatialModel
  globalConfig?: GlobalConfig
  hover: number
}) {
  const {
    ref,
    width,
    height,
    registerRenderFunction,
    requestFrame,
    scaledXDomain,
    scaledYDomain,
    zoom,
  } = useVisContext()

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <svg viewBox={`${scaledXDomain.domain()[0]} ${scaledYDomain.domain()[0]} ${scaledXDomain.domain()[1] - scaledXDomain.domain()[0]} ${scaledYDomain.domain()[1] - scaledYDomain.domain()[0]}`} style={{
        width: '100%',
        height: '100%'
      }}>
        {
          x?.map((_, i) => {
            return <circle key={i} cx={x[i]} cy={y[i]} r="0.002" />
          })
        }
      </svg>
    </div>
  )
}
