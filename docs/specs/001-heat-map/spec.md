# Spec 001 — Mapa de calor de días estudiados

## Contexto y objetivo

El Diario de Estudio guarda sesiones de estudio en el dispositivo del usuario, cada una con
`fecha`, `tema` y `minutos`. Hoy la interfaz muestra la racha actual, la mejor racha, el
total semanal y la lista de sesiones, pero no ofrece una vista del histórico reciente que
permita apreciar de un vistazo la constancia a lo largo del tiempo.

**Objetivo:** añadir un mapa de calor tipo GitHub que muestre los días estudiados de las
últimas 12 semanas, donde la intensidad del color de cada día es mayor cuantos más minutos
se estudiaron. Sirve para motivar la constancia visualizando patrones (racha de días,
periodos de baja actividad) sin sustituir a las métricas ya existentes.

## Usuarios

- **Estudiante:** la única persona que usa la aplicación, en su propio navegador y para su
  uso personal. Registra sesiones y consulta el mapa para ver su progreso.

## Historias de usuario

- **HU-1.** Como estudiante, quiero ver un mapa de calor de mis últimas 12 semanas para
  identificar de un vistazo mis días más productivos y mis periodos sin estudiar.
- **HU-2.** Como estudiante, quiero saber cuántos minutos estudié un día concreto pasando el
  ratón por encima o tocando la celda correspondiente.
- **HU-3.** Como estudiante, quiero una leyenda que me explique qué significa cada color del
  mapa.
- **HU-4.** Como estudiante, quiero ver el total de minutos estudiados en el periodo para
  medir mi dedicación global.
- **HU-5.** Como estudiante, quiero que el mapa siga funcionando aunque no haya sesiones o
  los datos guardados estén dañados, sin que se pierda lo que ya tenía guardado.

## Requisitos funcionales

### RF-1 — Ventana temporal de 12 semanas

El sistema deberá mostrar un mapa de calor con las 12 semanas más recientes, cada una de
lunes a domingo. La semana más antigua es completa y la actual incluye los días ya
transcurridos; los días futuros de la semana actual se representan apagados (RF-4).

Criterios de aceptación:

- CUANDO se abra la página, el sistema deberá dibujar una cuadrícula de 7 filas
  (lunes → domingo) por 12 columnas (una por semana).
- CUANDO una sesión tenga fecha anterior al lunes de la semana más antigua mostrada, el
  sistema deberá ignorarla y no representarla.
- CUANDO una sesión tenga fecha posterior a hoy, el sistema deberá ignorarla y no sumarla
  al mapa.

### RF-2 — Minutos por día

El sistema deberá calcular los minutos de cada día como la suma de los minutos de todas las
sesiones válidas registradas en esa fecha, tratando el día como una única celda del mapa.

Criterios de aceptación:

- CUANDO un día tenga varias sesiones, el sistema deberá sumar sus minutos y reflejar el
  total en una sola celda.
- CUANDO un día no tenga ninguna sesión válida, el sistema deberá representarlo en el tramo
  más bajo (0 minutos, «sin estudio»).

### RF-3 — Escala de color por tramos fijos

El sistema deberá asignar a cada día un nivel de intensidad de color según tramos fijos de
minutos, independientemente del resto de días del periodo. Los tramos son: 0 («sin
estudio»), 1–30, 31–90 y 91 o más.

Criterios de aceptación:

- CUANDO un día tenga 0 minutos, el sistema deberá usar el color del tramo «sin estudio».
- CUANDO un día tenga entre 1 y 30 minutos, el sistema deberá usar el primer nivel de color.
- CUANDO un día tenga entre 31 y 90 minutos, el sistema deberá usar el segundo nivel.
- CUANDO un día tenga 91 o más minutos, el sistema deberá usar el nivel más intenso.
- SI un mismo total de minutos se repite en distintos días, ENTONCES el sistema deberá
  pintarlos con el mismo nivel de color (el criterio no depende del máximo del periodo).

### RF-4 — Días futuros

El sistema deberá representar los días futuros de la semana actual con un aspecto apagado o
inactivo y sin interacción.

Criterios de aceptación:

- CUANDO una celda corresponda a un día posterior a hoy, el sistema deberá pintarla con un
  estilo claramente distinto (apagado) y no aplicarle ningún nivel de color.
