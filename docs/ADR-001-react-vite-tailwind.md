# ADR-001: Frontend React con Vite y Tailwind

## Estado

Aceptada e implementada.

## Contexto y problema

La interfaz original estaba concentrada en `templates/index.html`, mezclaba dos pantallas grandes y repetía la estructura de las métricas. Además, el flujo de predicción no tenía un formulario visual para ingresar las características del modelo.

Esto dificultaba:

- Mantener una jerarquía visual consistente.
- Validar el formulario y comunicar estados de carga o error.
- Reutilizar tarjetas, modales y campos.
- Evolucionar la interfaz sin aumentar el tamaño de una sola plantilla.

## Atributos de calidad

- **Usabilidad:** flujo visible de carga, entrenamiento y predicción, validación nativa y retroalimentación de estados.
- **Mantenibilidad:** componentes pequeños y responsabilidades separadas.
- **Modificabilidad:** los estilos y componentes pueden evolucionar sin cambiar los filtros de Machine Learning.
- **Integración:** el backend conserva Pipes and Filters y expone un contrato JSON.

## Decisión

Se implementó un frontend independiente con **React + Vite + Tailwind CSS**. Flask se mantiene como backend y ahora expone:

- `POST /api/train`: recibe el CSV y devuelve métricas y el esquema de características.
- `GET /api/model-info`: devuelve el esquema del último modelo entrenado.
- `POST /api/predict`: recibe los valores del formulario y devuelve la predicción.

La lógica de negocio se movió a `services/weather_service.py`. Los filtros existentes no se modificaron; el servicio los orquesta y persiste el modelo con su esquema de tipos.

## Componentes principales

- `UploadPanel`: selección y arrastre del CSV.
- `MetricCard`: tarjeta reutilizable para las métricas.
- `PredictionForm`: formulario dinámico basado en el esquema del modelo.
- `Modal`: resultado de la predicción, cierre por botón, clic exterior o Escape.
- `api.js`: comunicación HTTP aislada de los componentes.

## Alternativas consideradas

### Mantener Jinja y Bootstrap

Era el cambio más pequeño, pero mantenía la plantilla monolítica y limitaba la reutilización del frontend.

### React embebido dentro de Jinja

Permitía una migración gradual, pero mezclaba dos formas de renderizado y aumentaba la complejidad de mantenimiento.

### React con un framework visual adicional

Reducía el CSS inicial, pero agregaba otra abstracción y dependencia. Tailwind permite controlar la identidad visual sin Bootstrap.

### Cambiar a TensorFlow

No resuelve la interfaz ni la reutilización. Para datos tabulares y el objetivo del reto, Scikit-learn conserva un flujo más simple y adecuado.

## Trade-offs

### Beneficios

- Componentes reutilizables y fáciles de probar de forma aislada.
- Estados de carga y error visibles.
- Formulario generado según las características reales del modelo.
- Separación clara entre UI, API y lógica de entrenamiento.

### Costos

- Se agregan Node.js, Vite, React y Tailwind al proyecto.
- Hay que ejecutar `npm install` y construir el frontend antes de servirlo desde Flask.
- Existe una curva de aprendizaje de JSX, estados y comunicación HTTP.

## Validación

Se verificó el siguiente flujo con `weather_dataset(in).csv`:

1. `npm run build` terminó correctamente.
2. `GET /` devolvió el frontend compilado.
3. Los assets de Vite respondieron correctamente desde Flask.
4. `POST /api/train` entrenó con 1200 registros y 4 características.
5. `POST /api/predict` devolvió una predicción y probabilidad.