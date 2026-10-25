import type { AthenaInstallContext } from "../athena/install";
import type { LegacyContext } from "../runtime/legacy-context";
import { ring, taperedTube } from "./geometry";
import { norm, type Vec } from "./layout";

/**
 * Quest waypoint towards the next topic house: a column of warm light rising from its
 * door (visible over the rooftops) plus a HUD marker. On screen the marker floats above the
 * door with the topic name and distance; off screen it rides the screen edge and points
 * the way. Hidden in the aerial view, while paused and once the door is within reach.
 */
export function createWaypoint(ctx: AthenaInstallContext, scene: LegacyContext, host: HTMLElement) {
  const s = ctx.scope;
  const uniforms = { uTime: { value: 0 } };
  const beamMaterial = new s.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    side: s.DoubleSide,
    blending: s.AdditiveBlending,
    vertexShader: `varying float vH; varying vec3 vN, vV;
      void main(){ vH=position.y/14.0+.5; vec4 w=modelMatrix*vec4(position,1.0);
        vN=normalize(mat3(modelMatrix)*normal); vV=normalize(cameraPosition-w.xyz);
        gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform float uTime; varying float vH; varying vec3 vN, vV;
      void main(){
        float core=pow(abs(dot(normalize(vN),normalize(vV))),1.6);
        float fade=(1.0-smoothstep(.0,1.0,vH))*smoothstep(0.0,.04,vH);
        float shimmer=.75+.25*sin(vH*26.0-uTime*3.0);
        float a=core*fade*shimmer*.55;
        gl_FragColor=vec4(vec3(2.2,1.6,.75)*a,a);
      }`,
  });
  const beam = new s.Mesh(taperedTube(s, 0.32, 0.5, 14, 32, 12), beamMaterial);
  beam.position.y = 7;
  const ringMaterial = new s.MeshBasicMaterial({
    color: new s.Color(2.4, 1.7, 0.8),
    transparent: true,
    depthWrite: false,
    blending: s.AdditiveBlending,
  });
  ringMaterial.toneMapped = false;
  const pulse = new s.Mesh(ring(s, 0.9, 0.035, 8, 64), ringMaterial);
  pulse.position.y = 0.08;
  const marker = new s.Group();
  marker.name = "athena-quest-waypoint";
  marker.add(beam, pulse);
  marker.visible = false;
  for (const mesh of [beam, pulse]) {
    mesh.raycast = () => {};
    mesh.frustumCulled = false;
  }
  scene.add(marker);

  // HUD: a glowing medallion (open-book glyph, turning rune ring, pulse ripple), a name and
  // distance tag, and a cascade of chevrons that orbit the medallion to point the way.
  const hud = document.createElement("div");
  hud.className = "village-waypoint";
  hud.setAttribute("aria-hidden", "true");
  hud.innerHTML = `
    <div class="wp-medallion">
      <span class="wp-ripple"></span>
      <svg class="wp-runes" viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" /></svg>
      <svg class="wp-glyph" viewBox="0 0 24 24"><path d="M12 6.4C10.2 5 7.6 4.5 4.2 4.6a1 1 0 0 0-1 1v11.6a1 1 0 0 0 1 1c3 0 5.6.5 7.8 1.9 2.2-1.4 4.8-1.9 7.8-1.9a1 1 0 0 0 1-1V5.6a1 1 0 0 0-1-1C16.4 4.5 13.8 5 12 6.4z"/><path class="wp-spine" d="M12 6.6v12.6"/></svg>
      <div class="wp-compass">
        <svg class="wp-chevrons" viewBox="0 0 24 40">
          <path class="wp-c1" d="M4 4l8 7 8-7"/><path class="wp-c2" d="M4 16l8 7 8-7"/><path class="wp-c3" d="M4 28l8 7 8-7"/>
        </svg>
      </div>
    </div>
    <div class="wp-tag"><strong></strong><span></span></div>`;
  hud.hidden = true;
  host.appendChild(hud);
  const compass = hud.querySelector(".wp-compass") as HTMLElement;
  const title = hud.querySelector(".wp-tag strong") as HTMLElement;
  const distance = hud.querySelector(".wp-tag span") as HTMLElement;
  const point = new s.Vector3(),
    toPoint = new s.Vector3(),
    forward = new s.Vector3();
  let shownTitle = "",
    shownDistance = "";

  return {
    tick(
      camera: LegacyContext,
      target: { door: Vec; up: Vec; title: string; distance: number } | undefined,
      time: number,
      paused: boolean,
      overview: boolean,
    ) {
      uniforms.uTime.value = time;
      const near = !!target && target.distance <= 2.6 && !overview;
      const show = !!target && !paused && !near;
      marker.visible = !!target && !paused;
      hud.hidden = !show;
      if (!target) return;
      marker.position.set(...target.door);
      const up = new s.Vector3(...norm(target.up));
      marker.quaternion.setFromUnitVectors(new s.Vector3(0, 1, 0), up);
      // From the aerial view the column grows so it reads across the whole globe.
      const grow = overview ? 1.9 : 1;
      beam.scale.set(grow, grow, grow);
      beam.position.y = 7 * grow;
      const breath = (1 + 0.25 * Math.sin(time * 2.4)) * (overview ? 2.2 : 1);
      pulse.scale.set(breath, 1, breath);
      ringMaterial.opacity = 0.55 + 0.35 * Math.sin(time * 2.4);
      if (!show) return;
      if (target.title !== shownTitle) title.textContent = shownTitle = target.title;
      const metres = `${Math.round(target.distance)} m`;
      if (metres !== shownDistance) distance.textContent = shownDistance = metres;
      // Anchor a little above the door (higher from the air), in screen space.
      point.set(...target.door).addScaledVector(up, overview ? 7 : 2.4);
      toPoint.copy(point).sub(camera.position);
      camera.getWorldDirection(forward);
      const behind = toPoint.dot(forward) < 0;
      point.project(camera);
      let x = point.x,
        y = point.y;
      if (behind) {
        x = -x;
        y = -y;
      }
      const width = host.clientWidth,
        height = host.clientHeight;
      const margin = 0.82;
      const onScreen = !behind && Math.abs(x) < margin && Math.abs(y) < margin;
      let angle = 180;
      if (!onScreen) {
        // Behind the student or below the frame: dock on the side the way turns, never
        // along the bottom where the student, hints and panels sit.
        if (behind || y < -margin) {
          x = (x < 0 ? -1 : 1) * margin;
          y = Math.max(-0.45, Math.min(0.45, y * 0.5)) - 0.1;
        } else {
          const scale = margin / Math.max(Math.abs(x) || 1e-6, Math.abs(y) || 1e-6);
          x *= Math.min(1, scale);
          y *= Math.min(1, scale);
        }
        angle = (Math.atan2(x * width, y * height) * 180) / Math.PI;
      }
      hud.classList.toggle("is-edge", !onScreen);
      hud.style.left = `${((x + 1) * width) / 2}px`;
      hud.style.top = `${((1 - y) * height) / 2}px`;
      compass.style.transform = `rotate(${angle}deg)`;
    },
    dispose() {
      marker.removeFromParent();
      beam.geometry.dispose();
      pulse.geometry.dispose();
      beamMaterial.dispose();
      ringMaterial.dispose();
      hud.remove();
    },
  };
}
