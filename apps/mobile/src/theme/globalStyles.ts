import { Platform } from 'react-native';

export function injectGlobalStyles() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  const styleId = 'ai-money-apple-light-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    html, body, #root {
      background-color: #ECECEA !important;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, "Segoe UI", sans-serif !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
      margin: 0;
      padding: 0;
      color: #171715;
    }

    * {
      box-sizing: border-box;
    }

    /* Scrollbar sutil estilo macOS */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.12);
      border-radius: 999px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.22);
    }

    /* Tabular nums para cifras financieras */
    .tabular-nums {
      font-variant-numeric: tabular-nums !important;
    }

    /* Eliminar contorno azul por defecto en navegadores */
    input:focus, textarea:focus, button:focus {
      outline: none;
    }
  `;
  document.head.appendChild(style);
}
