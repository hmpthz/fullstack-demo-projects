import { createNextApiHandler } from "@trpc/server/adapters/next";

import { env } from "@/env";
import { appRouter } from "@/server/routers";
import { createTRPCContext } from "@/server/trpc";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
          );
        }
      : undefined,
});
