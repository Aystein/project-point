import { useEffect, useState } from 'react'
import { SpatialModel } from '../../Store/ModelSlice'
import { scaleLinear } from 'd3-scale'
import { useVisContext } from '../VisualizationContext'
import * as d3 from 'd3-quadtree'
import * as React from 'react'
import { useMouseDrag } from '../Behavior/LassoBehavior'
import { MOUSE_HOVER } from '../Commands'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScatterTrace } from '../Math/ScatterTrace'

type ColumnTemp = {
  values: number[]
  domain: number[]
}

interface GlobalConfig {
  pointSize: number
}

export function Scatterplot({
  x,
  x2,
  y,
  model,
  color,
  size,
  opacity,
  globalConfig = { pointSize: 16 },
}: {
  x: string | ColumnTemp
  x2: string | ColumnTemp
  y: string | ColumnTemp
  model: SpatialModel
  color?:  string | string[]
  size?: number[]
  opacity?: number[]
  globalConfig?: GlobalConfig
}) {
  const [myRenderer, setRenderer] = useState<ScatterTrace>()

  const [tree, setTree] = React.useState()
  const [hover, setHover] = React.useState(0)

  const getTimestamp = () => {
    return Date.now() / 1000
  }

  const [timestamp, setTimestamp] = React.useState(0)

  console.log("test");

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

  const render = (renderer: THREE.WebGLRenderer) => {
    if (!myRenderer) {
      return
    }

    myRenderer.render(renderer, 0, 0)
  }

  const renderRef = React.useRef(render)
  renderRef.current = render

  useEffect(() => {
    myRenderer?.setColor(color);
  }, [color, myRenderer]);

  useEffect(() => {
    registerRenderFunction((renderer) => {
      renderRef.current(renderer)
    })
    setTimeout(() => requestFrame(), 500)
  }, [])

  useEffect(() => {
    if (!myRenderer) return

    myRenderer.updateBounds(
      scaledXDomain.domain(),
      scaledYDomain.domain(),
      zoom,
      width,
      height,
      model.bounds
    )
    // 600 / 10 -> 60
    requestFrame()
  }, [scaledXDomain, scaledYDomain, myRenderer, zoom, timestamp, width, height])

  useMouseDrag(
    MOUSE_HOVER,
    (event) => {
      if (!tree) return false

      //const scaleX = scaleLinear().domain(scaledXDomain).range([0, width])
      //const scaleY = scaleLinear().domain(scaledYDomain).range([0, height])

      // const hit = tree.find(scaleX.invert(event.layerX), scaleY.invert(event.layerY))

      // setHover(hit.index);

      // myRenderer.setHover(hit.index);

      requestFrame()

      return true
    },
    [tree, scaledXDomain, scaledYDomain]
  )

  useEffect(() => {
    if (!model) return

    //setTree(d3.quadtree()
    //  .x((d) => d[xKey])
    //  .y((d) => d[yKey])
    //  .addAll(model.spatial.map((e, i) => ({ ...e, index: i }))));

    const rend = new ScatterTrace();

    rend.initialize({
      x: model.spatial.map((entry) => entry.x),
      y: model.spatial.map((entry) => entry.y),
      bounds: model.bounds,
    })

    setRenderer(rend);

    requestFrame()
  }, [setRenderer, ref, model])

  return null
}
