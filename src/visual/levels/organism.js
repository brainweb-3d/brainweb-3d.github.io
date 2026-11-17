// ORGANISM level: the whole person in everyday situations — a day and night (circadian rhythm & sleep stages),
// keeping the body in balance (temperature & hunger), touching a hot stove (reflex vs pain), and kinds of memory.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries as mergeGeos } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { V, mat, sphere, box, blob, flow, timeline, rand, cyl, dotTexture, taperTube } from '../build.js';
import { setupRealBody, nerveTube } from '../realbody.js';

const B = (en, he) => ({ en, he });
const P = (stage, id, en, he, den, dhe, color, chapters) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters });
const curve = (pts) => new THREE.CatmullRomCurve3(pts);

// ---------------- A day and a night ----------------
function dayScene(stage, { readout, L }) {
  P(stage, 'scn', 'Suprachiasmatic nucleus (SCN)', 'הגרעין העל-מצטלבי (SCN)', 'The body\'s master clock, in the hypothalamus. Light reaching the eyes resets it every day.', 'השעון הראשי של הגוף, בהיפותלמוס. אור שמגיע לעיניים מכוונן אותו מחדש בכל יום.', '#f97316', [11]);
  P(stage, 'pineal', 'Pineal gland', 'בלוטת האצטרובל', 'Releases melatonin in the dark, signalling "night" to the body.', 'משחררת מלטונין בחושך ומאותתת לגוף "לילה".', '#14b8a6', [11]);
  P(stage, 'eyes', 'Eyes', 'עיניים', 'Special light-sensitive ganglion cells send light information straight to the SCN.', 'תאי גנגליון מיוחדים הרגישים לאור שולחים מידע על אור ישירות ל-SCN.', '#2563eb', [6, 11]);
  P(stage, 'brain', 'Brain', 'מוח', 'During sleep the brain cycles through NREM stages 1–4 and REM sleep about every 90 minutes.', 'בזמן שינה המוח עובר במחזורים בין שלבי NREM ‏1–4 ושנת REM, בערך כל 90 דקות.', '#f2b8c6', [11]);
  const live = { group: null, scn: [], pineal: [], lightPath: null, melPath: null };
  const ready = setupRealBody(stage, { skin: 0.28, skeleton: 0.12, organs: ['eye'], brain: 'regions', regions: ['hypothalamus', 'pineal'], brainOpacity: 0.3 }).then((rb) => {
    live.group = rb.group;
    rb.regionMeshes.hypothalamus?.forEach((m) => stage.tag(m, 'scn'));
    rb.regionMeshes.pineal?.forEach((m) => stage.tag(m, 'pineal'));
    rb.regionMeshes._rest?.forEach((m) => stage.tag(m, 'brain'));
    ['eye|left', 'eye|right'].forEach((k) => rb.body.meshes[k] && stage.tag(rb.body.meshes[k], 'eyes'));
    live.scn = rb.regionMeshes.hypothalamus || [];
    live.pineal = rb.regionMeshes.pineal || [];
    const eye = new THREE.Box3().setFromObject(rb.body.meshes['eye|left']).getCenter(V());
    const hyp = rb.region('hypothalamus').center, pin = rb.region('pineal').center;
    live.lightPath = flow(stage, curve([eye, eye.clone().lerp(hyp, 0.5).add(V(0, -0.05, 0)), hyp]), { color: '#fde047', count: 6, size: 0.14, speed: 0.8, parent: rb.group });
    live.melPath = flow(stage, curve([pin, rb.vertebra('C2').add(V(0, 0, 0.8)), rb.vertebra('T3').add(V(0.2, 0, 1.2))]), { color: '#14b8a6', count: 12, size: 0.25, speed: 0.3, parent: rb.group });
    stage.resetView();
  });
  // the bed (owner, 2026-11-15: better-looking models): a wooden frame with a headboard, a mattress, a pillow, a blanket
  const bed = new THREE.Group();
  const frame = new THREE.Mesh(new RoundedBoxGeometry(6.4, 0.9, 19.4, 3, 0.2), mat('#8b5e3c', { rough: 0.7 })); frame.position.y = 0.45; bed.add(frame);
  const head = new THREE.Mesh(new RoundedBoxGeometry(6.4, 3.4, 0.4, 3, 0.18), mat('#7c4f2e', { rough: 0.7 })); head.position.set(0, 1.7, -9.6); bed.add(head);
  const mattress = new THREE.Mesh(new RoundedBoxGeometry(6.0, 1.3, 19, 4, 0.45), mat('#f1f5f9', { rough: 0.9 })); mattress.position.y = 1.55; bed.add(mattress);
  const pillow = new THREE.Mesh(new RoundedBoxGeometry(4.2, 0.8, 2.2, 4, 0.38), mat('#e0e7ff', { rough: 0.9 })); pillow.position.set(0, 2.5, -8.0); bed.add(pillow);
  const blanket = new THREE.Mesh(new RoundedBoxGeometry(6.3, 0.35, 10.5, 3, 0.15), mat('#6366f1', { rough: 0.85, opacity: 0.55 })); blanket.material.depthWrite = false; blanket.position.set(0, 2.5, 3.6); bed.add(blanket);
  bed.position.y = 0.9; bed.visible = false; stage.root.add(bed);
  // the sky: deeper blue overhead, paler at the horizon (vertex colours, tinted by the time of day)
  const skyGeo = new THREE.SphereGeometry(70, 32, 16), skyCol = new Float32Array(skyGeo.attributes.position.count * 3);
  for (let i = 0; i < skyGeo.attributes.position.count; i++) { const y = skyGeo.attributes.position.getY(i) / 70, k = 0.55 + 0.45 * (1 - Math.max(0, y)); skyCol.set([k, k, k + (1 - k) * 0.3], i * 3); }
  skyGeo.setAttribute('color', new THREE.BufferAttribute(skyCol, 3));
  const sky = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ color: '#bfe3ff', side: THREE.BackSide, vertexColors: true }));
  stage.root.add(sky);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(16, 48), mat('#64748b', { rough: 0.95, opacity: 0.55 })); floor.material.depthWrite = false; floor.rotation.x = -Math.PI / 2; floor.position.y = -0.02; stage.root.add(floor);
  const halo = (color, size) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTexture(), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sp.scale.setScalar(size); return sp; };
  const sun = new THREE.Mesh(new THREE.SphereGeometry(2.2, 32, 20), new THREE.MeshBasicMaterial({ color: '#fffbe6', toneMapped: false }));
  sun.add(halo('#fde047', 11), halo('#fb923c', 6));
  const moonGeo = new THREE.SphereGeometry(1.5, 32, 20), mp = moonGeo.attributes.position, mv = V();
  const craters = [[0.5, 0.4, 0.75, 0.35], [-0.6, 0.1, 0.8, 0.3], [0.1, -0.6, 0.8, 0.25], [-0.2, 0.7, 0.68, 0.2]].map(([x, y, z, rr]) => ({ c: V(x, y, z).normalize(), rr }));
  const moonCol = new Float32Array(mp.count * 3);
  for (let i = 0; i < mp.count; i++) { mv.fromBufferAttribute(mp, i).normalize(); let k = 1; for (const cr of craters) { const d = mv.distanceTo(cr.c); if (d < cr.rr) k = Math.min(k, 0.72 + 0.28 * (d / cr.rr) ** 2); } moonCol.set([k * 0.9, k * 0.92, k * 0.96], i * 3); }
  moonGeo.setAttribute('color', new THREE.BufferAttribute(moonCol, 3));
  const moon = new THREE.Mesh(moonGeo, new THREE.MeshBasicMaterial({ color: '#ffffff', vertexColors: true }));
  moon.add(halo('#c7d2fe', 6));
  stage.root.add(sun, moon);
  let hour = 7, playing = false, screen = false, lying = 0, adenosine = 0.1, caffeine = 0;
  const day = new THREE.Color('#7fb8e6'), night = new THREE.Color('#0b1530'), tmp = new THREE.Color();
  const asleep = (h) => h >= 23 || h < 7;
  const stageAt = (h) => {
    const mins = ((h - 23 + 24) % 24) * 60;
    const cyc = Math.floor(mins / 90), m = mins % 90;
    const remLen = 10 + cyc * 6, deep = Math.max(0, 30 - cyc * 8);
    if (cyc === 0 && m < 8) return L('NREM stage 1 (light)', 'NREM שלב 1 (קלה)');
    if (m < 25) return L('NREM stage 2', 'NREM שלב 2');
    if (m < 25 + deep) return L('NREM stages 3–4 (deep, slow waves)', 'NREM שלבים 3–4 (עמוקה, גלים איטיים)');
    if (m < 90 - remLen) return L('NREM stage 2', 'NREM שלב 2');
    return L('REM sleep (dreaming)', 'שנת REM (חלומות)');
  };
  stage.onUpdate((dt) => {
    if (playing) { hour = (hour + dt) % 24; caffeine = Math.max(0, caffeine - dt / 6); } // caffeine mostly gone in ~6 h
    // sleep pressure: adenosine builds up while awake and is cleared during sleep
    if (playing) adenosine = THREE.MathUtils.clamp(adenosine + (asleep(hour) ? -dt / 8 : dt / 16), 0, 1);
    const feltSleepy = Math.max(0, adenosine - caffeine * 0.7);
    const sunUp = Math.sin(((hour - 6) / 24) * Math.PI * 2);
    tmp.copy(night).lerp(day, THREE.MathUtils.clamp(sunUp * 1.5 + 0.5, 0, 1));
    sky.material.color.copy(tmp);
    const a = ((hour - 6) / 24) * Math.PI * 2;
    sun.position.set(Math.cos(a) * -40, Math.sin(a) * 30 + 8, -45);
    moon.position.set(Math.cos(a) * 40, -Math.sin(a) * 30 + 8, -45);
    const sl = asleep(hour);
    lying += ((sl ? 1 : 0) - lying) * Math.min(1, dt * 2);
    if (live.group) {
      // lying down: rotate about the hips and rest on the bed
      live.group.rotation.x = -lying * Math.PI / 2;
      live.group.position.set(0, lying * 4.2, lying * 8.6);
    }
    bed.visible = lying > 0.5;
    const light = sunUp > 0 || (screen && !sl);
    live.lightPath?.setActive(light);
    // melatonin: rises after ~21:00 in darkness, peaks ~3:00, gone by ~7:00; bright light suppresses it
    const fromNine = (hour - 21 + 24) % 24;
    let mel = fromNine < 10 ? Math.sin((fromNine / 10) * Math.PI) : 0;
    if (light) mel *= 0.15;
    live.melPath?.setActive(mel > 0.25);
    live.pineal.forEach((m) => m.material.emissive.set('#14b8a6').multiplyScalar(mel));
    live.scn.forEach((m) => m.material.emissive.set('#f97316').multiplyScalar(light ? 0.8 : 0.1));
    const hh = Math.floor(hour), mm = Math.floor((hour % 1) * 60);
    readout(`🕒 <b>${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}</b> · ${sl ? `😴 ${stageAt(hour)}` : `🙂 ${L('awake', 'ער')}`}<br>${L('Melatonin', 'מלטונין')}<div class="vbar"><span style="width:${Math.round(mel * 100)}%;background:#14b8a6"></span></div>${L('Sleep pressure (adenosine)', 'לחץ שינה (אדנוזין)')}<div class="vbar"><span style="width:${Math.round(adenosine * 100)}%;background:#64748b"></span></div>${L('Feeling sleepy', 'תחושת ישנוניות')}<div class="vbar"><span style="width:${Math.round(feltSleepy * 100)}%;background:#a855f7"></span></div>${caffeine > 0.05 ? '☕ ' + L('caffeine is hiding the adenosine signal', 'הקפאין מסתיר את אות האדנוזין') : ''}`);
  });
  return {
    ready,
    home: { pos: V(14, 12, 22), target: V(0, 8, 2) },
    actions: [
      { icon: '⏯️', label: B('Play a day (1 s = 1 hour)', 'הפעלת יממה (שנייה = שעה)'), toggle: true, caption: B('Watch 24 hours pass. In daylight the SCN is reset by light; in the evening the pineal gland releases melatonin; at night sleep cycles every ~90 minutes, with more deep sleep early and more REM toward morning.', 'צפו ב-24 שעות. באור יום ה-SCN מתכוונן לפי האור; בערב בלוטת האצטרובל משחררת מלטונין; בלילה השינה עוברת מחזורים של כ-90 דקות, עם יותר שינה עמוקה בתחילת הלילה ויותר REM לקראת הבוקר.'), run: (on) => { playing = on; } },
      { icon: '🌙', label: B('Jump to 2 a.m.', 'קפיצה ל-2 בלילה'), caption: B('Deep in the night: melatonin is high and the sleeper moves through NREM and REM cycles.', 'באמצע הלילה: המלטונין גבוה והישן עובר בין מחזורי NREM ו-REM.'), run: () => { hour = 2; } },
      { icon: '☀️', label: B('Jump to 9 a.m.', 'קפיצה ל-9 בבוקר'), run: () => { hour = 9; } },
      { icon: '📱', label: B('Bright screen in the evening', 'מסך בהיר בערב'), toggle: true, caption: B('Light at night (especially blue light from screens) reaches the SCN and suppresses melatonin — which can delay sleep.', 'אור בלילה (במיוחד אור כחול ממסכים) מגיע ל-SCN ומדכא את המלטונין — וזה עלול לדחות את השינה.'), run: (on) => { screen = on; if (on && !asleep(hour) && hour < 19) hour = 21.5; } },
      { icon: '☕', label: B('Coffee at 4 p.m.', 'קפה ב-4 אחר הצהריים'), caption: B('Two clocks decide when you sleep: the SCN body clock, and sleep pressure from adenosine, which piles up the longer you are awake. Caffeine blocks adenosine receptors, so you feel less sleepy, but the adenosine is still there. The body clears only half of the caffeine in about 5 hours (its half-life), so an afternoon coffee can still be working at bedtime. Press Play to watch.', 'שני שעונים קובעים מתי ישנים: השעון הביולוגי ב-SCN, ולחץ השינה מאדנוזין, שמצטבר ככל שנשארים ערים יותר. קפאין חוסם את קולטני האדנוזין, ולכן מרגישים פחות ישנוניים, אבל האדנוזין עדיין שם. ההגוף מפנה רק מחצית מהקפאין בתוך כ-5 שעות (זמן מחצית החיים שלו), ולכן קפה אחר הצהריים עדיין יכול לפעול בשעת השינה. לחצו על הפעלה כדי לצפות.'), run: () => { hour = 16; caffeine = 1; adenosine = Math.max(adenosine, 0.55); } },
    ],
  };
}

