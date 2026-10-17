import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { corsOptions } from './config/cors.js';
import logger from './config/logger.js';
import { csrfGuard } from './middleware/csrfGuard.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import adminRoutes from './routes/admin.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import authRoutes from './routes/auth.routes.js';
import availabilityRoutes from './routes/availability.routes.js';
import healthRoutes from './routes/health.routes.js';
import menuRoutes from './routes/menu.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import providerRoutes from './routes/provider.routes.js';
import serviceRoutes from './routes/service.routes.js';
import staffRoutes from './routes/staff.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors(corsOptions));
app.use(pinoHttp({ logger }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(compression());

app.use('/api/v1', csrfGuard);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/availability', availabilityRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/providers', providerRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/menus', menuRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;