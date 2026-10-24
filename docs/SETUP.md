# Arranque y desarrollo

El directorio de entrega solicitado es `C:\Users\guill\Desktop\dev2026\Athena`. Durante preparación puede existir una copia de trabajo en el workspace original; comprobar ubicación y `git remote -v` antes de editar o publicar. No mezclar el `.git` vacío del workspace antiguo con el historial del equipo.

Desde la raíz del monorepo, usando la versión de pnpm indicada en `package.json`:

```sh
pnpm install --frozen-lockfile
pnpm dev:web
```

Para ejecutar la API por separado: `pnpm dev:api`. Para verificaciones: `pnpm typecheck`, `pnpm lint` y `pnpm build`. La integración debe actualizar el lockfile antes de exigir `--frozen-lockfile` en CI. Consultar la salida real del servidor para el puerto; no asumir que coincide con la referencia antigua en 4173.

Configurar `NEXT_PUBLIC_USE_MOCKS=true` para la demostración educativa sin credenciales. No copiar secretos dentro de documentación, fixtures, bundles, capturas o inventarios. Las claves de Gemini y Supabase con privilegios permanecen exclusivamente en el backend. `.env.example` describe nombres, no valores reales.

## Rutas de aceptación

- `/world`: planeta del estudiante y casas con mocks.
- `/orbit`: demostración técnica de ocho planetas; no dashboard docente completo.
- `/reference/messenger`: base original conservada para regresión.
- `/api/health`: comprobar la ruta efectiva del adaptador de despliegue y del servidor local.

La interfaz usa una identidad fija. Sustituir modelos, materiales o animaciones mediante sus definiciones técnicas; no añadir selectores de apariencia para estudiantes.

## Git y Vercel

Trabajar en una rama `codex/…` de frontend; no hacer push directo a `main`. Abrir un PR pequeño y conservar las revisiones y CI del equipo. El cambio de nombre remoto a Athena requiere permisos administrativos del repositorio existente; no crear un repositorio alternativo para evitar esa restricción.

Conservar el proyecto Vercel existente y su vínculo con GitHub. Adaptar rutas del monorepo, instalación, build, assets y workers en su configuración; configurar variables en Vercel sin exponerlas. Validar primero el preview de la rama. Producción se comprueba después de la integración del equipo; no marcarla como validada solo por compilar localmente.

El checklist reproducible está en `VALIDATION.md`. Registrar URL, commit y fecha de cada despliegue probado; no introducir URLs de ejemplo como si fueran entregas reales.
