require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { initializeApp, cert, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const db = require('./db');

const PORT = process.env.PORT || 8080;
const app = express();

// Initialize Firebase Admin SDK
let firebaseReady = false;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    initializeApp({
      credential: cert(serviceAccount)
    });
    firebaseReady = true;
    console.log('[FIREBASE] Admin SDK initialized from FIREBASE_SERVICE_ACCOUNT_JSON');
  } else {
    const localKeyPath = path.join(__dirname, 'serviceAccountKey.json');
    if (fs.existsSync(localKeyPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
      initializeApp({
        credential: cert(serviceAccount)
      });
      firebaseReady = true;
      console.log('[FIREBASE] Admin SDK initialized from serviceAccountKey.json');
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      initializeApp({
        credential: applicationDefault()
      });
      firebaseReady = true;
      console.log('[FIREBASE] Admin SDK initialized from GOOGLE_APPLICATION_CREDENTIALS');
    } else {
      console.warn(
        '[FIREBASE] Warning: No Firebase Admin credentials found. Set FIREBASE_SERVICE_ACCOUNT_JSON or place backend/serviceAccountKey.json.'
      );
    }
  }
} catch (error) {
  console.error('[FIREBASE] Admin SDK initialization error:', error.message);
}

// Configure CORS
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    }
  })
);

app.use(express.json({ limit: '20mb' }));

// Request monitor
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Verify Firebase ID Token and resolve user role from Firestore
async function verifyFirebaseToken(req, res, next) {
  if (!firebaseReady) {
    return res.status(503).json({
      error: 'Authentication service is not configured on the server.'
    });
  }

  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({ error: 'Missing Firebase ID token.' });
  }

  try {
    const decoded = await getAuth().verifyIdToken(token);
    let role = 'User';

    try {
      const userDoc = await getFirestore().collection('users').doc(decoded.uid).get();
      if (userDoc.exists && userDoc.data()?.role === 'Admin') {
        role = 'Admin';
      }
    } catch (firestoreError) {
      console.error('[FIREBASE] Role lookup error:', firestoreError.message);
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email || '',
      role
    };

    return next();
  } catch (error) {
    console.error('[AUTH] Token verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid or expired Firebase ID token.' });
  }
}

function formatApplication(row) {
  let details = {};

  try {
    details = row.details ? JSON.parse(row.details) : {};
  } catch {
    details = {};
  }

  return {
    ...details,
    id: row.id,
    user_id: row.user_id,
    ownerId: row.user_id,
    service_type: row.service_type,
    service: row.service_type,
    applicant_name: row.applicant_name,
    applicant: row.applicant_name,
    contact_number: row.contact_number,
    contact: row.contact_number,
    email: row.email,
    application_date: row.application_date,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

// Health-check endpoints (for Render & monitoring)
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'DIOganize Backend is Running!' });
});

app.get('/api/health', async (req, res, next) => {
  try {
    await db.query('SELECT 1');
    res.json({
      status: 'ok',
      database: 'connected',
      firebaseAdmin: firebaseReady ? 'configured' : 'not-configured'
    });
  } catch (error) {
    next(error);
  }
});

// READ - GET ALL APPLICATIONS (Admin sees all; User sees own)
app.get('/api/service-applications', verifyFirebaseToken, async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'Admin';
    const [applications] = isAdmin
      ? await db.query('SELECT * FROM service_applications ORDER BY id DESC')
      : await db.query(
          'SELECT * FROM service_applications WHERE user_id = ? ORDER BY id DESC',
          [req.user.uid]
        );

    res.json(applications.map(formatApplication));
  } catch (error) {
    next(error);
  }
});

// READ - GET ONE APPLICATION
app.get('/api/service-applications/:id', verifyFirebaseToken, async (req, res, next) => {
  try {
    const [applications] = await db.query(
      'SELECT * FROM service_applications WHERE id = ?',
      [req.params.id]
    );

    if (applications.length === 0) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    const row = applications[0];
    if (req.user.role !== 'Admin' && row.user_id !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions.' });
    }

    res.json(formatApplication(row));
  } catch (error) {
    next(error);
  }
});

// CREATE - ADD APPLICATION
app.post('/api/service-applications', verifyFirebaseToken, async (req, res, next) => {
  try {
    const body = req.body;
    const userId = req.user.uid;
    const service = body.service_type || body.service;
    const applicant = body.applicant_name || body.applicant;
    const contact = body.contact_number || body.contact || null;
    const email = req.user.email || body.email || null;
    const date =
      body.application_date || body.date
        ? String(body.application_date || body.date).slice(0, 10)
        : null;

    if (!service || !applicant) {
      return res.status(400).json({
        error: 'Service type and applicant name are required.'
      });
    }

    const initialStatus = req.user.role === 'Admin' && body.status ? body.status : 'Pending';

    const [result] = await db.query(
      `INSERT INTO service_applications
      (user_id, service_type, applicant_name, contact_number,
       email, application_date, status, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        service,
        applicant,
        contact,
        email,
        date,
        initialStatus,
        JSON.stringify({ ...body, user_id: userId, ownerId: userId })
      ]
    );

    const [rows] = await db.query(
      'SELECT * FROM service_applications WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(formatApplication(rows[0]));
  } catch (error) {
    next(error);
  }
});

// UPDATE - EDIT APPLICATION
app.put('/api/service-applications/:id', verifyFirebaseToken, async (req, res, next) => {
  try {
    const [existingRows] = await db.query(
      'SELECT * FROM service_applications WHERE id = ?',
      [req.params.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    const existing = existingRows[0];
    const isAdmin = req.user.role === 'Admin';

    if (!isAdmin && existing.user_id !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: you can only edit your own applications.' });
    }

    const body = req.body;
    const service = body.service_type || body.service;
    const applicant = body.applicant_name || body.applicant;

    if (!service || !applicant) {
      return res.status(400).json({
        error: 'Service type and applicant name are required.'
      });
    }

    const nextStatus = body.status || existing.status || 'Pending';
    if (!isAdmin && nextStatus !== existing.status) {
      return res.status(403).json({
        error: 'Forbidden: only administrators can change application status.'
      });
    }

    const date =
      body.application_date || body.date
        ? String(body.application_date || body.date).slice(0, 10)
        : null;

    await db.query(
      `UPDATE service_applications
      SET service_type = ?,
          applicant_name = ?,
          contact_number = ?,
          email = ?,
          application_date = ?,
          status = ?,
          details = ?
      WHERE id = ?`,
      [
        service,
        applicant,
        body.contact_number || body.contact || null,
        body.email || existing.email || null,
        date,
        nextStatus,
        JSON.stringify(body),
        req.params.id
      ]
    );

    res.json({ message: 'Application Updated Successfully!' });
  } catch (error) {
    next(error);
  }
});

// DELETE - REMOVE APPLICATION
app.delete('/api/service-applications/:id', verifyFirebaseToken, async (req, res, next) => {
  try {
    const [existingRows] = await db.query(
      'SELECT id, user_id FROM service_applications WHERE id = ?',
      [req.params.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    if (req.user.role !== 'Admin' && existingRows[0].user_id !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: you can only delete your own applications.' });
    }

    await db.query('DELETE FROM service_applications WHERE id = ?', [req.params.id]);

    res.json({ message: 'Application Deleted Successfully!' });
  } catch (error) {
    next(error);
  }
});

// 404 handler for unknown API routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Global Express error handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.message);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: err.message });
  }
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error.'
  });
});

app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});
