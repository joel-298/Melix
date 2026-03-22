const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/songs', require('./routes/song.routes'));
app.use('/api/artists', require('./routes/artist.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/playlists', require('./routes/playlist.routes'));
app.use('/api/favourites', require('./routes/favourite.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/search', require('./routes/search.routes'));

app.get('/', (req, res) => res.json({ message: 'Melix API Running 🎵' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🎵 Melix Server running on port ${PORT}`));
