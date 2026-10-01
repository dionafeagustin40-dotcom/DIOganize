const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/api/service-application', (req, res) => {
    console.log('New Service Application:', req.body);
    res.status(201).json({ message: 'Service application received', data: req.body });
});

app.post('/api/login', (req, res) => {
    console.log('Login attempt:', req.body);
    res.status(200).json({ message: 'Login data received', data: req.body });
});

app.listen(8080, () => {
    console.log('DIOganize backend running at http://localhost:8080');
});
