const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();
server.express.use(cookieParser());

// Decode the JWT so we can get the user Id on each request.
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    req.userId = userId;
  }
  next();
});

// Populate the user on each request.
server.express.use(async (req, res, next) => {
  if (!req.userId) return next();

  const user = await db.query.user(
    { where: { id: req.userId }},
    `{ id, name, email, permissions }`
  );

  req.user = user;
  next();
});

server.start({
  cors: {
    credentials: true,
    origin: process.env.FRONTEND_URL,
  }
}, deets => {
  console.log(`Server is now running on port: http://localhost:${deets.port}`);
});