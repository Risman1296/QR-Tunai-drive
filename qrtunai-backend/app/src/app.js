

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const config = require('./config');


const app = express();
const path = require('path');
const uploadRouter = require('./routes/upload');

// Serve static files from /public
app.use(express.static(path.join(__dirname, '../public')));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: config.cspOrigin, credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(session({
  secret: config.jwtSecret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));
app.use(uploadRouter);




const publicRouter = require('./routes/public');
const adminRouter = require('./routes/admin');
const mainRouter = require('./routes');

app.use('/', mainRouter);
app.use(publicRouter);
app.use(adminRouter);


app.get('/api/ping', (req, res) => res.json({ status: 'ok' }));



// Error handler global
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});