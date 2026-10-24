# Validación y estado de entrega

Este archivo define la aceptación, no afirma que las pruebas ya pasaron. Registrar evidencia y resultados reales en la tabla al ejecutar cada verificación. «Pendiente» significa que todavía no existe evidencia aquí; no equivale a fallo ni a éxito.

| Verificación                           | Estado inicial | Evidencia requerida                                |
| -------------------------------------- | -------------- | -------------------------------------------------- |
| Tipos, lint y compilación del monorepo | Pendiente      | Comando, resultado y commit                        |
| Resolución de assets y contratos       | Pendiente      | Pruebas y total de recursos inventariados          |
| `/world` en mocks sin secretos         | Pendiente      | URL y captura de superficie                        |
| Casas con ratón, teclado y lista 2D    | Pendiente      | Disponible, bloqueada, sin tema y cierre de panel  |
| Extracción independiente del bundle    | Pendiente      | Grafo/imports y búsqueda de dependencias           |
| Movimiento, colisiones y diálogos      | Pendiente      | Comparación con referencia                         |
| Audio, emotes, animaciones y efectos   | Pendiente      | Escenarios comprobados y límites                   |
| Limpieza de recursos al navegar        | Pendiente      | Listeners, loops y workers tras varios ciclos      |
| Ocho planetas en canvas compartido     | Pendiente      | FPS, dispositivo, navegador, resolución y duración |
| Preview Vercel                         | Pendiente      | URL, commit, rutas, requests, workers y health     |
| Producción Vercel                      | Pendiente      | URL, commit integrado y mismas comprobaciones      |
| Conservación de archivos originales    | Pendiente      | Hashes y comparación del inventario                |
| Traslado final y remoto                | Pendiente      | Ruta, rama y permisos/resultados del rename        |

Objetivo de rendimiento: 60 fps en el portátil de prueba, registrando condiciones y resultados. No prometer 60 fps universales. Comprobar modo móvil, teclado, lector de pantalla, reducción de movimiento, error de carga y WebGL no disponible con alternativa HTML.

Pruebas de lifecycle: abrir superficie, cambiar a órbita, visitar referencia y repetir; confirmar que no se acumulan canvases, audio, listeners, workers ni render loops. En despliegue comprobar MIME, rutas absolutas, contenido de archivos WASM, fuentes, texturas, modelos y workers; un HTTP 200 que devuelve HTML no confirma que el asset exista.

Backend/AI: verificar health por separado. Autenticación, persistencia académica, RAG, tutor, generación multimedia y dashboard docente son futuros; no contabilizarlos como implementados por existir una carpeta o endpoint genérico.
