// Returns the user if found, if not found, return null
const getUserByEmail = (email, database) => {
  let user = null;
  Object.keys(database).forEach((key) => {
    const databaseUser = database[key];
    if (email === databaseUser.email) {
      user = databaseUser;
    }
  })
  return user;
}

module.exports = getUserByEmail;