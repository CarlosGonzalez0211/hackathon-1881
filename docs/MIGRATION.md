# Migración de la base a Athena

## Fuente y precedencia

El repositorio existente aporta historial, colaboración, CI y despliegue. La base local de Messenger aporta el mundo provisional y la referencia ejecutable. Los documentos originales se preservan en `docs/references`; sus instrucciones se tratan como contexto histórico, subordinado a la solicitud de implementación aprobada.

Cambios respecto del GAMEPLAN:

- `apps/web` pasa a `frontend/web`; `apps/api` a `backend/api`; `packages/shared` a `shared`.
- El motor reutilizable vive en `frontend/engine3d`; identidad y tokens en `frontend/brand`.
- Gemini y RAG son módulos internos en `ai`, no servicios nuevos.
- Los contratos se proponen al equipo; no se declaran congelados unilateralmente.
- Se elimina del alcance el selector de tema/personaje y la personalización visual de usuario. Hay una identidad única para todas las edades.
- Superficie y órbita son el trabajo actual. La sesión educativa es un stub explícito y la órbita no constituye el dashboard de profesor.

## Conservación y procedencia

Conservar modelos, texturas, audio, fuentes, workers, codecs, código, documentos y demás recursos disponibles. Mantener originales y avisos en la referencia y documentar licencia conocida, URL/origen, hash y destino. Lo desconocido se marca pendiente; no se descarta por ello.

El cambio de presentación visible a Athena no cambia la titularidad de recursos. El inventario no debe afirmar autoría propia de assets extraídos ni recuperación de originales de DCC que nunca estuvieron disponibles. La referencia conserva la experiencia y documentación histórica.

Antes de retirar la copia anterior: comparar hashes y conteos, comprobar la referencia ejecutable desde el destino, y confirmar que no quedan archivos exclusivos fuera del checkout. No borrar originales de Downloads. No sustituir el historial del equipo con el `.git` del workspace inicial.

## Estado verificable

Los documentos de arquitectura y diseño definen límites y objetivo. La evidencia de extracción vive en `tools/reverse-engineering`; `VALIDATION.md` contiene la aceptación pendiente de ejecución. La entrega debe distinguir código implementado, comprobado localmente, comprobado en preview, comprobado en producción y funciones futuras.

Si no hay permisos para renombrar el repositorio remoto, Carlos debe renombrar el repositorio existente a `Athena` desde su configuración de GitHub. Después se actualiza `origin` a la URL real resultante y se comprueba el vínculo del proyecto Vercel existente. No crear otro repositorio como sustituto.
