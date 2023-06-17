export function defaultAlphaBlend(): GPUBlendState {
  return {
    color: {
      srcFactor: 'src-alpha',
      dstFactor: 'one-minus-src-alpha',
      operation: 'add',
    },
    alpha: {
      srcFactor: 'one',
      dstFactor: 'one',
      operation: 'add',
    },
  };
}
