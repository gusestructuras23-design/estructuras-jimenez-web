# Versión recuperada: cómo usarla sin Codex

La restauración en Cloudflare se hizo el 25 de noviembre de 2026. Consulta RECUPERACION-Y-MANTENIMIENTO.md para ver versiones, arquitectura y recuperación de emergencia desde el panel de Cloudflare.

El código final está en production/. No reconstruyas el Astro antiguo de la raíz sobre el sitio base.

## Desde una descarga nueva de GitHub

1. Instala Python 3, descarga o clona este repositorio y abre una terminal en su carpeta.
2. Ejecuta `python production/restore-media.py`. Recupera las fotos y el video desde media-backup y verifica SHA-256.
3. Ejecuta `python production/manage.py`. Genera client-assets.mjs a partir de los archivos editables.
4. Edita el contenido y los estilos según RECUPERACION-Y-MANTENIMIENTO.md.
5. Configura tus propias variables CLOUDFLARE_ACCOUNT_ID y CLOUDFLARE_API_TOKEN y ejecuta `python production/manage.py --publish` para publicar el overlay. Nunca subas credenciales.
6. Guarda cambios en GitHub: editar archivos en Cloudflare o publicarlos no crea commits automáticamente.

Los binarios están respaldados como fragmentos base64 para conservarlos mediante la conexión disponible de GitHub. No los edites manualmente. restore-media.py los recompone de forma exacta.

## Límite pendiente

La entrada Akari original sigue alojada como archivos estáticos en el Worker base de Cloudflare. Los respaldos del repositorio cubren el overlay final y sus recursos, pero todavía no permiten reconstruir de cero esa entrada si se elimina el Worker base y sus versiones. No elimines ese Worker. Para una independencia completa falta migrar esa entrada y sus recursos originales al repositorio y unificar la publicación. Esta recuperación conserva la arquitectura original para evitar sustituir tu diseño por el Astro antiguo.
