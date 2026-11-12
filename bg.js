// Background: soft arch of light with film grain (from the personal brand site), drawn once
(() => {
  const canvas = document.getElementById('bg');
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: true });
  if (!gl) { canvas.remove(); return; }
  document.documentElement.classList.add('has-gl');

    const vert = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';

  const frag = `
    precision highp float;
    uniform vec2 res;
    uniform vec2 mouse;
    uniform vec3 base, bandA, bandB;
    uniform float grain;
    uniform float scroll;

    float hash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      p3 = fract((p3.x + p3.y) * p3.z + p3 * 17.13);
      p3 += dot(p3, p3.zyx + 19.19);
      return fract((p3.x + p3.y) * p3.z);
    }

    // asymmetric arch; scroll slowly slides the crest across
    float arch(float x) {
      float k = x + 0.08 - mouse.x * 0.14 - scroll * 0.35;
      float lean = clamp(mouse.x * 0.5 + 0.5, 0.0, 1.0);
      float w = mix(mix(0.24, 0.36, lean), mix(0.10, 0.05, lean), smoothstep(-0.2, 0.2, k));
      float e = exp(-k * k / w);
      float floorY = mix(-0.75, -0.2 - mouse.y * 0.08, smoothstep(-0.1, 0.5, k));
      return mix(floorY, 0.24 - scroll * 0.12 + mouse.y * 0.07, e);
    }

    float curveDist(vec2 p) {
      float best = 1e9, bx = p.x;
      for (int i = 0; i < 40; i++) {
        float x = p.x - 0.8 + float(i) * 0.04;
        vec2 c = vec2(x, arch(x)) - p;
        float dd = dot(c, c);
        if (dd < best) { best = dd; bx = x; }
      }
      for (int i = 0; i < 20; i++) {
        float x = bx - 0.04 + float(i) * 0.004;
        vec2 c = vec2(x, arch(x)) - p;
        best = min(best, dot(c, c));
      }
      return sqrt(best);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / res;
      float asp = res.x / res.y;
      vec2 p = vec2((uv.x - 0.5) * asp, uv.y - 0.5);
      p *= clamp(1.0 / asp, 1.0, 2.2);

      float y = arch(p.x);
      float d = p.y > y ? curveDist(p) : p.y - y;

      float spread = mix(0.24, 0.12, smoothstep(-0.8, 0.6, p.x)) * (1.0 + mouse.y * 0.18);
      float above = exp(-pow(d / 0.035, 2.0));
      float below = exp(-pow(-d / spread, 1.3));
      float g = d > 0.0 ? above : below;
      g *= mix(0.6, 0.85, smoothstep(-1.0, -0.3, p.x)) * mix(1.0, 0.55, smoothstep(0.1, 0.9, p.x));

      vec2 q = p - vec2(0.8 - mouse.x * 0.15, -0.3 + mouse.y * 0.1);
      float wash = exp(-dot(q, q) / 0.14) * 0.5;

      vec3 band = mix(bandA, bandB, smoothstep(-0.25 - mouse.x * 0.3, 0.65 - mouse.x * 0.3, p.x));
      vec3 col = mix(base, band, clamp(g, 0.0, 1.0));
      col = mix(col, bandB, wash * (1.0 - g));

      vec2 c = vec2((uv.x - 0.5) * asp, uv.y - 0.5);
      float v = smoothstep(1.25, 0.35, length(c));
      col = mix(base, col, 0.75 + 0.25 * v);

      vec2 gp = gl_FragCoord.xy;
      float n = hash(gp) - 0.5;
      vec3 cn = vec3(hash(gp + 3.1), hash(gp + 7.7), hash(gp + 11.3)) - 0.5;
      col += (n * 0.8 + cn * 0.35) * grain;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function shader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = (n) => gl.getUniformLocation(prog, n);
  const uRes = u('res'), uMouse = u('mouse'), uScroll = u('scroll');
  const uBase = u('base'), uA = u('bandA'), uB = u('bandB'), uGrain = u('grain');

  const hex = (h) => { h = h.trim().replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); };
  function readTheme() {
    const cs = getComputedStyle(document.documentElement);
    gl.uniform3fv(uBase, hex(cs.getPropertyValue('--base')));
    gl.uniform3fv(uA, hex(cs.getPropertyValue('--band-a')));
    gl.uniform3fv(uB, hex(cs.getPropertyValue('--band-b')));
    gl.uniform1f(uGrain, parseFloat(cs.getPropertyValue('--grain')));
  }

  function resize() {
    // one draw at screen size, so full res is cheap
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  }

  // static: drawn once, again only on theme change or resize
  function draw() {
    gl.uniform2f(uMouse, 0, 0);
    gl.uniform1f(uScroll, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  readTheme();
  resize();
  draw();

  let t = 0;
  addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => { resize(); draw(); }, 200);
  });
  const redo = () => { readTheme(); draw(); };
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redo);
  document.addEventListener('site:theme', redo);
})();
