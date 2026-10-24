# Contratos propuestos — no congelados

Este documento adapta el GAMEPLAN al monorepo Athena. El equipo debe revisar y acordar los esquemas de `shared` antes de integrar servicios reales. La referencia histórica no constituye aprobación automática de un contrato ni instrucción de implementar funciones futuras.

## Interfaces del frontend

```tsx
<Planet
  state={planetState}
  mode="surface" // o "orbit"
  onHouseClick={handleHouseClick}
  onPlanetClick={handlePlanetClick}
/>

<HouseSession topicId={topicId} studentId={studentId} />
```

`PlanetState` identifica estudiante, crecimiento normalizado y casas. `HouseState` identifica tema, título, slot, estado (`locked | available | in_progress | done`) y progreso normalizado. Usar el esquema ejecutable de `shared` como fuente precisa de tipos; esta descripción no crea una forma wire alternativa.

La identidad visual pertenece a `frontend/brand` y a la configuración del motor. Si se conserva `theme` por compatibilidad con el GAMEPLAN, es un valor técnico fijo y no una preferencia del usuario. `growth` y `progress` son fixtures en esta fase, sin cálculo desde el volumen de eventos AI.

## Estados de casa

| Estado                                | Acción del frontend                                                   |
| ------------------------------------- | --------------------------------------------------------------------- |
| Edificio sin tema asignado            | Mostrar «contenido pendiente»                                         |
| Tema bloqueado                        | Explicar el bloqueo, sin iniciar sesión                               |
| Disponible / en progreso / completado | Mostrar título, estado y progreso; abrir el panel de sesión pendiente |

El callback de interacción lleva identidad, no acceso directo al tutor. La UI conserva una alternativa HTML operable sin el canvas. El panel pendiente no registra avance ni promete respuestas de AI.

## API prevista del GAMEPLAN

Todas las rutas usan prefijo `/api`. La tabla describe el objetivo; verificar el código y `VALIDATION.md` para saber qué se ejecutó realmente.

| Método y ruta                   | Objetivo                              | Área           |
| ------------------------------- | ------------------------------------- | -------------- |
| `GET /planet/:studentId`        | `PlanetState` autorizado              | Plataforma     |
| `GET /class/:classId/planets`   | Planetas de estudiantes de la clase   | Plataforma     |
| `GET /analytics/class/:classId` | Resumen académico y uso AI            | Plataforma     |
| `POST /analytics/chat`          | Respuesta fundamentada sobre la clase | Aprendizaje/AI |
| `POST /learning/session`        | Tutor fundamentado en el tema         | Aprendizaje/AI |
| `GET /learning/quiz/:topicId`   | Preguntas del tema                    | Aprendizaje/AI |
| `POST /learning/hint`           | Pista del NPC, sin revelar respuesta  | Aprendizaje/AI |
| `POST /learning/generate`       | Resumen, podcast o vídeo              | Aprendizaje/AI |
| `POST /events`                  | Evento de uso AI                      | Plataforma     |

`AiEvent` propone estudiante, tema, tipo (`chat | podcast | video | summary | hint | quiz_answer`), fecha y metadatos. `ClassSummary` propone progreso por tema, conteos AI por tipo y filas por estudiante. DTO, autorización, límites y errores de esos servicios siguen pendientes de acuerdo; no añadirlos al cliente por inferencia.

Fixtures esperadas: un planeta, ocho planetas en diferentes etapas y resumen de clase. `NEXT_PUBLIC_USE_MOCKS=true` evita llamadas educativas reales. El health del backend demuestra disponibilidad técnica, no disponibilidad del tutor ni de Supabase.
