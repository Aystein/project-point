/* eslint-disable no-restricted-globals */
self.onmessage = () => {
  self.postMessage({ type: 'finish' })
}
