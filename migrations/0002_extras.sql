-- Extras de la estadía (dueño, 2026-11-10). Se cobran una vez por estadía, no por noche.
-- extras: JSON con [{ id, name, priceCop }] congelado al reservar. total_cop ya los incluye.
ALTER TABLE bookings ADD COLUMN extras TEXT NOT NULL DEFAULT '[]';
ALTER TABLE bookings ADD COLUMN extras_cop INTEGER NOT NULL DEFAULT 0;