- CUANDO el usuario pase el ratón o toque una celda de día futuro, el sistema deberá no
  mostrar detalle alguno.

### RF-5 — Detalle por día

El sistema deberá mostrar la fecha y el total de minutos de un día al interactuar con su
celda. Toda celda de un día ya transcurrido es interactiva, tenga o no sesiones.

Criterios de aceptación:

- CUANDO el usuario pase el ratón sobre una celda de un día ya transcurrido, el sistema
  deberá mostrar la fecha y los minutos totales de ese día (0 si no hubo sesión).
- CUANDO el usuario deje de pasar el ratón sobre la celda, el sistema deberá ocultar el
  detalle.
- CUANDO el usuario toque una celda de un día ya transcurrido en una pantalla táctil, el
  sistema deberá mostrar la fecha y los minutos totales de ese día.
- CUANDO el usuario toque la misma celda que ya está mostrando el detalle, el sistema deberá
  ocultarlo.
- CUANDO el usuario toque una celda distinta, el sistema deberá cerrar el detalle anterior y
  mostrar el de la nueva celda.
- CUANDO una celda sea accesible mediante tecnología de asistencia, el sistema deberá
  exponer su fecha y minutos como texto alternativo; las celdas futuras no tendrán detalle.

### RF-6 — Leyenda y total del periodo

El sistema deberá mostrar una leyenda con el significado de cada nivel de color y el total
de minutos estudiados dentro de la ventana de 12 semanas.

Criterios de aceptación:

- CUANDO el mapa esté visible, el sistema deberá mostrar una leyenda que relacione cada
  nivel de color con su rango de minutos y que incluya el estado «sin estudio» (0) y el
  estado «futuro» (apagado).
- CUANDO el mapa esté visible, el sistema deberá mostrar el total de minutos del periodo,
  calculado como la suma de los minutos de las sesiones válidas con fecha dentro de la
  ventana y no posterior a hoy.
- CUANDO se registre una nueva sesión, el sistema deberá recalcular el mapa, la leyenda y el
  total de forma inmediata.

### RF-7 — Datos ausentes, inválidos o ilegibles

El sistema deberá conservar siempre los datos guardados y degradar de forma elegante cuando
no haya sesiones, estas no se puedan leer o contengan valores inválidos.

Criterios de aceptación:

- CUANDO no existan sesiones guardadas (clave ausente o lista vacía), el sistema deberá
  mostrar el mapa vacío con el total en 0 y un mensaje discreto, sin registrar error.
- CUANDO los datos guardados no se puedan leer (no sean un array válido), el sistema deberá
  mostrar el mapa vacío con el mensaje y no deberá modificar ni reescribir la clave.
- SI el almacenamiento del navegador no está disponible o falla al leerlo, ENTONCES el
  sistema deberá mostrar el mapa vacío con el mensaje y no interrumpir el resto de la
  página.
- SI una sesión no es un objeto o tiene campos inválidos, ENTONCES el sistema deberá
  ignorarla en el mapa y conservarla sin borrarla.
- SI una sesión tiene una fecha que no corresponde a un día real del calendario, ENTONCES el
  sistema deberá ignorarla en el mapa y conservarla sin borrarla.

#### Validez de una sesión (referencia para RF-2, RF-6 y RF-7)

Se considera válida una sesión cuando:

- su `fecha` es una cadena en formato `AAAA-MM-DD` que corresponde a un día real del
  calendario, y
- su `minutos`, al interpretarse como número, es un entero finito mayor que 0.

Cualquier sesión que no cumpla ambas condiciones (minutos decimal, cero, negativo, no
numérico, infinito, o fecha nula, ausente, malformada o imposible) se ignora para el mapa y
no se borra.

## Requisitos no funcionales

- **Fechas locales:** el día representado para cada fecha debe ser el mismo día calendario
  local del usuario, sin desplazarse por la zona horaria (una sesión del 3 de noviembre debe
  verse siempre el 3 de noviembre).
- **Idioma:** todos los textos visibles y de accesibilidad estarán en español.
- **Formato de números:** el total y los minutos se mostrarán en español, con separador de
  miles cuando corresponda.
- **Rendimiento:** el mapa se dibujará de forma instantánea para el volumen esperado de
  datos (decenas o cientos de sesiones).
- **Accesibilidad:** cada celda de día transcurrido tendrá texto alternativo con su fecha y
  minutos; la leyenda será legible y el contraste entre los tres niveles de color será
  suficiente para distinguirlos.