// ---------------- Homeostasis ----------------
function homeoScene(stage, { readout, L }) {
  P(stage, 'hypothalamus', 'Hypothalamus', 'היפותלמוס', 'The body\'s thermostat and hunger/thirst centre. It compares the body\'s state to a set point and starts corrections.', 'התרמוסטט של הגוף ומרכז הרעב והצמא. הוא משווה את מצב הגוף לנקודת קביעה ומפעיל תיקונים.', '#f97316', [9]);
  P(stage, 'stomach', 'Stomach', 'קיבה', 'An empty stomach releases ghrelin (a "hunger" hormone); a full stomach and intestines release satiety signals such as CCK.', 'קיבה ריקה משחררת גרלין (הורמון "רעב"); קיבה ומעיים מלאים משחררים אותות שובע כמו CCK.', '#fb923c', [9]);
  P(stage, 'brain', 'Brain', 'מוח', 'Other brain areas turn hypothalamic signals into feelings (hungry, cold) and behaviour (eat, put on a coat).', 'אזורי מוח אחרים הופכים את אותות ההיפותלמוס לתחושות (רעב, קור) ולהתנהגות (לאכול, ללבוש מעיל).', '#f2b8c6', [9]);
  const live = { group: null, skins: [], hyp: [], stomach: null };
  // the hunger/satiety signals are created when the body has loaded; until then these stubs do nothing
  let ghrelin = { setActive() {}, points: { visible: false } }, satiety = { setActive() {} };
  const ready = setupRealBody(stage, { skin: 0.3, skeleton: 0.12, organs: ['stomach', 'gut', 'liver'], brain: 'regions', regions: ['hypothalamus'], brainOpacity: 0.25 }).then((rb) => {
    live.group = rb.group;
    live.skins = Object.entries(rb.body.meshes).filter(([k]) => k.startsWith('skin')).map(([, m]) => m);
    live.hyp = rb.regionMeshes.hypothalamus || [];
    live.hyp.forEach((m) => stage.tag(m, 'hypothalamus'));
    rb.regionMeshes._rest?.forEach((m) => stage.tag(m, 'brain'));
    live.stomach = rb.organ('stomach');
    stage.tag(live.stomach.pivot, 'stomach');
    const hyp = rb.region('hypothalamus').center, st = live.stomach.center, gut = rb.organ('gut').center;
    ghrelin = flow(stage, curve([st, rb.vertebra('T6').add(V(0.4, 0, 1.0)), rb.vertebra('C4').add(V(0.3, 0, 0.7)), hyp]), { color: '#f97316', count: 12, size: 0.3, speed: 0.3 });
    satiety = flow(stage, curve([gut, rb.vertebra('T8').add(V(-0.4, 0, 1.0)), rb.vertebra('C4').add(V(-0.3, 0, 0.7)), hyp]), { color: '#22c55e', count: 12, size: 0.3, speed: 0.3 });
    ghrelin.setActive(false); satiety.setActive(false);
    stage.resetView();
  });
  const drops = [];
  for (let i = 0; i < 40; i++) { const d = sphere(0.08, '#38bdf8', { opacity: 0.85 }); d.visible = false; stage.root.add(d); drops.push(d); }
  let env = 0, T = 37, hunger = 0.2, eating = 0, setPt = 37;
  const tl = timeline(stage);
  stage.onUpdate((dt, t) => {
    // Environment pushes temperature; the hypothalamus fights back once T leaves the set point
    const err = T - setPt;
    const sweat = Math.max(0, err - 0.15), shiver = Math.max(0, -err - 0.15);
    T += (env * 0.35 - sweat * 1.2 + shiver * 1.2) * dt;
    if (env === 0 && setPt === 37) T += (37 - T) * dt * 0.3;
    drops.forEach((d, i) => {
      if (sweat > 0.05) {
        if (!d.visible || d.position.y < 6) { d.visible = true; d.position.set(rand(-1.6, 1.6), rand(9, 14), rand(0.9, 1.3)); }
        d.position.y -= dt * (2 + (i % 5));
      } else d.visible = false;
    });
    if (live.group) live.group.position.x = shiver > 0.05 ? Math.sin(t * 60) * 0.06 : 0;
    const flush = THREE.MathUtils.clamp(err * 1.5, -1, 1);
    live.skins.forEach((m) => m.material.emissive.set(flush > 0 ? '#ef4444' : '#3b82f6').multiplyScalar(Math.abs(flush) * 0.35));
    live.hyp.forEach((m) => m.material.emissive.set('#f97316').multiplyScalar(Math.min(1, Math.abs(err) * 2 + (ghrelin.points.visible ? 0.6 : 0))));
    hunger = THREE.MathUtils.clamp(hunger + (eating > 0 ? -dt * 0.4 : dt * 0.004), 0, 1);
    eating = Math.max(0, eating - dt);
    live.stomach?.pivot.scale.setScalar(1 + (1 - hunger) * 0.18);
    const status = sweat > 0.05 ? L('sweating + blood vessels in the skin widen (red) to lose heat', 'הזעה + כלי הדם בעור מתרחבים (אדום) כדי לאבד חום') : shiver > 0.05 ? L('shivering + skin vessels narrow (blue) to keep heat', 'רעד + כלי הדם בעור מתכווצים (כחול) כדי לשמור חום') : L('at the set point', 'בנקודת הקביעה');
    readout(`🌡️ <b>${T.toFixed(1)} °C</b> (${L('set point', 'נקודת קביעה')} ${setPt} °C) — ${status}<br>🍽️ ${L('Hunger', 'רעב')}<div class="vbar"><span style="width:${Math.round(hunger * 100)}%;background:#f97316"></span></div>`);
  });
  return {
    ready,
    home: { pos: V(10, 11, 20), target: V(0, 10, 0) },
    actions: [
      { icon: '🥵', label: B('A hot day', 'יום חם'), radio: true, caption: B('Core temperature starts to rise above 37 °C. The hypothalamus responds: sweating and wider skin blood vessels release heat — negative feedback brings it back.', 'טמפרטורת הגוף מתחילה לעלות מעל 37°C. ההיפותלמוס מגיב: הזעה והרחבת כלי הדם בעור משחררות חום — משוב שלילי מחזיר אותה.'), run: () => { env = 1; } },
      { icon: '🥶', label: B('A cold day', 'יום קר'), radio: true, caption: B('Temperature falls. The hypothalamus triggers shivering (muscles make heat) and narrows skin vessels. We also change behaviour — find a coat!', 'הטמפרטורה יורדת. ההיפותלמוס מפעיל רעד (השרירים מייצרים חום) ומצר את כלי הדם בעור. אנחנו גם משנים התנהגות — מחפשים מעיל!'), run: () => { env = -1; } },
      { icon: '😌', label: B('Mild weather', 'מזג אוויר נעים'), radio: true, run: () => { env = 0; } },
      { icon: '🤒', label: B('A fever', 'חום (קדחת)'), toggle: true, caption: B('During an infection, immune signals (prostaglandins) raise the hypothalamus’s set point to about 39 °C. Now 37 °C feels "too cold": you shiver and feel chilly while your temperature climbs. When the fever breaks, the set point drops and you sweat. Fever medicines like ibuprofen work by blocking prostaglandins.', 'בזמן זיהום, אותות של מערכת החיסון (פרוסטגלנדינים) מעלים את נקודת הקביעה של ההיפותלמוס לכ-39°C. עכשיו 37°C מרגיש "קר מדי": רועדים ומרגישים צמרמורת בזמן שהחום עולה. כשהחום יורד, נקודת הקביעה יורדת ומזיעים. תרופות נגד חום כמו איבופרופן פועלות על ידי חסימת הפרוסטגלנדינים.'), run: (on) => { setPt = on ? 39 : 37; } },
      { icon: '⏰', label: B('Skip a meal', 'דילוג על ארוחה'), caption: B('With an empty stomach, ghrelin travels in the blood to the hypothalamus → we feel hungry.', 'כשהקיבה ריקה, הגרלין נע בדם להיפותלמוס ← אנחנו מרגישים רעב.'), run: () => { hunger = 0.85; satiety.setActive(false); ghrelin.setActive(true); } },
      { icon: '🍝', label: B('Eat', 'לאכול'), caption: B('Food stretches the stomach and reaches the intestines → satiety signals (stretch, CCK, insulin; long-term leptin from fat) tell the hypothalamus to stop eating.', 'האוכל מותח את הקיבה ומגיע למעיים ← אותות שובע (מתיחה, CCK, אינסולין; ולטווח ארוך לפטין מרקמת השומן) אומרים להיפותלמוס להפסיק לאכול.'), run: () => { eating = 2.2; ghrelin.setActive(false); satiety.setActive(true); tl.later(4, () => satiety.setActive(false)); } },
    ],
  };
}

