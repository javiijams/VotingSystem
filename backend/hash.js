const bcrypt = require('bcryptjs');

const password = 'SecurePass2025!'; // change this to your desired admin password

bcrypt.hash(password, 10).then(hash => {
  console.log('Hashed password:', hash);
});
