precision mediump float;

uniform sampler2D atlas;

uniform float spritesPerRow;
uniform float spritesPerColumn;

varying vec4 vColor;
varying float vType;
varying float vShow;
varying float vSelected;

void main() {
    gl_FragColor = vColor;

    //if (vShow <= 0.1) {
    //  discard;
    //}
    
    float xs = 1.0 / spritesPerRow;
    float xy = 1.0 / spritesPerColumn;

    float r = float(int(vType) / int(spritesPerRow)) * xy;
    float c = mod(vType, spritesPerRow) * xs;
    
    // gl_FragColor = gl_FragColor * texture2D(atlas, gl_PointCoord);
    gl_FragColor = gl_FragColor * texture2D(atlas, gl_PointCoord * vec2(xs, xy) + vec2(c, r));

    //if (vSelected > 0.5) {
    //vec4 border = texture2D(atlas, vec2(vType * 0.25, 0.5) + gl_PointCoord * 0.25);
    //gl_FragColor = mix(gl_FragColor, border, border.a);
    //}

}