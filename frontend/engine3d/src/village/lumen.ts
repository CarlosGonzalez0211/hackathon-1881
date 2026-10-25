import type { AthenaInstallContext } from "../athena/install";
import { localBounds } from "../athena/models";
import type { LegacyContext } from "../runtime/legacy-context";

/**
 * Lumen is the student's guide, so it is made of light: a warm inner glow keeps the white
 * cat readable against bright paving without ink outlines, and a soft pulsing aura with a
 * few orbiting sparks blooms around it. Everything pauses under reduced motion.
 */
export function illuminateLumen(ctx: AthenaInstallContext, root: LegacyContext) {
  const s = ctx.scope;
  const glow = new s.Color("#ffd99a");
  root.traverse((mesh: LegacyContext) => {
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mesh.material = materials.map((material: LegacyContext) => {
      if (!material?.emissive || /eye|ink|nose|mouth|pupil/i.test(String(material.name)))
        return material;
      const lit = material.clone();
      // clone() drops shader patches; keep the painterly light, and let merged vertex
      // colours mask the glow so dark eyes and markings stay dark.
      const previous = material.onBeforeCompile.bind(material);
      const key = material.customProgramCacheKey.bind(material);
      lit.onBeforeCompile = (shader: LegacyContext, renderer: LegacyContext) => {
        previous(shader, renderer);
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
#ifdef USE_COLOR
totalEmissiveRadiance *= vColor.rgb * vColor.rgb;
#endif`,
        );
      };
      lit.customProgramCacheKey = () => `${key()}-lumen-v1`;
      // Light-coloured fur glows; darker markings keep their contrast.
      const hsl = { h: 0, s: 0, l: 0 };
      lit.color.getHSL(hsl);
      lit.emissive.copy(lit.color).lerp(glow, 0.5);
      // Subtle: strong uniform glow flattens the muzzle and cheeks into a pale "mask".
      lit.emissiveIntensity = hsl.l > 0.55 ? 0.13 : 0.05;
      ctx.onDispose(() => lit.dispose());
      return lit;
    });
    if (materials.length === 1) mesh.material = mesh.material[0];
  });
  const bounds = localBounds(s, root);
  const height = Math.max(0.3, bounds.max.y - bounds.min.y);
  const centre = new s.Vector3();
  bounds.getCenter(centre);
  const uniforms = { uTime: { value: 0 } };
  const aura = new s.Mesh(
    new s.PlaneGeometry(height * 2.6, height * 2.6),
    new s.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: s.AdditiveBlending,
      vertexShader: `
        varying vec2 vUv;
        void main(){
          vUv=uv;
          vec4 view=modelViewMatrix*vec4(0.0,0.0,0.0,1.0);
          view.xy+=position.xy*vec2(length(modelMatrix[0].xyz),length(modelMatrix[1].xyz));
          gl_Position=projectionMatrix*view;
        }`,
      fragmentShader: `
        uniform float uTime; varying vec2 vUv;
        void main(){
          float d=length(vUv-.5)*2.0;
          float pulse=.85+.15*sin(uTime*2.2);
          float a=pow(max(0.0,1.0-d),2.4)*.55*pulse;
          gl_FragColor=vec4(vec3(1.6,1.2,.62)*a,a);
        }`,
    }),
  );
  aura.name = "lumen-aura";
  aura.position.copy(centre);
  aura.renderOrder = 5;
  aura.frustumCulled = false;
  aura.raycast = () => {};
  root.add(aura);
  const sparks: LegacyContext[] = [];
  const sparkMaterial = new s.MeshBasicMaterial({ color: new s.Color(3.2, 2.4, 1.2) });
  sparkMaterial.toneMapped = false;
  const sparkShape = new s.SphereGeometry(height * 0.035, 10, 8);
  for (let i = 0; i < 5; i++) {
    const spark = new s.Mesh(sparkShape, sparkMaterial);
    spark.name = "lumen-spark";
    spark.raycast = () => {};
    root.add(spark);
    sparks.push(spark);
  }
  ctx.onDispose(() => {
    aura.geometry.dispose();
    aura.material.dispose();
    sparkShape.dispose();
    sparkMaterial.dispose();
  });
  return {
    tick(time: number) {
      uniforms.uTime.value = time;
      sparks.forEach((spark, i) => {
        const a = time * (0.7 + i * 0.13) + i * 1.257;
        const r = height * (0.55 + 0.12 * Math.sin(time * 0.9 + i));
        spark.position.set(
          centre.x + Math.cos(a) * r,
          centre.y + height * (0.1 + 0.35 * Math.sin(time * 1.3 + i * 2.1)),
          centre.z + Math.sin(a) * r,
        );
      });
    },
  };
}
