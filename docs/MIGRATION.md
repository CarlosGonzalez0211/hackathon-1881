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

## Cambio de arte Messenger → Athena (Persona 3)

Mantiene el mundo de Messenger (planeta, caminos, colisión, cámara, controles, spawns de NPC, posiciones de lotes, cielo) y cambia solo el arte. Código en `frontend/engine3d/src/athena/*` (un sistema por slot, registrados en `systems.ts`; cada uno parchea el runtime recuperado y cae al legado si falla).

### Pipeline de carga

1. `scripts/build-athena-assets.mjs` (predev/prebuild) convierte `athena-assets/` en `frontend/web/public/athena/` con hash: GLB → dedup/prune/flatten+join/weld/simplify(meshopt)/meshopt; PNG → KTX2 si hay `toktx` (si no, PNG); WAV → OGG (ffmpeg); escribe `athena-manifest.runtime.json` y `athena-budget.json`. `ATHENA_KIT_DIR` apunta a otra copia del kit.
2. `runtime/context.ts` carga el manifiesto (`athenaAssets`, por defecto true; `NEXT_PUBLIC_ATHENA_ASSETS=false` para A/B) y `runtime/configuration.ts` envuelve los cargadores legados: texturas y audio resuelven primero a `/athena/`; la geometría `.drc` sigue siendo legado.
3. `athena/install.ts` crea el contexto (GLTFLoader con Meshopt/KTX2, toon, colocación) y ejecuta los sistemas. Los GLB se cargan con `loadAthenaModel`: fusión estática por material (colores a vértice; personajes animados por nodo → un `SkinnedMesh` con los nodos como huesos), toon + tinta, sombras.
4. Todo material Athena escribe el `gInfo` del pipeline MRT legado y usa su niebla, así que comparte postproceso, niebla y LUT con lo legado.

### Tabla de slots

| Slot legado                                          | Athena                                                                                                                                                     | Estado                                                                                                                                                                                 |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `avatar/*` (base, huesos, accesorios, 7 animaciones) | `athena-avatar-base.glb` + `hair-bob`, `top-poncho`, `bottom-shorts`, `shoes-boots`, `acc-scarf-satchel`; clips idle/walk/run/sprint/air/afk1-3/emote_wave | Hecho. El rig legado sigue oculto: su cápsula y sus pesos de mezcla mueven al avatar Athena (fundido 0,2 s).                                                                           |
| `npcs/present/<slot>` ×20                            | `athena-npc-*` (manifiesto)                                                                                                                                | Hecho. Idle, talk cerca del jugador, walk en curvas. Rigs legados ocultos (spawn, orientación, curvas, culling).                                                                       |
| `new:npc.cat`                                        | `athena-npc-cat-lumen.glb`                                                                                                                                 | Hecho. Junto a la casa disponible siguiente, sobre la colisión original.                                                                                                               |
| `topic-anchor.0-5`                                   | `athena-house-<status>-v<n%6>.glb`                                                                                                                         | Hecho. Sitio libre y plano junto a cada ancla (colisión + geometría visible); fundido 0,9 s, instantáneo con movimiento reducido. Ajustes por slot en `placement/athena-placement.ts`. |
| `planets/present/tree-leaves_*` (follaje)            | `athena-bush`, `athena-tree-round`, `athena-tree-spire` (copas)                                                                                            | Hecho. 214 copas desde `centr_tree`, instanciadas, simplificadas y recortadas por distancia.                                                                                           |
| `emojis/0-9`                                         | `athena-emote-*` (`pop`)                                                                                                                                   | Hecho. El sistema legado conserva límite, distancia y sonidos.                                                                                                                         |
| `deliveries/*`                                       | `items/athena-item-*`                                                                                                                                      | Hecho (oculto: las misiones son un stub).                                                                                                                                              |
| `birds/1`, `birds/2`                                 | `athena-bird-swift`, `athena-bird-finch`                                                                                                                   | Hecho. Bandadas, curvas y aleteo legados con la malla del kit.                                                                                                                         |
| cielo (`clouds_noise_512`)                           | `sky-gradient-day.png` como LUT vertical + `clouds-noise-512`                                                                                              | Hecho (fallback: degradado de tokens).                                                                                                                                                 |
| `images/lut`                                         | `lut-athena-256x16.png` → LUT 3D 16³                                                                                                                       | Hecho.                                                                                                                                                                                 |
| otras texturas de ruido                              | PNG/KTX2 del kit                                                                                                                                           | Hecho vía cargador.                                                                                                                                                                    |
| `audio/*` (54)                                       | WAV del kit → OGG                                                                                                                                          | Hecho. Buses música (música + ambiente) / efectos, apagado hasta el primer gesto.                                                                                                      |
| `fonts/*.font` (MSDF)                                | Newsreader / Atkinson Hyperlegible Next / IBM Plex Mono (`next/font`)                                                                                      | Hecho: texto HTML. Los bocadillos MSDF de NPC no se usan (sin tutor simulado).                                                                                                         |
| `*.icon` / símbolos de estado                        | `icons/state-*.svg`                                                                                                                                        | Hecho en la UI HTML (forma + texto + color).                                                                                                                                           |
| órbita (planeta legado ×8)                           | `athena-planet-<kind>` instanciado + `athena-teacher-sun`                                                                                                  | Hecho. 8 planetas en 3 draw calls; tipo configurable por clase.                                                                                                                        |

