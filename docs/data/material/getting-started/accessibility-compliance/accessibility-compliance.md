# Accessibility Compliance

<p class="description">Automated accessibility test coverage for Material UI components using axe-core.</p>

Material UI uses [axe-core](https://github.com/dequelabs/axe-core) for automated accessibility testing:

- **JSDOM tests** check structural accessibility rules (ARIA attributes, roles, labels).
- **Browser tests** check visual rules (color contrast, link-in-text-block) in real Chrome.

{{"component": "modules/components/MaterialAccessibilityCompliance.js"}}
