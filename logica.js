function fechaLocal(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function sumarDias(fechaStr, dias) {
  const [anio, mes, dia] = fechaStr.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  fecha.setDate(fecha.getDate() + dias);
  return fechaLocal(fecha);
}

function calcularRacha(sesiones, hoy) {
  const diasConSesion = new Set(sesiones.map((sesion) => sesion.fecha));
  const ayer = sumarDias(hoy, -1);

  let inicio;
  if (diasConSesion.has(hoy)) {
    inicio = hoy;
  } else if (diasConSesion.has(ayer)) {
    inicio = ayer;
  } else {
    return 0;
  }

  let racha = 0;
  let fecha = inicio;
  while (diasConSesion.has(fecha)) {
    racha += 1;
    fecha = sumarDias(fecha, -1);
  }
  return racha;
}

function calcularMejorRacha(sesiones, hoy) {
  const dias = [...new Set(sesiones.map((sesion) => sesion.fecha))]
    .filter((fecha) => fecha <= hoy)
    .sort();

  let mejor = 0;
  let actual = 0;
  let anterior = null;

  for (const fecha of dias) {
    if (anterior && fecha === sumarDias(anterior, 1)) {
      actual += 1;
    } else {
      actual = 1;
    }

    if (actual > mejor) {
      mejor = actual;
    }
    anterior = fecha;
  }

  return mejor;
}

function lunesDeSemana(fechaStr) {
  const [anio, mes, dia] = fechaStr.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  const diaSemana = fecha.getDay();
  const offsetLunes = (diaSemana + 6) % 7;
  return sumarDias(fechaStr, -offsetLunes);
}

function calcularMinutosSemana(sesiones, hoy) {
  const lunes = lunesDeSemana(hoy);
  return sesiones.reduce((total, sesion) => {
    if (sesion.fecha >= lunes && sesion.fecha <= hoy) {
      return total + (Number(sesion.minutos) || 0);
    }
    return total;
  }, 0);
}

function esFechaValida(fechaStr) {
  if (typeof fechaStr !== "string") return false;
  const patron = /^(\d{4})-(\d{2})-(\d{2})$/;
  const coincidencia = fechaStr.match(patron);
  if (!coincidencia) return false;

  const anio = Number(coincidencia[1]);
  const mes = Number(coincidencia[2]);
  const dia = Number(coincidencia[3]);
  const fecha = new Date(anio, mes - 1, dia);

  return (
    fecha.getFullYear() === anio &&
    fecha.getMonth() === mes - 1 &&
    fecha.getDate() === dia
  );
}

function sonMinutosValidos(minutos) {
  const numero = Number(minutos);
  return Number.isFinite(numero) && Number.isInteger(numero) && numero > 0;
}

function filtrarSesionesValidas(sesiones) {
  if (!Array.isArray(sesiones)) return [];

  return sesiones.filter((sesion) => {
    if (!sesion || typeof sesion !== "object") return false;
    return esFechaValida(sesion.fecha) && sonMinutosValidos(sesion.minutos);
  });
}

function generarSemanas(hoy) {
  const lunesActual = lunesDeSemana(hoy);
  const semanas = [];

  for (let indice = 11; indice >= 0; indice -= 1) {
    const lunes = sumarDias(lunesActual, -7 * indice);
    const semana = [];
    for (let dia = 0; dia < 7; dia += 1) {
      semana.push(sumarDias(lunes, dia));
    }
    semanas.push(semana);
  }

  return semanas;
}

function agruparMinutosPorDia(sesionesValidas) {
  const acumulado = {};

  for (const sesion of sesionesValidas) {
    const clave = sesion.fecha;
    const minutos = Number(sesion.minutos);
    acumulado[clave] = (acumulado[clave] || 0) + minutos;
  }

  return acumulado;
}

function asignarTramo(minutos) {
  if (minutos <= 0) return 0;
  if (minutos <= 30) return 1;
  if (minutos <= 90) return 2;
  return 3;
}

function construirMapa(hoy, sesiones) {
  const sesionesValidas = filtrarSesionesValidas(sesiones);
  const minutosPorDia = agruparMinutosPorDia(sesionesValidas);
  const semanas = generarSemanas(hoy);
  const celdas = [];

  for (const semana of semanas) {
    for (const fecha of semana) {
      if (fecha > hoy) {
        celdas.push({ fecha, esFuturo: true, minutos: 0, tramo: null });
      } else {
        const minutos = minutosPorDia[fecha] || 0;
        celdas.push({
          fecha,
          esFuturo: false,
          minutos,
          tramo: asignarTramo(minutos),
        });
      }
    }
  }

  return celdas;
}

function calcularTotalPeriodo(hoy, sesiones) {
  const inicio = sumarDias(lunesDeSemana(hoy), -7 * 11);
  const sesionesValidas = filtrarSesionesValidas(sesiones);

  return sesionesValidas.reduce((total, sesion) => {
    if (sesion.fecha >= inicio && sesion.fecha <= hoy) {
      return total + Number(sesion.minutos);
    }
    return total;
  }, 0);
}

if (typeof module !== "undefined") {
  module.exports = {
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
  };
}
