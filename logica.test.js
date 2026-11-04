const test = require("node:test");
const assert = require("node:assert/strict");

const { fechaLocal, sumarDias } = require("./logica.js");

test("fechaLocal devuelve AAAA-MM-DD en una fecha normal", () => {
  const fecha = new Date(2026, 10, 4);
  assert.equal(fechaLocal(fecha), "2026-11-04");
});

test("sumarDias cambia de mes correctamente", () => {
  assert.equal(sumarDias("2026-01-31", 1), "2026-02-01");
});

test("sumarDias cambia de año correctamente", () => {
  assert.equal(sumarDias("2026-12-31", 1), "2027-01-01");
});

test("sumarDias respeta año bisiesto", () => {
  assert.equal(sumarDias("2024-02-28", 1), "2024-02-29");
  assert.equal(sumarDias("2024-02-29", 1), "2024-03-01");
});
