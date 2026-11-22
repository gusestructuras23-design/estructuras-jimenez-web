const page = `<!doctype html>
<html lang="es-MX">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <title>Sitio suspendido | Estructuras Jiménez</title>
  <style>
    :root{color-scheme:light;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    *{box-sizing:border-box}
    body{min-height:100svh;margin:0;display:grid;place-items:center;background:#f4f6f8;color:#17212c;padding:24px}
    main{width:min(100%,540px);padding:48px 32px;text-align:center;background:#fff;border:1px solid #e2e8ee;border-radius:16px;box-shadow:0 12px 35px #1526380a}
    .brand{font-size:15px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:#526274}
    h1{font-size:clamp(26px,5vw,38px);line-height:1.15;letter-spacing:-.03em;margin:22px 0 14px}
    p{font-size:17px;line-height:1.6;color:#526274;margin:0}
    .line{width:56px;height:3px;background:#8797a7;margin:28px auto 0;border-radius:9px}
  </style>
</head>
<body>
  <main>
    <div class="brand">Estructuras Jiménez</div>
    <h1>Sitio temporalmente suspendido</h1>
    <p>Esta página no está disponible por el momento.</p>
    <div class="line" aria-hidden="true"></div>
  </main>
</body>
</html>`;

export default {
  fetch(request) {
    return new Response(request.method === 'HEAD' ? null : page, {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
        'Referrer-Policy': 'no-referrer',
      },
    });
  },
};
