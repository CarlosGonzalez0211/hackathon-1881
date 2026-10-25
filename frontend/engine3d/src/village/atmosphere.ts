import type { LegacyContext } from "../runtime/legacy-context";
import type { AthenaInstallContext } from "../athena/install";
import { cross, norm, RADIUS, type Vec } from "./layout";

/** Camera-centred painted sky. It follows local gravity on every side of the globe. */
export function createAtmosphere(ctx: AthenaInstallContext, scene: LegacyContext) {
  const s = ctx.scope;
  const uniforms = {
    uTime: { value: 0 },
    uOverview: { value: 0 },
    uViewForward: { value: new s.Vector3() },
    uViewUp: { value: new s.Vector3() },
    uViewRight: { value: new s.Vector3() },
    uUp: { value: new s.Vector3(0, 1, 0) },
    uForward: { value: new s.Vector3(1, 0, 0) },
    uRight: { value: new s.Vector3(0, 0, 1) },
  };
  const material = new s.ShaderMaterial({
    uniforms,
    side: s.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: `varying vec3 vSky; void main(){ vSky=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
      uniform float uTime,uOverview; uniform vec3 uUp,uForward,uRight,uViewForward,uViewUp,uViewRight; varying vec3 vSky;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec3 ray=normalize(vSky);
        // Frame the same illustrated sky above an overhead camera: its physical ray
        // points towards the planet, which would otherwise sample only the horizon.
        vec3 framed=normalize(uForward*dot(ray,uViewForward)+uRight*dot(ray,uViewRight)+uUp*(dot(ray,uViewUp)+.32));
        ray=normalize(mix(ray,framed,uOverview));
        float h=dot(ray,uUp);
        vec3 zenith=vec3(.12,.46,.65), horizon=vec3(.78,.86,.77);
        vec3 color=mix(horizon,zenith,pow(clamp(h*1.1,0.0,1.0),.48));
        color=mix(color,vec3(.96,.80,.62),pow(1.0-clamp(abs(h)*3.0,0.0,1.0),3.0)*.23);
        vec3 sun=normalize(uUp*.46+uForward*.8-uRight*.3);
        float facing=max(0.0,dot(ray,sun));
        color+=vec3(.23,.15,.04)*pow(facing,20.0);
        float disc=smoothstep(.9988,.9993,facing);
        color=mix(color,vec3(1.0,.93,.68),disc);
        vec2 uv=vec2(dot(ray,uRight),dot(ray,uForward))/(max(.08,h)+.4);
        vec2 flow=uv*2.5+vec2(uTime*.008,0.0);
        float warp=noise(flow*.8);
        float n=noise(flow+warp*.35)+noise(flow*2.0)*.25;
        float clouds=smoothstep(.76,.82,n)*smoothstep(.08,.3,h);
        float lining=smoothstep(.85,.91,n);
        vec3 cloudColor=mix(vec3(.71,.83,.85),vec3(1.0,.97,.87),lining);
        color=mix(color,cloudColor,clouds*.9);
        float wisps=smoothstep(.76,.87,noise(uv*vec2(2.0,12.0)+vec2(uTime*.005,0.0)))*smoothstep(.35,.7,h);
        color=mix(color,vec3(.86,.94,.92),wisps*.23);
        gl_FragColor=vec4(color,1.0);
        #include <colorspace_fragment>
      }
    `,
  });
  const sky = new s.Mesh(new s.SphereGeometry(150, 32, 16), material);
  sky.frustumCulled = false;
  sky.renderOrder = -100;
  sky.name = "athena-painted-sky";
  scene.add(sky);
  const haloMaterial = new s.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: s.BackSide,
    blending: s.AdditiveBlending,
    vertexShader: `varying vec3 vP,vN;void main(){vec4 w=modelMatrix*vec4(position,1.0);vP=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader: `varying vec3 vP,vN;void main(){float edge=pow(1.0-abs(dot(normalize(vN),normalize(cameraPosition-vP))),3.0);gl_FragColor=vec4(.23,.65,.69,edge*.25);}`,
  });
  const halo = new s.Mesh(new s.SphereGeometry(RADIUS + 0.75, 64, 32), haloMaterial);
  halo.name = "athena-planet-atmospheric-rim";
  halo.visible = false;
  scene.add(halo);
  return {
    tick(
      camera: LegacyContext,
      up: Vec,
      forward: Vec,
      time: number,
      reduced: boolean,
      overview = false,
    ) {
      sky.position.copy(camera.position);
      uniforms.uUp.value.set(...up);
      uniforms.uForward.value.set(...forward);
      uniforms.uRight.value.set(...norm(cross(forward, up)));
      uniforms.uTime.value = reduced ? 0 : time;
      uniforms.uOverview.value = overview ? 1 : 0;
      camera.getWorldDirection(uniforms.uViewForward.value);
      uniforms.uViewRight.value.crossVectors(uniforms.uViewForward.value, camera.up).normalize();
      uniforms.uViewUp.value
        .crossVectors(uniforms.uViewRight.value, uniforms.uViewForward.value)
        .normalize();
      halo.visible = overview;
    },
  };
}
