export function UpdateText(self: Window, value: string) {
  self.postMessage({
    type: 'message',
    message: 'Calculating embedding ...',
  });
}
