const arrow = `<svg class="ej-project-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>`;
// Add new work here: the home preview, catalogue and detail pages share this data.
const base = '/proyectos/jaulas-porcicolas/';
export const projects = [{
  slug: 'jaulas-porcicolas', title: 'Jaulas porcícolas', category: 'Transporte porcino',
  summary: 'Transporte de porcinos en remolque.',
  description: 'Fabricamos jaulas metálicas para el transporte de porcinos en remolque, con cerramientos de barras horizontales.',
  quoteBrief: '¿Buscas una jaula similar? Cuéntanos las medidas de tu remolque y qué necesitas transportar.',
  service: 'Jaulas porcícolas',
  photos: [
    { src: '/proyectos/jaulas-porcicolas/exterior-recorte-v2.svg', width: 1140, height: 650, label: 'Vista completa', alt: 'Jaula porcícola montada en un remolque, vista completa al exterior' },
    { src: '/proyectos/jaulas-porcicolas/taller-recorte-v2.svg', width: 1200, height: 1160, label: 'Estructura y detalles', alt: 'Detalle lateral de la estructura gris de la jaula dentro del taller' },
    { src: '/proyectos/jaulas-porcicolas/estructura-recorte-v2.svg', width: 1280, height: 930, label: 'Trabajo en el taller', alt: 'Jaula porcícola con estructura oscura y paneles metálicos dentro del taller' }
  ],
  video: { src: base + 'video-v1.mp4', poster: base + 'portada-v1.webp', label: 'Video del proyecto', width: 854, height: 480 }
}, {
  slug: 'carros-pastureros', title: 'Carros pastureros', category: 'Equipamiento agropecuario',
  summary: 'Traslado de pastura dentro de tus instalaciones.',
  description: 'Fabricamos carros pastureros con caja metálica y ruedas para trasladar pastura dentro de las instalaciones agropecuarias.',
  quoteBrief: 'Cuéntanos qué material necesitas mover, la cantidad aproximada y el espacio disponible para revisar un carro adecuado para tu trabajo.',
  service: 'Carros pastureros',
  photos: [{
    src: '/proyectos/carros-pastureros/foto-recorte-v2.svg', width: 980, height: 610,
    label: 'Vista de los carros',
    alt: 'Carros pastureros blancos de caja metálica, con ruedas de neumático y centros azules.'
  }]
}, {
  slug: 'tolvas', title: 'Tolvas para granos', category: 'Almacenamiento de granos',
  summary: 'Con estructura de soporte y escalera lateral.',
  description: 'Fabricamos tolvas metálicas para almacenar granos, con cuerpo cilíndrico, fondo cónico, estructura de soporte y escalera lateral.',
  quoteBrief: 'Indícanos el tipo de grano, la capacidad que necesitas y el lugar de instalación para revisar tu proyecto.',
  service: 'Tolvas para granos',
  photos: [{ src: '/proyectos/tolvas/foto-recorte-v2.svg', width: 690, height: 840,
    label: 'Vista completa de la tolva', alt: 'Tolva metálica blanca con fondo cónico, soportes y escalera lateral, instalada al exterior.' }]
}, {
  slug: 'estructuras-metalicas', title: 'Estructuras metálicas', category: 'Estructuras y naves',
  summary: 'Columnas, vigas y armaduras para naves.',
  description: 'Montamos columnas, vigas y armaduras metálicas para la estructura de las naves y el soporte de sus cubiertas.',
  quoteBrief: 'Comparte el uso de la nave, sus medidas aproximadas y la ubicación de la obra para revisar el alcance de una propuesta.',
  service: 'Estructuras metálicas',
  photos: [
    { src: '/proyectos/estructuras-metalicas/montaje-recorte-v2.svg', width: 720, height: 460, label: 'Montaje de la estructura', alt: 'Columnas y vigas metálicas montadas sobre muros de ladrillo durante la construcción.' },
    { src: '/proyectos/estructuras-metalicas/casetas-recorte-v2.svg', width: 1280, height: 820, label: 'Estructura de la nave', alt: 'Estructura metálica de una nave en construcción con columnas y armaduras para la cubierta.' },
    { src: '/proyectos/estructuras-metalicas/aerea-recorte-v2.svg', width: 960, height: 660, label: 'Vista aérea de las naves', alt: 'Vista aérea de varias naves con cubiertas metálicas y áreas en construcción.' },
    { src: '/proyectos/estructuras-metalicas/conjunto-recorte-v2.svg', width: 960, height: 670, label: 'Vista del conjunto', alt: 'Vista aérea del conjunto de naves y las estructuras de nuevas construcciones.' }
  ]
}];
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
export const projectURL = (project) => '/proyectos/' + encodeURIComponent(project.slug) + '/';
function card(project) {
  const photo = project.photos[0];
  return `<li class="ej-project-card" data-project-slug="${escape(project.slug)}" data-project-category="${escape(project.category)}" data-project-search="${escape(project.title + ' ' + project.category + ' ' + project.summary)}">
    <a class="ej-project-card-link" href="${projectURL(project)}" data-project-open="${escape(project.slug)}" aria-haspopup="dialog" aria-label="Abrir galería: ${escape(project.title)}">
      <div class="ej-project-card-image">${photo.width < photo.height ? `<img class="ej-project-photo-context" src="${photo.src}" alt="" aria-hidden="true" loading="lazy" decoding="async" width="${photo.width}" height="${photo.height}">` : ''}<img${photo.width < photo.height ? ' class="ej-project-portrait"' : ''} src="${photo.src}" alt="${escape(photo.alt)}" width="${photo.width}" height="${photo.height}" loading="lazy" decoding="async"></div>
      <div class="ej-project-card-copy"><span class="ej-project-kicker">${escape(project.category)}</span><h3>${escape(project.title)}</h3><p>${escape(project.summary)}</p><div class="ej-project-card-footer"><span>${project.photos.length} ${project.photos.length === 1 ? 'foto' : 'fotos'}${project.video ? ' · 1 video' : ''}</span><strong class="ej-action-button">Abrir galería <span aria-hidden="true">${arrow}</span></strong></div></div>
    </a>
  </li>`;
}
function portfolio(list, pageSize) {
  return `<div class="ej-project-catalogue" data-project-catalogue data-project-page-size="${pageSize}">
    ${list.length > 6 ? '<label class="ej-project-search">Buscar un proyecto<input type="search" placeholder="Nombre o tipo de proyecto" data-project-search-input></label>' : ''}
    <p class="ej-project-count${list.length <= 6 ? ' ej-project-count-quiet' : ''}" data-project-count aria-live="polite">${list.length} ${list.length === 1 ? 'proyecto' : 'proyectos'}</p>
    <ul class="ej-project-grid" aria-label="Proyectos realizados">${list.map(card).join('')}</ul><p data-project-empty hidden>No encontramos proyectos con esa búsqueda.</p>
    <button class="ej-project-more" type="button" data-project-more hidden>Mostrar más proyectos</button>
    ${list.map((project) => `<template data-project-template="${escape(project.slug)}" data-project-service="${escape(project.service)}">${renderProject(project, {overlay:true})}</template>`).join('')}
  </div>`;
}
export function renderHomeProjects(list = projects) {
  return `<section class="ej-projects" id="proyectos" aria-labelledby="ej-projects-title"><div class="ej-projects-shell">
    <div class="ej-projects-heading"><div><h2 id="ej-projects-title">Proyectos realizados.</h2></div></div>
    ${portfolio(list, 6)}
  </div></section>`;
}
export const projectSection = renderHomeProjects();
export function renderCatalogue(list = projects) {
  return `<main class="ej-project-page-main" id="contenido"><a class="ej-project-back" href="/">← Volver al inicio</a><div class="ej-project-page-heading"><span class="ej-project-kicker">Estructuras Jiménez</span><h1>Portafolio de proyectos.</h1><p>Explora nuestras estructuras y equipamiento sin salir de esta página.</p></div>${portfolio(list, 12)}</main>`;
}
export function renderProject(project, {overlay = false} = {}) {
  const photo = project.photos[0];
  const heading = overlay ? 'h2' : 'h1';
  const content = `<div class="ej-project-detail" data-project-gallery>
      <div class="ej-project-viewer">
        <div class="ej-project-stage-frame"><div class="ej-project-stage" data-project-stage><a href="${photo.fullSrc || photo.src}" data-project-photo target="_blank" rel="noopener" aria-label="Ampliar fotografía"><img src="${photo.fullSrc || photo.src}" alt="${escape(photo.alt)}" width="${photo.width}" height="${photo.height}" decoding="async"><span class="ej-project-expand" aria-hidden="true">Ampliar ${arrow}</span></a></div><button class="ej-project-step ej-project-prev" type="button" data-project-prev hidden aria-label="Foto o video anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" width="18" height="18" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button><button class="ej-project-step ej-project-next" type="button" data-project-next hidden aria-label="Foto o video siguiente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" width="18" height="18" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg></button></div>
        <div class="ej-project-thumbnails" aria-label="Fotos y video del proyecto">${project.photos.map((item, index) => `<a href="${item.fullSrc || item.src}" target="_blank" rel="noopener" class="ej-project-thumb" data-project-slide="image" data-project-width="${item.width}" data-project-height="${item.height}" data-project-alt="${escape(item.alt)}" data-project-label="${escape(item.label)}" ${index === 0 ? 'aria-current="true"' : ''} aria-label="Ver foto ${index + 1}: ${escape(item.label)}"><img src="${item.src}" alt="" width="96" height="72" loading="lazy"></a>`).join('')}${project.video ? `<a href="${project.video.src}" target="_blank" rel="noopener" class="ej-project-thumb ej-project-thumb-video" data-project-slide="video" data-project-poster="${project.video.poster}" data-project-label="Video del proyecto" aria-label="Reproducir video del proyecto"><img src="${project.video.poster}" alt="" width="96" height="72" loading="lazy"><span aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span></a>` : ''}</div>
        <p class="ej-project-gallery-caption" data-project-caption aria-live="polite">1 / ${project.photos.length + (project.video ? 1 : 0)} · ${escape(photo.label)}</p>
      </div>
      <div class="ej-project-detail-copy"><span class="ej-project-kicker">${escape(project.category)}</span><${heading} id="ej-project-title-${escape(project.slug)}">${escape(project.title)}.</${heading}><p class="ej-project-description">${escape(project.description)}</p><p class="ej-project-brief">${escape(project.quoteBrief)}</p><p class="ej-project-media-count">${project.photos.length} ${project.photos.length === 1 ? 'fotografía' : 'fotografías'}${project.video ? ' · 1 video' : ''}</p><a class="ej-project-quote" href="/?producto=${encodeURIComponent(project.service)}#cotizar">Cotizar un proyecto similar <span aria-hidden="true">${arrow}</span></a><a class="ej-project-direct ej-action-button" href="https://wa.me/523781214083" target="_blank" rel="noopener">Hablar por WhatsApp ${arrow}</a></div>
    </div>`;
  return overlay ? content : `<main class="ej-project-page-main ej-project-detail-main" id="contenido"><a class="ej-project-back" href="/proyectos/">← Todos los proyectos</a>${content}</main>`;
}
export const projectStyles = `
#productos:has(+.ej-projects){padding-bottom:36px!important}
.ej-projects{padding:36px 24px 44px;background:#f7f5f2;color:#292e30;scroll-margin-top:112px}
.ej-project-arrow{display:inline-block;width:14px;height:14px;vertical-align:middle;flex-shrink:0}
.ej-projects-shell{max-width:1240px;margin:0 auto}
.ej-projects *,.ej-project-page *{box-sizing:border-box}
.ej-projects-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-bottom:24px}
.ej-project-kicker{display:block;color:#925465;font:600 10px/1.5 Arial,sans-serif;letter-spacing:.15em;text-transform:uppercase;margin:0 0 9px}
.ej-projects-heading h2{font-size:clamp(27px,3vw,38px);line-height:1.15;letter-spacing:-.035em;margin:0;font-weight:600}
.ej-project-text-link{font-size:12px;color:#343a3c!important;text-decoration:none!important;display:inline-flex;gap:24px;align-items:center;border-bottom:1px solid #afb1ad;padding:8px 0;white-space:nowrap}
.ej-project-text-link:hover{border-color:#925465;color:#925465!important}
.ej-project-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;align-items:stretch}
.ej-project-card{min-width:0;margin:0;border:1px solid #ddd9d4;border-radius:5px;overflow:hidden;background:#fff;transition:box-shadow .2s,border-color .2s}
.ej-project-card:hover{border-color:#bfa5ac;box-shadow:0 8px 26px #24292b0d}
.ej-project-card-link{display:flex;flex-direction:column;height:100%;color:#292e30!important;text-decoration:none!important}
.ej-project-card-image{position:relative;aspect-ratio:16/10;flex-shrink:0;overflow:hidden;background:#e6e2dd;min-width:0}
.ej-project-card-image img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .3s}
.ej-project-card-image img.ej-project-portrait{object-fit:contain}
.ej-project-card:hover img{transform:scale(1.025)}
.ej-project-card-arrow{position:absolute;right:14px;bottom:14px;width:34px;height:34px;display:grid;place-items:center;background:#fff;color:#2c3335;border-radius:50%;font-size:19px}
.ej-project-card-copy{padding:22px;display:flex;flex-direction:column;flex:1}
.ej-project-card-copy h3{font-size:23px;font-weight:600;letter-spacing:-.025em;line-height:1.2;margin:0 0 10px;color:#292e30}
.ej-project-card-copy p{font-size:13px;line-height:1.6;color:#666b6c;margin:0 0 22px}
.ej-project-card-footer{display:flex;justify-content:space-between;gap:20px;align-items:center;margin-top:auto;padding-top:15px;border-top:1px solid #ebe7e3;font-size:10px;color:#747879}
.ej-project-card-footer strong{font-size:12px;font-weight:600;color:#764151}





.ej-project-page .office-whatsapp{bottom:calc(24px + env(safe-area-inset-bottom,0px))!important}
.ej-project-page{margin:0;background:#f7f5f2;color:#292e30;font-family:Arial,Helvetica,sans-serif;line-height:1.5}
.ej-project-page-header{border-bottom:1px solid #e0ddd8;background:#fff;position:sticky;top:0;z-index:20}
.ej-project-page-header>div{max-width:1240px;margin:auto;display:flex;align-items:center;justify-content:space-between;padding:12px 24px;gap:24px}
.ej-project-page-brand img{display:block;width:76px;height:59px;object-fit:contain}
.ej-project-page-nav{display:flex;gap:26px;align-items:center}
.ej-project-page-nav a{font-size:12px;font-weight:600;color:#343a3c;text-decoration:none}
.ej-project-page-nav .ej-project-header-quote{padding:12px 18px;background:#efafbd;border-radius:3px}
.ej-project-page-main{max-width:1240px;margin:0 auto;padding:30px 24px 64px;min-height:65vh}
.ej-project-back{font-size:12px;color:#64696a;text-decoration:none;display:inline-block;padding:7px 0;margin-bottom:30px}
.ej-project-back:hover{color:#925465}
.ej-project-page-heading{margin-bottom:30px}
.ej-project-page-heading h1{font-size:clamp(32px,4vw,48px);line-height:1.12;letter-spacing:-.04em;margin:0 0 14px;font-weight:600}
.ej-project-page-heading p{font-size:14px;line-height:1.7;color:#63696b;margin:0}
.ej-project-count{font-size:11px;color:#6c7274;margin-bottom:18px}
.ej-project-detail{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(280px,1fr);gap:50px;align-items:start}
.ej-project-viewer{min-width:0}
.ej-project-stage{display:grid;place-items:center;aspect-ratio:4/3;max-height:550px;background:#eae7e2;border-radius:5px;overflow:hidden}
.ej-project-stage>a{display:block;position:relative;width:100%;height:100%;min-height:0}
.ej-project-stage img,.ej-project-stage video{display:block;width:100%;height:100%;max-height:550px;object-fit:contain;aspect-ratio:4/3;background:#eae7e2}
.ej-project-expand{position:absolute;right:12px;bottom:12px;font-size:10px;color:#fff;background:#252b2edb;border-radius:3px;padding:8px 12px}
.ej-project-thumbnails{display:flex;gap:9px;margin-top:12px;overflow-x:auto;padding:3px;scrollbar-width:thin}
.ej-project-thumb{position:relative;display:block;flex:0 0 78px;height:58px;border:2px solid transparent;border-radius:3px;overflow:hidden;background:#e3dfda;opacity:.7}
.ej-project-thumb[aria-current="true"]{border-color:#8b5263;opacity:1}
.ej-project-thumb:hover{opacity:1}
.ej-project-thumb img{display:block;width:100%;height:100%;object-fit:cover}
.ej-project-thumb-video>span{position:absolute;inset:0;display:grid;place-items:center;background:#0005;color:#fff;font-size:18px}
.ej-project-gallery-caption{font-size:11px;color:#697072;margin:9px 0 0;line-height:1.5}
.ej-project-detail-copy{padding-top:12px}
.ej-project-detail-copy h1{font-size:clamp(32px,3.9vw,50px);line-height:1.12;letter-spacing:-.035em;font-weight:600;margin:0 0 22px}
.ej-project-detail-copy>p{font-size:14px;color:#62696b;line-height:1.85;margin:0 0 28px;max-width:410px}
.ej-project-detail-copy dl{border-top:1px solid #dcd7d1;margin:0 0 30px;padding:0}
.ej-project-detail-copy dl>div{display:flex;justify-content:space-between;gap:20px;border-bottom:1px solid #dcd7d1;padding:13px 0;font-size:12px}
.ej-project-detail-copy dt{color:#74797a}.ej-project-detail-copy dd{margin:0;font-weight:500;text-align:right}
.ej-project-quote{display:flex;justify-content:space-between;gap:20px;padding:15px 18px;border-radius:3px;background:#edafbd;color:#2b3031;text-decoration:none;font-size:13px;font-weight:600}
.ej-project-direct{display:inline-block;margin-top:17px;color:#686d6e;font-size:12px;text-underline-offset:4px}
.ej-project-page-footer{max-width:1192px;margin:auto;border-top:1px solid #dfd9d4;padding:24px 0 32px;display:flex;justify-content:space-between;gap:20px;font-size:11px;color:#727778}
.ej-project-page-footer a{color:inherit}
.ej-project-dialog{padding:0;border:1px solid #555;border-radius:6px;background:#191e20;color:#fff;max-width:94vw;max-height:94dvh;overflow:auto}
.ej-project-dialog::backdrop{background:#0b0e10e8}
.ej-project-dialog img{display:block;width:auto;height:auto;max-width:90vw;max-height:80dvh;object-fit:contain}
.ej-project-dialog form{display:flex;justify-content:flex-end;padding:10px 14px;background:#22282a}
.ej-project-dialog button{background:transparent;border:1px solid #8b9294;border-radius:3px;color:#fff;padding:10px 18px;font:inherit;cursor:pointer}
.ej-project-search{display:block;font-size:12px;max-width:400px;margin:0 0 22px}.ej-project-search input{display:block;width:100%;margin-top:7px;padding:12px;border:1px solid #ccc4be;border-radius:3px;background:#fff;font:inherit}
.ej-project-filters{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:22px}.ej-project-filters button,.ej-project-more{padding:10px 14px;border:1px solid #cfc8c1;background:transparent;border-radius:3px;color:#363d40;font:inherit;font-size:12px;cursor:pointer}.ej-project-filters button[aria-pressed="true"]{background:#2d3436;border-color:#2d3436;color:#fff}.ej-project-more{display:block;margin:28px auto 0}
.ej-project-page [hidden]{display:none!important}
.ej-project-card-link:focus-visible,.ej-project-page a:focus-visible,.ej-project-page button:focus-visible,.ej-project-dialog button:focus-visible{outline:3px solid #a45e75;outline-offset:3px}
.ej-project-skip{position:absolute;left:16px;top:-100px;z-index:100;background:#fff;color:#222;padding:12px}.ej-project-skip:focus{top:10px}
@media(max-width:1000px){.ej-project-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.ej-project-detail{gap:28px;grid-template-columns:minmax(0,1.2fr) minmax(260px,1fr)}.ej-project-page-footer{margin:0 24px}}
@media(max-width:680px){.ej-projects{padding:34px 20px 40px}.ej-projects-heading{align-items:start;gap:16px}.ej-projects-heading h2{font-size:26px;max-width:200px}.ej-project-text-link{font-size:10px;gap:8px;white-space:normal}.ej-project-grid{grid-template-columns:1fr;gap:18px}.ej-project-card-image{aspect-ratio:16/9}.ej-project-detail{grid-template-columns:1fr;gap:26px}.ej-project-detail-copy{padding-top:0}.ej-project-page-main{padding:22px 20px 40px}.ej-project-back{margin-bottom:20px}.ej-project-page-header>div{padding:10px 20px;gap:14px}.ej-project-page-brand img{width:61px;height:48px}.ej-project-page-nav{gap:16px}.ej-project-page-nav a{font-size:11px}.ej-project-page-nav .ej-project-header-quote{padding:9px 12px}.ej-project-page-footer{margin:0 20px;flex-direction:column;gap:8px}.ej-project-stage,.ej-project-stage img,.ej-project-stage video{max-height:440px}.ej-project-detail-copy h1{font-size:34px}}

/* Compact detail layout: all navigation stays within reach at laptop heights. */
.ej-project-detail-main{max-width:1120px;min-height:0;padding:20px 24px 28px}
.ej-project-detail-main .ej-project-back{margin-bottom:18px;padding:4px 0;font-size:11px}
.ej-project-detail{grid-template-columns:minmax(0,1.2fr) minmax(280px,1fr);gap:36px}
.ej-project-stage-frame{position:relative;min-width:0}
.ej-project-stage{aspect-ratio:auto;height:clamp(220px,calc(100svh - 285px),340px);max-height:none;touch-action:pan-y}
.ej-project-stage img,.ej-project-stage video{aspect-ratio:auto;width:100%;height:100%;max-height:none}
.ej-project-stage>a{width:100%;height:100%}
.ej-project-step{position:absolute;top:50%;transform:translateY(-50%);width:38px;height:44px;display:grid;place-items:center;cursor:pointer;border:1px solid #fff9;border-radius:4px;background:#fffd;color:#393438;box-shadow:0 1px 6px #0001;z-index:1}
.ej-project-step:hover{background:#fff;border-color:#c49aa8}
.ej-project-prev{left:10px}.ej-project-next{right:10px}
.ej-project-thumbnails{gap:8px;margin-top:9px;padding:2px}
.ej-project-thumb{flex-basis:66px;height:48px}
.ej-project-gallery-caption{margin-top:6px;font-size:10px}
.ej-project-detail-copy{padding-top:5px}
.ej-project-detail-copy h1{font-size:clamp(29px,3vw,39px);margin-bottom:17px;line-height:1.12}
.ej-project-detail-copy>p{font-size:13px;line-height:1.8;margin-bottom:18px;max-width:390px}
.ej-project-detail-copy>.ej-project-media-count{border-top:1px solid #ddd6d0;padding-top:14px;margin:0 0 20px;font-size:11px;color:#767173}
.ej-project-quote{padding:13px 16px;font-size:12px}
.ej-project-direct{margin-top:13px;font-size:11px}
.ej-project-page-header>div{padding-top:10px;padding-bottom:10px}
.ej-project-page-brand img{width:64px;height:50px}
.ej-project-page-footer{padding-top:18px;padding-bottom:24px}
@media(max-width:680px){.ej-project-detail-main{padding:18px 20px 30px}.ej-project-detail-main .ej-project-back{margin-bottom:20px}.ej-project-detail{display:flex;flex-direction:column;gap:0}.ej-project-detail-copy{display:contents}.ej-project-detail-copy>.ej-project-kicker{order:-3;margin-bottom:7px}.ej-project-detail-copy h1{order:-2;margin-bottom:18px;font-size:30px}.ej-project-viewer{order:-1;width:100%;margin-bottom:20px}.ej-project-stage{height:clamp(200px,62vw,280px)}.ej-project-detail-copy>p{margin-bottom:14px;max-width:100%}.ej-project-detail-copy>.ej-project-media-count{width:100%;padding-top:10px;margin-bottom:16px}.ej-project-quote{width:100%;padding:14px 16px}.ej-project-direct{margin-top:13px}.ej-project-step{width:36px;height:44px}.ej-project-thumb{flex-basis:65px;height:48px}}

.ej-projects-intro{margin:0;max-width:240px;font-size:12px;line-height:1.7;color:#6d7273}
.ej-projects .ej-project-card-copy{padding:18px}.ej-projects .ej-project-card-copy h3{font-size:21px}.ej-projects .ej-project-card-copy p{font-size:12px;margin-bottom:17px}
.ej-projects [hidden]{display:none!important}
.ej-portfolio-modal{margin:auto!important;padding:0;border:1px solid #ddd5cf;border-radius:9px;width:min(1040px,calc(100vw - 48px));max-width:none;max-height:calc(100dvh - 40px);overflow:auto;overscroll-behavior:contain;background:#f7f5f2;color:#292e30;font-family:Arial,Helvetica,sans-serif;box-shadow:0 20px 90px #0005}
.ej-portfolio-modal::backdrop{background:#111719c9;backdrop-filter:blur(5px)}
.ej-portfolio-modal *{box-sizing:border-box}
.ej-portfolio-modal-header{position:sticky;top:0;z-index:3;display:flex;align-items:center;justify-content:space-between;gap:20px;background:#f7f5f2;border-bottom:1px solid #e1d9d2;padding:6px 16px 6px 22px}
.ej-portfolio-modal-header>span{font-size:11px;letter-spacing:.08em;color:#7b5963}
.ej-portfolio-close{border:0;background:transparent;min-width:44px;min-height:44px;padding:8px;cursor:pointer;display:grid;place-items:center;color:#3b4143;border-radius:4px}
.ej-portfolio-close:hover{background:#e8e1dd}
.ej-portfolio-modal-body{padding:22px}
.ej-portfolio-modal .ej-project-detail{grid-template-columns:minmax(0,1.7fr) minmax(220px,1fr);gap:26px}
.ej-portfolio-modal .ej-project-stage{height:clamp(210px,calc(100dvh - 245px),420px);background:#e9e5e1}
.ej-portfolio-modal .ej-project-stage img,.ej-portfolio-modal .ej-project-stage video{background:#e9e5e1}
.ej-portfolio-modal .ej-project-detail-copy{display:flex;flex-direction:column;padding-top:12px}
.ej-portfolio-modal .ej-project-detail-copy h2{font-size:clamp(24px,2.6vw,32px);line-height:1.16;letter-spacing:-.03em;margin:0 0 16px;color:#292e30}
.ej-portfolio-modal .ej-project-detail-copy>p{font-size:13px;line-height:1.75;margin:0 0 18px}
.ej-portfolio-modal .ej-project-detail-copy>.ej-project-media-count{font-size:11px;padding-top:13px;margin:0 0 22px;width:100%}
.ej-portfolio-modal .ej-project-quote{font-size:11px;gap:12px;padding:14px}
.ej-portfolio-modal .ej-project-direct{font-size:11px}
.ej-portfolio-modal a:focus-visible,.ej-portfolio-modal button:focus-visible{outline:3px solid #a45e75;outline-offset:3px}
.ej-portfolio-modal [hidden]{display:none!important}
@media(max-width:680px){.ej-projects-heading{flex-direction:column;gap:8px}.ej-projects-heading h2{max-width:none}.ej-projects-intro{max-width:none;font-size:11px}.ej-portfolio-modal{width:calc(100vw - 20px);max-height:calc(100dvh - 20px);border-radius:8px}.ej-portfolio-modal-header{padding:4px 10px 4px 16px}.ej-portfolio-modal-body{padding:16px}.ej-portfolio-modal .ej-project-detail{display:flex;gap:0}.ej-portfolio-modal .ej-project-detail-copy{display:contents}.ej-portfolio-modal .ej-project-detail-copy>h2{order:-2;font-size:25px;margin-bottom:16px}.ej-portfolio-modal .ej-project-stage{height:clamp(200px,35dvh,300px)}.ej-portfolio-modal .ej-project-viewer{margin-bottom:16px}.ej-portfolio-modal .ej-project-detail-copy>.ej-project-media-count{padding-top:0;border:0;margin-bottom:14px}.ej-portfolio-modal .ej-project-detail-copy>p:is(.ej-project-description,.ej-project-brief){display:block;font-size:12px;line-height:1.65;margin-bottom:14px}.ej-portfolio-modal .ej-project-quote{font-size:12px}.ej-portfolio-modal .ej-project-direct{margin:13px 0 2px}}
@media(prefers-reduced-motion:reduce){.ej-project-card,.ej-project-card-image img{transition:none}}

/* One bounded transform surface for wheel, pinch, pan and keyboard zoom. */
.ej-project-stage.ej-zoom-ready{position:relative;overflow:hidden!important;overscroll-behavior:contain}
.ej-project-stage.ej-zoom-ready[data-photo-active="true"]{touch-action:none!important;user-select:none;-webkit-user-select:none}
.ej-project-stage.ej-zoom-ready[data-photo-active="false"]{touch-action:auto!important}
.ej-project-stage.ej-zoom-ready>[data-project-photo]{position:absolute;inset:0;width:100%!important;height:100%!important;overflow:hidden}
.ej-project-stage.ej-zoom-ready [data-project-photo] img{position:absolute;left:50%;top:50%;width:var(--ej-raster-width,100%);height:var(--ej-raster-height,100%);max-width:none;max-height:none;object-fit:contain;transform:translate(-50%,-50%) translate3d(var(--ej-pan-x,0px),var(--ej-pan-y,0px),0);transform-origin:center;pointer-events:none;transition:none}
.ej-project-stage.ej-zoom-ready.is-dragging img{will-change:transform}
body.ej-brand-theme .ej-project-stage.ej-zoom-ready [data-project-photo]{cursor:zoom-in}
body.ej-brand-theme .ej-project-stage.ej-zoom-ready.is-zoomed [data-project-photo]{cursor:grab}
body.ej-brand-theme .ej-project-stage.ej-zoom-ready.is-dragging [data-project-photo]{cursor:grabbing}
.ej-project-stage.ej-zoom-ready.is-zoomed .ej-project-expand{display:none}
.ej-project-toolbar{display:grid;grid-template-columns:44px minmax(0,1fr) 44px;align-items:center;gap:8px;margin:7px 0}
.ej-project-toolbar>.ej-project-step{position:static;transform:none;width:44px;height:44px;border-color:#61505d;background:#352d36;color:#e9b0c0}
.ej-project-toolbar>.ej-project-prev{grid-column:1;grid-row:1}
.ej-project-toolbar>.ej-project-next{grid-column:3;grid-row:1}
.ej-project-zoom-controls{grid-column:2;grid-row:1;position:static;display:flex;justify-content:center;gap:5px;padding:0;background:none;border:0;border-radius:0;box-shadow:none}
.ej-project-zoom-controls[hidden]{display:none!important}
.ej-project-zoom-controls button{display:grid;place-items:center;min-width:44px;min-height:44px;padding:6px;border:0;border-radius:3px;background:transparent;color:#f4edef;font:500 20px/1 Arial,sans-serif;touch-action:manipulation}
.ej-project-zoom-controls [data-zoom-reset]{font-size:24px;min-width:44px}
.ej-project-zoom-controls button:hover:not(:disabled){background:#403440}
.ej-project-zoom-controls button:disabled{opacity:.35}
.ej-project-zoom-controls button:focus-visible{outline:2px solid #e9b0c0;outline-offset:-2px}

@media(max-width:680px){
 .ej-portfolio-modal{width:calc(100vw - 16px);max-height:calc(100dvh - 16px)}
 .ej-portfolio-modal-header{padding:2px 8px 2px 12px;z-index:5}
 .ej-portfolio-modal-header>span{font-size:10px}
 .ej-portfolio-modal-body{padding:12px}
 .ej-portfolio-modal .ej-project-detail-copy>.ej-project-kicker,.ej-portfolio-modal .ej-project-detail-copy>.ej-project-media-count{display:none}
 .ej-portfolio-modal .ej-project-detail-copy>h2{font-size:23px;margin-bottom:12px}
 .ej-portfolio-modal .ej-project-stage,.ej-project-detail-main .ej-project-stage{height:auto;aspect-ratio:var(--ej-photo-ratio,4/3);max-height:68dvh;min-height:190px}
 .ej-portfolio-modal .ej-project-stage[data-photo-active="false"],.ej-project-detail-main .ej-project-stage[data-photo-active="false"]{aspect-ratio:16/9}
 .ej-portfolio-modal .ej-project-expand,.ej-project-detail-main .ej-project-expand{display:none!important}
 .ej-project-toolbar{margin:5px 0}
 .ej-project-thumbnails{margin-top:5px;gap:6px}
 .ej-portfolio-modal .ej-project-viewer{margin-bottom:12px}
}
/* Reserve room for header, zoom toolbar, thumbnails and caption on laptops.
   Keep natural scrolling for short viewports and enlarged text. */
@media(min-width:681px){
 .ej-portfolio-modal-body{padding:16px 20px}
 .ej-portfolio-modal .ej-project-detail{gap:22px}
 .ej-portfolio-modal .ej-project-stage{height:clamp(140px,calc(100dvh - 280px),420px)}
 .ej-portfolio-modal .ej-project-detail-copy{padding-top:0}
 .ej-portfolio-modal .ej-project-detail-copy h2{margin-bottom:12px}
 .ej-portfolio-modal .ej-project-detail-copy>p{margin-bottom:12px;line-height:1.65}
 .ej-portfolio-modal .ej-project-detail-copy>.ej-project-media-count{padding-top:10px;margin-bottom:14px}
 .ej-portfolio-modal .ej-project-direct{margin-top:10px}
}

`;
