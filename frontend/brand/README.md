# Athena brand kit

Identidad única para todos los estudiantes y profesores. Configuración para desarrolladores; no es un selector de temas, skins o avatares. Los tokens siguen la guía de marca v1.0 (`frontend/engine3d/athena-assets/docs/Athena Brand Guide.html`, sección 03) y el kit de `athena-assets/code/`. El motor 3D puede conservar materiales heredados mientras cada pieza migra a los modelos de Athena.

```tsx
import "@athena/brand/tokens.css";
import { athenaBrand, houseStateVisuals, houseModelFile, type BrandKit } from "@athena/brand";
```

`BrandKit` describe nombre, fase, colores, tipografía (`display`, `body`, `mono`), radios, espaciado y movimiento (`fast`, `standard`, `calm`, `ease`). CSS y TypeScript expresan los mismos valores; actualizar ambos juntos. Estos tokens no recolorean geometría automáticamente.

Tipografía: Newsreader (display), Atkinson Hyperlegible Next (texto, 17 px / 1.55) e IBM Plex Mono (etiquetas, teclas, datos). `tokens.css` no descarga fuentes: `frontend/web` las sirve con `next/font` y expone `--font-athena-display|body|mono`, que `--athena-font-*` usa cuando existen.

Los estados educativos necesitan texto y formas además de color (`houseStateVisuals`: símbolo, icono `state-*.svg`, etiqueta ES/EN y `modelPattern` del GLB; `houseModelFile(state, variant)` resuelve `athena-house-<estado>-v0…v5.glb`). Usar `ink` o `muted` sobre `paper`/`surface`; `accentInk` sobre `accent`; `light` solo como decoración, nunca para texto. Mantener foco visible de 3 px (`--athena-focus`), texto escalable, `prefers-contrast: more` y reducción de movimiento: los tokens de movimiento respetan `prefers-reduced-motion`; el adaptador 3D también debe aplicarlo a cámara y efectos.

La fase sigue siendo `provisional` hasta la aprobación formal del diseño.
