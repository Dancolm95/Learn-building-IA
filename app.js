const CLAVE = "diarioEstudio_sesiones";

const formSesion = document.getElementById("formSesion");
const inputFecha = document.getElementById("fecha");
const inputTema = document.getElementById("tema");
const inputMinutos = document.getElementById("minutos");
const rachaNumero = document.getElementById("rachaNumero");
const rachaTexto = document.getElementById("rachaTexto");
const mejorRacha = document.getElementById("mejorRacha");
const minutosSemana = document.getElementById("minutosSemana");
const listaSesiones = document.getElementById("listaSesiones");

function toLocalDateString(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function sumarDias(fechaStr, dias) {
  const [anio, mes, dia] = fechaStr.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  fecha.setDate(fecha.getDate() + dias);
  return toLocalDateString(fecha);
}

function formatearFecha(fechaStr) {
  const [anio, mes, dia] = fechaStr.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return fecha.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function leerSesiones() {
  const guardado = localStorage.getItem(CLAVE);
  if (!guardado) return [];
  try {
    const sesiones = JSON.parse(guardado);
    return Array.isArray(sesiones) ? sesiones : [];
  } catch {
    return [];
  }
}

function guardarSesiones(sesiones) {
  localStorage.setItem(CLAVE, JSON.stringify(sesiones));
}

function calcularRacha(sesiones) {
  const diasConSesion = new Set(sesiones.map((s) => s.fecha));
  const hoy = toLocalDateString(new Date());
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
    racha++;
    fecha = sumarDias(fecha, -1);
  }
  return racha;
}

function mostrarRacha(sesiones) {
  const racha = calcularRacha(sesiones);
  rachaNumero.textContent = racha;
  rachaTexto.textContent = racha === 1 ? "día seguido" : "días seguidos";
}

function calcularMejorRacha(sesiones) {
  const hoy = toLocalDateString(new Date());
  const dias = [...new Set(sesiones.map((s) => s.fecha))]
    .filter((f) => f <= hoy)
    .sort();

  let mejor = 0;
  let actual = 0;
  let anterior = null;

  for (const fecha of dias) {
    if (anterior && fecha === sumarDias(anterior, 1)) {
      actual++;
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

function mostrarMejorRacha(sesiones) {
  const mejor = calcularMejorRacha(sesiones);
  mejorRacha.textContent = "Mejor racha: ";
  const numero = document.createElement("strong");
  numero.textContent = `${mejor} ${mejor === 1 ? "día" : "días"}`;
  mejorRacha.appendChild(numero);
}

function calcularMinutosSemana(sesiones) {
  const hoy = new Date();
  const diaSemana = hoy.getDay();
  const offsetLunes = (diaSemana + 6) % 7;
  const lunes = sumarDias(toLocalDateString(hoy), -offsetLunes);
  const hoyStr = toLocalDateString(hoy);

  return sesiones.reduce((total, s) => {
    if (s.fecha >= lunes && s.fecha <= hoyStr) {
      return total + (Number(s.minutos) || 0);
    }
    return total;
  }, 0);
}

function mostrarMinutosSemana(sesiones) {
  const total = calcularMinutosSemana(sesiones);
  minutosSemana.textContent = "Esta semana: ";
  const numero = document.createElement("strong");
  numero.textContent = `${total} min`;
  minutosSemana.appendChild(numero);
}

function mostrarSesiones(sesiones) {
  listaSesiones.innerHTML = "";

  if (sesiones.length === 0) {
    const vacio = document.createElement("li");
    vacio.className = "vacio";
    vacio.textContent = "Todavía no has registrado ninguna sesión.";
    listaSesiones.appendChild(vacio);
    return;
  }

  const ordenadas = [...sesiones].sort((a, b) => b.fecha.localeCompare(a.fecha));

  for (const sesion of ordenadas) {
    const li = document.createElement("li");

    const info = document.createElement("div");
    info.className = "sesion-info";

    const tema = document.createElement("span");
    tema.className = "sesion-tema";
    tema.textContent = sesion.tema;

    const fecha = document.createElement("span");
    fecha.className = "sesion-fecha";
    fecha.textContent = formatearFecha(sesion.fecha);

    const minutos = document.createElement("span");
    minutos.className = "sesion-minutos";
    minutos.textContent = `${sesion.minutos} min`;

    info.appendChild(tema);
    info.appendChild(fecha);
    li.appendChild(info);
    li.appendChild(minutos);
    listaSesiones.appendChild(li);
  }
}

function renderizar() {
  const sesiones = leerSesiones();
  mostrarRacha(sesiones);
  mostrarMejorRacha(sesiones);
  mostrarMinutosSemana(sesiones);
  mostrarSesiones(sesiones);
}

formSesion.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const tema = inputTema.value.trim();
  const minutos = parseInt(inputMinutos.value, 10);
  const fecha = inputFecha.value;

  if (!tema || !fecha || isNaN(minutos) || minutos <= 0) {
    return;
  }

  const sesiones = leerSesiones();
  sesiones.push({ fecha, tema, minutos });
  guardarSesiones(sesiones);

  formSesion.reset();
  inputFecha.value = toLocalDateString(new Date());
  inputTema.focus();

  renderizar();
});

const hoy = toLocalDateString(new Date());
inputFecha.value = hoy;
inputFecha.max = hoy;

renderizar();
