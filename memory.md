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