// ---------------- Touching a hot stove ----------------
function stoveScene(stage, { readout, L }) {
  P(stage, 'brain', 'Brain (somatosensory cortex)', 'מוח (קליפה סומטו-סנסורית)', 'Pain is felt only when the signal reaches the brain — AFTER the reflex has already moved the hand.', 'הכאב מורגש רק כשהאות מגיע למוח — אחרי שהרפלקס כבר הזיז את היד.', '#f2b8c6', [7]);
  P(stage, 'receptor', 'Pain & heat receptors (nociceptors)', 'קולטני כאב וחום (נוציספטורים)', 'Free nerve endings in the skin that respond to damaging heat.', 'קצות עצב חופשיים בעור שמגיבים לחום מזיק.', '#ef4444', [7]);
  P(stage, 'sensory', 'Sensory neuron', 'נוירון תחושתי', 'Carries the alarm from the hand into the spinal cord through the dorsal root.', 'מוביל את האזעקה מהיד לחוט השדרה דרך השורש הגבי.', '#06b6d4', [7, 8]);
  P(stage, 'cord', 'Spinal cord & interneuron', 'חוט השדרה ונוירון ביניים', 'Inside the cord an interneuron passes the message directly to motor neurons — no brain needed. It also sends the message up to the brain.', 'בתוך חוט השדרה נוירון ביניים מעביר את המסר ישירות לנוירונים מוטוריים — בלי צורך במוח. הוא גם שולח את המסר למעלה אל המוח.', '#facc15', [2, 8]);
  P(stage, 'motor', 'Motor neuron', 'נוירון מוטורי', 'Leaves the cord through the ventral root and makes the arm muscle contract.', 'יוצא מחוט השדרה דרך השורש הגחוני וגורם לשריר הזרוע להתכווץ.', '#ef4444', [8]);
  P(stage, 'muscle', 'Biceps muscle', 'שריר הדו-ראשי', 'Contracts and pulls the hand away from the heat.', 'מתכווץ ומושך את היד מהחום.', '#f87171', [8]);
  P(stage, 'stove', 'Hot stove', 'כיריים חמות', 'Ouch!', 'אאוץ\'!', '#ef4444', []);
  const reach = { sx: -0.85, sz: 0.25, ex: -0.5 }, away = { sx: -0.2, sz: 0.5, ex: -1.9 };
  const tl = timeline(stage);
  let k = 0, kT = 0, msg = '', cut = false;
  let rebuild = () => {}, flows = { s: null, m: null, u: null }, pose = () => {};
  // no skin here: the skin is one rigid shell and cannot bend with the moving arm
  const ready = setupRealBody(stage, { skin: 0, skeleton: 0.6, brain: 'whole', brainOpacity: 0.5 }).then((rb) => {
  const body = rb;
  stage.tag(rb.brain, 'brain');
  stage.add(nerveTube(rb.cord, 0.11, '#facc15'), 'cord');
  const arm = rb.limbs.L;
  pose = (p) => { arm.shoulder.rotation.x = p.sx; arm.shoulder.rotation.z = p.sz; arm.elbow.rotation.x = p.ex; };
  pose(reach);
  const hand0 = body.pt('handL');
  // a kitchen cooker (owner, 2026-11-15: better-looking models): a cabinet with an oven door and knobs, a dark glass
  // top, the hot ring as a glowing coil, and heat shimmering up from it
  const stove = new THREE.Group();
  const H = hand0.y - 0.75; // the cabinet stands on the floor, its top just under the hand
  const cab = new THREE.Mesh(new RoundedBoxGeometry(3.4, H, 3.2, 3, 0.12), mat('#e5e7eb', { rough: 0.5 })); cab.position.y = -H / 2 - 0.15; stove.add(cab);
  const door = new THREE.Mesh(new RoundedBoxGeometry(2.8, Math.min(2.6, H * 0.45), 0.1, 2, 0.05), mat('#1f2937', { rough: 0.2, metal: 0.3 })); door.position.set(0, -H * 0.42, 1.62); stove.add(door);
  const handle = cyl(0.05, 0.05, 2.4, '#94a3b8', { metal: 0.7, rough: 0.3 }); handle.rotation.z = Math.PI / 2; handle.position.set(0, -H * 0.42 + Math.min(1.3, H * 0.22) + 0.15, 1.75); stove.add(handle);
  for (const x of [-1.1, -0.4, 0.4, 1.1]) { const kn = cyl(0.13, 0.13, 0.14, '#334155', { rough: 0.4 }); kn.rotation.x = Math.PI / 2; kn.position.set(x, -0.45, 1.66); stove.add(kn); }
  const top = new THREE.Mesh(new RoundedBoxGeometry(3.5, 0.18, 3.3, 3, 0.06), mat('#0f172a', { rough: 0.15, metal: 0.2 })); top.position.y = 0.0; stove.add(top);
  const coilPts = []; for (let i = 0; i <= 160; i++) { const a = i * 0.24, rr = 0.15 + (i / 160) * 0.72; coilPts.push(V(Math.cos(a) * rr, 0.11, Math.sin(a) * rr)); }
  const plate = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coilPts), 400, 0.045, 6, false), mat('#ef4444', { emissive: '#dc2626', rough: 0.4 }));
  stove.add(plate);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTexture(), color: '#f97316', transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending })); glow.scale.set(2.6, 1.0, 1); glow.position.y = 0.25; stove.add(glow);
  const wisps = Array.from({ length: 6 }, (_, i) => { const w = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTexture(), color: '#fdba74', transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending })); w.userData.ph = i / 6; w.userData.x = Math.cos(i * 2.1) * 0.4; w.userData.z = Math.sin(i * 2.1) * 0.4; stove.add(w); return w; });
  stage.onUpdate((dt, t) => wisps.forEach((w) => { const u = (t * 0.35 + w.userData.ph) % 1; w.position.set(w.userData.x + Math.sin(t * 2 + w.userData.ph * 9) * 0.1, 0.3 + u * 1.6, w.userData.z); w.scale.setScalar(0.5 + u * 0.8); w.material.opacity = 0.3 * (1 - u); }));
  stove.position.set(hand0.x, hand0.y - 0.6, hand0.z);
  stage.add(stove, 'stove');
  // the biceps: a spindle-shaped belly with tendons at both ends, its fibres running lengthwise
  const muscle = new THREE.Group();
  muscle.add(new THREE.Mesh(taperTube([V(0, 0.95, 0), V(0, 0.3, 0.05), V(0, -0.4, 0.06), V(0, -1.0, 0)], 0.3, (t) => 0.25 + 0.75 * Math.sin(Math.PI * t) ** 0.8, '#f87171', undefined, 30, 14).geometry, mat('#f87171', { rough: 0.55 })));
  for (const [a, b] of [[V(0, 0.95, 0), V(0, 1.35, -0.05)], [V(0, -1.0, 0), V(0, -1.35, 0.05)]]) muscle.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, a.distanceTo(b), 8).translate(0, 0, 0).applyMatrix4(new THREE.Matrix4().compose(a.clone().lerp(b, 0.5), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()), V(1, 1, 1))), mat('#f8fafc', { rough: 0.4 })));
  const fib = []; for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2; fib.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(Math.cos(a) * 0.06, 0.9, Math.sin(a) * 0.06), V(Math.cos(a) * 0.29, 0, Math.sin(a) * 0.29 + 0.03), V(Math.cos(a) * 0.06, -0.95, Math.sin(a) * 0.06)]), 16, 0.012, 4, false)); }
  muscle.add(new THREE.Mesh(mergeGeos(fib), mat('#b91c1c', { rough: 0.6 })));
  muscle.position.set(0, -1.4, 0.35); stage.add(muscle, 'muscle', arm.shoulder);
  const recp = sphere(0.16, '#ef4444', { emissive: '#7f1d1d' }); recp.position.copy(arm.elbow.worldToLocal(body.pt('handL'))); stage.add(recp, 'receptor', arm.elbow);
  // Paths built from the current pose (rebuilt while the arm moves)
  const cordC7 = rb.vertebra('C7');
  const plexus = () => { const sh = body.pt('shoulderL'); return V(Math.abs(sh.x) * 0.62, sh.y - 0.35, sh.z + 0.15); };
  const sensePts = () => [body.pt('handL'), body.pt('wristL'), body.pt('elbowL'), body.pt('shoulderL'), plexus(), cordC7.clone().add(V(0.3, 0, -0.1)), cordC7];
  const motorPts = () => [cordC7, cordC7.clone().add(V(0.3, 0, 0.1)), plexus(), body.pt('shoulderL'), arm.shoulder.localToWorld(V(0, -1.4, 0.35))];
  const upPts = [cordC7, ...rb.cord.slice(0, 6).reverse(), rb.cord[0].clone().add(V(0.4, 1.2, 0.2))];
  const sC = curve(sensePts()), mC = curve(motorPts());
  const sTube = nerveTube(sC.points, 0.06, '#06b6d4'), mTube = nerveTube(mC.points, 0.06, '#ef4444');
  stage.add(sTube, 'sensory'); stage.add(mTube, 'motor');
  const sFlow = flow(stage, sC, { color: '#22d3ee', count: 8, size: 0.4, speed: 0.6 });
  const mFlow = flow(stage, mC, { color: '#f87171', count: 8, size: 0.4, speed: 0.6 });
  const uFlow = flow(stage, curve(upPts), { color: '#fde047', count: 8, size: 0.4, speed: 0.35 });
  [sFlow, mFlow, uFlow].forEach((f) => f.setActive(false));
  flows = { s: sFlow, m: mFlow, u: uFlow };
  rebuild = () => {
    for (const [c, tb, fn] of [[sC, sTube, sensePts], [mC, mTube, motorPts]]) {
      fn().forEach((p, i) => c.points[i].copy(p));
      c.updateArcLengths();
      tb.geometry.dispose();
      tb.geometry = new THREE.TubeGeometry(c, 64, 0.06, 8, false);
    }
  };
  stage.resetView();
  });
  stage.onUpdate((dt) => {
    const prev = k;
    k += (kT - k) * Math.min(1, dt * 5);
    if (Math.abs(k - prev) > 1e-4) {
      pose({ sx: THREE.MathUtils.lerp(reach.sx, away.sx, k), sz: THREE.MathUtils.lerp(reach.sz, away.sz, k), ex: THREE.MathUtils.lerp(reach.ex, away.ex, k) });
      rebuild();
    }
    readout(msg);
  });
  const touch = () => {
    tl.clear(); kT = 0;
    msg = `🔥 ${L('Touch! Heat receptors fire…', 'מגע! קולטני החום יורים…')}`;
    flows.s?.setActive(true); stage.focus(['receptor', 'sensory']);
    tl.later(1.2, () => { msg = `⚡ ${L('Spinal cord: interneuron → motor neuron (no brain involved yet)', 'חוט השדרה: נוירון ביניים ← נוירון מוטורי (המוח עוד לא מעורב)')}`; flows.m?.setActive(true); flows.u?.setActive(!cut); stage.focus(['cord', 'motor']); });
    tl.later(2.2, () => { kT = 1; msg = `💪 ${L('Biceps contracts — hand pulled away!', 'הדו-ראשי מתכווץ — היד נמשכת!')}`; stage.focus(['muscle']); flows.s?.setActive(false); });
    tl.later(3.6, () => { if (cut) { msg = `🤚 <b>${L('The hand still pulled away, but NO pain is felt: the message could not get past the injury to the brain.', 'היד עדיין נמשכה, אבל לא מורגש כאב: המסר לא יכול היה לעבור את הפגיעה ולהגיע למוח.')}</b>`; flows.m?.setActive(false); return; } msg = `😖 <b>${L('“OUCH!” — the pain is felt only now, after the hand already moved.', '"אאוץ\'!" — הכאב מורגש רק עכשיו, אחרי שהיד כבר זזה.')}</b>`; stage.focus(['brain']); flows.m?.setActive(false); });
    tl.later(5.5, () => { flows.u?.setActive(false); stage.focus([]); });
  };
  return {
    ready,
    home: { pos: V(17, 14, 7), target: V(1, 11.5, 2) },
    actions: [
      { icon: '🔥', label: B('Touch the hot stove (slow motion)', 'נגיעה בכיריים חמות (הילוך איטי)'), caption: B('A withdrawal reflex: receptor → sensory neuron → spinal cord → motor neuron → muscle. It takes only tens of milliseconds, before the pain message even reaches the brain. (Shown here in slow motion.)', 'רפלקס נסיגה: קולטן ← נוירון תחושתי ← חוט השדרה ← נוירון מוטורי ← שריר. זה לוקח רק עשרות אלפיות שנייה, עוד לפני שהודעת הכאב מגיעה למוח. (מוצג כאן בהילוך איטי.)'), run: touch },
      { icon: '↩️', label: B('Reach out again', 'להושיט שוב את היד'), run: () => { tl.clear(); kT = 0; msg = ''; Object.values(flows).forEach((f) => f?.setActive(false)); } },
      { icon: '🩹', label: B('Spinal cord injury in the neck', 'פגיעה בחוט השדרה בצוואר'), toggle: true, caption: B('Imagine the spinal cord damaged above the level of the arm’s nerves. Touch the stove again: the reflex still works, because it only needs the cord at arm level, but the message can no longer travel up, so the brain feels nothing. This is how doctors test which parts of the cord still work.', 'דמיינו שחוט השדרה נפגע מעל לרמה של עצבי הזרוע. געו שוב בכיריים: הרפלקס עדיין עובד, כי הוא צריך רק את חוט השדרה ברמת הזרוע, אבל המסר כבר לא יכול לעלות, ולכן המוח לא מרגיש דבר. כך רופאים בודקים אילו חלקים של חוט השדרה עדיין עובדים.'), run: (on) => { cut = on; } },
    ],
  };
}

