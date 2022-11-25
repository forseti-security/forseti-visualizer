# Forseti Visualizer UI

Forseti Visualizer is the frontend aspect to visualize and communicate policy violation, via providing an interactive, visual user experience integrated with Forseti Security.

## Pre-Requisites

Forseti Visualizer is written in D3v5, Node.js v10.0.0+ and Vue.js 2.5+.  The application leverages babel for transpilation.  

## Getting Started

Navigate to the forseti-visualizer-ui/ directory, install packages and run the app.

```bash
cd forseti-visualizer-ui/
npm install
npm start # app served on :8081
```

## Connecting to Visualizer API

```bash
# If Mac OSX/Linux
npm run build
rm -rf ../forseti-api/dist-forseti-visualizer-ui && cp -R dist/ ../forseti-api/dist-forseti-visualizer-ui

# If Windows
npm run build-windows
rmdir -r ../forseti-api/dist-forseti-visualizer-ui && cp -R dist/ ../forseti-api/dist-forseti-visualizer-ui

```

## Testing

Tests written in jest.

```bash
# execute tests
npm run test
```
