# Tareas 001 — Mapa de calor de días estudiados

Derivadas de `spec.md` y `plan.md`. Orden de dependencia: completar una tarea antes de la
siguiente. Cada tarea está pensada para ~20–30 min y tiene cierre verificable.

Convenciones: tests automáticos con `node --test`; verificación manual abriendo `index.html`
por `file://`; sin dependencias ni build.

Registro manual obligatorio (constitución, regla 4): al cerrar cada tarea, añadir un apunte
breve en la sección **Registro QA manual** al final de este archivo (qué se probó, resultado,
fecha).

---

### T1 — Alinear documentación base del proyecto

Actualizar `AGENTS.md` para que la sección de estructura refleje los archivos reales de esta
iteración (`index.html`, `styles.css`, `app.js`, `logica.js`, `logica.test.js`) y mantener la
referencia de spec activa en `docs/specs/NNN-*/spec.md`.

- **RF:** — (alineación de reglas de proyecto).
- [x] Hecho cuando: `AGENTS.md` no contradice los archivos que se van a crear/modificar en
  `plan.md`.

---

### T2 — Crear `logica.js` base y mover helpers de fecha

Crear `logica.js` con `fechaLocal` y `sumarDias`, export condicional CommonJS al final, y
cargar `logica.js` antes de `app.js` en `index.html`. En `app.js`, reemplazar los usos de
`toLocalDateString` por `fechaLocal`.

- **RF:** auxiliar (base de RF-1…RF-7).
- [x] Hecho cuando: `node --test` pasa casos de `fechaLocal`/`sumarDias` (día normal, cambio
  de mes, cambio de año y bisiesto) y `index.html` sigue cargando sin errores de consola.

---

### T3 — Consolidar toda la lógica pura existente en `logica.js`

Mover a `logica.js` las funciones puras ya existentes relacionadas con fechas/racha/minutos
(`calcularRacha`, `calcularMejorRacha`, `calcularMinutosSemana` y auxiliares puros usados por
ellas), dejando `app.js` como capa de UI (leer datos, invocar lógica y pintar).

- **RF:** — (cumplimiento de constitución, regla 3).
- [x] Hecho cuando: al abrir `index.html`, racha actual, mejor racha y minutos semanales dan
  los mismos valores que antes con el mismo conjunto de sesiones.

---

### T4 — Implementar validación de sesiones para el mapa

Implementar en `logica.js`: `esFechaValida`, `sonMinutosValidos` y `filtrarSesionesValidas`,
según la sección “Validez de una sesión” de la spec. Añadir tests.

- **RF:** RF-7.
- [x] Hecho cuando: `node --test` cubre y pasa los casos de fecha inválida/imposible,
  minutos no válidos (`0`, negativos, decimales, no numéricos, `NaN`, `Infinity`) y arrays
  mixtos con entradas no-objeto.

---

### T5 — Implementar ventana temporal y escala de intensidad

Implementar en `logica.js`: `lunesDeSemana`, `generarSemanas`, `agruparMinutosPorDia` y
`asignarTramo`. Añadir tests.

- **RF:** RF-1, RF-2, RF-3.
- [x] Hecho cuando: `node --test` confirma 12 semanas (84 fechas), semanas lunes→domingo,
  suma correcta por día y tramos `0 / 1–30 / 31–90 / 91+`.

---

### T6 — Implementar construcción del mapa y total del periodo

Implementar en `logica.js`: `construirMapa` y `calcularTotalPeriodo`. Añadir tests para
futuros, fuera de ventana, inválidos y total filtrado por ventana+hoy.

- **RF:** RF-1, RF-2, RF-3, RF-4, RF-6, RF-7.
- [x] Hecho cuando: `node --test` valida que `construirMapa` devuelve 84 celdas con `esFuturo`
  correcto y que `calcularTotalPeriodo` excluye futuras/invalidas y devuelve `0` sin datos.

---

### T7 — Añadir marcado del mapa y mensaje discreto en `index.html`

Añadir sección del mapa con: título, contenedor de cuadrícula, leyenda completa (incluye
“sin estudio” y “futuro”), total del periodo y contenedor del mensaje discreto para estados
sin sesiones/datos no legibles.

