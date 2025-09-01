const { sequelize } = require('./models');

(async () => {
  await sequelize.sync({ force: true });
  console.log('DB force sync complete.');
  process.exit(0);
})();
