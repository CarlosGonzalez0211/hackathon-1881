# Athena brand kit

Identidad única para todos los estudiantes y profesores. Configuración para desarrolladores; no es un selector de temas, skins o avatares. La fase actual conserva el mundo provisional de Messenger y agrega tokens neutrales y legibles para la interfaz educativa. No implementa el rediseño inspirado en Sky.

```tsx
import "@athena/brand/tokens.css";
import { athenaBrand, type BrandKit } from "@athena/brand";
```

`BrandKit` describe nombre, fase, colores, tipografía, radios, espaciado y movimiento. CSS y TypeScript expresan los mismos valores; actualizar ambos al adoptar el kit aprobado por diseño. El motor conserva sus materiales originales hasta que exista un reemplazo explícito en su configuración; estos tokens no recolorean geometría automáticamente.

Los estados educativos necesitan texto y formas además de color. Usar `ink` o `muted` sobre `paper`/`surface`; `accentInk` sobre `accent`. No utilizar el color del estado como única señal. Mantener foco de teclado visible, texto escalable y reducción de movimiento. Los tokens de movimiento respetan `prefers-reduced-motion`; el adaptador 3D también debe aplicarlo a cámara y efectos.

El encargo completo para el diseño objetivo está en `docs/CLAUDE_DESIGN_PROMPT.md`. Ningún valor provisional representa una aprobación del branding final.
