# expense-tracking-frontend

Frontend repository for expense tracking app. WIP.

## Recommended Browser Setup

- Firefox:
    - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
    - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)
- Chromium-based browsers:
    - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
    - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)

## Project Setup

```sh
npm install
```

### Environment Configuration

Create a `.env` file based on `.env.example`:

```sh
cp .env.example .env
```

Configure the backend API URL (default is `http://localhost:8000`):

```env
VITE_API_URL=http://localhost:8000
```

For production, update this to your backend server URL.

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check and Compile

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
npm run test:e2e:dev
```

This runs the end-to-end tests against the Vite development server.
It is much faster than the production build.

But it's still recommended to test the production build with `test:e2e` before deploying (e.g. in CI environments):

```sh
npm run build
npm run test:e2e
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
