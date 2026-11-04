# Plan 001 — Mapa de calor de días estudiados

Implementa la spec `spec.md`. Describe el QUÉ técnico (archivos, funciones,
algoritmo, pintado, decisiones y tests), siempre dentro de la constitución. No incluye
código final.

## 1. Archivos y responsabilidades

| Archivo | Acción | Responsabilidad | RF cubiertos |
|---|---|---|---|
| `logica.js` | **crear** | Funciones puras de fechas y del mapa de calor. Sin DOM, sin `localStorage`, sin estado. Única fuente de verdad de la lógica. | RF-1…RF-7 |
| `app.js` | **modificar** | Capa de interfaz: lee/escribe datos (`localStorage`), calcula el «hoy» real una sola vez, llama a `logica.js` y pinta el mapa. Se le quitan las funciones puras de fechas que se mueven a `logica.js`. | RF-1…RF-6 |
| `index.html` | **modificar** | Añade la sección del mapa (contenedor de la cuadrícula, leyenda y total) y carga `logica.js` **antes** que `app.js`. | RF-3, RF-4, RF-6 |
| `styles.css` | **modificar** | Estilos de la cuadrícula (7×12), de los tramos de color, del estado «futuro», de la leyenda y del detalle (tooltip). | RF-3, RF-4, RF-5 |
| `logica.test.js` | **crear** | Tests de las funciones puras con el runner integrado de Node (`node --test`), sin dependencias. | RF-1…RF-7 |

Reglas respetadas: `logica.js` no toca el DOM (regla 3), solo `app.js` accede a
`localStorage` y el mapa **nunca** escribe ni borra datos (regla 5). Todo funciona abriendo
`index.html` por `file://`: no hay módulos ES (regla 1).

## 2. Funciones puras de lógica (`logica.js`)

Principio clave: **«hoy» es siempre un parámetro**. Ninguna función lo calcula por dentro;
quien lo calcula es `app.js` una única vez y lo pasa como string local `"AAAA-MM-DD"`. Así
los tests pueden usar fechas fijas y deterministas.

| Función | Qué hace | RF |
|---|---|---|
| `fechaLocal(fecha)` | Convierte un `Date` a `"AAAA-MM-DD"` en hora local. *(Renombra y mueve la actual `toLocalDateString` para cumplir la regla 6 de idioma.)* | auxiliar |
| `sumarDias(fechaStr, dias)` | Suma/resta días a `"AAAA-MM-DD"` respetando meses y años (se mueve tal cual desde `app.js`). | auxiliar |
| `esFechaValida(fechaStr)` | `true` si es string `AAAA-MM-DD` y corresponde a un día real del calendario (rechaza `2026-02-30`, `null`, etc.). | RF-7 |
| `sonMinutosValidos(minutos)` | `true` si, interpretado como número, es un entero finito mayor que 0 (acepta `"30"`, rechaza `45.5`, `0`, `NaN`, `Infinity`). | RF-7 |
| `filtrarSesionesValidas(sesiones)` | Devuelve solo las sesiones que son objeto y cumplen `esFechaValida` + `sonMinutosValidos`. | RF-7 |
| `lunesDeSemana(fechaStr)` | Devuelve el lunes de la semana que contiene `fechaStr`. | RF-1 |
| `generarSemanas(hoy)` | Devuelve 12 semanas, cada una como array de 7 fechas (lunes→domingo), la más antigua primero y la actual la última. | RF-1 |
| `agruparMinutosPorDia(sesionesValidas)` | Devuelve un mapa `{ "AAAA-MM-DD": minutosTotales }` sumando sesiones del mismo día. | RF-2 |
| `asignarTramo(minutos)` | Devuelve el nivel (0, 1, 2 o 3) según `0 / 1–30 / 31–90 / 91+`. | RF-3 |
| `construirMapa(hoy, sesiones)` | Devuelve las 84 celdas (12 semanas × 7 días), cada una con `fecha`, `minutos`, `tramo` y `esFuturo`. | RF-1…RF-4 |
| `calcularTotalPeriodo(hoy, sesiones)` | Devuelve el total de minutos de sesiones válidas dentro de la ventana y con fecha ≤ `hoy`. | RF-6 |