- **Responsive:** el mapa se verá correctamente en móvil (ancho de 375 px) sin
  desbordamiento horizontal.
- **Coherencia visual:** el mapa usará una escala monocromática del color de acento (teal)
  ya presente en la aplicación; los tonos exactos de cada nivel se definirán al implementar.

## Casos límite

- **Varias sesiones el mismo día:** se suman y cuentan como una sola celda (RF-2).
- **Sesión con minutos decimal, cero, negativo, no numérico, `NaN` o infinito:** se ignora
  para el mapa y no se borra (RF-7).
- **Sesión con minutos como texto numérico (`"30"`):** se interpreta como número y, si es un
  entero positivo, cuenta; en otro caso se ignora (RF-7).
- **Sesión con fecha nula, ausente, malformada o imposible (p. ej. `2026-02-30`):** se
  ignora para el mapa y no se borra (RF-7).
- **Datos que son un array pero con entradas no-objeto (`null`, números, cadenas):** cada
  entrada inválida se ignora; las válidas se representan (RF-7).
- **Almacenamiento no disponible o que falla al leer:** mapa vacío, total 0 y mensaje
  discreto, sin romper la página (RF-7).
- **Sesión con fecha futura:** no suma ni se representa (RF-1).
- **Sesión anterior a la ventana de 12 semanas:** no se representa (RF-1).
- **Semana actual incompleta:** los días futuros se muestran apagados y sin interacción
  (RF-4).
- **Hoy sin sesión pero ayer con sesión:** el día de ayer se pinta con su nivel de color;
  esto no afecta al cálculo de la racha, que es responsabilidad de otra funcionalidad.
- **Año bisiesto o cambio de mes/año dentro de la ventana:** el mapa sigue siendo correcto
  porque trabaja con fechas reales, no con desplazamientos fijos de días.
- **Cambio de horario (DST) dentro de la ventana:** no afecta, porque se trabaja solo con
  fechas locales, sin horas.
- **Sesiones duplicadas exactas (misma fecha y minutos):** se suman, igual que cualquier
  otra repetición del mismo día (RF-2).
- **Página abierta al cruzar la medianoche:** el mapa se recalcula solo al abrir la página o
  al registrar una sesión; no se refresca de forma automática.
- **Clave de datos ausente:** mapa vacío, total 0 y mensaje discreto (RF-7).
- **Datos corruptos (JSON inválido o no array):** mapa vacío, total 0 y mensaje discreto,
  sin tocar la clave (RF-7).

## Fuera de alcance (esta versión)

- Calcular o mostrar la racha: es responsabilidad de las funcionalidades ya existentes.
- Editar o eliminar sesiones (hoy la aplicación solo permite registrarlas); si en el futuro
  se añaden, el mapa deberá actualizarse del mismo modo que al registrar.
- Resaltar visualmente el día de hoy de forma especial.
- Refrescar el mapa automáticamente al cruzar la medianoche.
- Filtros o selección de un rango de fechas distinto a 12 semanas.
- Exportar o imprimir el mapa.
- Animaciones de carga o transiciones elaboradas.
- Comparar periodos o mostrar estadísticas adicionales por semana o mes.

## Criterios de finalización

- La spec está aprobada por el usuario y no hay dudas bloqueantes.
- El mapa se dibuja correctamente con 12 semanas (lunes → domingo) y los tramos de color
  acordados (0 / 1–30 / 31–90 / 91+).
- El detalle por día (fecha + minutos), la leyenda y el total del periodo funcionan al pasar
  el ratón y al tocar, con el cierre acordado en pantallas táctiles.
- Los días futuros se ven apagados y no son interactivos.
- Se comprueban manualmente en el navegador (abriendo el archivo directamente) los casos
  límite descritos, incluidos el de datos ausentes, el de datos corruptos y el de
  almacenamiento no disponible, y se documentan los resultados.
- La vista se ve bien en móvil (375 px) sin desbordamiento.
- La memoria del proyecto queda actualizada al terminar la tarea.

## Dudas abiertas

No quedan dudas bloqueantes. Único detalle no bloqueante, que se resolverá en el plan
(diseño): los tonos exactos de la escala monocromática de teal, garantizando el contraste
mínimo entre niveles para su accesibilidad.
