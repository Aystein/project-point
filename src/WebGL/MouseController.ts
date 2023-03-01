import { element } from "prop-types";
import { DOMElement } from "react";

const LEFT_BUTTON = 0;
const RIGHT_BUTTON = 2;

enum Mode {
  None,
  Pressed,
  Drag,
}

/**
 * Keeps track of the mouse state eg. press, click, move etc
 */
export class MouseController {
  pressed = new Array<boolean>(3).fill(false);

  pressedPosition = null;

  pressedButton = 0;

  mode: Mode = Mode.None;

  private mousePosition = { x: 0, y: 0 };

  onDragStart: (event: MouseEvent, button: number, initial) => void;

  onDragEnd: (event: MouseEvent, button: number) => void;

  onDragMove: (event: MouseEvent, button: number) => void;

  onContext: (event: MouseEvent, button: number) => void;

  onMouseUp: (event: MouseEvent) => void;

  onMouseMove: (event: MouseEvent) => void;

  onMouseLeave: (event: MouseEvent) => void;

  attachContext: {
    rootElement: HTMLElement,
    mouseDown,
    mouseLeave,
    mouseUp,
    mouseMove
  };

  constructor() {}

  get currentMousePosition() {
    return this.mousePosition;
  }

  attach(element: HTMLElement) {
    this.attachContext = {
        mouseDown: (event) => this.mouseDown(event),
        mouseUp: (event) => this.mouseUp(event),
        mouseMove: (event) => this.mouseMove(event),
        mouseLeave: (event) => this.mouseLeave(event),
        rootElement: element,
    }

    element.addEventListener('mousedown', this.attachContext.mouseDown)
    element.addEventListener('mouseup', this.attachContext.mouseUp)
    element.addEventListener('mousemove', this.attachContext.mouseMove)
    element.addEventListener('mousedown', this.attachContext.mouseLeave)
  }

  detach() {
    this.attachContext.rootElement.removeEventListener('mousedown', this.attachContext.mouseDown)
    this.attachContext.rootElement.removeEventListener('mousemove', this.attachContext.mouseMove)
    this.attachContext.rootElement.removeEventListener('mouseup', this.attachContext.mouseUp)
    this.attachContext.rootElement.removeEventListener('mouseleave', this.attachContext.mouseLeave)
  }

  mouseLeave(event: MouseEvent) {
    if (this.onMouseLeave) {
      this.onMouseLeave(event);
    }
  }

  mouseDown(event: MouseEvent) {
    switch (event.button) {
      case LEFT_BUTTON:
        this.pressed[LEFT_BUTTON] = true;
        this.pressedPosition = { x: event.offsetX, y: event.offsetY };
        this.pressedButton = LEFT_BUTTON;
        break;
      case RIGHT_BUTTON:
        this.pressed[RIGHT_BUTTON] = true;
        this.pressedPosition = { x: event.offsetX, y: event.offsetY };
        this.pressedButton = RIGHT_BUTTON;
        break;
      default:
        break;
    }

    this.mode = Mode.Pressed;
  }

  mouseUp(event: MouseEvent) {
    if (this.mode === Mode.Drag) {
      this.mode = Mode.None;
      if (this.onDragEnd) {
        this.onDragEnd(event, this.pressedButton);
      }
      return;
    }

    switch (event.button) {
      case LEFT_BUTTON:
        this.pressed[LEFT_BUTTON] = false;

        if (this.mode === Mode.Pressed) {
          if (this.onContext) {
            this.onContext(event, LEFT_BUTTON);
          }

          this.mode = Mode.None;
        }
        break;
      case RIGHT_BUTTON:
        this.pressed[RIGHT_BUTTON] = false;

        if (this.mode === Mode.Pressed) {
          if (this.onContext) {
            this.onContext(event, RIGHT_BUTTON);
          }

          this.mode = Mode.None;
        }
        break;
      default:
        break;
    }
  }

  mouseMove(event: MouseEvent) {
    const mousePosition = { x: event.offsetX, y: event.offsetY };
    this.mousePosition = mousePosition;

    if (this.mode === Mode.Drag) {
      if (this.onDragMove) {
        this.onDragMove(event, this.pressedButton);
      }
    } else if (this.onMouseMove) {
      this.onMouseMove(event);
    }

    if (this.mode === Mode.Pressed && this.pressedPosition && (Math.abs(this.pressedPosition.x - mousePosition.x) < 4 || Math.abs(this.pressedPosition.y - mousePosition.y) < 4)) {
      if (this.onDragStart) {
        this.onDragStart(event, this.pressedButton, this.pressedPosition);
        this.mode = Mode.Drag;
      }
    }
  }
}