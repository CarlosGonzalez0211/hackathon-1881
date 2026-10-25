import type { LegacyContext } from "../runtime/legacy-context";
import type { AthenaInstallContext } from "../athena/install";
import { cross, norm, RADIUS, type Vec } from "./layout";
import { sunDirection } from "./light";

/**
 * Camera-centred golden-hour sky. It follows local gravity on every side of the globe.
 * Values near the sun exceed 1.0 on purpose: the HDR grade blooms them into a soft glow.
 */
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
    uSun: { value: new s.Vector3(0, 0.3, 0.95) },
  };
  const material = new s.ShaderMaterial({
    uniforms,
    side: s.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: `varying vec3 vSky; void main(){ vSky=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
      uniform float uTime,uOverview; uniform vec3 uUp,uForward,uRight,uViewForward,uViewUp,uViewRight,uSun; varying vec3 vSky;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      vec3 lin(vec3 c){return pow(c,vec3(2.2));}
      float fbm(vec2 p){float v=0.0,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(17.1,9.2);a*=.5;}return v;}
      void main(){
        vec3 ray=normalize(vSky);
        // Frame the same sky above an overhead camera: its physical ray points towards the
        // planet, which would otherwise sample only the horizon.
        vec3 framed=normalize(uForward*dot(ray,uViewForward)+uRight*dot(ray,uViewRight)+uUp*(dot(ray,uViewUp)+.32));
        ray=normalize(mix(ray,framed,uOverview));
        float h=dot(ray,uUp);
        float facing=max(0.0,dot(ray,uSun));
        float sunSide=dot(normalize(ray-uUp*h+1e-4),normalize(uSun-uUp*dot(uSun,uUp)+1e-4))*.5+.5;
        // Gradient: deep azure zenith, luminous turquoise middle, warm peach horizon on the sun side.
        // Palette authored in display values, converted to linear light for the HDR grade.
        vec3 zenith=lin(vec3(.13,.36,.74)), middle=lin(vec3(.40,.70,.93));
        vec3 horizon=mix(lin(vec3(.84,.89,.97)),lin(vec3(1.0,.80,.60))*1.02,pow(sunSide,2.2));
        float up=clamp(h,0.0,1.0);
        vec3 color=mix(horizon,middle,smoothstep(0.0,.28,up));
        color=mix(color,zenith,smoothstep(.22,1.0,up));
        // Mie halo and sun disc in HDR.
        color+=vec3(1.0,.62,.32)*pow(facing,8.0)*.22;
        color+=vec3(1.0,.78,.5)*pow(facing,64.0)*.9;
        color=mix(color,vec3(4.2,3.4,2.4),smoothstep(.9986,.9993,facing));
        // Lit cumulus: soft fbm masses with sun-facing silver linings and violet undersides.
        vec2 uv=vec2(dot(ray,uRight),dot(ray,uForward))/(max(.06,h)+.35);
        vec2 flow=uv*1.6+vec2(uTime*.006,uTime*.002);
        float shape=fbm(flow+fbm(flow*.7)*.6);
        float clouds=smoothstep(.63,.8,shape)*smoothstep(.03,.22,h)*(1.0-smoothstep(.75,1.0,h));
        float thick=smoothstep(.68,.95,shape);
        float lining=pow(facing,3.0)*(1.0-thick)*2.2;
        vec3 cloudColor=mix(lin(vec3(1.0,.96,.93)),lin(vec3(.70,.70,.90)),thick*.6)+lin(vec3(1.0,.78,.5))*lining;
        color=mix(color,cloudColor,clouds*.88);
        float wisps=smoothstep(.62,.86,fbm(uv*vec2(1.2,7.0)+vec2(uTime*.004,0.0)))*smoothstep(.3,.7,h);
        color=mix(color,vec3(1.0,.96,.94),wisps*.1);
        // Below the horizon: a sea of sunlit cloud tops the globe floats on.
        float below=1.0-smoothstep(-.02,.06,h);
        vec2 seaUv=vec2(dot(ray,uRight),dot(ray,uForward))/(max(.04,-h)+.12);
        float puffs=fbm(seaUv*.9+vec2(uTime*.01,0.0));
        vec3 sea=mix(lin(vec3(.78,.81,.97)),lin(vec3(1.0,.9,.8))*1.05,smoothstep(.35,.75,puffs)*(.35+.65*sunSide));
        sea+=vec3(1.0,.7,.42)*pow(facing,6.0)*.6;
        color=mix(color,sea,below);
        gl_FragColor=vec4(color,1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const sky = new s.Mesh(new s.SphereGeometry(150, 48, 24), material);
  sky.frustumCulled = false;
  sky.renderOrder = -100;
  sky.name = "athena-painted-sky";
  scene.add(sky);
  // Overview rim: a warm, sun-weighted scattering shell around the floating globe.
  const haloMaterial = new s.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: s.BackSide,
    blending: s.AdditiveBlending,
    uniforms: { uSun: uniforms.uSun },
    vertexShader: `varying vec3 vP,vN;void main(){vec4 w=modelMatrix*vec4(position,1.0);vP=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader: `uniform vec3 uSun;varying vec3 vP,vN;void main(){vec3 n=normalize(vN);float edge=pow(1.0-abs(dot(n,normalize(cameraPosition-vP))),2.4);float lit=dot(-n,uSun)*.5+.5;vec3 c=mix(vec3(.35,.62,1.0),vec3(1.4,.95,.6),lit*lit);gl_FragColor=vec4(c*edge*.55,edge*.5);}`,
  });
  const halo = new s.Mesh(new s.SphereGeometry(RADIUS + 1.6, 64, 32), haloMaterial);
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
      uniforms.uSun.value.set(...sunDirection(up, forward));
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
