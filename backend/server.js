const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // 'limit' kasi may attachments (base64 images) tayo

// Kapag nag-submit ng Schedule Service form
app.post('/api/service-application', (req, res) => {
    console.log('New Service Application:', req.body);
    res.status(201).json({ message: 'Service application received', data: req.body });
});

// Kapag nag-edit ng Service Application
app.put('/api/service-application/:id', (req, res) => {
    console.log(`Service Application ${req.params.id} updated:`, req.body);
    res.status(200).json({ message: 'Service application updated', data: req.body });
});

// Kapag nag-delete ng Service Application
app.delete('/api/service-application/:id', (req, res) => {
    console.log(`Service Application ${req.params.id} deleted.`);
    res.status(200).json({ message: 'Service application deleted' });
});

// Kapag nag-login gamit ng email/password
app.post('/api/login', (req, res) => {
    console.log('Login attempt:', req.body);
    res.status(200).json({ message: 'Login data received', data: req.body });
});

app.listen(8080, () => {
    console.log('DIOganize backend running at http://localhost:8080');
});
