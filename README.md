# App-Humbolth

## Backend de materias con integración para n8n

Este repositorio incluye un backend en Express para gestionar materias y exponer la información en un formato que n8n puede consumir fácilmente mediante nodos HTTP o Webhook.

### Estructura principal

```
backend/
  src/
    controllers/     # Lógica HTTP y validaciones
    data/            # Persistencia basada en archivo JSON
    models/          # Modelo de dominio (Materia)
    routes/          # Definición de rutas Express
    server.js        # Punto de entrada de la API
```

### Instalación y ejecución

```bash
cd backend
npm install         # instalar dependencias (requiere acceso a npm)
npm run dev         # levanta el servidor con nodemon en http://localhost:3000
```

> Si el entorno no cuenta con acceso a npm puedes trabajar únicamente con el código fuente y ejecutar `node src/server.js` una vez que las dependencias estén disponibles.

### Endpoints disponibles

| Método | Ruta                | Descripción |
| ------ | ------------------- | ----------- |
| GET    | `/health`           | Estado del servicio |
| GET    | `/materias`         | Lista todas las materias |
| GET    | `/materias/:id`     | Obtiene una materia |
| POST   | `/materias`         | Crea una materia con nombre, descripción, plan de estudio y puntos de evaluación |
| PUT    | `/materias/:id`     | Modifica una materia existente |
| DELETE | `/materias/:id`     | Elimina una materia |
| GET    | `/materias/:id/n8n` | Devuelve la materia en el formato `{ json: { ... } }` que consume n8n |

#### Estructura del recurso `Materia`

```json
{
  "nombre": "Matemática I",
  "descripcion": "Fundamentos de álgebra",
  "planEstudio": {
    "objetivos": ["Comprender..."],
    "contenidos": ["Álgebra", "Trigonometría"],
    "calendario": [
      { "semana": 1, "tema": "Introducción" }
    ]
  },
  "puntosEvaluacion": [
    { "tipo": "Examen", "porcentaje": 40, "criterios": "..." }
  ]
}
```

### Integración sugerida con n8n

1. **Node HTTP Request:** configura el método y URL deseada (`GET /materias/:id/n8n` para obtener el payload estructurado).
2. **Node Webhook:** apunta el webhook a `POST /materias` o `PUT /materias/:id` para crear o actualizar materias desde un flujo n8n.
3. Cada registro incluye la estructura `planEstudio` y `puntosEvaluacion` lista para mapear dentro de n8n usando expresiones (`{{$json["planEstudio"].objetivos}}`).

Con esta API puedes construir flujos que automaticen la creación y actualización de materias, mantengan sincronizado el plan de estudio y disparen evaluaciones dentro de tus automatizaciones.
