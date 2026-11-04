// thems. — xususiy galereya: qora tosh pol, yong'oq devor, yashil lak, uchta yoritilgan ark va ichida uchta maneken.
// Qoida: buyum kam, yorug'lik aniq. Devorda rasm yo'q, sahnada faqat kiyim, poyabzal va logo.
import * as THREE from '../vendor/three.module.min.js';

const FLOOR = { w: 14, d: 13, cz: 3.5 }; // x: -7..7, z: -3..10
const H = 4.2;
const WALL_Z = -2.4; // arkli devor
const tl = new THREE.TextureLoader();

function rnd(a, b) { return a + Math.random() * (b - a); }

function canvasTex(c, repeat) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}

/* ---------- protsedural teksturalar ---------- */
function vein(g, x, y, len, ang, width, color, depth = 2) {
  g.strokeStyle = color; g.lineWidth = width; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x, y);
  const n = 12, branches = [];
  for (let i = 0; i < n; i++) {
    ang += rnd(-.42, .42);
    x += Math.cos(ang) * len / n; y += Math.sin(ang) * len / n;
    g.lineTo(x, y);
    if (depth > 0 && Math.random() < .14) branches.push([x, y, ang + rnd(-1, 1)]);
  }
  g.stroke();
  branches.forEach(([bx, by, ba]) => vein(g, bx, by, len * .34, ba, width * .55, color, depth - 1));
}

// Qora marmar (Nero Marquina): oq tomirlar, katta plitalar, ingichka jez chiziqlar
function marbleTexture(px) {
  const c = document.createElement('canvas');
  c.width = px; c.height = Math.round(px * FLOOR.d / FLOOR.w);
  const g = c.getContext('2d'), s = px / FLOOR.w;
  g.fillStyle = '#0b0b0c'; g.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 40; i++) {
    const x = rnd(0, c.width), y = rnd(0, c.height), r = rnd(.6, 2.2) * s;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(46,44,42,.34)'); gr.addColorStop(1, 'rgba(46,44,42,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  for (let i = 0; i < 26; i++) vein(g, rnd(0, c.width), rnd(0, c.height), rnd(2, 6) * s, rnd(0, 6.28), rnd(.008, .02) * s, `rgba(214,208,196,${rnd(.1, .36)})`);
  for (let i = 0; i < 60; i++) vein(g, rnd(0, c.width), rnd(0, c.height), rnd(.6, 2) * s, rnd(0, 6.28), rnd(.003, .007) * s, `rgba(214,208,196,${rnd(.06, .22)})`);
  const T = 2 * s;
  g.strokeStyle = 'rgba(0,0,0,.8)'; g.lineWidth = Math.max(1, .006 * s);
  for (let x = T / 2; x < c.width; x += T) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, c.height); g.stroke(); }
  for (let y = 0; y < c.height; y += T) { g.beginPath(); g.moveTo(0, y); g.lineTo(c.width, y); g.stroke(); }
  return canvasTex(c);
}

// Tik yo'nalishdagi yong'oq reykalar (1 m kenglik uchun)
function flutedTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const g = c.getContext('2d'), n = 12, w = c.width / n;
  for (let i = 0; i < n; i++) {
    const tone = 24 + Math.random() * 7;
    const l = g.createLinearGradient(i * w, 0, (i + 1) * w, 0);
    l.addColorStop(0, `rgb(${tone * .34},${tone * .22},${tone * .15})`);
    l.addColorStop(.26, `rgb(${tone * 1.5},${tone},${tone * .66})`);
    l.addColorStop(.7, `rgb(${tone * 1.16},${tone * .78},${tone * .5})`);
    l.addColorStop(1, `rgb(${tone * .28},${tone * .18},${tone * .12})`);
    g.fillStyle = l; g.fillRect(i * w, 0, w + 1, c.height);
    g.lineWidth = 1;
    for (let k = 0; k < 7; k++) {
      g.strokeStyle = `rgba(${Math.random() < .5 ? '10,6,3' : '110,76,46'},${rnd(.08, .24)})`;
      const x = i * w + rnd(0, w);
      g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + rnd(-3, 3), 170, x + rnd(-3, 3), 340, x, 512); g.stroke();
    }
  }
  return c;
}

