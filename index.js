import fetch from "node-fetch";
import { renderToStringAsync } from "solid-js/web";
import App from "./src/App";
import manifest from "./dist/js/rmanifest.json";

globalThis.fetch = fetch;

// entry point for server render
export default req => {
  return renderToStringAsync(() => <App url={req.url} manifest={manifest[req.url]} />);
};
