# Mapa de calor de estudio

## Contexto y objetivo
El diario muestra rachas y minutos semanales, pero no permite reconocer de un vistazo cómo se distribuye el estudio a lo largo del tiempo. El mapa debe hacer visibles los días estudiados y la intensidad de la dedicación reciente, sin modificar los registros existentes. Será una sección visible de la página del diario.

### Definiciones
- **Día transcurrido:** fecha local igual o anterior a hoy.
- **Día futuro:** fecha local posterior a hoy.
- **Minutos válidos:** número entero mayor que 0.
- **Sesión válida:** tiene fecha con formato `AAAA-MM-DD` que representa un día real, y minutos válidos.
- **Entrada defectuosa:** no cumple lo anterior (fecha con otro formato o imposible, o minutos no válidos).

## Usuarios
- Personas que registran sus sesiones de estudio y quieren revisar su constancia reciente, también desde el móvil.

## Historias de usuario
- Como estudiante, quiero ver los días en que estudié durante las últimas semanas para reconocer mi constancia.
- Como estudiante, quiero distinguir los días de mayor dedicación para comparar mi esfuerzo.
- Como estudiante, quiero consultar los minutos de un día concreto para entender su color.

## Requisitos funcionales
**RF-1. Período y rejilla.** Cuando se muestre el mapa, deberá representar 12 semanas calendario consecutivas de lunes a domingo (la semana en curso y las 11 anteriores), según la fecha local, y mostrar una cabecera que identifique los días de la semana y los meses.

**RF-2. Minutos por día.** Cuando un día transcurrido del período tenga una o más sesiones válidas, deberá sumar sus minutos válidos y representar ese día con esa suma total; los días fuera del período no aportan minutos.

**RF-3. Intensidad y leyenda.** Cuando el total de minutos de un día transcurrido sea 0, de 1 a 29, de 30 a 59, de 60 a 119 o 120 o más, deberá mostrarse respectivamente con los niveles «sin estudio», «bajo», «medio», «alto» o «máximo», y deberá mostrarse una leyenda que asocie cada nivel a su rango de minutos.

**RF-4. Días futuros.** Cuando un día del período corresponda a una fecha posterior a hoy, deberá mostrarse con un estado «futuro» distinto del nivel «sin estudio», sin minutos, sin actividad y sin detalle, aunque exista una sesión fechada en ese día.

**RF-5. Detalle del día.** Cuando el usuario toque, enfoque o pase el cursor sobre un día transcurrido, deberá poder conocer su fecha local y su total de minutos, incluidos los días con 0 minutos; los días futuros no ofrecerán detalle.

**RF-6. Actualización.** Cuando se guarde una sesión válida cuya fecha esté dentro del período visible, deberá actualizarse de inmediato el color y el total consultable de ese día sin alterar las demás sesiones; si la fecha queda fuera del período, el mapa no cambiará.

**RF-7. Ausencia de datos y errores.** Cuando la clave no exista o contenga un array vacío, deberá verse el calendario sin actividad; cuando la clave no pueda leerse (no es un array o su contenido no es JSON válido), deberá mostrarse un mensaje de que el mapa no está disponible en lugar de un calendario vacío; cuando haya entradas defectuosas, deberán omitirse solo del cálculo sin borrar ni modificar los datos guardados.

## Requisitos no funcionales
- El mapa deberá ser legible y utilizable en pantallas móviles a 375 px sin provocar desplazamiento horizontal de la página; si el espacio no alcanza, el mapa podrá desplazarse dentro de su propio contenedor sin desplazar la página.
- El significado de cada día no deberá depender únicamente del color; cada día transcurrido deberá tener un nombre accesible con su fecha y minutos, ser navegable por teclado y ofrecer contraste suficiente entre niveles.
- La interfaz y los mensajes de esta funcionalidad deberán estar en español.
- La consulta del mapa no deberá enviar ni exponer fuera del dispositivo el contenido de las sesiones.
- Con el volumen habitual de sesiones (del orden de cientos), la apertura y la actualización del mapa no deberán bloquear la interfaz de forma perceptible.

## Casos límite
- El período incluye cambio de mes o año, febrero bisiesto y días con cambio de hora: cada fecha local representa un único día y «hoy» se calcula con la fecha local.
- Semana actual incompleta: los días posteriores a hoy se marcan como «futuro».
- Varias sesiones del mismo día (incluidas las idénticas) se suman; no se deduplican.
- Fecha con formato distinto de `AAAA-MM-DD` (por ejemplo `2026-11-3`, `3/11/2026` o un objeto fecha) se trata como entrada defectuosa y se omite.
- Minutos no enteros o no positivos (decimal, 0, negativo, no numérico o vacío) se tratan como entrada defectuosa y se omiten.
- Una entrada defectuosa mezclada entre entradas válidas se omite solo a sí misma, no al resto.
- Clave ausente, array vacío, valor no-array y JSON inválido se distinguen según RF-7.

## Fuera de alcance
- Editar, eliminar o crear sesiones desde el mapa.
- Navegar por períodos anteriores o cambiar la duración de las 12 semanas.
- Filtrar por tema, mostrar el número de sesiones o comparar usuarios.

## Criterios de finalización
- Se comprueban RF-1 a RF-7 con casos manuales documentados en el navegador: días vacíos, varios registros por día, límites de intensidad, fechas futuras, cambio de semana/año, hora local y datos ausentes, no legibles o defectuosos.
- Se comprueba el detalle con ratón, teclado y pantalla táctil, y la legibilidad a 375 px sin desplazamiento horizontal de la página.
- Se comprueba que los registros existentes permanecen intactos, que una entrada defectuosa no elimina a las válidas y que los textos están en español.

## Dudas abiertas
- Ninguna por ahora.
