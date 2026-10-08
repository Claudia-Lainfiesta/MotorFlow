import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth.routes.js';
import { catalogRoutes } from './routes/catalog.routes.js';
import { commerceRoutes } from './routes/commerce.routes.js';
import { adminRoutes } from './routes/admin.routes.js';

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:4200' }));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));
app.get('/health', (_q, r) => r.json({ status: 0, message: 'MotorFlow API activa' }));
app.use('/api/auth', authRoutes);
app.use('/api', catalogRoutes);
app.use('/api', commerceRoutes);
app.use('/api/admin', adminRoutes);

const frontendDist = path.join(process.cwd(), process.env.FRONTEND_DIST || '../FrontEnd/dist/motorflow/browser');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use((_q, r) => r.status(404).json({ status: 1, message: 'Ruta no encontrada' }));
app.listen(Number(process.env.PORT || 4000), () => console.log(`MotorFlow API en http://localhost:${process.env.PORT || 4000}`));
