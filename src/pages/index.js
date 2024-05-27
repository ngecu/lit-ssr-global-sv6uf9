import { render } from '@lit-labs/ssr';
import { html } from 'lit';
import '../components/simple-greeter.js';

export function* renderIndex({ name }) {
  yield `
    <!doctype html>
    <html>
      <head>
        <title>Lit SSR Test Page</title>
      </head>
      <style>
        body[dsd-pending] {
          display: none;
        }
      </style>
      <body dsd-pending>
        <script>
          if (HTMLTemplateElement.prototype.hasOwnProperty('shadowRoot')) {
            // This browser has native declarative shadow DOM support, so we can
            // allow painting immediately.
            document.body.removeAttribute('dsd-pending');
          }
        </script>
  `;
  yield* render(html`<simple-greeter name=${name}></simple-greeter>`);
  yield `
      <script type="module">
        // Start fetching the Lit hydration support module (note the absence
        // of "await" -- we don't want to block yet).
        const litHydrateSupportInstalled = import(
          '/node_modules/@lit-labs/ssr-client/lit-element-hydrate-support.js'
        );

        if (!HTMLTemplateElement.prototype.hasOwnProperty('shadowRoot')) {
          // Fetch the declarative shadow DOM polyfill.
          const {hydrateShadowRoots} = await import(
            './node_modules/@webcomponents/template-shadowroot/template-shadowroot.js'
          );

          // Apply the polyfill. This is a one-shot operation, so it is important
          // it happens after all HTML has been parsed.
          hydrateShadowRoots(document.body);

          // At this point, browsers without native declarative shadow DOM
          // support can paint the initial state of your components!
          document.body.removeAttribute('dsd-pending');
        }
        await litHydrateSupportInstalled;

        // Import component modules causing them to become interactive
        import('./src/components/simple-greeter.js');
      </script>
    </body>
    </html>
  `;
}