Las funciones existentes `calcularRacha`, `calcularMejorRacha` y `calcularMinutosSemana`
siguen en `app.js` en esta iteración (no forman parte del mapa); si en el futuro se quieren
testear, se moverían a `logica.js` del mismo modo. Se deja anotado, no se hace ahora.

## 3. Algoritmo del mapa (pseudocódigo)

```
lunesDeSemana(fechaStr):
    [anio, mes, dia] = separar(fechaStr)
    fecha = new Date(anio, mes - 1, dia)        // local, NO new Date("AAAA-MM-DD")
    offset = (fecha.getDay() + 6) % 7           // 0=lunes … 6=domingo
    devolver sumarDias(fechaStr, -offset)

generarSemanas(hoy):
    lunesActual = lunesDeSemana(hoy)
    semanas = []
    para i desde 11 hasta 0:                    // de la más antigua a la actual
        lunes = sumarDias(lunesActual, -7 * i)
        semana = [lunes, sumarDias(lunes,1), …, sumarDias(lunes,6)]
        semanas.agregar(semana)
    devolver semanas

asignarTramo(minutos):
    si minutos <= 0:  devolver 0                // «sin estudio»
    si minutos <= 30: devolver 1
    si minutos <= 90: devolver 2
    devolver 3                                  // 91+

construirMapa(hoy, sesiones):
    validas   = filtrarSesionesValidas(sesiones)
    porDia    = agruparMinutosPorDia(validas)
    semanas   = generarSemanas(hoy)
    celdas    = []
    para cada semana en semanas:
        para cada fecha en semana:              // fecha = "AAAA-MM-DD"
            si fecha > hoy:                     // comparación lexicográfica, válida para este formato
                celdas.agregar({ fecha, esFuturo: true,  minutos: 0, tramo: null })
            si no:
                minutos = porDia[fecha] si existe, si no 0
                celdas.agregar({ fecha, esFuturo: false, minutos, tramo: asignarTramo(minutos) })
    devolver celdas

calcularTotalPeriodo(hoy, sesiones):
    inicio  = sumarDias(lunesDeSemana(hoy), -7 * 11)
    validas = filtrarSesionesValidas(sesiones)
    devolver suma de s.minutos para cada s en validas donde inicio <= s.fecha <= hoy
```

Notas del algoritmo:

- La comparación de fechas se hace sobre strings `"AAAA-MM-DD"` con `<=` / `>`, que es
  correcta y estable para ese formato; nunca se comparan objetos `Date` ni se usa UTC.
- `esFuturo` sale de comparar con `hoy`, no de una marca guardada: un día que pasa de
  futuro a transcurrido se recalcula al volver a renderizar.

## 4. Cómo se pinta en la interfaz

1. **`index.html`** añade una sección con: título del mapa, un contenedor vacío para la
   cuadrícula, una leyenda (marcado estático con los tres niveles + «sin estudio» +
   «futuro») y un elemento para el total. Se añade `<script src="logica.js">` antes de
   `<script src="app.js">`.
2. **`app.js`**, dentro de `renderizar()` (que ya se llama al cargar y al registrar una
   sesión), calcula:
   - `hoy = fechaLocal(new Date())` (una sola vez por renderizado),
   - `mapa = construirMapa(hoy, sesiones)`,
   - `total = calcularTotalPeriodo(hoy, sesiones)`,
   y luego pinta.
3. **Cuadrícula:** por cada celda de `mapa`, se crea un elemento. Si `esFuturo`, es un
   elemento no interactivo con clase `futuro` y sin texto alternativo. Si no, es un botón
   con clase `tramo-N` y `aria-label` «<fecha>: <minutos> min» (o «0 min»).
