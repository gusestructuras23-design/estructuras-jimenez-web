import { privacyContent, privacyDescription } from './privacy-page.mjs';
import { projectSection, projectStyles, projects, renderCatalogue, renderProject } from './project-section.mjs';
import { serveProjectMedia } from './project-media.mjs';
import { clientScript, clientStyle, brandStyle } from './client-assets.mjs';
// ASSETS is a service binding to the unchanged original Akari Worker.
// Deploy with deploy-whatsapp.py; never rebuild from the outdated Astro checkout.
const whatsappButton = `
<style id="office-whatsapp-style">
.office-whatsapp{position:fixed;right:22px;bottom:calc(22px + env(safe-area-inset-bottom,0px));z-index:9999;display:flex;align-items:center;justify-content:center;width:58px;height:58px;border-radius:50%;background:#128c4a;color:#fff;box-shadow:0 4px 18px #0005;text-decoration:none;transition:transform .15s}
.office-whatsapp:hover{transform:translateY(-3px);background:#107c42}
.office-whatsapp:focus-visible{outline:3px solid #fff;outline-offset:3px;box-shadow:0 0 0 6px #128c4a}
.office-whatsapp svg{width:32px;height:32px;fill:currentColor}
@media(max-width:760px){.office-whatsapp{right:16px;bottom:calc(82px + env(safe-area-inset-bottom,0px));width:54px;height:54px}}
@media(prefers-reduced-motion:reduce){.office-whatsapp{transition:none}}
</style>
<a class="office-whatsapp" href="https://wa.me/523781214083" target="_blank" rel="noopener noreferrer" aria-label="Abrir WhatsApp de la oficina de Estructuras Jiménez" title="Escríbenos por WhatsApp">
<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.52 3.48A11.84 11.84 0 0 0 12.05 0C5.47 0 .11 5.35.1 11.93c0 2.1.55 4.15 1.6 5.96L0 24l6.28-1.65a11.94 11.94 0 0 0 5.76 1.47h.01c6.58 0 11.94-5.35 11.95-11.93a11.86 11.86 0 0 0-3.48-8.41ZM12.05 21.8a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.73.98 1-3.64-.24-.38a9.87 9.87 0 0 1-1.51-5.24c0-5.47 4.45-9.92 9.93-9.92a9.84 9.84 0 0 1 7.02 2.91 9.85 9.85 0 0 1 2.9 7.02c0 5.47-4.45 9.92-9.97 9.86Zm5.45-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.61.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.5 1.71.64.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2.01-1.41.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"/></svg>
</a>`;

