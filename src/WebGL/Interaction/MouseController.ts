import { DragEvent as GDragEvent } from './Commands';

const LEFT_BUTTON = 0;
const RIGHT_BUTTON = 2;

enum Mode {
  None,
  Pressed,
  Drag,
}

export interface NormalizedMouseEvent {
  x: number
  y: number

  movementX: number
  movementY: number
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

  private prevX = 0;

  private prevY = 0;

  onDragStart: (event: GDragEvent, button: number, initial) => void;

  onDragEnd: (event: MouseEvent, button: number) => void;

  onDragMove: (event: GDragEvent, button: number) => void;

  onContext: (event: MouseEvent, button: number) => void;

  onMouseUp: (event: MouseEvent) => void;

  onMouseMove: (event: NormalizedMouseEvent) => void;

  onMouseLeave: (event: MouseEvent) => void;

  onMouseWheel: (event: MouseEvent) => void;

  onMouseDown: (event: MouseEvent) => boolean;

  mouseLeave(event: MouseEvent) {
    if (this.onMouseLeave) {
      this.onMouseLeave(event);
    }
  }

  mouseDown(event: MouseEvent) {
    event.preventDefault();

    let eat = false;
    if (this.onMouseDown) {
      eat = this.onMouseDown(event);
    }

    if (!eat) {
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
  }

  mouseUp(event: MouseEvent) {
    event.preventDefault();

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

  mouseWheel(event: MouseEvent) {
    if (this.onMouseWheel) {
      this.onMouseWheel(event);
    }
  }

  mouseMove(root: HTMLElement, event: MouseEvent) {
    const rect = root.getBoundingClientRect()

    const mousePosition = { x: event.x - rect.x, y: event.y - rect.y };
    this.mousePosition = mousePosition;

    if (this.mode === Mode.Drag) {
      if (this.onDragMove) {
        this.onDragMove(
          {
            movementX: event.screenX - this.prevX,
            movementY: event.screenY - this.prevY,
            offsetX: mousePosition.x,
            offsetY: mousePosition.y,
            button: this.pressedButton,
          },
          this.pressedButton
        );
      }
    } else if (this.onMouseMove) {
      this.onMouseMove({
        x: this.mousePosition.x,
        y: this.mousePosition.y,
        movementX: event.screenX - this.prevX,
        movementY: event.screenY - this.prevY,
      });
    }

    if (
      this.mode === Mode.Pressed &&
      this.pressedPosition &&
      (Math.abs(this.pressedPosition.x - mousePosition.x) < 4 ||
        Math.abs(this.pressedPosition.y - mousePosition.y) < 4)
    ) {
      if (this.onDragStart) {
        this.onDragStart(
          {
            movementX: 0,
            movementY: 0,
            offsetX: mousePosition.x,
            offsetY: mousePosition.y,
            button: this.pressedButton,
          },
          this.pressedButton,
          this.pressedPosition
        );
        this.mode = Mode.Drag;
      }
    }

    this.prevX = event.screenX;
    this.prevY = event.screenY;
  }
}
