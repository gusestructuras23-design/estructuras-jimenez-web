// Runs before the original page scripts; capture prevents the legacy mailto handler.
(() => {
  const endpoint = 'https://formspree.io/f/maeedawv';
  let sending = false;
  const isQuote = (form) => form instanceof HTMLFormElement && form.id === 'quote-form';
  const phoneValue = (value) => value.replace(/\D/g, '').slice(0, 10);
  const setStatus = (form, message, state = '') => {
    const status = form.querySelector('#quote-status');
    if (status) { status.textContent = message; status.dataset.state = state; }
  };
  const validateName = (input) => {
    input.setCustomValidity(input.value.trim().length >= 2 && /\p{L}/u.test(input.value) ? '' : 'Escribe un nombre o empresa válido, de al menos 2 caracteres.');
  };
  document.addEventListener('input', (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !isQuote(input.form)) return;
    if (input.name === 'phone') input.value = phoneValue(input.value);
    if (input.name === 'name') validateName(input);
  }, true);
  document.addEventListener('paste', (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.name !== 'phone' || !isQuote(input.form)) return;
    event.preventDefault();
    let digits = (event.clipboardData?.getData('text') || '').replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('52')) digits = digits.slice(2);
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    input.value = phoneValue(input.value.slice(0, start) + digits + input.value.slice(end));
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, true);
  document.addEventListener('submit', async (event) => {
    const form = event.target;
    if (!isQuote(form)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (sending) return;
    const name = form.querySelector('[name="name"]');
    const phone = form.querySelector('[name="phone"]');
    const email = form.querySelector('[name="email"]');
    const service = form.querySelector('[name="service"]');
    name.value = name.value.trim();
    validateName(name);
    phone.value = phoneValue(phone.value);
    if (email) email.value = email.value.trim();
    if (!form.reportValidity()) return;
    if (!service?.value || !Array.from(service.options).some((option) => option.value === service.value && !option.disabled)) {
      setStatus(form, 'Selecciona el producto o proyecto que necesitas.', 'error');
      service?.focus(); return;
    }
    const data = new FormData(form);
    data.delete('location');
    data.set('_subject', 'Solicitud de cotización · Estructuras Jiménez');
    const submit = form.querySelector('[type="submit"]');
    const original = submit?.innerHTML;
    sending = true;
    form.setAttribute('aria-busy', 'true');
    if (submit) { submit.disabled = true; submit.textContent = 'Enviando…'; }
    setStatus(form, 'Estamos enviando tu solicitud…');
    try {
      const response = await fetch(endpoint, {
        method: 'POST', headers: { Accept: 'application/json' }, body: data,
        signal: AbortSignal.timeout(20000)
      });
      if (!response.ok) throw new Error(response.status === 429 ? 'Hay demasiados intentos. Espera un momento o llámanos.' : 'No pudimos confirmar el envío. Tus datos siguen aquí; intenta de nuevo o llámanos.');
      const result = await response.json();
      if (result.ok !== true) throw new Error('No pudimos confirmar el envío. Tus datos siguen aquí; intenta de nuevo o llámanos.');
      form.reset();
      name.setCustomValidity('');
      setStatus(form, 'Tu solicitud se envió correctamente. Te contactaremos con los datos que proporcionaste.', 'success');
    } catch (error) {
      setStatus(form, error.name === 'Error' ? error.message : 'No pudimos confirmar el envío. Tus datos siguen aquí; intenta de nuevo o llámanos.', 'error');
    } finally {
      sending = false;
      form.removeAttribute('aria-busy');
      if (submit) { submit.disabled = false; submit.innerHTML = original; }
    }
  }, true);
  function prepare() {
    const form = document.querySelector('#quote-form');
    if (isQuote(form)) {
      form.querySelector('[name="location"]')?.closest('label')?.remove();
      const submit = form.querySelector('[type="submit"]');
      if (submit) submit.textContent = 'Enviar solicitud';
      setStatus(form, 'Enviaremos tu solicitud directamente a Estructuras Jiménez.');
      const name = form.querySelector('[name="name"]');
      if (name) validateName(name);
      const requestedService = new URLSearchParams(window.location.search).get('producto');
      const service = form.querySelector('[name="service"]');
      if (requestedService && service && Array.from(service.options).some((option) => option.value === requestedService)) service.value = requestedService;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', prepare);
  else prepare();
})();

// A single media stage keeps each project compact, regardless of photo count.
(() => {
  function initGallery(gallery) {
    if (!gallery || gallery.dataset.galleryReady) return;
    gallery.dataset.galleryReady = 'true';
    const links = Array.from(gallery.querySelectorAll('[data-project-slide]'));
    const stage = gallery.querySelector('[data-project-stage]');
    const caption = gallery.querySelector('[data-project-caption]');
    const controller = new AbortController();
    const on = (node, type, handler, options = {}) => node.addEventListener(type, handler, {...options, signal:controller.signal});
    const pointers = new Map();
    let scale = 1, x = 0, y = 0, frame = 0, gesture = null, drag = null, pinched = false, suppressClick = 0;
    let bounds;
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const photo = () => stage.querySelector('[data-project-photo] img');
    const controls = document.createElement('div');
    controls.className = 'ej-project-zoom-controls';
    controls.setAttribute('role', 'group'); controls.setAttribute('aria-label', 'Zoom de la fotografía');
    const control = (label, text) => {
      const button = document.createElement('button'); button.type = 'button';
      button.setAttribute('aria-label', label); button.title = label; button.textContent = text;
      controls.append(button); return button;
    };
    const minus = control('Reducir fotografía', '−'); minus.dataset.zoomOut = '';
    const reset = control('Restablecer tamaño de la fotografía', '↺'); reset.dataset.zoomReset = '';
    const plus = control('Ampliar fotografía', '+'); plus.dataset.zoomIn = '';
    const toolbar = document.createElement('div'); toolbar.className = 'ej-project-toolbar';
    const previousControl = gallery.querySelector('[data-project-prev]'), nextControl = gallery.querySelector('[data-project-next]');
    if (previousControl) toolbar.append(previousControl);
    toolbar.append(controls);
    if (nextControl) toolbar.append(nextControl);
    stage.parentElement.after(toolbar);
    stage.classList.add('ej-zoom-ready');
    function measure() {
      const image = photo();
      const sourceWidth = image?.naturalWidth || Number(image?.getAttribute('width')) || 0;
      const sourceHeight = image?.naturalHeight || Number(image?.getAttribute('height')) || 0;
      if (sourceWidth && sourceHeight) {
        const aspect = String(sourceWidth / sourceHeight);
        if (stage.style.getPropertyValue('--ej-photo-ratio')!==aspect) stage.style.setProperty('--ej-photo-ratio',aspect);
      }
      const rect = stage.getBoundingClientRect();
      const stageWidth = Math.max(1,rect.width), stageHeight = Math.max(1,rect.height);
      const ratio = sourceWidth && sourceHeight ? sourceWidth / sourceHeight : stageWidth / stageHeight;
      const width = Math.min(stageWidth, stageHeight * ratio, sourceWidth || Infinity);
      const limit = sourceWidth ? Math.max(1, Math.min(4, sourceWidth / width)) : 1;
      bounds = {rect, width, height:width / ratio, limit};
      return bounds;
    }
    function constrain() {
      const {rect, width, height, limit} = bounds || measure();
      scale = clamp(scale, 1, limit);
      const maxX = Math.max(0, (width * scale - rect.width) / 2);
      const maxY = Math.max(0, (height * scale - rect.height) / 2);
      x = clamp(x, -maxX, maxX); y = clamp(y, -maxY, maxY);
    }
    function draw() {
      frame = 0; constrain();
      stage.style.setProperty('--ej-zoom-scale', scale);
      stage.style.setProperty('--ej-pan-x', x + 'px'); stage.style.setProperty('--ej-pan-y', y + 'px');
      if (bounds.rect.width && bounds.rect.height) {
        // Resize the raster surface itself: scaling a fitted GPU texture blurs detail.
        stage.style.setProperty('--ej-raster-width', bounds.width * scale + 'px');
        stage.style.setProperty('--ej-raster-height', bounds.height * scale + 'px');
      }
      stage.dataset.zoom = scale.toFixed(3);
      stage.dataset.maxZoom = bounds.limit.toFixed(3);
      stage.dataset.photoActive = String(!!photo());
      stage.classList.toggle('is-zoomed', scale > 1.001);
      controls.hidden = !photo(); minus.disabled = scale <= 1.001; plus.disabled = scale >= bounds.limit - .001;
      plus.title = plus.disabled ? 'Ampliación máxima de esta fotografía' : 'Ampliar fotografía';
      const link = stage.querySelector('[data-project-photo]');
      link?.setAttribute('aria-label', scale > 1.001 ? 'Restablecer fotografía' : 'Ampliar fotografía');
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
    function zoomTo(next, cx = 0, cy = 0) {
      next = clamp(next, 1, (bounds || measure()).limit);
      const ratio = next / scale;
      x = cx - (cx - x) * ratio; y = cy - (cy - y) * ratio; scale = next;
      constrain(); schedule();
    }
    const center = (event) => {
      const {rect} = bounds || measure();
      return {x:event.clientX - rect.left - rect.width / 2, y:event.clientY - rect.top - rect.height / 2};
    };
    const pair = () => {
      const [a,b] = [...pointers.values()];
      return {x:(a.clientX+b.clientX)/2, y:(a.clientY+b.clientY)/2, distance:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)};
    };
    function beginPinch() {
      const p = pair(), c = center({clientX:p.x,clientY:p.y});
      gesture = {...c, distance:Math.max(1,p.distance), scale, x0:x, y0:y}; pinched = true;
    }
    function resetZoom() {
      scale = 1; x = y = 0; bounds = null; pointers.clear(); gesture = drag = null; pinched = false;
      stage.classList.remove('is-dragging'); measure(); draw();
    }
    const show = (link) => {
      stage.querySelector('video')?.pause();
      let media;
      if (link.dataset.projectSlide === 'video') {
        media = document.createElement('video'); media.controls = true; media.playsInline = true;
        media.preload = 'metadata'; media.poster = link.dataset.projectPoster; media.src = link.href;
        media.setAttribute('aria-label', 'Video del proyecto');
      } else {
        media = document.createElement('a'); media.href = link.href; media.target = '_blank'; media.rel = 'noopener';
        media.dataset.projectPhoto = '';
        const image = document.createElement('img'); image.src = link.href; image.alt = link.dataset.projectAlt; image.draggable = false;
        if (link.dataset.projectWidth) image.width = Number(link.dataset.projectWidth);
        if (link.dataset.projectHeight) image.height = Number(link.dataset.projectHeight);
        const label = document.createElement('span'); label.className = 'ej-project-expand'; label.textContent = 'Ampliar'; label.setAttribute('aria-hidden', 'true');
        media.append(image,label);
      }
      stage.replaceChildren(media); resetZoom();
      links.forEach(item => item.removeAttribute('aria-current')); link.setAttribute('aria-current','true');
      caption.textContent = (links.length>1?(links.indexOf(link)+1)+' / '+links.length+' · ':'')+link.dataset.projectLabel;
    };
    const step = (direction) => {
      const current = Math.max(0,links.findIndex(link => link.getAttribute('aria-current') === 'true'));
      show(links[(current + direction + links.length) % links.length]);
    };
    const previous = gallery.querySelector('[data-project-prev]'), next = gallery.querySelector('[data-project-next]');
    if (previous && next) {
      previous.hidden = next.hidden = links.length < 2;
      on(previous,'click',()=>step(-1)); on(next,'click',()=>step(1));
    }
    on(minus,'click',()=>{measure();zoomTo(scale/1.25)});
    on(plus,'click',()=>{measure();zoomTo(scale*1.25)});
    on(reset,'click',()=>{measure();zoomTo(1)});
    on(stage,'wheel',(event)=>{
      if (!photo() || !event.deltaY) return;
      event.preventDefault(); measure(); const c = center(event);
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? bounds.rect.height : 1);
      zoomTo(scale * Math.exp(-clamp(delta,-240,240)*.003),c.x,c.y);
    },{passive:false});
    on(stage,'pointerdown',(event)=>{
      if (!photo() || (event.pointerType === 'mouse' && event.button !== 0)) return;
      event.preventDefault(); measure();
      pointers.set(event.pointerId,{clientX:event.clientX,clientY:event.clientY});
      try { stage.setPointerCapture(event.pointerId); } catch {}
      if (pointers.size === 1) {
        pinched = false; drag = {id:event.pointerId,cx:event.clientX,cy:event.clientY,x0:x,y0:y,zoomed:scale>1.001};
        if (drag.zoomed) stage.classList.add('is-dragging');
      } else if (pointers.size === 2) beginPinch();
    });
    on(stage,'pointermove',(event)=>{
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId,{clientX:event.clientX,clientY:event.clientY});
      if (pointers.size >= 2 && gesture) {
        const p = pair(), c = center({clientX:p.x,clientY:p.y});
        scale = clamp(gesture.scale*p.distance/gesture.distance,1,bounds.limit);
        x = c.x - (gesture.x-gesture.x0)*scale/gesture.scale;
        y = c.y - (gesture.y-gesture.y0)*scale/gesture.scale;
        constrain(); schedule();
      } else if (drag && scale > 1.001) {
        x = drag.x0 + event.clientX-drag.cx; y = drag.y0 + event.clientY-drag.cy;
        constrain(); schedule();
      }
    });
    const finish = (event,cancelled = false) => {
      if (!pointers.has(event.pointerId)) return;
      const dx = drag ? event.clientX-drag.cx : 0, dy = drag ? event.clientY-drag.cy : 0;
      const moved = Math.hypot(dx,dy)>6;
      const swipe = !cancelled && !pinched && drag?.id===event.pointerId && !drag.zoomed && event.pointerType==='touch' && Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*1.4;
      if (pinched || moved || cancelled) suppressClick = performance.now()+600;
      pointers.delete(event.pointerId); gesture = null; stage.classList.remove('is-dragging');
      if (pointers.size >= 2) beginPinch();
      else if (pointers.size === 1) {
        const [id,p] = [...pointers.entries()][0]; drag = {id,cx:p.clientX,cy:p.clientY,x0:x,y0:y,zoomed:true};
      } else drag = null;
      if (swipe && links.length>1) step(dx<0?1:-1);
    };
    on(stage,'pointerup',event=>finish(event));
    on(stage,'pointercancel',event=>finish(event,true));
    on(stage,'lostpointercapture',event=>finish(event,true));
    on(stage,'click',(event)=>{
      if (!photo() || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button>0) return;
      event.preventDefault(); event.stopPropagation();
      if (event.detail!==0 && performance.now()<suppressClick) return;
      measure(); const c = event.detail===0 ? {x:0,y:0} : center(event);
      zoomTo(scale>1.001?1:2,c.x,c.y);
    });
    on(stage,'dragstart',event=>event.preventDefault());
    on(stage,'keydown',(event)=>{
      if (!photo()) return;
      if (['+','=','-','0'].includes(event.key)) {
        event.preventDefault(); measure(); zoomTo(event.key==='0'?1:event.key==='-'?scale/1.25:scale*1.25);
      }
    });
    on(stage,'load',()=>{measure();schedule()},{capture:true});
    links.forEach((link,index)=>{
      on(link,'click',(event)=>{
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button!==0) return;
        event.preventDefault(); show(link);
      });
      on(link,'keydown',(event)=>{
        let selected;
        if (event.key==='ArrowRight') selected=(index+1)%links.length;
        else if (event.key==='ArrowLeft') selected=(index-1+links.length)%links.length;
        else if (event.key==='Home') selected=0;
        else if (event.key==='End') selected=links.length-1;
        else return;
        event.preventDefault();links[selected].focus();show(links[selected]);
      });
    });
    const observer = typeof ResizeObserver==='function' ? new ResizeObserver(()=>{measure();schedule()}) : null;
    observer?.observe(stage);
    if (photo()) photo().draggable=false;
    resetZoom();
    return () => {controller.abort();observer?.disconnect();if(frame)cancelAnimationFrame(frame);pointers.clear()};
  }
  function initProjects() {
    document.querySelectorAll('[data-project-gallery]').forEach(initGallery);
    const catalogue = document.querySelector('[data-project-catalogue]');
    if (catalogue) {
      const cards = Array.from(catalogue.querySelectorAll('[data-project-category]'));
      const search = catalogue.querySelector('[data-project-search-input]');
      const filters = Array.from(catalogue.querySelectorAll('[data-project-filter]'));
      const more = catalogue.querySelector('[data-project-more]');
      const pageSize = Number(catalogue.dataset.projectPageSize) || 12;
      let category = '', limit = pageSize;
      const normalize = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const update = () => {
        const query = normalize(search?.value || '').trim();
        const matches = cards.filter((card) => (!category || card.dataset.projectCategory === category) && normalize(card.dataset.projectSearch).includes(query));
        cards.forEach((card) => { card.hidden = true; });
        matches.slice(0, limit).forEach((card) => { card.hidden = false; });
        more.hidden = matches.length <= limit;
        catalogue.querySelector('[data-project-empty]').hidden = matches.length !== 0;
        catalogue.querySelector('[data-project-count]').textContent = matches.length + (matches.length === 1 ? ' proyecto' : ' proyectos');
      };
      search?.addEventListener('input', () => { limit = pageSize; update(); });
      filters.forEach((button) => button.addEventListener('click', () => {
        category = button.dataset.projectFilter; limit = pageSize;
        filters.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
        update();
      }));
      more.addEventListener('click', () => { limit += pageSize; update(); });
      update();
    }
  }

  document.addEventListener('click', (event) => {
    const opener = event.target instanceof Element ? event.target.closest('[data-project-open]') : null;
    if (!opener || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0 || typeof HTMLDialogElement === 'undefined') return;
    const template = Array.from(document.querySelectorAll('template[data-project-template]')).find((item) => item.dataset.projectTemplate === opener.dataset.projectOpen);
    if (!template || document.querySelector('[data-project-overlay]')) return;
    event.preventDefault();
    const dialog = document.createElement('dialog');
    dialog.className = 'ej-portfolio-modal ej-project-page';
    dialog.dataset.projectOverlay = '';
    dialog.setAttribute('aria-labelledby', 'ej-project-title-' + opener.dataset.projectOpen);
    const header = document.createElement('div');
    header.className = 'ej-portfolio-modal-header';
    const label = document.createElement('span');
    label.textContent = 'GALERÍA DEL PROYECTO';
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'ej-portfolio-close';
    close.setAttribute('aria-label', 'Cerrar galería');
    close.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('keydown', (key) => {
      if (key.key !== 'Tab') return;
      const focusable = Array.from(dialog.querySelectorAll('a[href],button:not([disabled]),video[controls],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter((item) => item.getClientRects().length > 0);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (key.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) { key.preventDefault(); last?.focus(); }
      else if (!key.shiftKey && document.activeElement === last) { key.preventDefault(); first?.focus(); }
    });
    header.append(label, close);
    const body = document.createElement('div');
    body.className = 'ej-portfolio-modal-body';
    body.append(template.content.cloneNode(true));
    dialog.append(header, body);
    const savedScroll = window.scrollY;
    const hadGalleryClass = document.documentElement.classList.contains('ej-gallery-open');
    document.documentElement.classList.add('ej-gallery-open');
    const savedOverflow = document.documentElement.style.overflow;
    const savedPadding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.append(dialog);
    const disposeGallery = initGallery(dialog.querySelector('[data-project-gallery]'));
    dialog.addEventListener('close', () => disposeGallery?.(), {once:true});
    dialog.addEventListener('close', () => {
      dialog.querySelector('video')?.pause();
      document.documentElement.style.overflow = savedOverflow;
      if (!hadGalleryClass) document.documentElement.classList.remove('ej-gallery-open');
      document.body.style.paddingRight = savedPadding;
      dialog.remove();
      opener.focus({preventScroll:true});
      window.scrollTo({top:savedScroll,behavior:'instant'});
    }, {once:true});
    dialog.addEventListener('click', (click) => {
      if (click.target === dialog) {
        const rect = dialog.getBoundingClientRect();
        if (click.clientX < rect.left || click.clientX > rect.right || click.clientY < rect.top || click.clientY > rect.bottom) dialog.close();
        return;
      }
      const quote = click.target instanceof Element ? click.target.closest('.ej-project-quote') : null;
      if (quote && location.pathname === '/' && !click.ctrlKey && !click.metaKey && !click.shiftKey && !click.altKey && click.button === 0) {
        click.preventDefault();
        const service = document.querySelector('#quote-form [name="service"]');
        if (service && Array.from(service.options).some((item) => item.value === template.dataset.projectService)) service.value = template.dataset.projectService;
        dialog.addEventListener('close', () => requestAnimationFrame(() => {
          document.getElementById('cotizar')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
          service?.focus({preventScroll:true});
        }), {once:true});
        dialog.close();
      }
    });
    document.body.style.paddingRight = (parseFloat(getComputedStyle(document.body).paddingRight) + scrollbar) + 'px';
    document.documentElement.style.overflow = 'hidden';
    dialog.showModal();
    close.focus();
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initProjects);
  else initProjects();
})();

// A short story: build a roomy steel shelter, then welcome all three pigs inside.
(() => {
 const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 function themeWorkshop(){
  const candidates=[...document.querySelectorAll('section')].filter(section=>/taller\s*interactivo/.test(normalize(section.textContent||'')) && /refugio|casita/.test(normalize(section.textContent||'')));
  candidates.filter(section=>!candidates.some(other=>other!==section&&section.contains(other))).forEach((section,index)=>{
   if(section.dataset.simpleWorkshopReady)return;
   const contact=document.querySelector('#quote-form')?.closest('section')||document.getElementById('cotizar');
   if(contact&&contact!==section&&!section.contains(contact))contact.after(section);
   section.dataset.simpleWorkshopReady='true';section.classList.add('ej-workshop-theme','ej-simple-workshop');
   section.setAttribute('aria-label','Un refugio para los tres puerquitos');section.removeAttribute('aria-labelledby');
   const root=document.createElement('div');root.className='shell ej-pig-workshop ej-story-workshop';root.dataset.step='0';root.dataset.phase='idle';root.dataset.mode='timing';
   const id='ej-refugio-'+index;
   root.innerHTML=`<div class="ej-pig-heading"><span class="section-label">Taller interactivo</span><h2>Un refugio para los tres.</h2><p id="${id}-instruction">Construye su casita, pieza a pieza. Al terminar, invítalos a entrar.</p></div>
   <div class="ej-pig-game"><div class="ej-build-scene" role="button" tabindex="0" aria-label="Empezar a construir el refugio" aria-describedby="${id}-instruction">
   <svg class="ej-house-art" viewBox="0 0 500 360" aria-hidden="true">
    <defs><linearGradient id="${id}-roof" x2="0" y2="1"><stop stop-color="#f7c3c8"/><stop offset="1" stop-color="#cf8b95"/></linearGradient><linearGradient id="${id}-steel" x2="1" y2="0"><stop stop-color="#aeb7b4"/><stop offset=".5" stop-color="#e8ebe6"/><stop offset="1" stop-color="#899591"/></linearGradient><radialGradient id="${id}-warm"><stop stop-color="#f5ce9f" stop-opacity=".32"/><stop offset="1" stop-color="#f5ce9f" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="250" cy="304" rx="188" ry="28" fill="#191c1d" opacity=".7"/>
    <path d="M38 306H462M62 318h45m286 0h45" stroke="#68716f" stroke-width="1" opacity=".45"/>
    <g class="ej-house-blueprint" fill="none" stroke="#89918e" stroke-width="1.5" stroke-dasharray="5 7"><path d="M94 282V157L250 83 406 157V282M83 287H417"/><path d="M114 282V164H386V282" opacity=".6"/></g>
    <g class="ej-house-base"><path d="M85 285L105 272H395L415 285Z" fill="#b9c0ba"/><rect x="83" y="285" width="334" height="13" rx="4" fill="#8b9790"/><path d="M90 285H410" stroke="#eef0e9" stroke-width="2"/></g>
    <g class="ej-house-walls"><path d="M108 163H392V282H108Z" fill="#34393a"/><path d="M124 169H376V280H124Z" fill="#24292a"/><path d="M142 170v110m36-110v110m36-110v110m36-110v110m36-110v110m36-110v110m36-110v110" stroke="#56615c" stroke-width="1" opacity=".5"/>
     <rect x="97" y="157" width="16" height="126" rx="3" fill="url(#${id}-steel)"/><rect x="387" y="157" width="16" height="126" rx="3" fill="url(#${id}-steel)"/><path d="M100 159L250 86 400 159" fill="none" stroke="#bec8c1" stroke-width="9" stroke-linejoin="round"/>
     <path d="M91 278l20-33m278 0 20 33M113 171H387" fill="none" stroke="#e6ece5" stroke-width="3"/>
    </g>
    <g class="ej-house-roof"><path d="M78 159L250 77 422 159L411 169 250 95 89 169Z" fill="url(#${id}-roof)" stroke="#ffe2e5" stroke-width="2" stroke-linejoin="round"/><path d="M111 147L250 80 389 147M137 135l113-54 113 54M166 121l84-39 84 39" fill="none" stroke="#b67c86" stroke-width="1" opacity=".65"/><path d="M114 169H386" stroke="#eccbaf" stroke-width="3" stroke-linecap="round"/>
     <rect x="227" y="120" width="46" height="23" rx="5" fill="#34393a" stroke="#d3939d"/><text x="250" y="136" text-anchor="middle" fill="#f7c3c8" font-family="Georgia,serif" font-size="16">EJ</text>
    </g>
    <ellipse class="ej-shelter-glow" cx="250" cy="228" rx="155" ry="90" fill="url(#${id}-warm)"/>
    <g class="ej-pig-family"><g class="ej-pig-welcome"><image class="ej-pig-portrait" href="/media/puerquitos-v1.webp" x="120" y="230" width="260" height="130"/></g></g>
    <g class="ej-home-sparkles" stroke="#f5afb7" stroke-width="2" fill="none"><path d="M65 171v14m-7-7h14M435 201v14m-7-7h14M170 64v12m-6-6h12M337 76v12m-6-6h12"/><path d="M55 233l3-5 3 5-3 5ZM445 132l3-5 3 5-3 5Z"/></g>
    <g class="ej-aim-guide"><rect class="ej-aim-target" x="172" y="20" width="156" height="42" rx="12" fill="#f5afb71f" stroke="#f5afb7" stroke-width="1.5" stroke-dasharray="4 5"/><path d="M250 26v7m0 16v7" stroke="#f7c3c8" stroke-width="1.5"/></g>
    <g class="ej-piece-swing"><g class="ej-piece-drop"></g></g>
   </svg><span class="ej-scene-status">Tres amigos. Un lugar seguro.</span></div>
   <div class="ej-build-controls"><div class="ej-game-meta"><button class="ej-build-assist" type="button" aria-pressed="false">Sin prisa</button></div><p class="ej-build-count">Tu misión: un hogar para los tres</p><ol class="ej-build-steps" aria-label="Progreso del refugio"><li>Base</li><li>Estructura</li><li>Techo</li></ol><p class="ej-build-message" role="status" aria-live="polite">Ellos ponen la ilusión.<br>Tú construyes su refugio.</p><button class="ej-build-action" type="button" aria-describedby="${id}-instruction">Empezar a construir</button><p class="ej-build-note">Tres piezas y una sorpresa al final. Puedes jugar con clic, toque o teclado.</p><a class="ej-build-real" href="#cotizar" hidden>Ahora, hagamos realidad tu proyecto <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 18 18 6M6 6h12v12"/></svg></a></div></div>`;
   section.append(root);
   const scene=root.querySelector('.ej-build-scene'),piece=root.querySelector('.ej-piece-swing'),button=root.querySelector('.ej-build-action'),message=root.querySelector('.ej-build-message'),count=root.querySelector('.ej-build-count'),note=root.querySelector('.ej-build-note'),assist=root.querySelector('.ej-build-assist'),real=root.querySelector('.ej-build-real'),status=root.querySelector('.ej-scene-status'),steps=[...root.querySelectorAll('.ej-build-steps li')];
   const shapes=['<rect x="204" y="36" width="92" height="11" rx="4" fill="#edf0ea" stroke="#d799a3" stroke-width="2"/>','<path d="M218 57V26H282V57" fill="none" stroke="#edf0ea" stroke-width="6" stroke-linejoin="round"/>','<path d="M203 52L250 28 297 52" fill="none" stroke="#f5afb7" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>'];
   const reduced=matchMedia('(prefers-reduced-motion:reduce)');
   let step=0,phase='idle',busy=false,misses=0;
   const update=()=>{
    root.dataset.step=String(step);root.dataset.phase=phase;
    steps.forEach((item,i)=>{item.classList.toggle('is-built',i<step);if(i===step&&phase==='build')item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');});
    count.textContent=phase==='idle'?'Tu misión: un hogar para los tres':phase==='home'?'3 de 3 piezas · 3 puerquitos en casa':step+' de 3 piezas listas';
    button.textContent=phase==='idle'?'Empezar a construir':phase==='home'?'Construir otra vez':step===3?'¡A casa, puerquitos!':'Colocar '+['la base','la estructura','el techo'][step];
    scene.setAttribute('aria-label',button.textContent);piece.querySelector('.ej-piece-drop').innerHTML=shapes[Math.min(step,2)];
    real.hidden=phase!=='home';
   };
   function attempt(){
    if(busy)return;
    root.dataset.feedback='';
    if(phase==='home'){step=0;phase='idle';misses=0;status.textContent='Tres amigos. Un lugar seguro.';note.textContent='Tres piezas y una sorpresa al final. Puedes jugar con clic, toque o teclado.';message.textContent='¿Otra casita? Ellos ya están listos.';update();return;}
    if(phase==='idle'){phase='build';message.textContent='Primero, una base firme.';note.textContent=root.dataset.mode==='calm'?'Sin tiempo límite: coloca cada pieza cuando quieras.':'Pulsa cuando la pieza esté en la zona rosa. Tu avance se conserva.';update();return;}
    if(step===3){
     phase='home';busy=true;root.setAttribute('aria-busy','true');button.setAttribute('aria-disabled','true');assist.disabled=true;update();message.textContent='¡Pasen, esta casita es suya!';status.textContent='Bienvenidos a casa.';
     setTimeout(()=>{busy=false;root.removeAttribute('aria-busy');button.removeAttribute('aria-disabled');assist.disabled=false;message.textContent='Los tres ya están en casa. ¡Buen trabajo!';note.textContent='Un buen refugio empieza con una estructura bien hecha.';},reduced.matches?0:1100);return;
    }
    const calm=root.dataset.mode==='calm'||reduced.matches;
    const offset=new DOMMatrix(getComputedStyle(piece).transform).m41;
    if(!calm&&Math.abs(offset)>(misses>=2?98:78)){misses++;root.dataset.feedback='miss';message.textContent='¡Casi! Espera la zona rosa o elige «Sin prisa».';return;}
    busy=true;root.setAttribute('aria-busy','true');button.setAttribute('aria-disabled','true');assist.disabled=true;piece.style.animationPlayState='paused';scene.style.setProperty('--ej-piece-drop',([242,150,72][step])+'px');scene.classList.add('is-dropping');
    setTimeout(()=>{
     step++;misses=0;scene.classList.remove('is-dropping');piece.style.animationPlayState='';busy=false;root.removeAttribute('aria-busy');button.removeAttribute('aria-disabled');assist.disabled=false;update();
     message.textContent=['','Base firme. Ahora, una estructura que los cuide.','¡Ya casi! Vamos a ponerles un buen techo.','¡Refugio listo! Solo faltan sus habitantes.'][step];
     if(step===3){status.textContent='Su nuevo hogar está listo.';note.textContent='Invítalos a entrar. Ahora sí, caben los tres.';}
    },reduced.matches?0:460);
   }
   assist.addEventListener('click',()=>{
    const calm=root.dataset.mode!=='calm';root.dataset.mode=calm?'calm':'timing';assist.setAttribute('aria-pressed',String(calm));
    if(phase==='build'&&step<3){note.textContent=calm?'Sin tiempo límite: coloca cada pieza cuando quieras.':'Pulsa cuando la pieza esté en la zona rosa. Tu avance se conserva.';message.textContent=calm?'A tu ritmo. Cada pieza encontrará su lugar.':'¡Vamos! Busca la zona rosa.';}
   });
   button.addEventListener('click',attempt);scene.addEventListener('click',attempt);
   scene.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();event.stopPropagation();attempt();}});
   root.addEventListener('keydown',event=>{if(event.key===' ')event.stopPropagation();});
   if(typeof IntersectionObserver==='function')new IntersectionObserver(entries=>entries.forEach(entry=>root.classList.toggle('ej-build-in-view',entry.isIntersecting)),{threshold:0}).observe(root);else root.classList.add('ej-build-in-view');
   update();
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',themeWorkshop);else themeWorkshop();
 window.addEventListener('load',themeWorkshop,{once:true});
})();

// Preserve all controls and data, revealing optional detail only when requested.
(() => {
  function refineQuoteNote() {
    const status=document.querySelector('#quote-status');
    if(status && !status.dataset.state && /Enviaremos.*solicitud/i.test(status.textContent || '')) status.textContent='Te contactaremos con los datos que proporciones.';
  }
  function compactLayout() {
    const form = document.querySelector('#quote-form');
    if (form) {
      const detailsLabel = form.querySelector('[name="details"]')?.closest('label');
      if (detailsLabel && !detailsLabel.closest('details')) {
        const disclosure = document.createElement('details');
        disclosure.className = 'ej-quote-details';
        const summary = document.createElement('summary');
        summary.textContent = 'Agregar detalles del proyecto (opcional)';
        detailsLabel.before(disclosure);
        disclosure.append(summary, detailsLabel);
      }
      const status = form.querySelector('#quote-status');
      const alternative = form.querySelector('.form-alternative');
      if (status && alternative && !status.closest('.ej-quote-meta')) {
        const meta = document.createElement('div');
        meta.className = 'ej-quote-meta';
        status.before(meta);
        meta.append(status, alternative);
      }
      const consent = form.querySelector('.consent span');
      const privacy = consent?.querySelector('a');
      if (consent && privacy) {
        privacy.textContent = 'Aviso de privacidad';
        consent.replaceChildren(document.createTextNode('Acepto el uso de mis datos para esta solicitud. '), privacy);
      }
    }
    for (const node of document.querySelectorAll('footer [class*="wordmark"],footer [class*="brand"],footer h2,footer [class*="signature"]')) {
      if (parseFloat(getComputedStyle(node).fontSize) > 48) node.classList.add('ej-compact-footer-wordmark');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', compactLayout);
  else compactLayout();
  window.addEventListener('load',refineQuoteNote,{once:true});
})();

// Hide progress copy without deleting nodes still referenced by the original intro.
// Decorative light lines never participate in input, layout or the game board.
(() => {
  const labelText = /^(desliza para descubrir|tu proximo proyecto empieza aqui|dando forma a tu proximo proyecto)$/;
  const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
  function hideProgress() {
    for (const node of document.querySelectorAll('span,small,div,p,output,strong')) {
      if (node.closest('.ej-progress-hidden,.ej-workshop-theme,#quote-form,[data-project-overlay]')) continue;
      const text = normalize(node.textContent || '');
      if (node.children.length > 2 || (!/^\d{1,3}\s*%$/.test(text) && !labelText.test(text))) continue;
      if (/^\d/.test(text)) {
        let progressContext = node.closest('#akari,[class*="intro"],[id*="intro"],[class*="scroll"],[id*="scroll"],[data-scroll-percentage]');
        for (let ancestor = node, depth = 0; !progressContext && ancestor && depth < 4; ancestor = ancestor.parentElement, depth++) {
          if (getComputedStyle(ancestor).position === 'fixed') progressContext = ancestor;
        }
        if (!progressContext) continue;
      }
      let block = node;
      for (let parent = node.parentElement, depth = 0; parent && depth < 3; parent = parent.parentElement, depth++) {
        if (parent.matches('section,main,body,header,footer') || parent.querySelector('a,button,input,canvas,svg')) break;
        const box = parent.getBoundingClientRect();
        if (box.width > 420 || box.height > 150 || (parent.textContent || '').trim().length > 160) break;
        block = parent;
      }
      block.classList.add('ej-progress-hidden');
    }
  }
  function initAtmosphere() {
    hideProgress();
    document.querySelectorAll('.ej-ambient-lines').forEach((node) => node.remove());
    document.querySelectorAll('.ej-ambient-host').forEach((node) => node.classList.remove('ej-ambient-host','ej-ambient-in-view'));
    document.querySelectorAll('.ej-light-trails').forEach(node => node.remove());
    const motion = matchMedia('(prefers-reduced-motion:reduce)');
    let lightObserver;
    function addLights() {
      lightObserver?.disconnect();
      document.querySelectorAll('.ej-light-trails').forEach(node => node.remove());
      document.querySelectorAll('.ej-light-host').forEach(node => node.classList.remove('ej-light-host','ej-light-in-view'));
      if (motion.matches) return;
      lightObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => entry.target.classList.toggle('ej-light-in-view',entry.isIntersecting));
      },{rootMargin:'40px'});
      const hosts = [...document.querySelectorAll('.ej-unified-about,#cotizar,.technical-section,.featured-project,.site-footer')];
      for (const host of hosts) {
        if (hosts.some(parent => parent !== host && parent.contains(host))) continue;
        const channels = getComputedStyle(host).backgroundColor.match(/[\d.]+/g)?.map(Number);
        if (!channels || channels.length > 3 && channels[3] === 0 || Math.max(...channels.slice(0,3)) > 95) continue;
        const layer = document.createElement('div');layer.className = 'ej-light-trails';
        layer.setAttribute('aria-hidden','true');layer.setAttribute('inert','');
        layer.append(document.createElement('span'),document.createElement('span'));
        host.classList.add('ej-light-host');host.prepend(layer);lightObserver.observe(host);
      }
    }
    motion.addEventListener('change',addLights);addLights();
    const visibility = () => document.documentElement.classList.toggle('ej-light-document-hidden', document.hidden);
    document.addEventListener('visibilitychange', visibility); visibility();
    // Only direct additions, e.g. a late-created floating badge; no per-scroll scans.
    new MutationObserver(hideProgress).observe(document.body, {childList:true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAtmosphere);
  else initAtmosphere();
  window.addEventListener('load', hideProgress, {once:true});
})();

// Release only oversized/pinned welcome wrappers; preserve the Akari scene itself.
(() => {
  const normalized = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
  function naturalEntryFlow() {
    const explore = Array.from(document.querySelectorAll('a,button')).find((node) => /^(explorar el sitio|entrar al sitio)$/.test(normalized(node.textContent || '')));
    if (!explore || explore.dataset.entryFlowReady) return;
    let entry = explore.closest('section');
    while (entry && !normalized(entry.textContent || '').includes('jimenez')) entry = entry.parentElement?.closest('section');
    if (!entry) {
      for (let parent = explore.parentElement; parent && !parent.matches('body,main'); parent = parent.parentElement) {
        if (normalized(parent.textContent || '').includes('jimenez')) { entry = parent; break; }
      }
    }
    if (!entry || entry.querySelector('#productos,#cotizar')) return;
    const viewport = window.innerHeight;
    const screens = Array.from(entry.querySelectorAll('div,section,main')).filter((node) => {
      const style = getComputedStyle(node), rect = node.getBoundingClientRect();
      return ['sticky','fixed'].includes(style.position) && rect.height >= viewport * .6 && rect.width >= innerWidth * .6 && normalized(node.textContent || '').includes('jimenez');
    });
    if (['sticky','fixed'].includes(getComputedStyle(entry).position)) screens.unshift(entry);
    let outer = entry;
    const wrappers = [];
    for (let parent = entry.parentElement; parent && !parent.matches('body,main,header'); parent = parent.parentElement) {
      if (parent.querySelector('#productos,#cotizar')) break;
      if (parent.getBoundingClientRect().height > viewport * 1.3) { wrappers.push(parent); outer = parent; }
    }
    // No change to an already natural entrance.
    if (!screens.length && !wrappers.length && entry.getBoundingClientRect().height <= viewport * 1.3) return;
    wrappers.forEach((node) => node.classList.add('ej-entry-flow'));
    entry.classList.add('ej-entry-flow');
    if (screens.length) screens.forEach((node) => node.classList.add('ej-entry-screen'));
    else entry.classList.add('ej-entry-screen');
    explore.dataset.entryFlowReady = 'true';
    // The old intro may cache its original long scroll distance. Use its current end.
    explore.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0) return;
      event.preventDefault(); event.stopImmediatePropagation();
      window.scrollTo({top:window.scrollY + outer.getBoundingClientRect().bottom,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', naturalEntryFlow);
  else naturalEntryFlow();
  window.addEventListener('load', naturalEntryFlow, {once:true});
})();

// Keep the decorative brand watermark and footer from competing with real copy.
(() => {
  function refineSections() {
    const about = document.querySelector('#nosotros');
    if (about) {
      const brandWord = (text) => /jim[eé]nez/i.test(text || '');
      for (const pseudo of ['before','after']) {
        const style = getComputedStyle(about, '::' + pseudo);
        if (brandWord(style.content) && parseFloat(style.fontSize) > 80) about.classList.add('ej-about-' + pseudo + '-muted');
      }
      for (const node of about.querySelectorAll('[aria-hidden="true"],[class*="watermark"],[class*="wordmark"],[class*="ghost"]')) {
        if (brandWord(node.textContent) && parseFloat(getComputedStyle(node).fontSize) > 80) node.classList.add('ej-brand-watermark-muted');
      }
    }
    const copyrightGroups = Array.from(document.querySelectorAll('footer div')).filter((node) => (node.textContent || '').includes('©'));
    copyrightGroups.filter((node) => !copyrightGroups.some((child) => child !== node && node.contains(child))).forEach((node) => node.classList.add('ej-footer-meta'));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refineSections);
  else refineSections();
})();

// Keep the welcome copy specific to the business, within the entrance only.
(() => {
  function refineWelcomeCopy() {
    const plain = (text) => (text || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const explore = Array.from(document.querySelectorAll('a,button')).find((node) => /^(explorar el sitio|entrar al sitio)$/.test(plain(node.textContent)));
    if (!explore) return;
    let entrance = explore.closest('section');
    if (!entrance) {
      for (let parent = explore.parentElement; parent && !parent.matches('body,main'); parent = parent.parentElement) {
        if (/jim[eé]nez/i.test(parent.textContent || '')) { entrance = parent; break; }
      }
    }
    if (!entrance || entrance.querySelector('#productos,#cotizar')) return;
    // Keep the welcome's bottom caption clear of the floating contact shortcut.
    if (!entrance.dataset.ejWhatsappVisibility && typeof IntersectionObserver === 'function') {
      entrance.dataset.ejWhatsappVisibility = 'ready';
      const root = document.documentElement;
      const update = visible => root.classList.toggle('ej-welcome-in-view',visible);
      const bounds = entrance.getBoundingClientRect();
      update(bounds.bottom > 0 && bounds.top < innerHeight);
      new IntersectionObserver(entries => update(entries.some(entry => entry.isIntersecting)),{threshold:0}).observe(entrance);
    }
    for (const node of entrance.querySelectorAll('*')) {
      if (node.matches('script,style,svg,svg *')) continue;
      const text = plain(node.textContent);
      const labels = text.replace(/[^a-z]/g, '') === 'ideaformaestructura';
      const coordinates = /^(?:20[°º]49[’'′]?n(?:102[°º]46[’'′]?[ow])?|102[°º]46[’'′]?[ow])$/i.test(text.replace(/\s/g, ''));
      if (labels || coordinates) node.classList.add('ej-entry-copy-removed');
    }
    const replacements = new Map([
      ['grandes ideas.', 'Estructuras metálicas.'],
      ['estructuras que perduran.', 'Equipamiento porcino y para granos.']
    ]);
    const walker = document.createTreeWalker(entrance, NodeFilter.SHOW_TEXT);
    let textNode;
    while ((textNode = walker.nextNode())) {
      if (textNode.parentElement.closest('script,style')) continue;
      const replacement = replacements.get(plain(textNode.nodeValue));
      if (replacement) textNode.nodeValue = textNode.nodeValue.replace(/\S[\s\S]*\S|\S/, replacement);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refineWelcomeCopy);
  else refineWelcomeCopy();
})();

// Remove the secondary hero annotations requested by the owner. Retain legacy nodes
// so the original page's listeners can still refer to them safely.
(() => {
  function simplifyHero() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const copy = /delplanoaloposible|verintroduccion|hagamostuproyecto|explorarsoluciones|fabricaciondeestructurasmetalicasyequipamientoespecializado|visualizacionarquitectonicaconceptual/g;
    for (const node of hero.querySelectorAll('*')) {
      if (node.matches('script,style,svg,svg *')) continue;
      const text = (node.textContent || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
      if (text && text.replace(copy, '') === '') node.classList.add('ej-hero-removed');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', simplifyHero);
  else simplifyHero();
})();

// Keep contact details in normal flow; never place mobile shortcuts over the form.
(() => {
  function mobileContactLayout() {
    const root = document.documentElement;
    const mobile = window.matchMedia('(max-width:760px)');
    const normalize = text => (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
    function fixedControl(node, wide = false) {
      for (let parent=node; parent && parent!==document.body; parent=parent.parentElement) {
        if (getComputedStyle(parent).position!=='fixed') continue;
        const box=parent.getBoundingClientRect();
        if (box.height<=180 && (wide ? box.width>innerWidth*.65 : box.width<=180)) return parent;
        return null;
      }
      return null;
    }
    function identifyUtilities() {
      for (const node of document.querySelectorAll('a,button,[role="button"]')) {
        if (node.closest('header,footer,#quote-form,.ej-workshop-theme,[data-project-overlay],.office-whatsapp,.mobile-quick-actions,.ej-mobile-dock,.ej-mobile-utility')) continue;
        const label=normalize([node.getAttribute('aria-label'),node.getAttribute('title'),node.textContent].filter(Boolean).join(' '));
        const destination=node.getAttribute('href');
        if (/volver (arriba|al inicio|al principio)|ir (arriba|al inicio)|regresar arriba|subir|back to top/.test(label) || ['#inicio','#top','#akari'].includes(destination) || /^[↑⇧]+$/.test(label)) {
          fixedControl(node)?.classList.add('ej-mobile-utility');
        }
        if (node.matches('a[href^="tel:"]')) {
          const dock=fixedControl(node,true);
          if (dock?.querySelector('a[href="#cotizar"]')) dock.classList.add('ej-mobile-dock');
        }
      }
    }
    const visible = new Map();
    const updateContact = () => {
      root.classList.toggle('ej-projects-in-view',[...visible].some(([node,entry])=>node.id==='proyectos' && entry.isIntersecting));
      root.classList.toggle('ej-contact-in-view',[...visible].some(([node,entry])=>node.id==='cotizar' && entry.isIntersecting));
      root.classList.toggle('ej-footer-visible',[...visible].some(([node,entry])=>node.matches('footer') && entry.isIntersecting));
      root.classList.toggle('ej-game-in-view',[...visible].some(([node,entry])=>node.matches('.ej-build-controls') && entry.isIntersecting));
      root.classList.toggle('ej-footer-in-view',[...visible].some(([node,entry])=>node.matches('footer') && entry.intersectionRatio>=.98));
    };
    if (typeof IntersectionObserver==='function') {
      const observer=new IntersectionObserver(entries=>{
        entries.forEach(entry=>visible.set(entry.target,entry));updateContact();
      },{threshold:[0,.98,1],rootMargin:'0px'});
      document.querySelectorAll('#cotizar,#proyectos,footer,.ej-build-controls').forEach(node=>observer.observe(node));
    }
    const updateEditing = () => {
      const field=document.activeElement;
      const editing=field instanceof Element && field.matches('input,textarea,select,[contenteditable="true"]');
      const keyboard=window.visualViewport && innerHeight-window.visualViewport.height>120;
      root.classList.toggle('ej-mobile-editing',!!editing || !!keyboard);
    };
    document.addEventListener('focusin',updateEditing);
    document.addEventListener('focusout',()=>queueMicrotask(updateEditing));
    window.visualViewport?.addEventListener('resize',updateEditing,{passive:true});
    mobile.addEventListener('change',identifyUtilities);
    window.addEventListener('load',identifyUtilities,{once:true});
    identifyUtilities();updateEditing();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mobileContactLayout);
  else mobileContactLayout();
})();


// Decorative lamplight: the native pointer retains its precision and familiar states.
(() => {
 function cursorLamp() {
  if (!document.body.classList.contains('ej-brand-theme') || document.querySelector('.ej-cursor-lamp')) return;
  const media=matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference) and (forced-colors:none)');
  let lamp=null,frame=0,visible=false,x=0,y=0,tx=0,ty=0,last=0;
  function stop(){visible=false;if(frame)cancelAnimationFrame(frame);frame=0;last=0;lamp?.classList.remove('is-visible','is-pressed');}
  function configure(){
   stop();lamp?.remove();lamp=null;if(!media.matches)return;
   lamp=document.createElement('div');lamp.className='ej-cursor-lamp';lamp.setAttribute('aria-hidden','true');lamp.setAttribute('inert','');
   if(typeof lamp.showPopover==='function')lamp.setAttribute('popover','manual');
   document.body.append(lamp);
  }
  function draw(time){
   frame=0;if(!visible || !lamp)return;
   const t=last?1-Math.exp(-Math.min(time-last,40)/65):1;last=time;
   x+=(tx-x)*t;y+=(ty-y)*t;lamp.style.transform=`translate3d(${x}px,${y}px,0)`;
   if(Math.hypot(tx-x,ty-y)>.1)frame=requestAnimationFrame(draw);else last=0;
  }
  function update(event){
   if(!lamp || event.pointerType!=='mouse'){stop();return;}
   const target=event.target instanceof Element?event.target:null;if(!target)return;
   if(target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),video,iframe,[aria-disabled="true"]') || /^(text|grab|grabbing|zoom-in|zoom-out|wait|not-allowed)$/.test(getComputedStyle(target).cursor)){stop();return;}
   if(typeof lamp.showPopover==='function' && !lamp.matches(':popover-open')){try{lamp.showPopover();}catch{stop();return;}}
   else if(typeof lamp.showPopover!=='function' && target.closest('dialog[open]')){stop();return;}
   tx=event.clientX;ty=event.clientY;if(!visible){x=tx;y=ty;last=0;}
   visible=true;lamp.classList.add('is-visible');lamp.classList.toggle('is-interactive',!!target.closest('a[href],button,summary,label[for],[role="button"],.ej-build-scene'));
   if(!frame)frame=requestAnimationFrame(draw);
  }
  document.addEventListener('pointermove',update,{passive:true});document.addEventListener('pointerover',update,{passive:true});
  document.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse'){stop();return;}if(visible)lamp?.classList.add('is-pressed');},{passive:true});
  document.addEventListener('pointerup',()=>lamp?.classList.remove('is-pressed'),{passive:true});
  document.addEventListener('pointercancel',stop,{passive:true});document.documentElement.addEventListener('pointerleave',stop,{passive:true});
  document.addEventListener('keydown',stop,{passive:true});document.addEventListener('scroll',stop,{passive:true,capture:true});
  window.addEventListener('blur',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  media.addEventListener('change',configure);configure();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cursorLamp);else cursorLamp();
})();


// Choreograph headings, media and cards with separate, brief entrances.
(() => {
 function revealContent(){
  if(!document.body.classList.contains('ej-brand-theme'))return;
  const media=matchMedia('(prefers-reduced-motion:reduce)');let observer;
  const seen=new WeakSet();
  const groups='.ej-unified-about .hero-copy,.ej-projects-heading,.quote-intro,.ej-pig-heading';
  const selector=groups+',.ej-company-visual,.ej-project-card,#quote-form,.ej-footer-top,.ej-footer-bottom,.ej-pig-workshop';
  function show(node,immediate=false){
   if(immediate)node.classList.add('ej-reveal-immediate');
   node.classList.remove('ej-reveal-pending');node.classList.add('ej-reveal-shown');seen.add(node);observer?.unobserve(node);
  }
  function configure(){
   observer?.disconnect();const nodes=[...document.querySelectorAll(selector)];
   document.querySelectorAll('.ej-reveal-part').forEach(node=>{node.classList.remove('ej-reveal-part');node.style.removeProperty('--ej-part-delay');});
   nodes.forEach(node=>node.classList.remove('ej-reveal-pending','ej-reveal-shown','ej-reveal-item','ej-reveal-immediate'));
   if(media.matches || typeof IntersectionObserver!=='function')return;
   observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)show(entry.target);},{threshold:0,rootMargin:'0px 0px -40px 0px'});
   nodes.forEach(node=>{
    node.classList.add('ej-reveal-item');
    const group=node.matches(groups),card=node.matches('.ej-project-card'),photo=node.matches('.ej-company-visual');
    node.dataset.revealType=group?'group':card?'card':photo?'media':'surface';
    node.style.setProperty('--ej-reveal-delay','0ms');
    if(group){
     const parts=node.matches('.ej-projects-heading')?[...node.querySelectorAll(':scope > div > span,:scope > div > h2,:scope > p')]:[...node.children].filter(child=>!child.hidden && getComputedStyle(child).display!=='none');
     parts.forEach((part,index)=>{part.classList.add('ej-reveal-part');part.style.setProperty('--ej-part-delay',`${Math.min(index*65,195)}ms`);});
    }
    if(card){
     const columns=getComputedStyle(node.parentElement).gridTemplateColumns.split(' ').length;
     const index=[...node.parentElement.children].indexOf(node);
     node.style.setProperty('--ej-reveal-delay',`${index%Math.max(1,columns)*70}ms`);
    }
    if(seen.has(node) || node.getBoundingClientRect().top<innerHeight-40)show(node,true);
    else{node.classList.add('ej-reveal-pending');observer.observe(node);}
   });
  }
  document.addEventListener('focusin',event=>{const node=event.target.closest?.('.ej-reveal-item');if(node)show(node,true);});
  window.addEventListener('beforeprint',()=>document.querySelectorAll('.ej-reveal-pending').forEach(node=>show(node,true)));
  window.addEventListener('pageshow',event=>{if(event.persisted)document.querySelectorAll('.ej-reveal-pending').forEach(node=>{if(node.getBoundingClientRect().top<innerHeight)show(node,true);});});
  media.addEventListener('change',configure);configure();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',revealContent);else revealContent();
})();


// Pointer light is decorative and event-driven: no idle animation or touch tracking.
(() => {
 const media=matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
 let card=null,box=null,frame=0,x=50,y=40;
 function reset(){
  if(frame)cancelAnimationFrame(frame);frame=0;
  card?.style.removeProperty('--ej-shine-x');card?.style.removeProperty('--ej-shine-y');card=null;box=null;
 }
 function paint(){frame=0;if(card){card.style.setProperty('--ej-shine-x',x.toFixed(1)+'%');card.style.setProperty('--ej-shine-y',y.toFixed(1)+'%');}}
 function track(event){
  if(!media.matches||event.pointerType!=='mouse'){reset();return;}
  const next=event.target instanceof Element?event.target.closest('.ej-project-card'):null;
  if(!next){reset();return;}
  if(next!==card){reset();card=next;box=card.querySelector('.ej-project-card-image')?.getBoundingClientRect();}
  if(!box?.width||!box.height)return;
  x=Math.max(0,Math.min(100,(event.clientX-box.left)/box.width*100));y=Math.max(0,Math.min(100,(event.clientY-box.top)/box.height*100));
  if(!frame)frame=requestAnimationFrame(paint);
 }
 document.addEventListener('pointerover',track,{passive:true});document.addEventListener('pointermove',track,{passive:true});
 document.addEventListener('pointerout',event=>{if(card&&!(event.relatedTarget instanceof Node&&card.contains(event.relatedTarget)))reset();},{passive:true});
 document.addEventListener('scroll',reset,{passive:true,capture:true});window.addEventListener('resize',reset,{passive:true});window.addEventListener('blur',reset);media.addEventListener('change',reset);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
})();

// Recolour only the native welcome's paint; its layout and animation declarations stay native.
(() => {
 const properties=['color','background-color','background-image','border-top-color','border-right-color','border-bottom-color','border-left-color','box-shadow','text-shadow','fill','stroke'];
 let sheet=null,observer=null,scheduled=0;
 function tone(r,g,b,alpha,property){
  const max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;
  if(alpha===0)return null;
  let hue=0;
  if(delta){hue=(max===r?(g-b)/delta:max===g?(b-r)/delta+2:(r-g)/delta+4)*60;if(hue<0)hue+=360;}
  const accent=delta>3&&(hue>=250||hue<65);
  const neutralLight=delta<=8&&min>200;
  if(!accent&&!neutralLight)return null;
  const background=property.startsWith('background')||property.includes('shadow');
  if(accent&&background&&max<95){
   const l=Math.round(r*.2126+g*.7152+b*.0722);return [l,Math.min(255,l+2),Math.min(255,l+3)];
  }
  const rose=accent&&(hue>=300||hue<10);
  const target=rose?[245,175,183]:[244,242,239];
  const factor=Math.min(1,max/Math.max(...target));
  return target.map(v=>Math.round(v*factor));
 }
 function recolor(value,property,thinLight){
  const urls=[];
  let result=value.replace(/url\((?:[^"'()]|"[^"]*"|'[^']*')*\)/g,url=>{urls.push(url);return `__EJ_URL_${urls.length-1}__`;});
  result=result.replace(/rgba?\(([^)]+)\)/g,(match,body)=>{
   const parts=body.trim().split(/[\s,/]+/);if(parts.length<3)return match;
   const channels=parts.slice(0,3).map(v=>parseFloat(v)*(v.includes('%')?2.55:1));
   const alpha=parts[3]===undefined?1:parseFloat(parts[3])/(parts[3].includes('%')?100:1);
   const next=tone(...channels,alpha,property)||channels.map(Math.round);
   const glow=property.includes('shadow') || thinLight&&property.startsWith('background')&&alpha<1;
   const haze=property==='background-image'&&!thinLight&&alpha>0&&alpha<=.55&&Math.max(...channels)>95;
   const opacity=Number((alpha*(haze ? .82 : glow ? .72 : 1)).toFixed(4));
   if(opacity===alpha&&next.every((v,i)=>Math.abs(v-channels[i])<1))return match;
   return `rgba(${next.join(',')},${opacity})`;
  });
  return result.replace(/__EJ_URL_(\d+)__/g,(_,i)=>urls[Number(i)]);
 }
 function apply(){
  scheduled=0;
  const plain=value=>(value||'').replace(/\s+/g,' ').trim().toLowerCase();
  const explore=[...document.querySelectorAll('a,button')].find(node=>/^(explorar el sitio|entrar al sitio)$/.test(plain(node.textContent)));
  if(!explore)return;
  let entry=explore.closest('section');
  if(!entry){for(let parent=explore.parentElement;parent&&!parent.matches('body,main');parent=parent.parentElement){if(/jim[eé]nez/i.test(parent.textContent||'')){entry=parent;break;}}}
  if(!entry||entry.querySelector('#productos,#cotizar'))return;
  sheet?.remove();
  const rules=[];let index=0;
  for(const node of [entry,...entry.querySelectorAll('*')]){
   if(node.matches('script,style,link,img,video,iframe'))continue;
   const id=String(index++),selector=`[data-ej-entry-tone="${id}"]`;
   node.setAttribute('data-ej-entry-tone',id);
   const base=getComputedStyle(node);
   const thickness=Math.min(parseFloat(base.width),parseFloat(base.height));
   const thinLight=thickness>0&&thickness<=8;
   const smallText=parseFloat(base.fontSize)<=24&&Boolean((node.textContent||'').trim());
   for(const pseudo of ['', '::before','::after']){
    const style=getComputedStyle(node,pseudo||null);
    if(pseudo&&['none','normal'].includes(style.content))continue;
    const declarations=[];
    for(const property of properties){
     const value=style.getPropertyValue(property);if(!value||['none','transparent'].includes(value))continue;
     const next=property==='color'&&smallText&&!pseudo?'rgb(244,242,239)':recolor(value,property,thinLight);if(next!==value)declarations.push(`${property}:${next}!important`);
    }
    if(declarations.length)rules.push(`${selector}${pseudo}{${declarations.join(';')}}`);
   }
  }
  sheet=document.createElement('style');sheet.id='ej-native-entry-palette';sheet.textContent=rules.join('\n');document.head.append(sheet);
  if(!observer){
   observer=new MutationObserver(records=>{
    if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&!node.matches('script,style')))&&!scheduled)scheduled=requestAnimationFrame(apply);
   });
   observer.observe(entry,{childList:true,subtree:true});
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
 window.addEventListener('load',apply,{once:true});
})();