4. **Detalle (RF-5):** un único tooltip compartido. Se muestra al pasar el ratón
   (`mouseenter`/`mouseleave`), al enfocar con teclado (`focus`/`blur`) y al tocar
   (`click`); al tocar la misma celda se cierra y al tocar otra se cambia. El texto es la
   fecha y los minutos de la celda.
5. **Leyenda y total (RF-6):** el total se actualiza con el valor formateado en español
   (separador de miles con punto). La leyenda es estática; solo cambia si cambian los
   tramos, que no ocurre en esta versión.
6. **`styles.css`:** cuadrícula con `display: grid` de 12 columnas × 7 filas, celdas
   compactas y cuadradas; tres tonos de teal (monocromáticos) para los niveles 1–3, celda
   clara para «sin estudio» y celda apagada para «futuro». En móvil (375 px) las celdas se
   reducen y la leyenda se apila para no desbordar.

## 5. Decisiones técnicas (justificación y alternativa descartada)

1. **Lógica pura en `logica.js`, interfaz en `app.js`.**
   *Justificación:* cumple la regla 3 (lógica separada de la interfaz) y permite probar la
   lógica con `node --test` sin DOM.
   *Alternativa descartada:* dejar todo en `app.js` y probarlo con un DOM simulado → exige
   una dependencia (viola la regla 4) o guardas `if (typeof document…)` que ensucian y
   mezclan capas.

2. **«hoy» como parámetro, nunca calculado dentro de la lógica.**
   *Justificación:* tests deterministas (fechas fijas, límites de semana/año) y una sola
   fuente de verdad para el «hoy» real.
   *Alternativa descartada:* leer `new Date()` dentro de cada función → imposible probar
   casos límite de forma estable.

3. **Export condicional CommonJS** (`if (typeof module !== "undefined") module.exports = …`)
   al final de `logica.js`.
   *Justificación:* el archivo funciona en el navegador (se ignora el export) y en Node
   (lo expone a los tests), sin usar módulos ES, que romperían `file://`.
   *Alternativa descartada:* `export`/`import` (módulos ES) → prohibido por AGENTS y rompe
   `file://`; o duplicar la lógica en el test → riesgo de divergencia.

4. **Fechas como string local `"AAAA-MM-DD"` y comparación lexicográfica.**
   *Justificación:* evita el desplazamiento de día por UTC (regla de fechas de AGENTS) y es
   simple de razonar.
   *Alternativa descartada:* `toISOString()` o `new Date("AAAA-MM-DD")` → interpretan en
   UTC y desplazan el día; comparar objetos `Date` → propenso a errores de hora.

5. **`asignarTramo` con límites fijos (0 / 1–30 / 31–90 / 91+).**
   *Justificación:* determinista y coherente con lo aprobado en la spec.
   *Alternativa descartada:* tramos relativos al máximo del periodo → el color cambia al
   añadir sesiones y contradice la spec (ya descartado allí).

6. **Celda interactiva como botón con `aria-label`** (días transcurridos), y elemento no
   interactivo para «futuro».
   *Justificación:* accesible por teclado y lectores de pantalla (RF-5), y el «futuro» queda
   claramente no interactivo (RF-4).
   *Alternativa descartada:* `<div>` con solo `title` → no accesible por teclado ni
   lectores de pantalla.

7. **Cuadrícula con CSS Grid (12 columnas × 7 filas).**
   *Justificación:* responsive y fácil de reducir en móvil.
   *Alternativa descartada:* tabla HTML → menos flexible para el layout responsive.

8. **Tests con `node --test` (runner integrado de Node).**
   *Justificación:* sin instalar nada (regla 4) y es el comando fijado en AGENTS.
   *Alternativa descartada:* un framework de test → añade dependencia, viola la
   constitución.

## 6. Estrategia de tests (`node --test`)

Archivo `logica.test.js`, usando `node:test` y `node:assert` (integrados) y
`require("./logica.js")`. Se ejecuta con `node --test`. Cubre solo la lógica pura; la
interfaz se verifica manualmente en el navegador (regla 4 y AGENTS).

