import type { AthenaInstallContext } from "../athena/install";
import type { LegacyContext } from "../runtime/legacy-context";

/**
 * Lumen, the student's guide cat. The sculpted cat itself is the kit GLB
 * (`athena-npc-cat-lumen.glb`: idle and talk clips, a blink on its `face_expression` node).
 * This only adds what a model file cannot: a faint warm aura behind the figure and a charm that
 * breathes with light. Everything holds still under reduced motion (time 0).
 */
export function illuminateLumen(ctx: AthenaInstallContext, root: LegacyContext) {
  const s = ctx.scope;
  // The charm keeps the kit's `charm_glow` material; clone it so the pulse stays Lumen's own.
  const charms: { material: LegacyContext; base: number }[] = [];
  root.traverse((mesh: LegacyContext) => {
    if (!mesh.isMesh || Array.isArray(mesh.material)) return;
    if (String(mesh.material?.name ?? "") !== "charm_glow") return;
    const material = mesh.material.clone();
    mesh.material = material;
    ctx.onDispose(() => material.dispose());
    charms.push({ material, base: material.emissiveIntensity ?? 1 });
  });
  // Faint warm aura behind the figure.
  const uniforms = { uTime: { value: 0 } };
  const aura = new s.Mesh(
    new s.PlaneGeometry(1.1, 1.1),
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
          view.z-=0.25;
          gl_Position=projectionMatrix*view;
        }`,
      fragmentShader: `
        uniform float uTime; varying vec2 vUv;
        void main(){
          float d=length(vUv-.5)*2.0;
          float a=pow(max(0.0,1.0-d),3.0)*(.16+.04*sin(uTime*2.0));
          gl_FragColor=vec4(vec3(1.4,1.05,.6)*a,a);
        }`,
    }),
  );
  aura.name = "lumen-aura";
  aura.position.set(0, 0.25, 0);
  aura.renderOrder = 5;
  aura.raycast = () => {};
  root.add(aura);
  ctx.onDispose(() => {
    aura.geometry.dispose();
    aura.material.dispose();
  });
  return {
    tick(time: number) {
      uniforms.uTime.value = time;
      const pulse = 1 + 0.35 * Math.sin(time * 2.4);
      for (const charm of charms) charm.material.emissiveIntensity = charm.base * pulse;
    },
  };
}
