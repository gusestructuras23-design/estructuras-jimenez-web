const menuButton = document.querySelector<HTMLButtonElement>('.menu-toggle');
const nav = document.querySelector<HTMLElement>('.main-nav');
const header = document.querySelector<HTMLElement>('.site-header');
function closeMenu(restoreFocus = false) {
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Abrir menú');
  nav?.classList.remove('open');
  if (restoreFocus) menuButton?.focus();
}
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  nav?.classList.toggle('open', open);
});
document.querySelectorAll<HTMLAnchorElement>('.main-nav a, .header-quote').forEach((link) => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') closeMenu(true); });
document.addEventListener('click', (event) => { if (event.target instanceof Node && !header?.contains(event.target)) closeMenu(); });
window.matchMedia('(min-width: 761px)').addEventListener('change', () => closeMenu());
// Keep navigation usable without JavaScript, too.
header?.classList.add('has-menu');
const form = document.querySelector<HTMLFormElement>('#quote-form');
const service = form?.querySelector<HTMLSelectElement>('[name="service"]');
document.querySelectorAll<HTMLAnchorElement>('[data-service]').forEach((link) => link.addEventListener('click', () => { if (service) service.value = link.dataset.service || ''; }));
const status = document.querySelector<HTMLElement>('#quote-status');
const summary = document.querySelector<HTMLTextAreaElement>('#quote-summary');
const summaryWrap = document.querySelector<HTMLElement>('#quote-summary-wrap');
const buildQuote = () => {
  if (!form) return '';
  const data = new FormData(form);
  return ['SOLICITUD DE COTIZACIÓN · ESTRUCTURAS JIMÉNEZ', '', 'Nombre o empresa: ' + data.get('name'), 'Teléfono: ' + data.get('phone'), 'Producto o proyecto: ' + data.get('service'), 'Ubicación: ' + (data.get('location') || 'No indicada'), 'Correo: ' + (data.get('email') || 'No indicado'), '', 'Detalles, medidas o cantidades:', String(data.get('details') || 'Por definir')].join('\n');
};
document.querySelector<HTMLButtonElement>('#copy-quote')?.addEventListener('click', async () => {
  if (!form?.reportValidity()) return;
  const body = buildQuote();
  try {
    await navigator.clipboard.writeText(body);
    if (status) status.textContent = 'Solicitud copiada. Ya puedes pegarla y compartirla por el medio que prefieras.';
  } catch {
    if (summary && summaryWrap) { summaryWrap.hidden = false; summary.value = body; summary.focus(); summary.select(); }
    if (status) status.textContent = 'Selecciona y copia el resumen que aparece abajo.';
  }
});
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const subject = 'Solicitud de cotización · ' + (service?.value || 'Estructuras Jiménez');
  window.location.href = 'mailto:gusestructuras23@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(buildQuote());
  if (status) status.textContent = 'Revisa y envía el mensaje desde tu aplicación de correo. Si no se abrió, usa “Copiar solicitud”.';
});
