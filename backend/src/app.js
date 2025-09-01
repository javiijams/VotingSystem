const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const { sequelize, User } = require('./models'); // ✅ Import User model
const authRoutes = require('./routes/auth');
const electionRoutes = require('./routes/election');
const adminRoutes = require('./routes/admin');
const candidateRoutes = require('./routes/candidates');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Test route for root URL
app.get('/', (req, res) => {
  res.send('Backend is running successfully!');
});

// ✅ Debug route to list all users
app.get('/debug-users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.use('/auth', authRoutes);
app.use('/elections', electionRoutes);
app.use('/admin', adminRoutes);
app.use('/candidates', candidateRoutes);

// Change default port to 5004
const PORT = process.env.PORT || 5004;

async function start() {
  await sequelize.authenticate();
  console.log('DB connected.');
  // sync (for dev); in prod use migrations
  await sequelize.sync();
  console.log('Models synced.');
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
}

start();


