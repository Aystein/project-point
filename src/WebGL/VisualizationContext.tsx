import { useElementSize } from '@mantine/hooks'
import * as React from 'react'
import { createContext, useContext } from 'react'
import { WebGLRenderer } from 'three'
import {
  MOUSE_LEAVE,
  MOUSE_MOVE,
  MOUSE_DRAG,
  MOUSE_DRAGGING,
  MOUSE_UP,
  MOUSE_HOVER,
  MOUSE_WHEEL,
  MOUSE_DRAG_END,
} from './Commands'
import { MouseController } from './MouseController'
import { Visualization } from './Visualization'
import { scaleLinear, ScaleLinear } from 'd3-scale'
import { ZoomTransform } from './ZoomTransform'

export const VisContext = createContext<{
  vis: Visualization
  ref
  requestFrame: () => void
  registerRenderFunction: (value) => void
  xDomain: number[]
  yDomain: number[]
  width: number
  height: number
  zoom: { tx: number; ty: number; s: number }
  setZoom: (
    zoom: React.SetStateAction<{ tx: number; ty: number; s: number }>
  ) => void
  scaledXDomain: ScaleLinear<number, number>
  scaledYDomain: ScaleLinear<number, number>
}>(null)

export const VisProvider = ({ children }) => {
  const [dimensions, setDimensions] = React.useState({
    width: 600,
    height: 400,
  })

  const [zoom, setZoom] = React.useState({
    tx: 0,
    ty: 0,
    s: 1,
  })

  const { ref, width, height } = useElementSize()
  const [renderer, setRenderer] = React.useState<WebGLRenderer>()

  const [renderFunctions, setRenderFunctions] = React.useState([])

  const [xDomain, setXDomain] = React.useState([-2, 2])

  const yDomain = React.useMemo(() => {
    const halfExtent = ((xDomain[1] - xDomain[0]) * (height / width)) / 2
    const centerY = 0

    return [centerY - halfExtent, centerY + halfExtent]
  }, [xDomain, width, height])

  const scaledXDomain = React.useMemo(() => {
    const xScale = scaleLinear().domain(xDomain).range([0, width])

    const zoomTransform = new ZoomTransform(zoom.s, zoom.tx, zoom.ty)
    const newX = zoomTransform.rescaleX(xScale)

    return newX
  }, [xDomain, zoom, width])

  const scaledYDomain = React.useMemo(() => {
    const yScale = scaleLinear().domain(yDomain).range([0, height])

    const zoomTransform = new ZoomTransform(zoom.s, zoom.tx, zoom.ty)
    const newY = zoomTransform.rescaleY(yScale)

    return newY
  }, [yDomain, zoom, height])

  renderer?.setSize(width, height, false)

  const dirtyRef = React.useRef(false)

  const frame = () => {
    dirtyRef.current = false

    renderFunctions.forEach((func) => {
      func(renderer)
    })
  }

  const frameRef = React.useRef(frame)
  frameRef.current = frame

  const requestFrame = React.useCallback(() => {
    if (!dirtyRef.current) {
      requestAnimationFrame(() => frameRef.current())

      dirtyRef.current = true
    }
  }, [])

  React.useEffect(() => {
    requestFrame()
  }, [width, height])

  const registerRenderFunction = (value) => {
    setRenderFunctions([...renderFunctions, value])
  }

  React.useEffect(() => {
    const value = new WebGLRenderer({ canvas: ref.current })
    value.setPixelRatio(window.devicePixelRatio)
    value.setClearColor('#ffffff')

    setRenderer(value)
  }, [ref])

  const visContext = React.useMemo(() => {
    return new Visualization()
  }, [])

  React.useEffect(() => {
    const controller = new MouseController()

    controller.onMouseLeave = (event) =>
      visContext.dispatchCommand(MOUSE_LEAVE, event)

    controller.onMouseMove = (event) => {
      visContext.dispatchCommand(MOUSE_HOVER, event)
    }
    controller.onMouseUp = (event) =>
      visContext.dispatchCommand(MOUSE_UP, event)

    controller.onDragStart = (event) => {
      visContext.dispatchCommand(MOUSE_DRAG, event)
    }
    controller.onDragMove = (event) => {
      visContext.dispatchCommand(MOUSE_DRAGGING, event)
    }
    controller.onDragEnd = (event) => {
      visContext.dispatchCommand(MOUSE_DRAG_END, event)
    }

    controller.onMouseWheel = (event) => {
      visContext.dispatchCommand(MOUSE_WHEEL, event)
    }

    controller.attach(ref.current)

    return () => {
      if (ref.current) {
        controller.detach()
      }
    }
  }, [visContext, ref])

  return (
    <VisContext.Provider
      value={{
        width,
        height,
        requestFrame,
        registerRenderFunction,
        xDomain: xDomain,
        yDomain: [0, 50],
        ref,
        vis: visContext,
        zoom,
        setZoom,
        scaledXDomain,
        scaledYDomain,
      }}
    >
      <canvas
        onContextMenu={(event) => {
          event.preventDefault()
        }}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        width={dimensions.width}
        height={dimensions.height}
        ref={ref}
      ></canvas>

      {children}
    </VisContext.Provider>
  )
}

export function useVisContext() {
  const visContext = useContext(VisContext)

  if (visContext == null) {
    console.error('VisContext.useVisContext: cannot find a VisContext')
  }

  return visContext
}
