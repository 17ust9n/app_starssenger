/*
  ============================================================
  QANVIX — motor de protocolo
  Protocolo: CHAOS de Marito ("Europa DOS", origen cuántico / CubeSat QRNG)
  Reemplaza al viejo fibo1 de Spacenger.
  ============================================================
  Interfaz idéntica (para que la app no se entere del cambio):
    senderSeed, enc, dec, encBytes, decBytes, mediaSeed, mediaKeystream, room

  Traducción fiel del archivo de Marito  chaos-794ca1fd.m  (Europa DOS):
      x = 0.444666 + y/1e7
      r = 3.611   + y/1e4
      x = r*x*(1-x);  x = x - floor(x)
      -> se extraen 8 bits por PARIDAD de los dígitos decimales de x  => 1 byte
      -> y se realimenta con el byte producido  (y = b2d(k))   [mapa encadenado]
  ============================================================
*/

export function utf8bytes(s){ return Array.from(new TextEncoder().encode(s)); }
export function bytesToStr(b){ return new TextDecoder().decode(new Uint8Array(b)); }

// ============================================================
// ORIGEN DE LA SEMILLA (lo que en "Europa DOS" viene del chavo cuántico)
//   PRODUCCIÓN: y0 = media de bits aleatorios del CubeSat (QRNG).  -> el diferencial de Marito
//   DEMO:       y0 se deriva DETERMINISTA de los números, para que los dos
//               teléfonos obtengan la MISMA clave sin intercambiar nada.
//               (En producción se reemplaza por el QRNG cuántico.)
// ============================================================
const seedCache = {};
export function senderSeed(members, who){
  const ck = members.slice().sort().join('_') + '|' + who;
  if(!(ck in seedCache)) seedCache[ck] = deriveSeed(members, who);
  return seedCache[ck];
}
function deriveSeed(members, who){
  // hash determinista -> y0 en 0..255 (rango que mantiene el mapa caótico estable, como el byte realimentado)
  let h = 2166136261 >>> 0;
  for(const ch of (members.slice().sort().join('') + who)){
    h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0;
  }
  return h % 256;   // en producción: valor del QRNG cuántico del CubeSat
}

// ============================================================
// KEYSTREAM = CHAOS de Marito (Europa DOS), mapa logístico + paridad de dígitos
// Genera N bytes (saltando 'off'). Determinista para (seed, off).
// ============================================================
export function keystream(seed, off, N){
  let y = (seed >>> 0) % 256;           // estado (se realimenta con cada byte)
  const total = off + N;
  const out = new Uint8Array(N);
  for(let i=0;i<total;i++){
    let x = 0.444666 + y/1e7;
    const r = 3.611 + y/1e4;
    x = r*x*(1-x);
    x = x - Math.floor(x);
    let acuy = 0, byte = 0;
    for(let d=1; d<=8; d++){
      const yd = Math.floor(x*Math.pow(10,d)) - acuy*10;   // d-ésimo dígito decimal de x
      acuy = acuy + yd;
      const bit = (yd % 2 === 0) ? 0 : 1;                  // paridad del dígito
      byte += bit * Math.pow(2, d-1);
    }
    byte = byte & 255;
    y = byte;                                              // realimentación (y = b2d(k))
    if(i>=off) out[i-off] = byte;
  }
  return out;
}

// ============================================================
// APLICAR LA CORTINA (XOR) — genérico
// ============================================================
export function enc(msg, seed, off){
  const V = utf8bytes(msg); const K = keystream(seed, off, V.length);
  return V.map((v,i)=> v ^ K[i]);
}
export function dec(ct, seed, off){
  const K = keystream(seed, off, ct.length);
  try { return bytesToStr(ct.map((v,i)=> v ^ K[i])); } catch(e){ return "(?)"; }
}
export function encBytes(bytes, seed, off){
  const K = keystream(seed, off, bytes.length); const out = new Uint8Array(bytes.length);
  for(let i=0;i<bytes.length;i++) out[i] = bytes[i] ^ K[i]; return out;
}
export function decBytes(ct, seed, off){ return encBytes(ct, seed, off); } // XOR simétrico

// ============================================================
// MEDIOS EN VIVO (video / voz) — usan lo de arriba, con clave por cuadro (timestamp)
// ============================================================
export function mediaSeed(from, to){ return senderSeed([from, to], from); }
export function mediaKeystream(seed, ts, N){ return keystream((seed + ((ts>>>0) % 251)) % 256, 0, N); }

// ============================================================
// SALA / TÓPICO (no es secreto, es solo un id para el relay)
// ============================================================
export function room(members){
  let h=5381; for(const c of members.slice().sort().join('|')) h=((h<<5)+h+c.charCodeAt(0))>>>0;
  return "starssenger/"+h.toString(36);
}

/* ============================================================
   TEST rápido:  node protocol_QANVIX.js
   ============================================================ */
if (typeof process !== 'undefined' && import.meta && process.argv[1] && process.argv[1].includes('protocol_QANVIX')){
  const A="5491158358486", B="16465154045";
  const s = senderSeed([A,B], A);
  const msg = "Hola STARSSENGER, con ñ y emoji 🚀";
  const t = dec(enc(msg, s, 0), s, 0);
  console.log("1) texto da la vuelta:", t === msg);
  const buf = new Uint8Array(500); for(let i=0;i<buf.length;i++) buf[i]=(i*7)%256;
  const back = decBytes(encBytes(buf, s, 20), s, 20);
  let ok=true; for(let i=0;i<buf.length;i++) if(back[i]!==buf[i]){ ok=false; break; }
  console.log("2) bytes (voz/video) da la vuelta:", ok);
  const eve = dec(enc("secreto", s, 0), senderSeed(["1","2"],"1"), 0);
  console.log("3) Eve NO lee (correcto):", eve !== "secreto");
  // muestra que sí cifra (no queda igual al original)
  const ct = enc(msg, s, 0);
  console.log("4) el cifrado NO es igual al texto:", bytesToStr(ct) !== msg);
}
