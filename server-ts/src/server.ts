import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

import { initDb } from './db/database';
import { RealtimeWebSocketService } from './services/webSocketServer';
import { AuthController } from './controllers/authController';
import { EventController } from './controllers/eventController';
import { AnalyticsController } from './controllers/analyticsController';
import { SourceController } from './controllers/sourceController';
import { CitizenController } from './controllers/citizenController';
import { AdminController } from './controllers/adminController';
import { authenticateToken, requireRole } from './middleware/auth';
import { seedDatabase } from './scripts/seed';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Setup upload directory
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `upload_${Date.now()}_${Math.random().toString(36).substring(2, 6)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// --- ROUTES ---

// Auth
app.post('/api/auth/login', AuthController.login);
app.get('/api/auth/me', authenticateToken, AuthController.me);

// Events
app.get('/api/events', EventController.getEvents);
app.get('/api/events/map', EventController.getMapEvents);
app.get('/api/events/stats', EventController.getStats);
app.get('/api/events/:id', EventController.getEventById);
app.patch('/api/events/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN', 'VERIFIER']), EventController.updateEvent);

// Analytics
app.get('/api/analytics/timeline', AnalyticsController.getTimeline);
app.get('/api/analytics/geographic', AnalyticsController.getGeographic);
app.get('/api/analytics/events', AnalyticsController.getEventsDistribution);
app.get('/api/analytics/verification', AnalyticsController.getVerification);
app.get('/api/analytics/sources', AnalyticsController.getSourceAnalytics);

// Sources
app.get('/api/sources', SourceController.getSources);
app.post('/api/sources', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), SourceController.addSource);
app.patch('/api/sources/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), SourceController.toggleSource);
app.post('/api/sources/poll', SourceController.triggerPoll);

// Citizen Reports
app.post('/api/citizen/reports', upload.single('media'), CitizenController.submitReport);

// Admin
app.get('/api/admin/hashtags', AdminController.getHashtags);
app.post('/api/admin/hashtags', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), AdminController.addHashtag);
app.delete('/api/admin/hashtags/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), AdminController.deleteHashtag);

app.get('/api/admin/users', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), AdminController.getUsers);
app.post('/api/admin/users', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), AdminController.createUser);
app.patch('/api/admin/users/:id/role', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), AdminController.updateUserRole);

app.get('/api/admin/audit-logs', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN', 'ANALYST']), AdminController.getAuditLogs);
app.get('/api/admin/ml-stats', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN', 'ANALYST']), AdminController.getMlStats);
app.get('/api/admin/health', AdminController.getSystemHealth);

// Start Server
async function start() {
  await initDb();
  await seedDatabase();
  RealtimeWebSocketService.init(server);

  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`WeatherVani India Server running at http://localhost:${PORT}`);
    console.log(`WebSocket Server listening on ws://localhost:${PORT}/ws/events`);
    console.log(`=======================================================`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});
