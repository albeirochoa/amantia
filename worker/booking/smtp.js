// Cliente SMTP mínimo para Workers (cloudflare:sockets). Sin dependencias.
// Pensado para Zoho Mail (smtp.zoho.com:465, TLS implícito, AUTH LOGIN con contraseña de aplicación).
// Los Workers no pueden usar el puerto 25; sí el 465 y el 587 (este último no está soportado aquí).
import { connect } from 'cloudflare:sockets';

const enc = new TextEncoder();
const dec = new TextDecoder();
const b64 = (s) => btoa(String.fromCharCode(...enc.encode(s)));
const b64wrapped = (s) => (b64(s).match(/.{1,76}/g) || []).join('\r\n');
const encodeHeader = (s) => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${b64(s)}?=`);
const bare = (addr) => String(addr).replace(/^.*<([^>]+)>.*$/, '$1').trim();
const safe = (s) => String(s).replace(/[\r\n]+/g, ' ');

/** Arma el mensaje MIME (texto + HTML en base64: sin problemas de líneas largas ni de puntos). */
export function buildMessage({ from, fromName, to, subject, text, html, replyTo }, domain) {
  const boundary = `amantia-${crypto.randomUUID()}`;
  const head = [
    `From: ${fromName ? `${encodeHeader(safe(fromName))} <${from}>` : from}`,
    `To: ${safe(to)}`,
    `Subject: ${encodeHeader(safe(subject))}`,
    `Date: ${new Date().toUTCString().replace('GMT', '+0000')}`,
    `Message-ID: <${crypto.randomUUID()}@${domain}>`,
    ...(replyTo ? [`Reply-To: ${safe(replyTo)}`] : []),
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];
  const part = (type, body) =>
    [`--${boundary}`, `Content-Type: ${type}; charset=UTF-8`, 'Content-Transfer-Encoding: base64', '', b64wrapped(body)].join('\r\n');
  return [...head, '', part('text/plain', text || ''), part('text/html', html || text || ''), `--${boundary}--`, ''].join('\r\n');
}

/**
 * Envía un correo por SMTP. Lanza Error si el servidor responde con error.
 * cfg: { host, port, user, pass, secure ('on' | 'off', 'off' solo para pruebas locales) }
 */
export async function smtpSend(cfg, mail) {
  const socket = connect({ hostname: cfg.host, port: Number(cfg.port) }, { secureTransport: cfg.secure === 'off' ? 'off' : 'on', allowHalfOpen: false });
  const writer = socket.writable.getWriter();
  const reader = socket.readable.getReader();
  let buffer = '';

  async function readReply() {
    for (;;) {
      const lines = buffer.split('\r\n');
      // Una respuesta termina en la línea "NNN texto" (sin guion tras el código).
      for (let i = 0; i < lines.length - 1; i++) {
        if (/^\d{3} /.test(lines[i]) || /^\d{3}$/.test(lines[i])) {
          const reply = lines.slice(0, i + 1);
          buffer = lines.slice(i + 1).join('\r\n');
          return { code: Number(reply[0].slice(0, 3)), text: reply.join('\n') };
        }
      }
      const { value, done } = await reader.read();
      if (done) throw new Error('SMTP: conexión cerrada por el servidor');
      buffer += dec.decode(value, { stream: true });
    }
  }
  const send = (line) => writer.write(enc.encode(`${line}\r\n`));
  async function expect(code, what) {
    const r = await readReply();
    if (r.code !== code) throw new Error(`SMTP ${what}: ${r.text.slice(0, 200)}`);
    return r;
  }

  try {
    const from = bare(mail.from);
    const domain = from.split('@')[1] || 'localhost';
    await expect(220, 'saludo');
    await send(`EHLO ${domain}`);
    await expect(250, 'EHLO');
    await send('AUTH LOGIN');
    await expect(334, 'AUTH');
    await send(b64(cfg.user));
    await expect(334, 'usuario');
    await send(b64(cfg.pass));
    await expect(235, 'autenticación (¿contraseña de aplicación?)');
    await send(`MAIL FROM:<${from}>`);
    await expect(250, 'MAIL FROM');
    await send(`RCPT TO:<${bare(mail.to)}>`);
    const rcpt = await readReply();
    if (rcpt.code !== 250 && rcpt.code !== 251) throw new Error(`SMTP RCPT TO: ${rcpt.text.slice(0, 200)}`);
    await send('DATA');
    await expect(354, 'DATA');
    await writer.write(enc.encode(`${buildMessage(mail, domain)}\r\n.\r\n`));
    await expect(250, 'envío');
    await send('QUIT');
    return true;
  } finally {
    try { await writer.close(); } catch { /* ya cerrado */ }
    try { await socket.close(); } catch { /* ya cerrado */ }
  }
}
