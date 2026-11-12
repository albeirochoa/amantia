-- Panel de administración (MVP, 2026-11-10).
ALTER TABLE bookings ADD COLUMN balance_paid_at TEXT;   -- el dueño marcó el saldo como pagado
ALTER TABLE bookings ADD COLUMN cancelled_at TEXT;
ALTER TABLE booking_nights ADD COLUMN note TEXT;        -- motivo de un bloqueo manual

-- Enlaces mágicos de ingreso: un solo uso, vencen a los 15 minutos.
CREATE TABLE admin_tokens (
  nonce      TEXT PRIMARY KEY,
  email      TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at    TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_admin_tokens_email ON admin_tokens (email, created_at);
