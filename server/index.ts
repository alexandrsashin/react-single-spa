import Fastify from "fastify";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import fastifyStatic from "@fastify/static";
import cors from "@fastify/cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// repo root is one level up from server folder
const repoRoot = path.resolve(__dirname, "..");
const packagesDir = path.join(repoRoot, "packages");

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

function registerPackageStatic(app: ReturnType<typeof Fastify>, name: string, distPath: string) {
  const prefix = `/${name}/`;
  // Register static files under /<packageName>/
  app.register(fastifyStatic, {
    root: distPath,
    prefix,
    decorateReply: false,
  });

  // Serve index.html for the base path without trailing slash
  interface IndexRouteHandler {
    (
      request: import("fastify").FastifyRequest,
      reply: import("fastify").FastifyReply
    ): Promise<import("fastify").FastifyReply>;
  }

  const indexRouteHandler: IndexRouteHandler = async (_request, reply) => {
    const indexPath = path.join(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      reply.type("text/html");
      return reply.send(fs.createReadStream(indexPath));
    }
    return reply.code(404).send("Not found");
  };

  app.get(`/${name}`, indexRouteHandler);
}

// Serve root-config dist at `/` if present (BEFORE registering other packages)
const rootConfigDist = path.join(packagesDir, "root-config", "dist");
if (fs.existsSync(rootConfigDist)) {
  app.register(fastifyStatic, {
    root: rootConfigDist,
    prefix: "/",
    decorateReply: false,
  });
  app.log.info(`Serving root-config dist from %s at path /`, rootConfigDist);
} else {
  app.log.info("No root-config dist found at %s", rootConfigDist);
}

if (fs.existsSync(packagesDir)) {
  const entries = fs.readdirSync(packagesDir, { withFileTypes: true });
  const packageEntries = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  for (const name of packageEntries) {
    const distPath = path.join(packagesDir, name, "dist");
    if (fs.existsSync(distPath)) {
      registerPackageStatic(app, name, distPath);
      app.log.info(`Serving package %s from %s at path /%s/`, name, distPath, name);
    } else {
      app.log.info(`Skipping package %s (no dist found at %s)`, name, distPath);
    }
  }
} else {
  app.log.warn("No packages directory found at %s", packagesDir);
}

// SPA fallback: serve index.html for unknown routes (AFTER all static files)
if (fs.existsSync(rootConfigDist)) {
  app.setNotFoundHandler((request, reply) => {
    const indexPath = path.join(rootConfigDist, "index.html");
    if (fs.existsSync(indexPath)) {
      reply.type("text/html");
      return reply.send(fs.createReadStream(indexPath));
    }
    return reply.code(404).send("Not found");
  });
}

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
try {
  await app.listen({ port, host: "0.0.0.0" });
  app.log.info("Server listening on http://0.0.0.0:%d", port);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
