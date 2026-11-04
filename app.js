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

const cuadrillaMapa = document.getElementById("cuadrillaMapa");
const detalleMapa = document.getElementById("detalleMapa");
const mensajeMapa = document.getElementById("mensajeMapa");
const totalMapa = document.getElementById("totalMapa");

let celdaTactilActiva = null;

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

function leerSesionesConEstado() {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado === null) {
      return { sesiones: [], estado: "sin-sesiones" };
    }

    try {
      const sesiones = JSON.parse(guardado);
      if (!Array.isArray(sesiones)) {
        return { sesiones: [], estado: "no-legible" };
      }
      if (sesiones.length === 0) {
        return { sesiones: [], estado: "sin-sesiones" };
      }
      return { sesiones, estado: "ok" };
    } catch {
      return { sesiones: [], estado: "no-legible" };
    }
  } catch {
    return { sesiones: [], estado: "sin-acceso" };
  }
}

function guardarSesiones(sesiones) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(sesiones));
    return true;
  } catch {
    return false;
  }
}

function obtenerMensajeMapa(estado) {
  if (estado === "sin-sesiones") {
    return "Aún no hay sesiones registradas.";
  }

  if (estado === "no-legible") {
    return "No se pudieron leer las sesiones guardadas.";
  }

  if (estado === "sin-acceso") {
    return "No se pudo acceder al almacenamiento del navegador.";
  }

  return "";
}

function mostrarRacha(sesiones, hoy) {
  const racha = calcularRacha(sesiones, hoy);
  rachaNumero.textContent = racha;
  rachaTexto.textContent = racha === 1 ? "día seguido" : "días seguidos";
}

function mostrarMejorRacha(sesiones, hoy) {
  const mejor = calcularMejorRacha(sesiones, hoy);
  mejorRacha.textContent = "Mejor racha: ";
  const numero = document.createElement("strong");
  numero.textContent = `${mejor} ${mejor === 1 ? "día" : "días"}`;
  mejorRacha.appendChild(numero);
}

function mostrarMinutosSemana(sesiones, hoy) {
  const total = calcularMinutosSemana(sesiones, hoy);
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

  const ordenadas = [...sesiones].sort((a, b) =>
    String(b.fecha || "").localeCompare(String(a.fecha || ""))
  );

  for (const sesion of ordenadas) {
    const li = document.createElement("li");

    const info = document.createElement("div");
    info.className = "sesion-info";

    const tema = document.createElement("span");
    tema.className = "sesion-tema";
    tema.textContent = sesion.tema || "(sin tema)";

    const fecha = document.createElement("span");
    fecha.className = "sesion-fecha";
    fecha.textContent = esFechaValida(sesion.fecha)
      ? formatearFecha(sesion.fecha)
      : "Fecha inválida";

    const minutos = document.createElement("span");
    minutos.className = "sesion-minutos";
    minutos.textContent = `${sesion.minutos ?? "?"} min`;

    info.appendChild(tema);
    info.appendChild(fecha);
    li.appendChild(info);
    li.appendChild(minutos);
    listaSesiones.appendChild(li);
  }
}

function ocultarDetalleMapa() {
  detalleMapa.hidden = true;
  celdaTactilActiva = null;
}

function mostrarDetalleMapa(celda, elemento) {
  if (celda.esFuturo) return;

  detalleMapa.textContent = `${formatearFecha(celda.fecha)}: ${celda.minutos} min`;
  detalleMapa.hidden = false;
  celdaTactilActiva = elemento;
}

function crearCeldaMapa(celda, indice) {
  const semana = Math.floor(indice / 7);
  const dia = indice % 7;

  if (celda.esFuturo) {
    const bloque = document.createElement("div");
    bloque.className = "mapa-celda mapa-futuro";
    bloque.style.gridColumn = String(semana + 1);
    bloque.style.gridRow = String(dia + 1);
    return bloque;
  }

  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = `mapa-celda mapa-tramo-${celda.tramo}`;
  boton.style.gridColumn = String(semana + 1);
  boton.style.gridRow = String(dia + 1);
  boton.setAttribute(
    "aria-label",
    `${formatearFecha(celda.fecha)}: ${celda.minutos} min`
  );

  boton.addEventListener("mouseenter", () => mostrarDetalleMapa(celda, boton));
  boton.addEventListener("mouseleave", () => {
    if (celdaTactilActiva !== boton) {
      detalleMapa.hidden = true;
    }
  });

  boton.addEventListener("click", () => {
    if (celdaTactilActiva === boton && !detalleMapa.hidden) {
      ocultarDetalleMapa();
      return;
    }
    mostrarDetalleMapa(celda, boton);
  });

  return boton;
}

function mostrarMapa(sesiones, estado, hoy) {
  const mapa = construirMapa(hoy, sesiones);
  const total = calcularTotalPeriodo(hoy, sesiones);

  cuadrillaMapa.innerHTML = "";
  ocultarDetalleMapa();

  mapa.forEach((celda, indice) => {
    cuadrillaMapa.appendChild(crearCeldaMapa(celda, indice));
  });

  totalMapa.textContent = "Total (12 semanas): ";
  const numero = document.createElement("strong");
  numero.textContent = `${total.toLocaleString("es-ES")} min`;
  totalMapa.appendChild(numero);

  const mensaje = obtenerMensajeMapa(estado);
  mensajeMapa.textContent = mensaje;
  mensajeMapa.hidden = mensaje === "";
}

function renderizar() {
  const hoy = fechaLocal(new Date());
  const lectura = leerSesionesConEstado();
  const sesiones = lectura.sesiones.filter(
    (sesion) => sesion && typeof sesion === "object"
  );

  mostrarRacha(sesiones, hoy);
  mostrarMejorRacha(sesiones, hoy);
  mostrarMinutosSemana(sesiones, hoy);
  mostrarSesiones(sesiones);
  mostrarMapa(sesiones, lectura.estado, hoy);
}

formSesion.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const tema = inputTema.value.trim();
  const minutos = parseInt(inputMinutos.value, 10);
  const fecha = inputFecha.value;

  if (!tema || !fecha || Number.isNaN(minutos) || minutos <= 0) {
    return;
  }

  const lectura = leerSesionesConEstado();
  if (lectura.estado === "no-legible" || lectura.estado === "sin-acceso") {
    renderizar();
    return;
  }

  const sesiones = lectura.sesiones;
  sesiones.push({ fecha, tema, minutos });
  const guardadoOk = guardarSesiones(sesiones);

  if (!guardadoOk) {
    renderizar();
    return;
  }

  formSesion.reset();
  inputFecha.value = fechaLocal(new Date());
  inputTema.focus();

  renderizar();
});

const hoy = fechaLocal(new Date());
inputFecha.value = hoy;
inputFecha.max = hoy;

renderizar();
