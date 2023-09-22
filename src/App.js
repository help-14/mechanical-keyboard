import { HydrationScript } from "solid-js/web";
import { Link, Router, useIsRouting, useLocation, useRoutes } from "solid-app-router";
import routes from "./routes";

const App = ({ manifest = [] }) => {
  const location = useLocation();
  const isRouting = useIsRouting();
  const Routes = useRoutes(routes);
  return (
    <html lang="en">
      <head>
        <title>🔥 Solid SSR 🔥</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/styles.css" />
        {manifest.map(m => <link rel="modulepreload" href={m.href} />).reverse()}
        <HydrationScript />
      </head>
      <body>
        <div id="app">
          <ul class="inline">
            <li classList={{ selected: location.pathname === "/" }}>
              <Link class="link" href="/">Home</Link>
            </li>
            <li classList={{ selected: location.pathname === "/profile" }}>
              <Link class="link" href="/profile">Profile</Link>
            </li>
            <li classList={{ selected: location.pathname === "/settings" }}>
              <Link class="link" href="/settings">Settings</Link>
            </li>
          </ul>
          <div class="tab" classList={{ pending: isRouting() }}>
            <Suspense
              fallback={
                <span class="loader" style={"opacity: 0"}>
                  Loading...
                </span>
              }
            >
              <Routes />
            </Suspense>
          </div>
        </div>
        <script type="module" src="/js/index.js" async></script>
      </body>
    </html>
  );
};

export default props => (
  <Router url={props.url}>
    <App url={props.url} manifest={props.manifest} />
  </Router>
);
