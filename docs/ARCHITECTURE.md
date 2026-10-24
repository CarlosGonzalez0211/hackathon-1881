# Arquitectura de Athena

Athena representa aprendizaje demostrado mediante un planeta por estudiante y casas por tema. El frontend 3D es la prioridad de esta fase. El backend valida progreso; AI ayuda con explicaciones fundamentadas en contenido autorizado. El número de prompts y el tiempo conectado nunca determinan crecimiento académico.

## Límites y módulos

| Área                        | Responsabilidad                                                       | Límite                                                        |
| --------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------- |
| `frontend/web`              | Next.js, rutas, UI accesible y adaptador React                        | Consume contratos; no valida dominio académico                |
| `frontend/engine3d`         | Runtime, escenas, mundo, personajes, acciones, render, assets y audio | Independiente de React, credenciales, API de tutor y Supabase |
| `frontend/brand`            | Identidad fija y tokens visuales                                      | Sin personalización de apariencia por usuario ni por edad     |
| `backend/api`               | Fastify, health, validación HTTP y composición                        | No expone secretos al cliente                                 |
| `backend/modules`           | Reservas para aprendizaje y analytics                                 | Pendientes de implementación del equipo                       |
| `ai/gemini`                 | Cliente existente e integración del proveedor                         | Módulo interno del backend, no microservicio                  |
| `ai/rag`                    | Futura recuperación de currículo autorizado                           | No presentar un prompt genérico como tutor fundamentado       |
| `data/supabase`             | Futuras migraciones, políticas y datos                                | Permisos por rol y por clase antes de uso real                |
| `shared`                    | Zod, tipos y fixtures educativos                                      | Propuesta de contrato pendiente de acuerdo del equipo         |
| `references/messenger`      | Original, recursos y procedencia                                      | Referencia de regresión; no dependencia del motor extraído    |
| `tools/reverse-engineering` | Extracción reproducible e inventarios                                 | Evidencia completa fuera del código distribuido               |

El stack conserva Next.js, TypeScript, Tailwind, Fastify, Supabase y Gemini. No se añade otro framework 3D ni microservicio. La reorganización conserva el historial del repositorio y sus flujos de colaboración, CI y despliegue.

## Flujo del frontend

1. La ruta carga fixtures con `NEXT_PUBLIC_USE_MOCKS=true`. El modo real queda separado y necesita endpoints acordados.
2. El adaptador entrega `PlanetState` al motor cargado únicamente en cliente. `HouseState.slot` se relaciona con una posición de la configuración del mundo.
3. El motor carga recursos mediante identificadores estables y emite eventos de interacción. No modifica estado académico.
4. React abre un panel de sesión pendiente o informa el bloqueo. El listado HTML de temas proporciona la misma operación por teclado y lector de pantalla.
5. Al salir de una ruta, el adaptador libera listeners, render loop, workers y recursos que le pertenecen.

La órbita es una demostración técnica de ocho planetas en un canvas con recursos compartidos. No es todavía un dashboard de profesor. Omite física, personajes y efectos costosos de superficie. Superficie y órbita representan el mismo contrato educativo.

## Configuración y extracción

Las definiciones separan assets físicos, entidades, transformaciones, visuales, colisiones, interacciones, personajes, animaciones, acciones, materiales, cámara, audio y efectos. Las instancias repetidas comparten definición y tienen identidad/posición propias. Las casas identificadas son entidades interactuables, incluso si su contenido sigue pendiente.

Todo elemento extraído conserva procedencia: archivo, símbolo o identificador de batching original. Un `batchId` no demuestra por sí mismo que una pieza sea casa o árbol; la asignación semántica requiere inspección visual. Una geometría compuesta sin límites recuperables se documenta como tal, con límites de interacción independientes y tarea de reemplazo. No se afirma recuperar archivos fuente originales de modelado.

Se preservan originales, recursos, avisos y material de procedencia, incluidos aquellos con licencia desconocida. La interfaz Athena se diferencia de la referencia; conservar archivos no supone verificar su licencia ni cambiar su titularidad. La extracción no se considera completa mientras Athena importe el bundle monolítico original.

## Backend, AI y datos futuros

El backend será la autoridad para comprensión, desbloqueos, crecimiento y permisos. El frontend envía acciones y representa el resultado validado. Las rutas previstas están en `CONTRACTS.md`; su existencia en un documento no implica implementación.

El tutor recuperará información de los materiales del profesor dentro del tema y curso permitidos. El LLM puede adaptar formato y analogías, pero no reemplazar currículo con hechos no fundamentados. Pistas, respuestas de quiz, analytics y eventos necesitan validación y autorización propias. La fase actual no conecta una UI de tutor a un endpoint genérico de generación.

No se implementan todavía autenticación, progreso persistente, ingestión RAG, quizzes, podcast, vídeo, dashboard docente ni interiores. Los archivos de reserva deben decir explícitamente que son reservas.

## Propiedad de trabajo propuesta

| Área                                | Responsable funcional a acordar | Cambios cruzados                           |
| ----------------------------------- | ------------------------------- | ------------------------------------------ |
| Motor, planeta y casas              | Frontend 3D                     | Coordinar contratos y sesión con el equipo |
| Vista docente y analytics UI        | Frontend docente                | Reutilizar estado y modo órbita            |
| Sesión educativa y tutor            | Aprendizaje/AI                  | Acordar DTO, errores y controles de acceso |
| API, datos, contratos y despliegues | Plataforma                      | Revisar cambios de contrato con todos      |

Estos roles no asignan nombres nuevos ni congelan contratos. La tabla histórica del GAMEPLAN se conserva como referencia; las rutas actuales reemplazan sus ubicaciones `apps/` y `packages/`.
