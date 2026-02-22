const container = document.getElementById("halftone-app");

if (!container) {
  throw new Error("Missing #halftone-app container");
}

async function initHalftone() {
  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js");
    const { OrbitControls } = await import("https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js");
    const { EffectComposer } = await import("https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/postprocessing/EffectComposer.js");
    const { RenderPass } = await import("https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/postprocessing/RenderPass.js");
    const { ShaderPass } = await import("https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/postprocessing/ShaderPass.js");

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f3f3f3");

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x666666, 0.35);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(5, 5, 5);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xffffff, 0.7);
    fill.position.set(-5, 3, -5);
    scene.add(fill);

    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.8, 0.3, 100, 16),
      new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        roughness: 0.55,
        metalness: 0.05,
      })
    );
    scene.add(knot);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const MonoHalftoneShader = {
      uniforms: {
        tDiffuse: { value: null },
        uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
        uCellSize: { value: 8.0 },
        uInvert: { value: 0.0 },
      },
      vertexShader: /* glsl */`
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */`
        uniform sampler2D tDiffuse;
        uniform vec2 uResolution;
        uniform float uCellSize;
        uniform float uInvert;

        varying vec2 vUv;

        float luminance(vec3 color) {
          return dot(color, vec3(0.299, 0.587, 0.114));
        }

        void main() {
          vec2 fragCoord = vUv * uResolution;
          vec2 cell = floor(fragCoord / uCellSize);
          vec2 cellCenter = cell * uCellSize + vec2(uCellSize * 0.5);

          vec2 sampleUv = cellCenter / uResolution;
          vec3 src = texture2D(tDiffuse, sampleUv).rgb;
          float lum = luminance(src);

          float radius = (1.0 - lum) * (uCellSize * 0.5);

          float d = length(fragCoord - cellCenter);
          float aa = 1.0;
          float dotMask = 1.0 - smoothstep(radius - aa, radius + aa, d);

          vec3 outColor = mix(vec3(1.0), vec3(0.0), dotMask);

          if (uInvert > 0.5) {
            outColor = 1.0 - outColor;
          }

          gl_FragColor = vec4(outColor, 1.0);
        }
      `,
    };

    const halftonePass = new ShaderPass(MonoHalftoneShader);
    composer.addPass(halftonePass);

    function onResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) {
        return;
      }
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      halftonePass.uniforms.uResolution.value.set(w, h);
    }

    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();

    function animate() {
      const t = clock.getElapsedTime();
      knot.rotation.y = t * 0.4;
      knot.rotation.x = t * 0.2;
      controls.update();
      composer.render();
      requestAnimationFrame(animate);
    }

    animate();
    onResize();
  } catch (error) {
    console.error("Failed to initialize halftone:", error);
  }
}

initHalftone();
