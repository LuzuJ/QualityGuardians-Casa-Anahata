const bcrypt = jest.requireActual('bcrypt');

bcrypt.compare = jest.fn();
bcrypt.hash = jest.fn();

module.exports = bcrypt;