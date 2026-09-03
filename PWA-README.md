# Instalación de la App (PWA)

Tu aplicación ahora es una PWA (Progressive Web App) que se puede instalar en iOS y Android como una app nativa.

## Cómo instalar en Android (Chrome)

1. Abre la app en Chrome: http://localhost:5173
2. Toca el menú (3 puntos) → "Agregar a pantalla de inicio"
3. Toca "Instalar" en el banner inferior (si aparece)
4. La app se instalará con un icono azul en tu escritorio

## Cómo instalar en iOS (Safari)

1. Abre la app en Safari: http://localhost:5173
2. Toca el botón "Compartir" (cuadrado con flecha)
3. Desplázate y toca "Agregar a pantalla de inicio"
4. Toca "Agregar" en la esquina superior derecha
5. La app aparecerá en tu pantalla de inicio con el icono azul

## Características de la PWA

✅ **Funciona offline** - Cache automático de archivos
✅ **Icono en escritorio** - Se ve como app nativa
✅ **Sin barra de navegador** - Pantalla completa
✅ **Actualizaciones automáticas** - Se actualiza sola
✅ **Respuesta nativa** - Animaciones suaves de 60fps

## Nota sobre iOS

En iOS, la app se abrirá en Safari sin barra de navegación, pero para funcionalidad offline completa se recomienda usar Android con Chrome.

## Archivos generados

- `manifest.webmanifest` - Configuración de la app
- `sw.js` - Service Worker para offline
- `icon-*.png` - Iconos en todos los tamaños
- `registerSW.js` - Registro automático del service worker
