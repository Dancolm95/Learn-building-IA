# memory.md

## Estado del proyecto
- "Diario de Estudio": web estática (HTML + CSS + JS puros) para registrar sesiones de
  estudio y ver la racha de días seguidos.
- Archivos: `index.html`, `styles.css`, `app.js`.
- Datos en `localStorage`, clave `diarioEstudio_sesiones`, array de
  `{ fecha: "AAAA-MM-DD", tema, minutos }` (fecha local del usuario).

## Funcionalidades implementadas
- Formulario para registrar una sesión (fecha editable, tema obligatorio, minutos > 0).
- Racha actual en grande con una llama dibujada (SVG, sin emoji).
- Mejor racha (máximo histórico de días consecutivos con sesión, ignorando fechas
  futuras), calculada al vuelo, mostrada debajo de la racha actual.
- Total de minutos estudiados esta semana (de lunes a domingo), debajo de la mejor racha.
- Lista de sesiones de más reciente a más antigua.
- Persistencia en `localStorage`.

## Historial de cambios
- 2026-11-03: Añadida la "mejor racha" (`calcularMejorRacha` + `.racha-mejor`). Se
  reconciliaron AGENTS.md (clave y campos de datos) con el código existente.
- 2026-11-03: Añadido "total de minutos esta semana" (`calcularMinutosSemana` +
  `.racha-semana`). Semana de lunes a domingo; corregida la clave y campos en AGENTS.md
  (que seguían con los nombres antiguos).
- 2026-11-03: Rediseño visual (estilo "editorial greeting" de tasteskill): paleta neutra
  con acento teal (#1b6e66), paneles planos sin sombras, número de racha en peso regular,
  llama dibujada en lugar del emoji. Sin cambios en los datos ni en la lógica.
- 2026-11-03: Probado `index.html` por `file://` en Brave con Chrome DevTools (Chrome no
  estaba instalado). Tres sesiones de 3/2/1 nov: racha y mejor racha 3; tras recargar
  persisten, consola sin mensajes y captura móvil a 375 px sin desbordamiento. Las
  sesiones de prueba quedan en el almacenamiento del navegador usado.
- 2026-11-03: Captura móvil trasladada a `~/Pictures/screenshots/diario-estudio-movil-375.png`
  a petición del usuario; usar esa carpeta para próximas capturas cuando lo solicite.
- 2026-11-03: Aprobada `docs/constitution.md` con 6 principios (stack, spec, separación
  lógica/UI, tests sin dependencias, datos y español). Pendiente decidir si se renombra
  `toLocalDateString` para cumplir la regla de idioma.
- 2026-11-03: Primera redacción y revisión QA de la spec del mapa de calor (entonces
  `001-mapa-calor.md`, ya sustituida por la actual). Las specs viven en `docs/specs/`.
- 2026-11-04: Spec del mapa de calor en `docs/specs/001-heat-map/spec.md` y plan técnico en
  `docs/specs/001-heat-map/plan.md` (carpeta `001-heat-map/`). Decidido por preguntas: 12
  semanas lunes→domingo, tramos fijos 0/1–30/31–90/91+ (escala monocromática teal), detalle
  fecha/minutos al pasar y al tocar (cerrar tocando la misma u otra celda), días futuros
  apagados, datos ausentes/corruptos → mapa vacío + mensaje sin tocar la clave. Revisión QA
  resuelta: minutos = entero positivo (lo demás se ignora), fecha = día real, no existe
  borrado/edición de sesiones (solo registrar), "hoy" se recalcula al renderizar, celdas
  pasadas siempre interactivas, leyenda incluye 0 y futuro. Sin código.
