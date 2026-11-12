// Correos del motor. Dos vías, en este orden:
//   1. SMTP de Zoho Mail (si existe el secreto SMTP_PASSWORD): sale como hola@amantia.com.co a cualquier destinatario.
//   2. Binding `EMAIL` de Cloudflare (Email Routing / Email Sending), como alternativa.
// Si el envío falla, se registra y no rompe el flujo de la reserva.
import { smtpSend } from './smtp.js';

const fromAddress = (env) => env.MAIL_FROM || 'hola@amantia.com.co';

export async function sendMail(env, { to, subject, text, html }) {
  try {
    if (env.SMTP_PASSWORD) {
      await smtpSend(
        {
          host: env.SMTP_HOST || 'smtp.zoho.com',
          port: env.SMTP_PORT || '465',
          secure: env.SMTP_SECURE || 'on',
          user: env.SMTP_USER || fromAddress(env),
          pass: env.SMTP_PASSWORD,
        },
        { from: fromAddress(env), fromName: 'Amantia', to, subject, text, html },
      );
      return true;
    }
    if (env.EMAIL) {
      await env.EMAIL.send({ from: { email: fromAddress(env), name: 'Amantia' }, to, subject, text, html });
      return true;
    }
    console.warn('Sin SMTP_PASSWORD ni binding EMAIL; correo no enviado:', subject);
    return false;
  } catch (err) {
    console.error('Error enviando correo:', err?.code, err?.message);
    return false;
  }
}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const money = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
const day = (d) =>
  new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${d}T00:00:00Z`));

/** Aviso al dueño: reserva confirmada o en conflicto (pago tardío sin cabaña). */
export async function notifyBooking(env, b, origin) {
  const to = env.NOTIFY_EMAIL;
  if (!to) return false;
  const extras = JSON.parse(b.extras || '[]');
  const conflict = b.status === 'conflict';
  const subject = conflict
    ? `ATENCIÓN: pago sin cabaña ${b.ref} · reembolsar o reubicar`
    : `Nueva reserva ${b.ref} · ${b.cabin_name} · ${day(b.check_in)}–${day(b.check_out)}`;
  const lines = [
    conflict ? 'Llegó un pago APROBADO después de que venció la retención y la cabaña ya estaba ocupada. Contacta al huésped.' : 'Hay una reserva nueva confirmada.',
    '',
    `Código: ${b.ref}`,
    `Cabaña: ${b.cabin_name}`,
    `Llegada: ${day(b.check_in)} · Salida: ${day(b.check_out)} (${b.nights} noche${b.nights === 1 ? '' : 's'})`,
    `Huésped: ${b.first_name} ${b.last_name}`,
    `WhatsApp: ${b.phone} · Correo: ${b.email}`,
    `Extras: ${extras.length ? extras.map((e) => e.name).join(', ') : 'ninguno'}`,
    `Total: ${money(b.total_cop)} · Pagado: ${money(b.deposit_cop)} · Saldo: ${money(b.total_cop - b.deposit_cop)}`,
    '',
    `Panel: ${origin}/admin/`,
  ];
  const text = lines.join('\n');
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#1A2A44">${lines
    .map((l) => (l ? `<p style="margin:0 0 6px">${esc(l)}</p>` : '<br>'))
    .join('')}</div>`;
  return sendMail(env, { to, subject, text, html });
}

export async function sendLoginLink(env, to, link) {
  const text = `Para entrar al panel de reservas de Amantia abre este enlace (vence en 15 minutos y sirve una sola vez):\n\n${link}\n\nSi no lo pediste, ignora este correo.`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#1A2A44">
    <p>Para entrar al panel de reservas de Amantia:</p>
    <p><a href="${esc(link)}" style="display:inline-block;background:#B8944B;color:#1A2A44;padding:12px 24px;text-decoration:none">Entrar al panel</a></p>
    <p style="color:#4F5B70;font-size:13px">Vence en 15 minutos y sirve una sola vez. Si no lo pediste, ignora este correo.</p></div>`;
  return sendMail(env, { to, subject: 'Tu enlace para entrar al panel de Amantia', text, html });
}
