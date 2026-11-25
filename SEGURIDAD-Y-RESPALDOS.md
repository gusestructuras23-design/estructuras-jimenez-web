# Regla de trabajo y recuperación

## Fuente oficial recuperada

Rama GitHub: recovery-akari-completa-20261125. Etiqueta de recuperación: estable-akari-2026-11-25. No reconstruir desde la antigua rama principal. La etiqueta es una referencia estable, pero un administrador puede borrarla: no es un candado inmutable.

## Antes de cada publicación

1. Trabajar en una rama de cambios. Conservar la versión estable.
2. Regenerar recursos: python production/generate-native.py y python production/manage.py.
3. Probar inicio Akari, juego completo, galerías, WhatsApp, formulario sin enviar y vista móvil.
4. Guardar con git add y git commit, y subir con git push. Verificar el commit en GitHub.
5. Publicar con python production/manage.py --publish. Este script bloquea cambios sin commit y archivos esenciales ausentes; además respalda el Worker anterior antes de subir. No verifica por sí solo que hiciste push ni impide publicaciones directas desde Cloudflare.
6. Abrir el dominio real y comprobarlo. Registrar versión Cloudflare y commit GitHub.

## Copias fuera de los servicios

Descargar el ZIP y el archivo .bundle a tu PC. Guardar una segunda copia en disco externo o almacenamiento en nube. Crear copias nuevas después de cambios importantes, sin sustituir inmediatamente la copia estable anterior.

El .bundle contiene historial Git. Para abrirlo: git clone estructuras-jimenez-estable.bundle estructuras-jimenez. El ZIP incluye los archivos y recursos listos para inspeccionar, junto con instrucciones. Ninguno incluye credenciales.

## Candado adicional recomendado en GitHub

Settings → Rules → Rulesets: proteger la rama recovery-akari-completa-20261125 frente a eliminación y force push; exigir revisión por pull request si hay más colaboradores. Proteger también etiquetas estable-* frente a cambios y borrado. Estas reglas NO están activadas automáticamente por esta guía; necesitan permisos de administración y pueden depender del plan del repositorio.

No conectar despliegues automáticos de la raíz Astro antigua ni cambiar la ruta del dominio. Conservar los Workers existentes. No borrar recursos Cloudflare para corregir un problema de diseño.
