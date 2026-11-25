# Mantenimiento sin Codex

## Qué se recuperó el 25 de noviembre de 2026

La versión final del overlay es `62eca9cc-9787-457d-ad50-dd52977f23a0`. Sus 21 módulos coinciden byte por byte con `production/`. El problema estaba en las publicaciones posteriores del sitio base. Se restauró el Worker base a la versión `316e229a-d191-47d4-98cd-78063d5bf32a`, activa antes de nuestros ajustes del 18 de noviembre.

## Arquitectura real: importante antes de publicar

Cloudflare usa DOS Workers. `estructuras-jimenez-web` conserva la entrada Akari y los archivos originales. `estructuras-jimenez-whatsapp` aplica los cambios finales y sirve fotos, proyectos y privacidad. La ruta `estructurasjimenez.com/*` apunta al segundo, que tiene un enlace ASSETS al primero.

**No publiques `npm run build` ni el wrangler.jsonc de la raíz sobre el sitio base.** La carpeta Astro de raíz es anterior al diseño final. No es un proyecto reconstruible completo de Akari. Esta dependencia debe migrarse en un trabajo posterior para tener un único sitio totalmente reconstruible; no afirmamos que esté resuelta aquí.

## Editar cambios finales

- Texto del pie, ubicación y transformaciones HTML: `production/whatsapp-worker.mjs`.
- Colores, espacios y diseño: `production/brand-combined.css`.
- Interacción y juego: `production/site-enhancements.js` y `site-enhancements.css`.
- Proyectos: `production/project-section.mjs`.
- Privacidad: `production/privacy-page.mjs`.
- No edites `client-assets.mjs`: se genera automáticamente.

Con Python 3 instalado, desde la carpeta del proyecto:

```
python production/manage.py
```

Esto regenera los recursos sin publicar. Para publicar, configura en tu terminal CLOUDFLARE_ACCOUNT_ID y CLOUDFLARE_API_TOKEN (token propio con permiso Workers Scripts Edit; nunca lo guardes en GitHub), y ejecuta:

```
python production/manage.py --publish
```

El comando respalda la versión anterior en production/backups y publica únicamente el overlay. No reemplaza el sitio base. Antes y después revisa inicio, proyectos, formulario sin enviar datos, juego, pie y celular. Guarda cada cambio con git add, git commit y git push. Publicar no equivale a guardar el código en GitHub.

## Emergencia desde Cloudflare, sin Codex ni terminal

1. Workers & Pages → estruct​uras-jimenez-web → Deployments / Versions.
2. Selecciona la versión base `316e229a-d191-47d4-98cd-78063d5bf32a` y despliega al 100%.
3. En estruct​uras-jimenez-whatsapp, selecciona la versión final `62eca9cc-9787-457d-ad50-dd52977f23a0` y despliega al 100%.
4. Comprueba que ASSETS apunta al Worker base y que la ruta estruct​urasjimenez.com/* sigue asignada al overlay.
5. Comprueba la página en una ventana privada. No borres versiones ni Workers.

La copia ZIP incluye fuentes finales, recursos binarios y el checkout disponible. No contiene tokens ni contraseñas. Guarda una copia fuera de esta conversación. El repositorio y el ZIP no sustituyen todavía los archivos originales de Akari alojados en el Worker base.
