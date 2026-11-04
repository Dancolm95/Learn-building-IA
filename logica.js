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

if (typeof module !== "undefined") {
  module.exports = { fechaLocal, sumarDias };
}