const externalArrow = `<svg class="ej-project-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>`;
const brandWordmark = '<span class="ej-brand-wordmark" aria-hidden="true"><span>Estructuras</span><strong>Jiménez</strong></span>';
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
const companyMapURL = 'https://www.google.com/maps/dir/?api=1&destination=20.7766287%2C-102.7632378';
const companyAddress = { '@type':'PostalAddress', streetAddress:'Periférico Salvador Zúñiga 1871', postalCode:'47723', addressLocality:'Tepatitlán de Morelos', addressRegion:'Jalisco', addressCountry:'MX' };
function updateStructuredLocation(value) {
  if (Array.isArray(value)) return value.map(updateStructuredLocation);
  if (!value || typeof value !== 'object') return value;
  const types = [].concat(value['@type'] || []);
  if (types.includes('PostalAddress')) return { ...companyAddress };
  const updated = Object.fromEntries(Object.entries(value).map(([key, item]) => [key, updateStructuredLocation(item)]));
  if (types.some(type => ['LocalBusiness', 'Organization', 'GeneralContractor'].includes(type)) && /Estructuras\s+Jiménez/i.test(value.name || '')) {
    updated.foundingDate = '1994-10-31';
    updated.address = companyAddress;
    updated.geo = { '@type':'GeoCoordinates', latitude:20.7766287, longitude:-102.7632378 };
    updated.hasMap = companyMapURL;
  }
  return updated;
}
function projectDocument(content, title, path, project = null, descriptionOverride = null) {
  const canonical = 'https://estructurasjimenez.com' + path;
  const description = descriptionOverride || project?.description || 'Proyectos de estructuras metálicas y equipamiento realizados por Estructuras Jiménez.';
  const safeDescription = escapeHTML(description);
  title = escapeHTML(title);
  const structured = project ? '<script type="application/ld+json">' + JSON.stringify({ '@context':'https://schema.org', '@type':'CreativeWork', name: project.title, description, url: canonical, image: project.photos.map((photo) => 'https://estructurasjimenez.com' + photo.src), creator: { '@type':'Organization', name:'Estructuras Jiménez', foundingDate:'1994-10-31' } }).replace(/</g, '\\u003c') + '</script>' : '';
  return '<!doctype html><html lang="es-MX"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + title + ' | Estructuras Jiménez</title><meta name="description" content="' + safeDescription + '"><link rel="canonical" href="' + canonical + '"><link rel="icon" href="/brand/estructuras-jimenez-auth0.png"><meta name="theme-color" content="#222526"><meta property="og:title" content="' + title + ' | Estructuras Jiménez"><meta property="og:description" content="' + safeDescription + '"><meta property="og:url" content="' + canonical + '"><meta property="og:image" content="https://estructurasjimenez.com' + (project?.photos[0].src || (descriptionOverride ? '/brand/estructuras-jimenez-auth0.png' : projects[0].photos[0].src)) + '"><style>' + projectStyles + clientStyle + brandStyle + '</style><script>' + clientScript + '</script>' + structured + '</head><body class="ej-project-page ej-brand-theme"><a class="ej-project-skip" href="#contenido">Saltar al contenido</a><header class="ej-project-page-header"><div><a class="ej-project-page-brand ej-brand-lockup" href="/" aria-label="Estructuras Jiménez, inicio"><img src="/brand/estructuras-jimenez-auth0.png" alt="Estructuras Jiménez" width="76" height="59">' + brandWordmark + '</a><nav class="ej-project-page-nav" aria-label="Navegación principal"><a href="/">Inicio</a><a href="/proyectos/">Proyectos</a><a class="ej-project-header-quote" href="/#cotizar">Cotizar ' + externalArrow + '</a></nav></div></header>' + content + '<footer class="ej-project-page-footer"><span>Estructuras Jiménez · Tepatitlán, Jalisco</span><a href="/aviso-de-privacidad">Política de privacidad</a></footer>' + whatsappButton + '</body></html>';
}
function serveProjectPage(request) {
  const url = new URL(request.url);
  const catalogue = url.pathname === '/proyectos' || url.pathname === '/proyectos/';
  const match = /^\/proyectos\/([a-z0-9-]+)\/?$/.exec(url.pathname);
  if (!catalogue && !match) return null;
  if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, { status:405, headers:{ Allow:'GET, HEAD' } });
  if (!url.pathname.endsWith('/')) { url.pathname += '/'; return Response.redirect(url.href, 308); }
  const project = match ? projects.find((item) => item.slug === match[1]) : null;
  const status = !catalogue && !project ? 404 : 200;
  const content = catalogue ? renderCatalogue() : project ? renderProject(project) : '<main class="ej-project-page-main" id="contenido"><h1>Proyecto no encontrado.</h1><a href="/proyectos/">Ver los proyectos realizados</a></main>';
  const title = catalogue ? 'Proyectos realizados' : project?.title || 'Proyecto no encontrado';
  return new Response(request.method === 'HEAD' ? null : projectDocument(content, title, url.pathname, project), { status, headers: { 'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-cache', 'X-Content-Type-Options':'nosniff' } });
}

function servePrivacyPage(request) {
 const url = new URL(request.url);
 if (!['/aviso-de-privacidad','/aviso-de-privacidad/','/politica-de-privacidad','/politica-de-privacidad/'].includes(url.pathname)) return null;
 if (!['GET','HEAD'].includes(request.method)) return new Response(null,{status:405,headers:{Allow:'GET, HEAD'}});
 if (url.pathname !== '/aviso-de-privacidad') {url.pathname='/aviso-de-privacidad';url.search='';return Response.redirect(url.href,308);}
 return new Response(request.method==='HEAD' ? null : projectDocument(privacyContent,'Política de privacidad','/aviso-de-privacidad',null,privacyDescription),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}});
}

