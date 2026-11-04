# Constitución del Diario de Estudio

1. **Stack mínimo:** HTML, CSS y JavaScript puros; sin frameworks, dependencias, build ni servidor. Se verifica abriendo `index.html` con doble clic.
2. **Especificación primero:** cada funcionalidad visible debe estar descrita en `docs/specs/`; si spec y código discrepan, se corrige antes de dar el cambio por terminado.
3. **Lógica separada de la interfaz:** fechas, racha y minutos se calculan sin tocar el DOM; la interfaz solo recoge datos, llama a esas funciones y pinta.
4. **Tests sin instalar nada:** cada cambio se comprueba con casos manuales documentados en el navegador, sin frameworks ni dependencias de test.
5. **Datos protegidos:** nunca se borra ni se envía fuera `diarioEstudio_sesiones`; todo cambio de formato debe migrar las sesiones existentes sin pérdida.
6. **Todo en español:** interfaz, documentación, comentarios y nombres nuevos de variables y funciones, salvo las APIs nativas del navegador.
