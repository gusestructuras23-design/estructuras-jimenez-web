import buildingmontaje from './project-building-montaje.bin';
import buildingcasetas from './project-building-casetas.bin';
import buildingaerea from './project-building-aerea.bin';
import buildingconjunto from './project-building-conjunto.bin';
import hoppers from './project-hoppers.bin';
import exterior from './project-exterior.bin';
import workshop from './project-workshop.bin';
import structure from './project-structure.bin';
import video from './project-video.bin';
import poster from './project-poster.bin';
import carts from './project-carts.bin';
import company from './company-photo.bin';
import pigs from './workshop-pigs.bin';
import originalExterior from './project-original-exterior.bin';
import originalTaller from './project-original-taller.bin';
import originalEstructura from './project-original-estructura.bin';
const files = new Map([
  ['/proyectos/estructuras-metalicas/estructuras-conjunto-v1.jpg', { bytes: buildingconjunto, type: 'image/jpeg' }],
  ['/proyectos/estructuras-metalicas/estructuras-aerea-v1.jpg', { bytes: buildingaerea, type: 'image/jpeg' }],
  ['/proyectos/estructuras-metalicas/estructuras-casetas-v1.jpg', { bytes: buildingcasetas, type: 'image/jpeg' }],
  ['/proyectos/estructuras-metalicas/estructuras-montaje-v1.jpg', { bytes: buildingmontaje, type: 'image/jpeg' }],
  ['/proyectos/tolvas/foto-v1.jpg', { bytes: hoppers, type: 'image/jpeg' }],
  ['/media/puerquitos-v1.webp', { bytes: pigs, type: 'image/webp' }],
  ['/proyectos/jaulas-porcicolas/original-exterior-v1.jpg', { bytes: originalExterior, type: 'image/jpeg' }],
  ['/proyectos/jaulas-porcicolas/original-taller-v1.jpg', { bytes: originalTaller, type: 'image/jpeg' }],
  ['/proyectos/jaulas-porcicolas/original-estructura-v1.jpg', { bytes: originalEstructura, type: 'image/jpeg' }],
  ['/media/estructura-empresa-v1.jpg', { bytes: company, type: 'image/jpeg' }],
  ['/proyectos/carros-pastureros/foto-v1.jpg', { bytes: carts, type: 'image/jpeg' }],
  ['/proyectos/jaulas-porcicolas/foto-exterior-v1.webp', { bytes: exterior, type: 'image/webp' }],
  ['/proyectos/jaulas-porcicolas/foto-taller-v1.webp', { bytes: workshop, type: 'image/webp' }],
  ['/proyectos/jaulas-porcicolas/foto-estructura-v1.webp', { bytes: structure, type: 'image/webp' }],
  ['/proyectos/jaulas-porcicolas/video-v1.mp4', { bytes: video, type: 'video/mp4' }],
  ['/proyectos/jaulas-porcicolas/portada-v1.webp', { bytes: poster, type: 'image/webp' }]
]);
// SVG viewports embed the unchanged photograph; only the visible bounds change.
const cropViews = new Map([["/proyectos/jaulas-porcicolas/exterior-recorte-v2.svg", ["/proyectos/jaulas-porcicolas/original-exterior-v1.jpg", 50, 240, 1140, 650, 1280, 960]], ["/proyectos/jaulas-porcicolas/taller-recorte-v2.svg", ["/proyectos/jaulas-porcicolas/original-taller-v1.jpg", 0, 120, 1200, 1160, 1200, 1600]], ["/proyectos/jaulas-porcicolas/estructura-recorte-v2.svg", ["/proyectos/jaulas-porcicolas/original-estructura-v1.jpg", 0, 0, 1280, 930, 1280, 960]], ["/proyectos/carros-pastureros/foto-recorte-v2.svg", ["/proyectos/carros-pastureros/foto-v1.jpg", 20, 90, 980, 610, 1024, 768]], ["/proyectos/tolvas/foto-recorte-v2.svg", ["/proyectos/tolvas/foto-v1.jpg", 15, 160, 690, 840, 720, 1280]], ["/proyectos/estructuras-metalicas/montaje-recorte-v2.svg", ["/proyectos/estructuras-metalicas/estructuras-montaje-v1.jpg", 0, 45, 720, 460, 720, 531]], ["/proyectos/estructuras-metalicas/casetas-recorte-v2.svg", ["/proyectos/estructuras-metalicas/estructuras-casetas-v1.jpg", 0, 110, 1280, 820, 1280, 960]], ["/proyectos/estructuras-metalicas/aerea-recorte-v2.svg", ["/proyectos/estructuras-metalicas/estructuras-aerea-v1.jpg", 0, 60, 960, 660, 960, 720]], ["/proyectos/estructuras-metalicas/conjunto-recorte-v2.svg", ["/proyectos/estructuras-metalicas/estructuras-conjunto-v1.jpg", 0, 50, 960, 670, 960, 720]]]);
function croppedPhoto(pathname) {
 const crop = cropViews.get(pathname);
 if (!crop) return null;
 const [src,x,y,width,height,sourceWidth,sourceHeight] = crop;
 const original = files.get(src);
 const bytes = new Uint8Array(original.bytes);
 let binary = '';
 for (let offset=0; offset<bytes.length; offset+=16384) binary += String.fromCharCode(...bytes.subarray(offset,offset+16384));
 const encoded = btoa(binary);
 const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${x} ${y} ${width} ${height}" overflow="hidden"><image width="${sourceWidth}" height="${sourceHeight}" href="data:${original.type};base64,${encoded}"/></svg>`;
 return {bytes:new TextEncoder().encode(svg),type:'image/svg+xml'};
}
export function serveProjectMedia(request) {
  const pathname = new URL(request.url).pathname;
  const file = files.get(pathname) || croppedPhoto(pathname);
  if (!file) return null;
  if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  const headers = new Headers({ 'Content-Type': file.type, 'Cache-Control': 'public, max-age=31536000, immutable', 'Accept-Ranges': 'bytes', 'X-Content-Type-Options': 'nosniff' });
  const length = file.bytes.byteLength;
  const range = request.headers.get('Range');
  if (range && request.method === 'GET') {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    let start, end;
    if (match && (match[1] || match[2])) {
      start = match[1] ? Number(match[1]) : Math.max(0, length - Number(match[2]));
      end = match[1] && match[2] ? Math.min(Number(match[2]), length - 1) : length - 1;
    }
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= length) {
      headers.set('Content-Range', `bytes */${length}`);
      return new Response(null, { status: 416, headers });
    }
    headers.set('Content-Range', `bytes ${start}-${end}/${length}`);
    headers.set('Content-Length', String(end - start + 1));
    return new Response(file.bytes.slice(start, end + 1), { status: 206, headers });
  }
  headers.set('Content-Length', String(length));
  return new Response(request.method === 'HEAD' ? null : file.bytes, { headers });
}
