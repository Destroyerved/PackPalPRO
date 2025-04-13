import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import eventsRouter from './routes/events';
import notificationRoutes from './routes/notifications';
import pollRoutes from './routes/polls';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add Prisma client to request
app.use((req, res, next) => {
  req.db = prisma;
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Routes
app.use('/api/events', eventsRouter);
app.use('/api/notifications', notificationRoutes);
app.use('/api/polls', pollRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

(async () => {
  const PORT = Number(process.env.PORT) || 3000;
  const server = await registerRoutes(app);

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  server.listen(PORT, () => {
    log(`Server is running on port ${PORT}`);
  });
})();