Grupos de casos (con RF):

- **`fechaLocal` / `sumarDias`** (auxiliares): día normal; paso de mes; paso de año; año
  bisiesto (29-feb-2024).
- **`esFechaValida`** (RF-7): válida; malformada (`2026-1-3`, `03/11/2026`); imposible
  (`2026-02-30`); no-string (`null`, `undefined`, objeto, número).
- **`sonMinutosValidos`** (RF-7): `30` ok; `"30"` ok; `0`, `-5`, `45.5`, `"abc"`, `NaN`,
  `Infinity`, `null` → no válidos.
- **`filtrarSesionesValidas`** (RF-7): array con `null`, strings y objetos válidos/inválidos
  → solo devuelve los válidos.
- **`lunesDeSemana`** (RF-1): un miércoles → su lunes; un domingo → su lunes; un lunes → él
  mismo.
- **`generarSemanas`** (RF-1): devuelve 12 semanas; 84 fechas únicas; todas empiezan en
  lunes; la última contiene `hoy`; la primera es 11 semanas antes.
- **`agruparMinutosPorDia`** (RF-2): varias sesiones el mismo día suman; días distintos no
  se mezclan; entrada vacía → mapa vacío.
- **`asignarTramo`** (RF-3): `0→0`, `1→1`, `30→1`, `31→2`, `90→2`, `91→3`, `1000→3`.
- **`construirMapa`** (RF-1…RF-4): devuelve 84 celdas; con `hoy` = miércoles, los días
  jueves→domingo de la semana actual son `esFuturo`; un día con minutos conocidos obtiene el
  tramo correcto; sesión fuera de la ventana no aparece; sesión futura no suma; día pasado
  sin sesión → `tramo 0`, `minutos 0`.
- **`calcularTotalPeriodo`** (RF-6): suma solo dentro de la ventana y con `fecha <= hoy`;
  excluye futuras e inválidas; sin sesiones → `0`.

Cada grupo de casos se documenta en el propio test como nombre descriptivo (en español) que
indica el resultado esperado, de modo que la salida de `node --test` sea legible sin leer
el código.

## 7. Cobertura de RF (resumen)

| RF | Dónde se implementa | Dónde se comprueba |
|---|---|---|
| RF-1 (ventana 12 semanas) | `lunesDeSemana`, `generarSemanas`, `construirMapa` | `logica.test.js` (lunes, semanas, mapa) |
| RF-2 (minutos por día) | `agruparMinutosPorDia` | `logica.test.js` (suma por día) |
| RF-3 (tramos fijos) | `asignarTramo` + clases CSS | `logica.test.js` (tramos) + verificación visual |
| RF-4 (días futuros) | `construirMapa` (`esFuturo`) + pintado en `app.js` | `logica.test.js` + verificación visual |
| RF-5 (detalle por día) | tooltip en `app.js` + `aria-label` | verificación manual (ratón, teclado, táctil) |
| RF-6 (leyenda y total) | `calcularTotalPeriodo` + marcado en `index.html` | `logica.test.js` (total) + verificación visual |
| RF-7 (datos ausentes/inválidos/ilegibles) | `esFechaValida`, `sonMinutosValidos`, `filtrarSesionesValidas` + `leerSesiones` ya existente en `app.js` | `logica.test.js` + verificación manual (borrar clave, clave corrupta) |

## 8. Criterios de finalización

- `logica.js`, `app.js`, `index.html`, `styles.css` y `logica.test.js` implementados según
  este plan y la spec, sin dependencias ni build.
- `node --test` en verde, cubriendo todos los RF que tienen lógica pura.
- Comprobación manual en el navegador por `file://` de los casos límite de la spec
  (ausencia de clave, datos corruptos, almacenamiento no disponible) y de la vista a
  375 px, con resultados documentados.
- La spec `spec.md` no discrepa de este plan (regla 2).
