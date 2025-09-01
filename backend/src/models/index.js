const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', '..', 'data.sqlite'),
  logging: false
});

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('student','admin','commissioner'), defaultValue: 'student' },
  totpSecretEnc: { type: DataTypes.TEXT }, // encrypted TOTP secret
  status: { type: DataTypes.ENUM('pending','active'), defaultValue: 'pending' }
});

const Election = sequelize.define('Election', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  startsAt: { type: DataTypes.DATE },
  endsAt: { type: DataTypes.DATE },
  status: { type: DataTypes.ENUM('draft','open','closed','tallied'), defaultValue: 'draft' },
  dataKeyWrapped: { type: DataTypes.TEXT } // base64 wrapped (encrypted) data key
});

const Candidate = sequelize.define('Candidate', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  electionId: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  position: { type: DataTypes.STRING }
});

const Ballot = sequelize.define('Ballot', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  electionId: { type: DataTypes.UUID, allowNull: false },
  voterHash: { type: DataTypes.STRING, allowNull: false },
  ciphertext: { type: DataTypes.TEXT, allowNull: false },
  iv: { type: DataTypes.STRING, allowNull: false },
  tag: { type: DataTypes.STRING, allowNull: false },
  aad: { type: DataTypes.TEXT }
});

// Associations (simple)
Election.hasMany(Candidate, { foreignKey: 'electionId' });
Candidate.belongsTo(Election, { foreignKey: 'electionId' });

module.exports = { sequelize, User, Election, Candidate, Ballot, DataTypes };
