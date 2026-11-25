# Recuperación confirmada en vivo: 25 de noviembre de 2026

La portada original Akari y sus siete recursos están ahora en production/native-akari/, incluidos en production/native-akari.mjs. Esto resuelve la dependencia pendiente descrita en las guías anteriores para la página principal. Ya no hace falta recuperar la portada mediante un rollback del Worker base.

Versión publicada: b679eb5d-e3bc-4b38-99bf-867247efdb6c. Comprobada en Chromium contra https://estructurasjimenez.com/: portada Akari visible, construcción de las tres piezas y entrada de los puerquitos; móvil 390px sin desbordamiento.

Fuente completa: rama recovery-akari-completa-20261125. Esta rama incluye binarios directamente, además del código del juego, galería, cursores, formularios, privacidad y pie final. Las rutas no principales aún tienen respaldo ASSETS en el Worker base, que debe conservarse.

Para editar la portada original, modifica production/native-akari/index.html y sus estilos. Después ejecuta:

    python production/generate-native.py
    python production/manage.py

Para publicar desde tu computadora, configura tus variables CLOUDFLARE_ACCOUNT_ID y CLOUDFLARE_API_TOKEN, y ejecuta:

    python production/manage.py --publish

Conserva los dos Workers y la ruta actual. No publiques el Astro antiguo de la raíz sobre ellos. Guarda cada cambio en GitHub además de publicarlo. No hace falta Codex para estos comandos.