// Ark ichidagi orqadan yoritilgan oniks tosh
function onyxTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 1024;
  const g = c.getContext('2d');
  const base = g.createRadialGradient(256, 400, 30, 256, 460, 640);
  base.addColorStop(0, '#c9a06a'); base.addColorStop(.4, '#8a6236'); base.addColorStop(.78, '#3d2914'); base.addColorStop(1, '#1b1209');
  g.fillStyle = base; g.fillRect(0, 0, 512, 1024);
  g.filter = 'blur(5px)';
  for (let i = 0; i < 16; i++) vein(g, rnd(0, 512), rnd(0, 1024), rnd(240, 620), rnd(1.2, 1.9), rnd(8, 26), `rgba(${Math.random() < .5 ? '60,34,12' : '255,232,190'},${rnd(.015, .04)})`, 0);
  g.filter = 'none';
  return canvasTex(c);
}

function noiseTex(base, amp, px = 256, rep = 3) {
  const c = document.createElement('canvas'); c.width = c.height = px;
  const g = c.getContext('2d'); g.fillStyle = base; g.fillRect(0, 0, px, px);
  const d = g.getImageData(0, 0, px, px);
  for (let i = 0; i < d.data.length; i += 4) {
    const n = (Math.random() - .5) * amp;
    d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n;
  }
  g.putImageData(d, 0, 0);
  return canvasTex(c, [rep, rep]);
}

function radial(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)', px = 256) {
  const c = document.createElement('canvas'); c.width = c.height = px;
  const g = c.getContext('2d'), r = g.createRadialGradient(px / 2, px / 2, 0, px / 2, px / 2, px / 2);
  r.addColorStop(0, inner); r.addColorStop(1, outer);
  g.fillStyle = r; g.fillRect(0, 0, px, px);
  return canvasTex(c);
}

function load(url, srgb = true) {
  return new Promise((res, rej) => tl.load(url, t => {
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4; res(t);
  }, undefined, rej));
}

// Yuqorisi yarim doira bo'lgan ark shakli
function archPath(P, x, w, h, y0 = 0) {
  const r = w / 2;
  P.moveTo(x - r, y0); P.lineTo(x + r, y0); P.lineTo(x + r, y0 + h - r);
  P.absarc(x, y0 + h - r, r, 0, Math.PI, false);
  P.lineTo(x - r, y0);
  return P;
}