export default {
  async fetch(request, env) {
    const privacyPage = servePrivacyPage(request);
    if (privacyPage) return privacyPage;
    const media = serveProjectMedia(request);
    if (media) return media;
    const projectPage = serveProjectPage(request);
    if (projectPage) return projectPage;
    const response = await env.ASSETS.fetch(request);
    if (request.method !== 'GET' || !response.headers.get('content-type')?.includes('text/html') || response.status !== 200) return response;
    const aboutCopy = 'Fabricamos jaulas, comederos y casetas para porcinos, tolvas para granos y estructuras metálicas para bodegas y naves.';
    const rewriter = new HTMLRewriter()
      .on('head', { element(element) { element.prepend('<style>' + clientStyle + projectStyles + '</style><script>' + clientScript + '</script>', { html: true }); element.append('<style id="ej-brand-theme">' + brandStyle + '</style>', {html:true}); } })
      .on('.site-header .brand', { element(element) {
        element.setAttribute('class', ((element.getAttribute('class') || '') + ' ej-brand-lockup').trim());
        element.setAttribute('aria-label', 'Estructuras Jiménez, inicio');
        element.append(brandWordmark, {html:true});
      } })
      .on('.site-header .header-quote', { element(element) {
        element.setAttribute('aria-label', 'Cotizar proyecto');
        element.setInnerContent('<span class="ej-quote-label-full">Cotizar proyecto</span><span class="ej-quote-label-short" aria-hidden="true">Cotizar</span>' + externalArrow, {html:true});
      } })
      .on('meta[name="theme-color"]', { element(element) { element.setAttribute('content', '#222526'); } })
      .on('a[href*="google.com/maps"], a.location-card', { element(element) {
        element.setAttribute('href', companyMapURL);
        element.setAttribute('target', '_blank');
        element.setAttribute('rel', 'noopener noreferrer');
      } })
      .on('.location-card small, .location-card p', { element(element) {
        element.setInnerContent('Periférico Salvador Zúñiga #1871<br>47723 Tepatitlán de Morelos, Jalisco', {html:true});
      } })
      .on('script[type="application/ld+json"]', {
        buffer:'',
        element() { this.buffer = ''; },
        text(chunk) {
          this.buffer += chunk.text;
          if (!chunk.lastInTextNode) { chunk.remove(); return; }
          let content = this.buffer;
          try { content = JSON.stringify(updateStructuredLocation(JSON.parse(content))).replace(/</g, '\\u003c'); } catch { /* Preserve unrelated invalid structured data. */ }
          chunk.replace(content, {html:true});
        }
      })
      .on('.hero', { element(element) {
        element.setAttribute('class', ((element.getAttribute('class') || '') + ' ej-unified-about').trim());
        element.setAttribute('aria-labelledby', 'ej-company-title');
        element.prepend('<span id="nosotros" class="ej-company-anchor" aria-hidden="true"></span><figure class="ej-company-visual"><img class="ej-company-photo" src="/media/estructura-empresa-v1.jpg" width="720" height="536" alt="Estructura metálica en construcción, con columnas y vigas sobre muros de ladrillo." decoding="async" fetchpriority="high"></figure>', {html:true});
      } })
      .on('.hero img', { element(element) {
        element.setAttribute('src', '/media/estructura-empresa-v1.jpg');
        element.removeAttribute('srcset');
        element.setAttribute('hidden', '');
        element.setAttribute('aria-hidden', 'true');
      } })
      .on('.hero .eyebrow', { element(element) { element.setInnerContent('Tepatitlán, Jalisco'); } })
      .on('.hero .hero-copy h1', { element(element) {
        element.setAttribute('id', 'ej-company-title');
        element.setInnerContent('Estructuras <span>Jiménez.</span>', {html:true});
        element.after('<p class="ej-company-since"><time datetime="1994-10-31" title="31 de octubre de 1994">Desde 1994</time><span>Más de tres décadas de trayectoria.</span></p>',{html:true});
      } })
      .on('.hero .hero-description, .hero .hero-bottom > p', { element(element) { element.setInnerContent(aboutCopy, {html:true}); } })
      .on('.featured-project, #proyecto-destacado, .hero .hero-phone', { element(element) {
        element.setAttribute('hidden','');element.setAttribute('aria-hidden','true');
        element.setAttribute('data-ej-redundant','');
      } })
      .on('a[href="#proyecto-destacado"]', { element(element) { element.setAttribute('href','#proyectos'); } })
      .on('a[href="#nosotros"]', { element(element) { element.setInnerContent('Quiénes somos'); } })
      .on('section#nosotros', { element(element) {
        element.setAttribute('id', 'ej-legacy-about');
        element.setAttribute('class', ((element.getAttribute('class') || '') + ' ej-legacy-about').trim());
        element.setAttribute('hidden', '');
        element.setAttribute('aria-hidden', 'true');
      } })
      .on('#productos', { element(element) {
        element.setAttribute('hidden', '');
        element.setAttribute('aria-hidden', 'true');
        element.after(projectSection, { html: true });
      } })
      .on('#main-nav', { element(element) { element.prepend('<a href="#proyectos">Proyectos</a>', { html: true }); } })
      .on('.mobile-quick-actions', { element(element) {
        element.setAttribute('hidden', '');
        element.setAttribute('aria-hidden', 'true');
      } })
      .on('footer.site-footer', { element(element) {
        element.setAttribute('class',((element.getAttribute('class')||'')+' ej-clean-footer').trim());
        element.setInnerContent('<div class="shell ej-footer-inner"><div class="ej-footer-top"><div class="ej-footer-brand"><a href="#inicio" aria-label="Estructuras Jiménez, inicio"><img src="/brand/estructuras-jimenez-auth0.png" width="60" height="48" alt="" loading="lazy"><span>Estructuras<br><strong>Jiménez.</strong></span></a><time class="ej-footer-since" datetime="1994-10-31">Desde 1994</time></div><div class="ej-footer-details"><div class="ej-footer-contact"><a class="ej-footer-phone" href="tel:+523781214083" aria-label="Llamar al 378 121 4083">378 121 4083</a><a class="ej-footer-inline" href="' + companyMapURL + '" target="_blank" rel="noopener noreferrer" aria-label="Cómo llegar al taller">Cómo llegar' + externalArrow + '</a></div><address class="ej-footer-address">Periférico Salvador Zúñiga #1871<br>47723 Tepatitlán de Morelos, Jalisco</address></div></div><div class="ej-footer-bottom"><div class="ej-footer-legal"><span class="ej-footer-copyright">© ' + new Date().getUTCFullYear() + ' Estructuras Jiménez</span><a href="/aviso-de-privacidad">Privacidad</a></div><a class="ej-footer-credit" href="https://wa.me/5215644361349" target="_blank" rel="noopener noreferrer" aria-label="Desarrollado por IPService, contactar por WhatsApp"><span>Desarrollado por <strong>IPService</strong></span>' + externalArrow + '</a></div></div>',{html:true});
      } })
      .on('.quote-intro .section-label', { element(element) { element.setInnerContent('Contacto'); } })
      .on('.quote-intro h2', { element(element) { element.setInnerContent('Solicita una <span>cotización.</span>', {html:true}); } })
      .on('.quote-intro > p', { element(element) { element.setInnerContent('Elige lo que necesitas y déjanos tus datos.'); } })
      .on('.location-card strong', { element(element) { element.setInnerContent('Ubicación'); } })
      .on('#quote-form .form-head h3', { element(element) { element.setInnerContent('Tus datos'); } })
      .on('#quote-status', { element(element) { element.setInnerContent('Te contactaremos con los datos que proporciones.'); } })
      .on('#quote-form', { element(element) {
        element.setAttribute('action', 'https://formspree.io/f/maeedawv');
        element.setAttribute('method', 'post');
        element.removeAttribute('enctype');
        element.prepend('<input type="hidden" name="_subject" value="Solicitud de cotización · Estructuras Jiménez"><div style="position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)" aria-hidden="true"><input name="_gotcha" tabindex="-1" autocomplete="off" aria-label="Deja este campo vacío"></div>', { html: true });
      } })
      .on('#quote-form input[name="location"]', { element(element) { element.setAttribute('disabled', ''); } })
      .on('#quote-form input[name="phone"]', { element(element) {
        for (const [key, value] of Object.entries({ type:'tel', inputmode:'numeric', autocomplete:'tel-national', minlength:'10', maxlength:'10', pattern:'[0-9]{10}', placeholder:'10 dígitos', title:'Escribe un teléfono de 10 dígitos, sin letras.', required:'' })) element.setAttribute(key, value);
      } })
      .on('#quote-form select[name="service"] option[value=""]', { element(element) { element.setInnerContent('Selecciona una opción'); } })
      .on('#quote-form input[name="name"]', { element(element) {
        for (const [key, value] of Object.entries({ minlength:'2', maxlength:'120', pattern:'.*[^\\s].*', required:'' })) element.setAttribute(key, value);
      } })
      .on('#quote-form input[name="email"]', { element(element) { element.setAttribute('type', 'email'); element.setAttribute('maxlength', '254'); } })
      .on('#quote-form textarea[name="details"]', { element(element) { element.setAttribute('maxlength', '2500'); } })
      .on('#quote-form select[name="service"]', { element(element) {
        element.setAttribute('required', '');
        element.append('<option value="Carros pastureros">Carros pastureros</option><option value="Estructuras metálicas">Estructuras metálicas</option>', {html:true});
      } })
      .on('#quote-form input[type="checkbox"]', { element(element) { element.setAttribute('name', 'consent'); element.setAttribute('required', ''); } })
      .on('#quote-form button[type="submit"]', { element(element) { element.setInnerContent('Enviar solicitud'); } })
      .on('body', {
      element(element) { element.setAttribute('class', ((element.getAttribute('class') || '') + ' ej-brand-theme').trim()); element.append(whatsappButton, { html: true }); }
    });
    const transformed = rewriter.transform(response);
    const result = new Response(transformed.body, transformed);
    result.headers.set('Content-Type', 'text/html; charset=utf-8');
    result.headers.delete('Content-Length');
    result.headers.delete('ETag');
    return result;
  }
};
