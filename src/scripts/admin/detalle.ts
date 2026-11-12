// Ficha de reserva: datos, desglose, pagos, nota interna y acciones.
import { api } from '../reservas-comun';
import { actionButton, Booking, chip, confirmButton, dateTime, esc, fmtDate, money, sheet, stay, toast, waLinkTo } from './ui';

interface Detail {
  booking: Booking;
  payments: { txId: string | null; status: string | null; amount: number; source: string; at: string }[];
}

const PAY_STATUS: Record<string, string> = { APPROVED: 'Aprobado', DECLINED: 'Rechazado', PENDING: 'Pendiente', ERROR: 'Error', VOIDED: 'Anulado' };
const PAY_SOURCE: Record<string, string> = { webhook: 'Wompi', redirect: 'Al volver de Wompi', simulated: 'Simulado' };

export async function openDetail(ref: string, onChange: () => void) {
  let d: Detail;
  try {
    d = await api<Detail>(`/api/admin/reservas/${encodeURIComponent(ref)}`);
  } catch (e) {
    return toast((e as Error).message, true);
  }
  const b = d.booking;

  sheet(`Reserva ${b.ref}`, (body, close) => {
    const wa = waLinkTo(b);
    const live = b.status === 'confirmed' || b.status === 'hold' || b.status === 'conflict';
    body.innerHTML = `
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="font-serif text-[24px] leading-tight">${esc(stay(b))}</p>
          <p class="mt-1 text-[14px] text-ink-muted">${b.nights} ${b.nights === 1 ? 'noche' : 'noches'} · ${esc(b.cabin.name)} · 2 personas</p>
        </div>
        ${chip(b.status)}
      </div>
      ${b.status === 'conflict' ? '<p class="mt-4 bg-[#f4dcdc] text-[#9b2c2c] px-4 py-3 text-[14px] leading-snug">El pago llegó después de que venció la retención y la cabaña ya estaba ocupada. Contacta al huésped para reubicarlo o reembolsar desde Wompi.</p>' : ''}
      ${b.status === 'hold' ? `<p class="mt-4 bg-sand px-4 py-3 text-[14px]">Está pagando ahora. Si no completa el pago, se libera sola a las ${new Date(b.holdExpiresAt).toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit' })}.</p>` : ''}

      <h3 class="mt-7 text-[11px] tracking-[0.2em] uppercase text-ink-muted">Huésped</h3>
      <p class="mt-2 text-[17px]">${esc(b.name)}</p>
      <p class="mt-1 text-[15px] flex flex-wrap gap-x-5">
        <a class="underline underline-offset-4 py-1" href="${esc(wa)}" target="_blank" rel="noopener">WhatsApp ${esc(b.phone)}</a>
        <a class="underline underline-offset-4 py-1" href="tel:${esc(b.phone)}">Llamar</a>
        <a class="underline underline-offset-4 py-1" href="mailto:${esc(b.email)}">${esc(b.email)}</a>
      </p>

      <h3 class="mt-7 text-[11px] tracking-[0.2em] uppercase text-ink-muted">Cuenta</h3>
      <dl class="mt-2 grid grid-cols-[1fr_auto] gap-y-1.5 text-[15px]">
        <dt>Alojamiento</dt><dd class="text-right">${money(b.lodging)}</dd>
        ${b.extras.map((e) => `<dt>${esc(e.name)}</dt><dd class="text-right">${money(e.priceCop)}</dd>`).join('')}
        <dt class="pt-2 border-t border-linen">Total</dt><dd class="pt-2 border-t border-linen text-right">${money(b.total)}</dd>
        <dt>Anticipo ${b.status === 'confirmed' ? 'pagado' : ''}</dt><dd class="text-right">${money(b.paid)}</dd>
        <dt class="${b.balancePaidAt ? 'text-ink-muted' : 'font-normal'}">Saldo ${b.balancePaidAt ? '(pagado ' + esc(dateTime(b.balancePaidAt)) + ')' : ''}</dt>
        <dd class="text-right ${b.balancePaidAt ? 'text-ink-muted line-through' : ''}">${money(b.balance)}</dd>
      </dl>

      <h3 class="mt-7 text-[11px] tracking-[0.2em] uppercase text-ink-muted">Pagos (Wompi)</h3>
      ${
        d.payments.length
          ? `<ul class="mt-2 divide-y divide-linen text-[14px]">${d.payments
              .map((p) => `<li class="py-2 flex justify-between gap-3"><span>${esc(PAY_STATUS[p.status ?? ''] ?? p.status ?? '—')} · ${esc(PAY_SOURCE[p.source] ?? p.source)}</span><span class="text-ink-muted whitespace-nowrap">${money(p.amount)} · ${esc(dateTime(p.at))}</span></li>`)
              .join('')}</ul>`
          : '<p class="mt-2 text-[14px] text-ink-muted">Todavía no hay intentos de pago.</p>'
      }

      <h3 class="mt-7 text-[11px] tracking-[0.2em] uppercase text-ink-muted">Origen</h3>
      <p class="mt-2 text-[14px]">${b.source ? esc(b.source) + (b.medium ? ' · ' + esc(b.medium) : '') : 'Directo o sin dato'} · creada ${esc(dateTime(b.createdAt))}</p>

      <h3 class="mt-7 text-[11px] tracking-[0.2em] uppercase text-ink-muted">Nota interna</h3>
      <textarea id="nota" rows="3" maxlength="1000" class="mt-2 w-full border border-linen bg-paper p-3 text-[15px]" placeholder="Solo la ves tú: alergias, hora de llegada, acuerdos…">${esc(b.note ?? '')}</textarea>
      <div class="mt-2" data-nota-actions></div>
      <div class="mt-7 flex flex-wrap gap-3" data-actions></div>`;

    const noteActions = body.querySelector('[data-nota-actions]')!;
    noteActions.appendChild(
      actionButton('Guardar nota', async () => {
        try {
          await api(`/api/admin/reservas/${b.ref}/nota`, { method: 'POST', body: JSON.stringify({ nota: (body.querySelector('#nota') as HTMLTextAreaElement).value }) });
          toast('Nota guardada');
          onChange();
        } catch (e) {
          toast((e as Error).message, true);
        }
      }),
    );

    const act = async (path: string, payload: object, ok: string) => {
      try {
        await api(path, { method: 'POST', body: JSON.stringify(payload) });
        toast(ok);
        close();
        onChange();
      } catch (e) {
        toast((e as Error).message, true);
      }
    };
    const actions = body.querySelector('[data-actions]')!;
    if (b.status === 'confirmed') {
      actions.appendChild(
        actionButton(b.balancePaidAt ? 'Desmarcar saldo pagado' : 'Marcar saldo pagado', () =>
          act(`/api/admin/reservas/${b.ref}/saldo`, { pagado: !b.balancePaidAt }, b.balancePaidAt ? 'Saldo desmarcado' : 'Saldo marcado como pagado'),
        ),
      );
    }
    if (live) {
      actions.appendChild(
        confirmButton('Cancelar reserva', 'Sí, cancelar y liberar noches', () => act(`/api/admin/reservas/${b.ref}/cancelar`, {}, 'Reserva cancelada. El reembolso, si aplica, se hace en Wompi.')),
      );
    }
    if (!live) {
      actions.insertAdjacentHTML('beforeend', `<p class="text-[14px] text-ink-muted">Esta reserva ya no está activa${b.cancelledAt ? ' (cancelada el ' + esc(fmtDate(b.cancelledAt.slice(0, 10))) + ')' : ''}.</p>`);
    }
  });
}
