-- Analítica propia y notas internas del panel (2026-11-12).

-- Eventos ANÓNIMOS del flujo de reserva: sin IP, sin correo, sin teléfono.
-- sid = identificador aleatorio de la pestaña (sessionStorage), no identifica a la persona.
CREATE TABLE events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at   TEXT NOT NULL,
  type         TEXT NOT NULL,          -- visit | search | select | begin_payment
  sid          TEXT NOT NULL,
  source       TEXT,                   -- utm_source, host de referencia o 'directo'
  medium       TEXT,
  check_in     TEXT,                   -- search: noche de llegada buscada
  nights       INTEGER,
  cabin_id     TEXT,
  results      INTEGER                 -- search: cuántas cabañas había libres
);
CREATE INDEX idx_events_type_time ON events (type, created_at);
CREATE INDEX idx_events_search ON events (type, check_in);

-- Origen de cada reserva (para medir qué canal convierte) y nota interna del dueño.
ALTER TABLE bookings ADD COLUMN source TEXT;
ALTER TABLE bookings ADD COLUMN medium TEXT;
ALTER TABLE bookings ADD COLUMN internal_note TEXT;