// ---------------- Kinds of memory ----------------
function memoryScene(stage, { readout, L }) {
  P(stage, 'hippocampus', 'Hippocampus', 'היפוקמפוס', 'Turns new experiences and facts into long-term memories (consolidation). Patient H.M., who lost both hippocampi, could no longer form new declarative memories.', 'הופך חוויות ועובדות חדשות לזיכרונות ארוכי טווח (קונסולידציה). המטופל ה.מ., שאיבד את שני ההיפוקמפוסים, לא יכול היה עוד ליצור זיכרונות דקלרטיביים חדשים.', '#22c55e', [12]);
  P(stage, 'amygdala', 'Amygdala', 'אמיגדלה', 'Adds emotional weight — especially fear — so emotional events are remembered strongly.', 'מוסיפה משקל רגשי — במיוחד פחד — ולכן אירועים רגשיים נזכרים היטב.', '#ef4444', [12, 14]);
  P(stage, 'basal', 'Basal ganglia (striatum)', 'הגרעינים הבסיסיים (סטריאטום)', 'Learn habits and procedures through repetition.', 'לומדים הרגלים ונהלים דרך חזרה.', '#3b82f6', [8, 12]);
  P(stage, 'cerebellum', 'Cerebellum', 'מוח קטן', 'Fine-tunes movements; needed for motor skills and simple conditioning (e.g. the eyeblink response).', 'מכוונן תנועות; נחוץ למיומנויות מוטוריות ולהתניה פשוטה (למשל תגובת מצמוץ).', '#e59bb0', [8, 12]);
  P(stage, 'motorCx', 'Motor cortex', 'קליפה מוטורית', 'Plans and sends voluntary movement commands; its maps change with practice.', 'מתכננת ושולחת פקודות תנועה רצוניות; המפות שלה משתנות עם תרגול.', '#f59e0b', [8, 12]);
  P(stage, 'prefrontal', 'Prefrontal cortex', 'קליפת המצח הקדמית', 'Holds information "online" for a short time — working memory.', 'מחזיקה מידע "בזמן אמת" לזמן קצר — זיכרון עבודה.', '#8b5cf6', [12]);
  let hm = false, hippo = [];
  const MAP = { hippocampus: 'hippocampus', amygdala: 'amygdala', basalGanglia: 'basal', cerebellum: 'cerebellum', motor: 'motorCx', frontal: 'prefrontal' };
  const ready = setupRealBody(stage, { skin: 0.14, skeleton: 0.12, organs: [], brain: 'regions', regions: Object.keys(MAP), brainOpacity: 0.2 }).then((rb) => {
    Object.entries(MAP).forEach(([r, id]) => rb.regionMeshes[r]?.forEach((m) => stage.tag(m, id)));
    hippo = rb.regionMeshes.hippocampus || [];
    stage.resetView();
  });
  return {
    ready,
    home: { pos: V(5, 16.4, 5), target: V(0, 15.6, 0) },
    actions: [
      { icon: '📖', label: B('Learn a fact (declarative)', 'לימוד עובדה (דקלרטיבי)'), caption: B('Facts and events ("what I had for breakfast") depend on the hippocampus to be stored, and are later kept in the cortex.', 'עובדות ואירועים ("מה אכלתי בבוקר") תלויים בהיפוקמפוס כדי להישמר, ומאוחר יותר נשמרים בקליפה.'), run: () => { stage.focus(['hippocampus']); readout(hm ? '❌ ' + L('H.M. cannot store it: an hour later the fact is gone.', 'ה.מ. לא יכול לשמור את זה: אחרי שעה העובדה נעלמה.') : '✅ ' + L('Stored, and over time kept in the cortex.', 'נשמר, ועם הזמן נשמר בקליפה.')); } },
      { icon: '🚲', label: B('Learn to ride a bike (procedural)', 'ללמוד לרכוב על אופניים (פרוצדורלי)'), caption: B('Skills and habits rely on the cerebellum, basal ganglia and motor cortex — which is why H.M. could still learn new motor skills.', 'מיומנויות והרגלים נשענים על המוח הקטן, הגרעינים הבסיסיים והקליפה המוטורית — ולכן ה.מ. עדיין יכול היה ללמוד מיומנויות מוטוריות חדשות.'), run: () => { stage.focus(['cerebellum', 'basal', 'motorCx']); readout('✅ ' + (hm ? L('H.M. gets better with practice, even though he does not remember practising.', 'ה.מ. משתפר עם תרגול, למרות שהוא לא זוכר שתרגל.') : L('Learned slowly, by repetition.', 'נלמד לאט, בחזרה.'))); } },
      { icon: '😱', label: B('A frightening moment (emotional)', 'רגע מפחיד (רגשי)'), caption: B('The amygdala tags the event as important and boosts the hippocampus — strong emotional memories, and fear conditioning.', 'האמיגדלה מסמנת את האירוע כחשוב ומחזקת את ההיפוקמפוס — זיכרונות רגשיים חזקים, והתניית פחד.'), run: () => { stage.focus(['amygdala', 'hippocampus']); readout(hm ? '⚠️ ' + L('No memory of the event, but the amygdala can still keep a fear response to it.', 'אין זיכרון של האירוע, אבל האמיגדלה עדיין יכולה לשמור תגובת פחד אליו.') : '✅ ' + L('Remembered vividly.', 'נזכר בבהירות.')); } },
      { icon: '🔢', label: B('Remember a phone number (working memory)', 'לזכור מספר טלפון (זיכרון עבודה)'), caption: B('Keeping a few items in mind for seconds uses the prefrontal cortex.', 'החזקת כמה פריטים בראש למשך שניות משתמשת בקליפת המצח הקדמית.'), run: () => { stage.focus(['prefrontal']); readout('✅ ' + (hm ? L('H.M. can hold it for a few seconds, as long as he is not distracted.', 'ה.מ. יכול להחזיק אותו כמה שניות, כל עוד לא מסיחים את דעתו.') : L('Held for a few seconds.', 'מוחזק כמה שניות.'))); } },
      { icon: '🧑‍⚕️', label: B('Patient H.M.', 'המטופל ה.מ.'), toggle: true, caption: B('In 1953 Henry Molaison had both hippocampi removed to stop his epilepsy. Turn this on and try each kind of memory again to see which still worked for him. His case showed that memory is not one thing.', 'ב-1953 הוסרו להנרי מולייסון שני ההיפוקמפוסים כדי לעצור את האפילפסיה שלו. הפעילו את זה ונסו שוב כל סוג זיכרון כדי לראות אילו עדיין עבדו אצלו. המקרה שלו הראה שזיכרון הוא לא דבר אחד.'), run: (on) => { hm = on; hippo.forEach((m) => { m.visible = !on; }); readout(on ? L('Hippocampi removed. Try the four kinds of memory.', 'ההיפוקמפוסים הוסרו. נסו את ארבעת סוגי הזיכרון.') : ''); } },
    ],
  };
}

