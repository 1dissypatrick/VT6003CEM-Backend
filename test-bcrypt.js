import bcrypt from 'bcrypt';
const bcrypt = require('bcrypt');

const storedHash = '$2b$10$rre/qzqLd/lTNesgL4W9auHcgreSFRv70yavNVm1UItLu7B6E6LM.';
const password = 'password12345';

bcrypt.compare(password, storedHash, (err, isValid) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Password valid:', isValid);
  }
});