/* ---------- sahna ---------- */
export async function createStore(canvas, cfg) {
  const mobile = cfg.mobile, P = cfg.portrait;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: false, powerPreference: 'high-performance' });
  let dpr = Math.min(devicePixelRatio || 1, mobile ? 1.4 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#050505');
  scene.fog = new THREE.Fog('#070605', 12, 26);
  const camera = new THREE.PerspectiveCamera(42, 1, .05, 60);

  // Metall va lak aksi uchun qorong'i studiya
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color('#060504');
  const addEnv = (c, x, y, z, s) => { const m = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(7) })); m.position.set(x, y, z); envScene.add(m); };
  addEnv('#ffe6bd', 0, 6, 0, 5); addEnv('#ffd9a0', 0, 2, -8, 5); addEnv('#fff1d6', -7, 3, 5, 2); addEnv('#ffd9a0', 7, 2, 6, 2);
  const pm = new THREE.PMREMGenerator(renderer);
  const envTex = pm.fromScene(envScene, .03).texture;
  scene.environment = envTex;
  pm.dispose();
  scene.environmentIntensity = .5;
  scene.add(new THREE.HemisphereLight('#ffeed6', '#1a120a', mobile ? .78 : .52));

  /* --- materiallar --- */
  const flutedC = flutedTexture();
  const fluted = (rx, ry) => new THREE.MeshStandardMaterial({ map: canvasTex(flutedC, [rx, ry]), roughness: .52, envMapIntensity: .8 });
  const matLacquer = new THREE.MeshStandardMaterial({ map: noiseTex('#0b2e23', 5, 256, 4), roughness: .62, envMap: envTex, envMapIntensity: .12 });
  const matBlack = new THREE.MeshStandardMaterial({ color: '#080808', roughness: .34, metalness: .6 });
  const matBrass = new THREE.MeshStandardMaterial({ color: '#b8935a', roughness: .26, metalness: 1, envMapIntensity: 1.6 });
  const matGold = new THREE.MeshStandardMaterial({ color: '#efcf92', roughness: .26, metalness: 1, envMap: envTex, envMapIntensity: 2.2 });
  const matCeil = new THREE.MeshBasicMaterial({ color: '#0a0908' });
  const lightMat = (c = '#ffe3b4', k = 2.2) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), toneMapped: false });

  const mirrored = [];
  const box = (w, h, d, m, x, y, z, shadow) => {
    const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z);
    if (shadow) { o.castShadow = true; o.receiveShadow = true; }
    scene.add(o); return o;
  };
  const glowTex = radial('rgba(255,226,180,.95)', 'rgba(255,226,180,0)');
  const glow = (w, h, x, y, z, ry = 0, rx = 0, op = 1, color = '#ffffff') => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: glowTex, color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false }));
    m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.renderOrder = 3; scene.add(m); return m;
  };
  const shadowTex = radial('rgba(0,0,0,.8)', 'rgba(0,0,0,0)');
  const blob = (w, d, x, y, z, op = .6) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: op, depthWrite: false, toneMapped: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.renderOrder = 2; scene.add(m); return m;
  };

  /* --- pol: yarim shaffof marmar, ostida ko'zgu nusxalar turadi --- */
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(FLOOR.w, FLOOR.d), new THREE.MeshStandardMaterial({ map: marbleTexture(mobile ? 1536 : 2560), roughness: .24, envMap: envTex, envMapIntensity: .05, transparent: true, opacity: .82 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, FLOOR.cz); floor.receiveShadow = true; floor.renderOrder = 1; scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(FLOOR.w, FLOOR.d), matCeil);
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, H, FLOOR.cz); scene.add(ceil);

  /* --- yon devorlar: pastga ham davom etadi, polda aksi ko'rinsin --- */
  box(.2, H * 2, FLOOR.d, fluted(FLOOR.d, H * 2), -7.1, 0, FLOOR.cz);           // chap: yong'oq reyka
  box(.2, H * 2, FLOOR.d, matLacquer, 7.1, 0, FLOOR.cz);                        // o'ng: to'q yashil lak
  box(FLOOR.w, H * 2, .2, matLacquer, 0, 0, 10.1);                              // kirish tomoni

  // Chap devor ritmi: jez ustunchalar va yuqoridan tushgan yumshoq nur
  for (let z = -1.6; z < 9.6; z += 2.8) {
    box(.03, H, .035, matBrass, -6.985, H / 2, z);
    glow(1.7, 3.3, -6.975, 2.5, z + 1.4, Math.PI / 2, 0, .1);
  }
  // Shift chekkasi: bilinar-bilinmas issiq chiziq
  [[-6.85, 0, .02, FLOOR.d], [6.85, 0, .02, FLOOR.d]].forEach(([x, , w, d]) => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(w, .02, d), lightMat('#ffdca6', 1.5)); s.position.set(x, H - .04, FLOOR.cz); scene.add(s);
  });

  /* --- arkli devor --- */
  const MX = P ? 1.12 : 2.05;
  const AW = P ? .98 : 1.5, AH = 3.3;
  const wallDepth = .46;
  const wallShape = new THREE.Shape([new THREE.Vector2(-7, 0), new THREE.Vector2(7, 0), new THREE.Vector2(7, H), new THREE.Vector2(-7, H)]);
  [-MX, 0, MX].forEach(x => wallShape.holes.push(archPath(new THREE.Path(), x, AW, AH)));
  const wallGeo = new THREE.ExtrudeGeometry(wallShape, { depth: wallDepth, bevelEnabled: false, curveSegments: 40 });
  const wallTex = canvasTex(flutedC, [1, .25]);
  const wall = new THREE.Mesh(wallGeo, new THREE.MeshStandardMaterial({ map: wallTex, roughness: .5, envMapIntensity: .8 }));
  wall.position.z = WALL_Z - wallDepth; scene.add(wall); mirrored.push(wall);

  const onyx = new THREE.MeshBasicMaterial({ map: onyxTexture(), toneMapped: false, fog: false });
  const brassLine = .022;
  [-MX, 0, MX].forEach(x => {
    const back = new THREE.Mesh(new THREE.PlaneGeometry(AW + .02, AH + .02), onyx);
    back.position.set(x, AH / 2, WALL_Z - wallDepth + .005); scene.add(back); mirrored.push(back);
    const ringS = archPath(new THREE.Shape(), x, AW + brassLine * 2, AH + brassLine);
    ringS.holes.push(archPath(new THREE.Path(), x, AW, AH));
    const ring = new THREE.Mesh(new THREE.ExtrudeGeometry(ringS, { depth: .02, bevelEnabled: false, curveSegments: 40 }), matBrass);
    ring.position.z = WALL_Z; scene.add(ring); mirrored.push(ring);
  });
  // Devor tepasi bo'ylab issiq nur chizig'i
  const topLine = new THREE.Mesh(new THREE.BoxGeometry(13.9, .018, .018), lightMat('#ffd9a2', 1.7));
  topLine.position.set(0, H - .08, WALL_Z + .05); scene.add(topLine);
  glow(14, 1.5, 0, H - .5, WALL_Z + .012, 0, 0, .26);

  /* --- kirish paneli: skrollda eshikdek yuqoriga ko'tariladi --- */
  const door = new THREE.Group(); scene.add(door);
  const panelTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
    const r = g.createRadialGradient(256, 230, 40, 256, 256, 400);
    r.addColorStop(0, '#1b4537'); r.addColorStop(1, '#0d261e');
    g.fillStyle = r; g.fillRect(0, 0, 512, 512);
    return canvasTex(c);
  })();
  const panel = new THREE.Mesh(new THREE.BoxGeometry(14, H, .3), new THREE.MeshBasicMaterial({ map: panelTex, fog: false }));
  panel.position.set(0, H / 2, 6); door.add(panel);
  const logoData = await (await fetch('assets/logo.json')).json();
  const logoGroup = new THREE.Group();
  const logoHeight = P ? .44 : .72;
  const shapes = logoData.s.map(s => {
    const sh = new THREE.Shape(s.o.map(p => new THREE.Vector2(p[0], p[1])));
    s.h.forEach(h => sh.holes.push(new THREE.Path(h.map(p => new THREE.Vector2(p[0], p[1])))));
    return sh;
  });
  const logoGeo = new THREE.ExtrudeGeometry(shapes, { depth: .02, bevelEnabled: false, curveSegments: 1 });
  logoGroup.add(new THREE.Mesh(logoGeo, new THREE.MeshBasicMaterial({ color: '#e3d3a8', fog: false })));
  logoGroup.scale.setScalar(logoHeight);
  const LY = P ? 2.0 : 1.86;
  logoGroup.position.set(-logoData.w * logoHeight / 2, LY, 6.16);
  door.add(logoGroup);

  /* --- uchta maneken: har biri o'z tosh taglikida, o'z nuri ostida --- */
  const MZ = -1.9;
  const PH = .26, PR = P ? .46 : .6;
  const matPlinth = new THREE.MeshStandardMaterial({ map: noiseTex('#0d0d0e', 8, 128, 2), roughness: .24, envMap: envTex, envMapIntensity: .1 });
  const manList = [['m1', -MX], ['m2', 0], ['m3', MX]];
  const manTex = await Promise.all(manList.map(async ([n]) => [await load(`assets/m/${n}.webp`), await load(`assets/m/${n}_d.jpg`, false)]));
  const maxPx = Math.max(...manTex.map(([t]) => t.image.height));
  const mannequins = [];
  manList.forEach(([n, x], i) => {
    const [tex, dep] = manTex[i];
    const hh = 1.92 * tex.image.height / maxPx, ww = hh * tex.image.width / tex.image.height;
    const geo = new THREE.PlaneGeometry(ww, hh, 72, 140);
    const uFocus = { value: 1 };
    const mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: tex }, dep: { value: dep }, bulge: { value: .26 }, uFocus },
      vertexShader: `
        uniform sampler2D dep; uniform float bulge; varying vec2 vU; varying float vD; varying vec3 vX,vY,vZ;
        void main(){ vU=uv; float d=texture2D(dep,uv).r; vD=d;
          vX=normalize(modelMatrix[0].xyz); vY=normalize(modelMatrix[1].xyz); vZ=normalize(modelMatrix[2].xyz);
          vec3 p=position; p.z+=d*bulge; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }`,
      fragmentShader: `
        uniform sampler2D map,dep; uniform float uFocus; varying vec2 vU; varying float vD; varying vec3 vX,vY,vZ;
        void main(){ vec4 c=texture2D(map,vU); if(c.a<.5) discard;
          // Chuqurlik xaritasidan sirt normali: yorug'lik tanaga hajm bo'yicha tushadi
          vec2 e=vec2(.014,.006);
          float dx=texture2D(dep,vU+vec2(e.x,0.)).r-texture2D(dep,vU-vec2(e.x,0.)).r;
          float dy=texture2D(dep,vU+vec2(0.,e.y)).r-texture2D(dep,vU-vec2(0.,e.y)).r;
          vec3 n=normalize(vec3(-dx*3.2,-dy*5.,1.));
          vec3 N=normalize(vX*n.x+vY*n.y+vZ*n.z);
          float key=max(dot(N,normalize(vec3(.42,.72,.56))),0.);
          float fill=max(dot(N,normalize(vec3(-.7,.1,.5))),0.);
          float shade=.26+1.02*key+.16*fill;
          shade*=mix(.62,1.,smoothstep(.0,.42,vD));           // chetlari o'z soyasida
          shade*=mix(.8,1.06,smoothstep(.0,.9,vU.y));         // nur yuqoridan
          vec3 col=c.rgb*shade;
          // Orqadagi oniks nuri chetlarni oltin yoritadi
          col+=vec3(.92,.62,.3)*smoothstep(.2,.03,vD)*.09;
          col*=mix(.2,1.,uFocus);
          col=mix(vec3(dot(col,vec3(.3,.59,.11))),col,1.06);
          gl_FragColor=vec4(col,1.);
          #include <colorspace_fragment>
        }`,
      alphaToCoverage: !mobile, side: THREE.DoubleSide, toneMapped: false,
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, PH + hh / 2 - .012, MZ);
    m.castShadow = true;
    m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: .5 });
    m.userData.phase = i * 2.1; m.userData.focus = 1; m.userData.uFocus = uFocus;
    scene.add(m); mannequins.push(m); mirrored.push(m);

    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(PR, PR, PH, 64), matPlinth);
    plinth.position.set(x, PH / 2, MZ); plinth.castShadow = true; plinth.receiveShadow = true; scene.add(plinth); mirrored.push(plinth);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(PR + .004, PR + .004, .016, 64), matBrass);
    band.position.set(x, PH - .012, MZ); scene.add(band); mirrored.push(band);
    // Taglik ostidan chiqqan oltin halqa nur
    const under = new THREE.Mesh(new THREE.TorusGeometry(PR - .02, .007, 8, 64), lightMat('#ffcf8e', 2));
    under.rotation.x = Math.PI / 2; under.position.set(x, .012, MZ); scene.add(under);
    glow(PR * 3.6, PR * 3.6, x, .014, MZ, 0, -Math.PI / 2, .14);
    blob(.72, .4, x, PH + .004, MZ + .03, .82);

    const lamp = new THREE.Mesh(new THREE.CircleGeometry(.05, 24), lightMat('#fff0d4', 3));
    lamp.rotation.x = Math.PI / 2; lamp.position.set(x, H - .01, MZ); scene.add(lamp);
  });
  const manSpot = new THREE.SpotLight('#ffe9c9', mobile ? 34 : 50, 12, .62, .85, 1.5);
  manSpot.position.set(.8, H - .2, 2.6); manSpot.target.position.set(0, .7, MZ);
  if (!mobile) {
    manSpot.castShadow = true; manSpot.shadow.mapSize.set(1536, 1536); manSpot.shadow.bias = -.0006; manSpot.shadow.radius = 6;
    manSpot.shadow.camera.near = 1; manSpot.shadow.camera.far = 11;
  }
  scene.add(manSpot, manSpot.target);

  /* --- o'ng devor: lak fonda jez javon, har juft poyabzal alohida yoritilgan --- */
  const SZ = 2.2;                              // javon markazi
  const shelfGap = P ? .94 : 1.3;
  const shelfY = [.72, 1.42, 2.12];
  shelfY.forEach(y => {
    box(.34, .022, shelfGap * 2 + 1, matBrass, 6.83, y, SZ, true);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(.01, .008, shelfGap * 2 + .9), lightMat('#ffd9a2', 1.5));
    strip.position.set(6.66, y - .016, SZ); scene.add(strip);
  });
  const shoeTex = await Promise.all(cfg.shoes.slice(0, 9).map(s => load(s.img)));
  shoeTex.forEach((t, i) => {
    const y = shelfY[Math.floor(i / 3)], z = SZ + (i % 3 - 1) * shelfGap;
    const asp = t.image.width / t.image.height, w = P ? .6 : .72, h = w / asp;
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, alphaTest: .35, toneMapped: false, side: THREE.DoubleSide }));
    p.rotation.y = -Math.PI / 2 + .1; p.position.set(6.8, y + .012 + h / 2, z); scene.add(p);
    glow(1.2, .78, 6.985, y + .27, z, -Math.PI / 2, 0, .1);
    blob(.26, .78, 6.82, y + .014, z, .7);
  });
  const shoeSpot = new THREE.SpotLight('#ffe7c4', mobile ? 7 : 10, 8, .72, 1, 1.5);
  shoeSpot.position.set(3.6, H - .3, SZ); shoeSpot.target.position.set(6.9, 1.4, SZ);
  scene.add(shoeSpot, shoeSpot.target);

  /* --- polda aks: sahnaning ko'zgu nusxasi --- */
  mirrored.forEach(o => {
    const c = o.clone();
    c.scale.y *= -1; c.position.y *= -1; c.castShadow = false; c.receiveShadow = false;
    scene.add(c); if (mannequins.includes(o)) o.userData.twin = c;
  });

  /* --- kamera yo'li: kirish, umumiy reja, uchta maneken, javon, nosimmetrik yakun --- */
  const stops = P ? [
    { p: [0, 1.72, 9.55], l: [0, 1.62, 6] },
    { p: [0, 1.5, 7.3], l: [0, 1.24, MZ] },
    { p: [0, 1.38, 5.1], l: [0, 1.0, MZ] },
    { p: [-MX, 1.3, 1.35], l: [-MX, .82, MZ] },
    { p: [0, 1.3, 1.35], l: [0, .82, MZ] },
    { p: [MX, 1.3, 1.35], l: [MX, .82, MZ] },
    { p: [1.5, 1.46, SZ], l: [7, .86, SZ] },
    { p: [0, 1.38, 5.1], l: [0, 1.0, MZ] },
  ] : [
    { p: [0, 1.74, 9.45], l: [0, 1.75, 6] },
    { p: [0, 1.6, 7.6], l: [0, 1.5, MZ] },
    { p: [0, 1.36, 4.8], l: [-.95, 1.42, MZ] },
    { p: [-MX + .7, 1.3, 1.4], l: [-MX + .7, 1.16, MZ] },
    { p: [.7, 1.3, 1.4], l: [.7, 1.16, MZ] },
    { p: [MX + .7, 1.3, 1.4], l: [MX + .7, 1.16, MZ] },
    { p: [2.4, 1.42, SZ - .85], l: [7, 1.42, SZ - .85] },
    { p: [0, 1.36, 4.8], l: [-.95, 1.42, MZ] },
  ];
  const curveP = new THREE.CatmullRomCurve3(stops.map(s => new THREE.Vector3(...s.p)), false, 'catmullrom', .42);
  const curveL = new THREE.CatmullRomCurve3(stops.map(s => new THREE.Vector3(...s.l)), false, 'catmullrom', .42);
  const N = stops.length - 1;
  const ease = t => { const e = Math.min(1, Math.max(0, (t - .2) / .6)); return e * e * e * (e * (e * 6 - 15) + 10); };

  let progress = 0, active = -1, smooth = 0;
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  const lookPos = new THREE.Vector3(), camPos = new THREE.Vector3();

  function setProgress(p) { progress = Math.max(0, Math.min(1, p)); }
  function stopFloat(pp) { const x = pp * N, i = Math.min(N - 1, Math.floor(x)); return i + ease(x - i); }

  let hover = -1;
  function applyFocus() {
    mannequins.forEach((m, i) => {
      m.userData.focus = active >= 3 && active <= 5 ? (active - 3 === i ? 1 : 0) : (hover < 0 || hover === i ? 1 : .42);
    });
  }
  function setActive(idx) {
    if (idx === active) return;
    active = idx; applyFocus();
  }
  // Ekrandagi nuqta qaysi manekenga tushadi: -1 hech qaysi
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function pick(x, y) {
    ndc.set(x, y); ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(mannequins, false)[0];
    if (!hit) return -1;
    return Math.abs(hit.uv.x - .5) < .46 ? mannequins.indexOf(hit.object) : -1;
  }

  function resize(w, h) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? 56 : 42;
    camera.updateProjectionMatrix();
  }

  let visible = true, t0 = performance.now(), frames_n = 0, tFps = t0;
  const t = { v: 0 };
  function tick(now) {
    requestAnimationFrame(tick);
    if (!visible) return;
    const dt = Math.min(.05, (now - t0) / 1000); t0 = now; t.v += dt;
    smooth += (progress - smooth) * (1 - Math.pow(.0009, dt));
    const u = stopFloat(smooth) / N;
    curveP.getPoint(u, camPos); curveL.getPoint(u, lookPos);
    mouse.sx += (mouse.x - mouse.sx) * .05; mouse.sy += (mouse.y - mouse.sy) * .05;
    const mx = mouse.sx * .1, my = mouse.sy * .05;
    camera.position.set(camPos.x + mx, camPos.y - my, camPos.z);
    camera.lookAt(lookPos.x + mx * .35, lookPos.y - my * .35, lookPos.z);

    // Eshik: birinchi bekatga yetguncha ko'tariladi, keyin chizilmaydi
    const lift = Math.min(1, Math.max(0, (stopFloat(smooth) - .04) / .72));
    door.position.y = H * 1.04 * lift * lift * (3 - 2 * lift);
    door.visible = lift < 1;
    mannequins.forEach(m => {
      const f = m.userData.uFocus;
      f.value += (m.userData.focus - f.value) * .08;
      // Aylanadigan taglikdagidek sekin burilish
      // Kameraga asosan yuzlanadi: yon burchakda plakatdek qiyshaymaydi. Qoldiq burilish hajmni ko'rsatadi
      const face = Math.atan2(camera.position.x - m.position.x, camera.position.z - m.position.z) * .84;
      const ry = face + Math.sin(t.v * .32 + m.userData.phase) * .07;
      m.rotation.y = ry; if (m.userData.twin) m.userData.twin.rotation.y = ry;
    });
    renderer.render(scene, camera);

    frames_n++;
    if (now - tFps > 1800) {
      const fps = frames_n * 1000 / (now - tFps); frames_n = 0; tFps = now;
      if (fps < 28 && dpr > .85) { dpr = Math.max(.85, dpr - .25); renderer.setPixelRatio(dpr); resize(canvas.clientWidth, canvas.clientHeight); }
    }
  }

  return {
    setProgress, setActive, resize, pick, stopCount: stops.length,
    setHover(i) { if (i !== hover) { hover = i; applyFocus(); } },
    setMouse(x, y) { mouse.x = x; mouse.y = y; },
    setVisible(v) { visible = v; t0 = performance.now(); frames_n = 0; tFps = t0; },
    start() { requestAnimationFrame(tick); },
    renderOnce() { const u = stopFloat(progress) / N; camera.position.copy(curveP.getPoint(u)); camera.lookAt(curveL.getPoint(u)); renderer.render(scene, camera); },
    stopFloat,
    jump(p) { progress = p; smooth = p; },
  };
}