export default {
  id: 'organism',
  scenes: [
    { id: 'day', icon: '🌗', name: B('A day and a night', 'יום ולילה'), chapters: [11], intro: B('Follow one person through 24 hours: the body clock, melatonin, and the stages of sleep.', 'עקבו אחר אדם אחד במשך 24 שעות: השעון הביולוגי, המלטונין ושלבי השינה.'), build: dayScene },
    { id: 'homeostasis', icon: '🌡️', name: B('Keeping in balance', 'שמירה על איזון'), chapters: [9], intro: B('Homeostasis: the hypothalamus keeps temperature and energy near their set points using negative feedback.', 'הומאוסטזיס: ההיפותלמוס שומר על הטמפרטורה והאנרגיה קרוב לנקודות הקביעה בעזרת משוב שלילי.'), build: homeoScene },
    { id: 'stove', icon: '🔥', name: B('Touching a hot stove', 'נגיעה בכיריים חמות'), chapters: [7, 8], intro: B('Why do you pull your hand away before it hurts? Follow the reflex arc in slow motion.', 'למה אתם מושכים את היד לפני שכואב? עקבו אחרי קשת הרפלקס בהילוך איטי.'), build: stoveScene },
    { id: 'memory', icon: '💭', name: B('Kinds of memory', 'סוגי זיכרון'), chapters: [12], intro: B('Different kinds of learning use different brain systems. Try each one.', 'סוגים שונים של למידה משתמשים במערכות מוח שונות. נסו כל אחד.'), build: memoryScene },
  ],
};
