-- Motor de reservas de Amantia (ADR-004). Base: Cloudflare D1 (SQLite).
-- Aplicar: npx wrangler d1 migrations apply amantia-reservas --local   (o --remote)

-- Cabañas reservables. nightly_rate_cop NULL = no reservable (tarifa TODO, HARD RULE 1).
CREATE TABLE cabins (
  id               TEXT PRIMARY KEY,           -- slug: la-calma, el-encuentro, el-instante
  name             TEXT NOT NULL,
  sort             INTEGER NOT NULL DEFAULT 0,
  nightly_rate_cop INTEGER,                    -- tarifa por noche en COP (sin centavos)
  active           INTEGER NOT NULL DEFAULT 1
);

-- Nombres PROVISIONALES (dueño, 2026-10-15). Sin tarifa hasta que el dueño la fije.
INSERT INTO cabins (id, name, sort) VALUES
  ('la-calma', 'La calma', 1),
  ('el-encuentro', 'El encuentro', 2),
  ('el-instante', 'El instante', 3);

CREATE TABLE bookings (
  ref               TEXT PRIMARY KEY,          -- AMT-XXXXXX (visible para el huésped)
  token             TEXT NOT NULL,             -- secreto para consultar la reserva sin login
  cabin_id          TEXT NOT NULL REFERENCES cabins(id),
  check_in          TEXT NOT NULL,             -- YYYY-MM-DD
  check_out         TEXT NOT NULL,             -- YYYY-MM-DD (no se duerme esa noche)
  nights            INTEGER NOT NULL,
  guests            INTEGER NOT NULL,
  first_name        TEXT NOT NULL,
  last_name         TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT NOT NULL,
  nightly_rate_cop  INTEGER NOT NULL,          -- tarifa congelada al crear la reserva
  total_cop         INTEGER NOT NULL,
  deposit_cop       INTEGER NOT NULL,          -- lo que se paga hoy
  status            TEXT NOT NULL CHECK (status IN ('hold', 'confirmed', 'expired', 'cancelled', 'conflict')),
  hold_expires_at   TEXT NOT NULL,             -- ISO 8601 UTC
  payment_attempts  INTEGER NOT NULL DEFAULT 1,
  payment_status    TEXT,                      -- último estado de Wompi: PENDING, APPROVED, DECLINED, VOIDED, ERROR
  payment_tx_id     TEXT,
  client_ip         TEXT,
  terms_accepted_at TEXT NOT NULL,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);
CREATE INDEX idx_bookings_status ON bookings (status, hold_expires_at);
CREATE INDEX idx_bookings_ip ON bookings (client_ip, status);

-- Una fila por cabaña y noche ocupada. La PRIMARY KEY impide la doble reserva de forma atómica.
-- booking_ref NULL = bloqueo manual o importado (source: 'manual', 'ical:airbnb', 'ical:booking').
CREATE TABLE booking_nights (
  cabin_id    TEXT NOT NULL REFERENCES cabins(id),
  night       TEXT NOT NULL,                   -- YYYY-MM-DD
  booking_ref TEXT REFERENCES bookings(ref),
  source      TEXT NOT NULL DEFAULT 'booking',
  PRIMARY KEY (cabin_id, night)
);
CREATE INDEX idx_nights_booking ON booking_nights (booking_ref);

-- Bitácora de eventos de pago (webhook, conciliación al volver de Wompi, simulador).
CREATE TABLE payment_events (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_ref     TEXT,
  reference       TEXT,                        -- referencia enviada a Wompi: AMT-XXXXXX-N
  tx_id           TEXT,
  status          TEXT,
  amount_in_cents INTEGER,
  source          TEXT NOT NULL,               -- webhook | redirect | simulated
  received_at     TEXT NOT NULL,
  raw             TEXT
);
CREATE INDEX idx_payment_events_ref ON payment_events (booking_ref);