### Pendiente

- **Terreno y arquitectura** (`full_*`, LOD 1-3): el planeta es una esfera de ~30 m y sus lotes funden suelo, edificios y caminos en mallas espaciales (las componentes no separan edificios del terreno). Las losetas de 8×8 m no encajan, así que se conserva la forma original (y su colisión) con el material legado. Pendiente: recolorear con `palette-atlas-256.png` (diferido hasta comprobar que su distribución coincide con las UV legadas).
- **Edificios de los lotes**: no se sustituyen por instancias del kit por el mismo motivo (quitarlos abriría huecos en el terreno).
- **VFX** (agua, cascada, salpicadura, entrada, espuma, humo) y **césped/mariposas**: su geometría está ajustada al terreno legado; el kit no la coloca para este planeta.
- **Texturas acopladas a UV/shaders legados**: atlas, ojos/boca, sprites de partículas, mariposas, briznas, hojas; y el anillo de controles táctiles.
- **Escena de introducción** (`intro/*`: título, botón, galaxias, estrellas): la web abre la superficie directamente (`initPresent`), así que la intro no se muestra; sus slots están mapeados en el manifiesto.
- **Casas sin colisión propia**: se apoyan en la colisión original, así que el jugador puede atravesarlas (la interacción E funciona en el ancla o en la puerta). Las casas 3 y 5 usan el sitio menos obstruido (registro en consola).
- **Postes muy delgados** (< 0,5 m) pueden pasar entre los rayos de la búsqueda de sitio.
- **Retirar `public/assets/athena`**: no es posible mientras existan los slots estructurales de arriba. `pnpm check:assets` lista cada archivo legado con su motivo (`src/assets/legacy-allowlist.mjs`) y falla con cualquier otro; `--strict` falla con todos.

### Presupuestos medidos (Chromium headless, SwiftShader)

- Superficie: 50-105 draw calls (el legado solo usa 35; objetivo ≤ 120). Triángulos 300-600 k según la vista: el mundo legado ya supera el objetivo de 250 k (265 k) y las sombras cuentan dos veces.
- Órbita: 11 draw calls en total (8 planetas en 3; 4 son pasadas de postproceso legadas); ~65 k triángulos.
- Primera carga de la superficie: 5,7 MB de GLB + texturas/audio (~6,5 MB con un kit completo de prueba) / 8 MB.
- 30 fps en Chromebook: sin medir (SwiftShader no es representativo).

### Kit en Git LFS

Los 293 binarios del kit (GLB/PNG/WAV) nunca se subieron al servidor LFS: el checkout remoto solo tiene punteros. Desde la máquina que los tiene: `git lfs push --all origin`. Sin ellos, el build marca cada archivo como no construido y el motor usa el arte legado en esos slots.
