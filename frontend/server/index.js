const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // L'URL de votre frontend Next.js
  credentials: true
}));

// ... rest of the existing code ... 