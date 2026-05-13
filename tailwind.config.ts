import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      "colors": {
        "on-tertiary-container": "var(--on-tertiary-container)",
        "on-error": "var(--on-error)",
        "secondary-fixed-dim": "var(--secondary-fixed-dim)",
        "primary": "var(--primary)",
        "inverse-primary": "var(--inverse-primary)",
        "tertiary": "var(--tertiary)",
        "on-tertiary": "var(--on-tertiary)",
        "on-secondary-container": "var(--on-secondary-container)",
        "on-surface-variant": "var(--on-surface-variant)",
        "primary-container": "var(--primary-container)",
        "error": "var(--error)",
        "tertiary-fixed": "var(--tertiary-fixed)",
        "tertiary-fixed-dim": "var(--tertiary-fixed-dim)",
        "tertiary-container": "var(--tertiary-container)",
        "surface-container-highest": "var(--surface-container-highest)",
        "background": "var(--background)",
        "on-secondary-fixed": "var(--on-secondary-fixed)",
        "on-secondary": "var(--on-secondary)",
        "on-surface": "var(--on-surface)",
        "inverse-surface": "var(--inverse-surface)",
        "on-background": "var(--on-background)",
        "outline-variant": "var(--outline-variant)",
        "surface-container-low": "var(--surface-container-low)",
        "surface-dim": "var(--surface-dim)",
        "surface-container-high": "var(--surface-container-high)",
        "on-secondary-fixed-variant": "var(--on-secondary-fixed-variant)",
        "surface-container-lowest": "var(--surface-container-lowest)",
        "inverse-on-surface": "var(--inverse-on-surface)",
        "on-primary-fixed-variant": "var(--on-primary-fixed-variant)",
        "primary-fixed": "var(--primary-fixed)",
        "surface-container": "var(--surface-container)",
        "on-tertiary-fixed": "var(--on-tertiary-fixed)",
        "secondary-container": "var(--secondary-container)",
        "on-primary-container": "var(--on-primary-container)",
        "secondary-fixed": "var(--secondary-fixed)",
        "outline": "var(--outline)",
        "surface": "var(--surface)",
        "on-primary": "var(--on-primary)",
        "on-error-container": "var(--on-error-container)",
        "on-primary-fixed": "var(--on-primary-fixed)",
        "on-tertiary-fixed-variant": "var(--on-tertiary-fixed-variant)",
        "surface-tint": "var(--surface-tint)",
        "surface-variant": "var(--surface-variant)",
        "secondary": "var(--secondary)",
        "surface-bright": "var(--surface-bright)",
        "error-container": "var(--error-container)",
        "primary-fixed-dim": "var(--primary-fixed-dim)"
      },
      "borderRadius": {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      "spacing": {
        "stack-space": "8px",
        "card-padding": "16px",
        "element-gap": "12px",
        "unit": "4px",
        "container-padding": "16px"
      },
      "fontFamily": {
        "body-sm": ["Inter", "sans-serif"],
        "label-caps": ["JetBrains Mono", "monospace"],
        "code-sm": ["JetBrains Mono", "monospace"],
        "body-md": ["Inter", "sans-serif"],
        "display-sm": ["Geist", "sans-serif"],
        "headline-main": ["Geist", "sans-serif"],
        sans: ["Inter", "Geist", "sans-serif"],
      },
      "fontSize": {
        "body-sm": ["12px", {"lineHeight": "16px", "fontWeight": "400"}],
        "label-caps": ["10px", {"lineHeight": "12px", "letterSpacing": "0.05em", "fontWeight": "700"}],
        "code-sm": ["12px", {"lineHeight": "18px", "fontWeight": "450"}],
        "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
        "display-sm": ["24px", {"lineHeight": "32px", "letterSpacing": "-0.02em", "fontWeight": "600"}],
        "headline-main": ["18px", {"lineHeight": "24px", "fontWeight": "500"}]
      }
    },
  },
  plugins: [],
};

export default config;