- **RF:** RF-4, RF-6, RF-7.
- [x] Hecho cuando: al abrir `index.html` se ve la sección del mapa con leyenda completa,
  total y zona de mensaje, sin errores de consola.

---

### T8 — Integrar pintado del mapa y robustez de lectura en `app.js`

Integrar en `renderizar()` el cálculo de `hoy`, `construirMapa` y `calcularTotalPeriodo`.
Actualizar `leerSesiones` para que, si `localStorage` no está disponible o falla al leer,
devuelva estado seguro sin romper la página. Mostrar mensaje discreto cuando no hay sesiones
o los datos no son legibles; nunca modificar la clave en esos casos.

Datos fijos para verificación manual de esta tarea:
- Día A (pasado): 20 min y 15 min (mismo día).
- Día B (pasado): 95 min.
- Día C (hoy): 10 min.
- Día D (futuro): 50 min.

Resultado esperado del total: **140 min** (solo A+B+C).

- **RF:** RF-1, RF-2, RF-4, RF-6, RF-7.
- [x] Hecho cuando: con esos datos, el total mostrado es 140 min, Día D no suma, la página no
  se rompe si falla `localStorage`, y el mensaje discreto aparece en ausencia/corrupción sin
  reescribir la clave.

---

### T9 — Implementar detalle por interacción en celdas transcurridas

Implementar el detalle de fecha + minutos en `app.js`: mostrar al pasar ratón y al tocar;
ocultar al salir; en táctil, tocar la misma celda cierra y tocar otra cambia el detalle. Las
celdas futuras no muestran detalle.

- **RF:** RF-5, RF-4.
- [x] Hecho cuando: se cumplen los comportamientos de hover/táctil definidos en spec y las
  celdas futuras no reaccionan.

---

### T10 — Aplicar estilos del mapa y responsive

En `styles.css`, aplicar cuadrícula 12×7, estados visuales (`sin estudio`, tramos 1–3,
`futuro`), estilos de leyenda y detalle, y ajuste responsive a 375 px sin desbordamiento.

- **RF:** RF-3, RF-4, RF-5.
- [x] Hecho cuando: a 375 px no hay scroll horizontal y los estados visuales se distinguen
  claramente (incluyendo futuro apagado).

---

### T11 — Verificación manual final + actualización de memoria

Ejecutar la verificación manual completa (datos ausentes, datos corruptos, almacenamiento no
disponible, fuera de ventana, futura, duplicadas por día, interacción táctil, accesibilidad
básica con `aria-label`, responsive 375 px) y dejar registro en la sección **Registro QA
manual** de este archivo. Después actualizar `memory.md` con estado final y decisiones.

- **RF:** RF-1…RF-7.
- [ ] Hecho cuando: `node --test` está en verde, todos los casos manuales quedan registrados
  con resultado, y `memory.md` queda actualizado sin datos sensibles.

---

## Registro QA manual

Completar durante la ejecución (una línea por tarea cerrada):

- Fecha: 2026-11-04
- Tarea: T1
- Prueba manual realizada: revisión de `AGENTS.md` para verificar que la sección de
  estructura incluye `logica.js` y `logica.test.js`, y que se mantiene la referencia
  `docs/specs/NNN-*/spec.md`.
- Resultado: OK.
- Fecha: 2026-11-04
- Tarea: T2
- Prueba manual realizada: apertura de `index.html` por `file://` tras cargar `logica.js`
  antes de `app.js`; comprobación de consola sin errores y de valores iniciales visibles.
- Resultado: OK.
- Fecha: 2026-11-04
- Tarea: T3-T6
- Prueba manual realizada: validación por `node --test` de lógica pura movida a `logica.js`
  (racha, mejor racha, minutos semana, validación de sesiones, semanas, tramos, mapa y total).
- Resultado: OK (17/17 tests en verde).
- Fecha: 2026-11-04
- Tarea: T7-T10
- Prueba manual realizada: implementación de sección de mapa, pintado, detalle interactivo y
  estilos responsive según spec; validación estática de marcado y clases en `index.html`+
  `styles.css`.
- Resultado: OK en implementación; verificación visual manual completa pendiente en navegador.
