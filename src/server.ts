// TanStack Start server entry; Vite config resolves this file as "server".
// Delegates to the framework's built-in handler for SSR and server functions.
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

export default createServerEntry({
  fetch(request, opts) {
    return handler.fetch(request, opts);
  },
});
