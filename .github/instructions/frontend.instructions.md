---
applyTo: "frontend/src/**/*.{js,jsx,ts,tsx}"
---

# Frontend guidance

- The frontend is a Vite/React app with route-based pages under frontend/src/pages and shared UI under frontend/src/components.
- Reuse the existing API client in frontend/src/services/api.js and the theme tokens in frontend/src/theme.js instead of inventing new request or styling patterns.
- Follow the current structure of the app: route guards in frontend/src/App.jsx, page components in pages/, and shared UI in components/.
- Keep UI changes consistent with the existing inline-style approach and the CSS variables in frontend/src/index.css.
- Preserve current auth and navigation flow, including token handling, redirects, and the existing role-based guards.
