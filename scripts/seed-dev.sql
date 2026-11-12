-- Tarifa de PRUEBA ($100.000/noche), aprobada por el dueño el 2026-11-10 para local y para la prueba en producción.
-- NO es la tarifa definitiva de Amantia (TODO). Al fijarla: UPDATE cabins SET nightly_rate_cop = <tarifa> WHERE id = '<cabaña>';
-- Local: npm run db:seed:local · Producción: npx wrangler d1 execute amantia-reservas --remote --file=scripts/seed-dev.sql
UPDATE cabins SET nightly_rate_cop = 100000;
