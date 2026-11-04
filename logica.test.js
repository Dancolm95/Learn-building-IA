const test = require("node:test");
const assert = require("node:assert/strict");

const {
  fechaLocal,
  sumarDias,
  calcularRacha,
  calcularMejorRacha,
  calcularMinutosSemana,
  esFechaValida,
  sonMinutosValidos,
  filtrarSesionesValidas,
  lunesDeSemana,
  generarSemanas,
  agruparMinutosPorDia,
  asignarTramo,
  construirMapa,
  calcularTotalPeriodo,
} = require("./logica.js");

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

test("calcularRacha cuenta desde hoy si hoy tiene sesión", () => {
  const sesiones = [
    { fecha: "2026-11-04" },
    { fecha: "2026-11-03" },
    { fecha: "2026-11-02" },
  ];
  assert.equal(calcularRacha(sesiones, "2026-11-04"), 3);
});

test("calcularRacha cuenta desde ayer si hoy no tiene sesión", () => {
  const sesiones = [{ fecha: "2026-11-03" }, { fecha: "2026-11-02" }];
  assert.equal(calcularRacha(sesiones, "2026-11-04"), 2);
});

test("calcularMejorRacha ignora futuras", () => {
  const sesiones = [
    { fecha: "2026-11-01" },
    { fecha: "2026-11-02" },
    { fecha: "2026-11-10" },
    { fecha: "2026-11-11" },
  ];
  assert.equal(calcularMejorRacha(sesiones, "2026-11-04"), 2);
});

test("calcularMinutosSemana suma de lunes a hoy", () => {
  const sesiones = [
    { fecha: "2026-11-02", minutos: 30 },
    { fecha: "2026-11-03", minutos: 15 },
    { fecha: "2026-11-04", minutos: 25 },
    { fecha: "2026-11-01", minutos: 90 },
  ];
  assert.equal(calcularMinutosSemana(sesiones, "2026-11-04"), 70);
});

test("esFechaValida valida formato y fecha real", () => {
  assert.equal(esFechaValida("2026-11-04"), true);
  assert.equal(esFechaValida("2026-2-4"), false);
  assert.equal(esFechaValida("2026-02-30"), false);
  assert.equal(esFechaValida(null), false);
});

test("sonMinutosValidos acepta enteros positivos finitos", () => {
  assert.equal(sonMinutosValidos(30), true);
  assert.equal(sonMinutosValidos("30"), true);
  assert.equal(sonMinutosValidos(0), false);
  assert.equal(sonMinutosValidos(-5), false);
  assert.equal(sonMinutosValidos(45.5), false);
  assert.equal(sonMinutosValidos("abc"), false);
  assert.equal(sonMinutosValidos(NaN), false);
  assert.equal(sonMinutosValidos(Infinity), false);
});

test("filtrarSesionesValidas deja solo entradas válidas", () => {
  const sesiones = [
    null,
    "texto",
    { fecha: "2026-11-04", minutos: 20 },
    { fecha: "2026-02-30", minutos: 20 },
    { fecha: "2026-11-03", minutos: 0 },
  ];
  const resultado = filtrarSesionesValidas(sesiones);
  assert.equal(resultado.length, 1);
  assert.deepEqual(resultado[0], { fecha: "2026-11-04", minutos: 20 });
});

test("lunesDeSemana devuelve el lunes correcto", () => {
  assert.equal(lunesDeSemana("2026-11-04"), "2026-11-02");
  assert.equal(lunesDeSemana("2026-11-01"), "2026-10-26");
  assert.equal(lunesDeSemana("2026-11-02"), "2026-11-02");
});

test("generarSemanas produce 12 semanas de 7 días", () => {
  const semanas = generarSemanas("2026-11-04");
  assert.equal(semanas.length, 12);
  for (const semana of semanas) {
    assert.equal(semana.length, 7);
  }
  assert.equal(semanas[11][0], "2026-11-02");
  assert.equal(semanas[0][0], "2026-08-17");
});

test("agruparMinutosPorDia suma sesiones del mismo día", () => {
  const agrupado = agruparMinutosPorDia([
    { fecha: "2026-11-04", minutos: 20 },
    { fecha: "2026-11-04", minutos: 15 },
    { fecha: "2026-11-03", minutos: 40 },
  ]);
  assert.equal(agrupado["2026-11-04"], 35);
  assert.equal(agrupado["2026-11-03"], 40);
});

test("asignarTramo aplica límites fijos", () => {
  assert.equal(asignarTramo(0), 0);
  assert.equal(asignarTramo(1), 1);
  assert.equal(asignarTramo(30), 1);
  assert.equal(asignarTramo(31), 2);
  assert.equal(asignarTramo(90), 2);
  assert.equal(asignarTramo(91), 3);
});

test("construirMapa crea 84 celdas y marca futuros", () => {
  const celdas = construirMapa("2026-11-04", [
    { fecha: "2026-11-04", minutos: 10 },
    { fecha: "2026-11-03", minutos: 50 },
    { fecha: "2026-11-06", minutos: 120 },
  ]);
  assert.equal(celdas.length, 84);

  const hoy = celdas.find((celda) => celda.fecha === "2026-11-04");
  const jueves = celdas.find((celda) => celda.fecha === "2026-11-05");
  assert.equal(hoy.esFuturo, false);
  assert.equal(hoy.tramo, 1);
  assert.equal(jueves.esFuturo, true);
});

test("calcularTotalPeriodo excluye futuras e inválidas", () => {
  const total = calcularTotalPeriodo("2026-11-04", [
    { fecha: "2026-11-04", minutos: 10 },
    { fecha: "2026-11-03", minutos: 20 },
    { fecha: "2026-11-06", minutos: 100 },
    { fecha: "2026-11-02", minutos: "abc" },
  ]);
  assert.equal(total, 30);
});
