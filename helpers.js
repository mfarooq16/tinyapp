const bcrypt = require('bcrypt');

const generateRandomString = function()  {
  let r = Math.random().toString(36).substring(7);
  return r;
};

const urlsForUser = function(id) {
  let urls = {};
  for (let shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL].userID) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }
  return urls;
};

const checkEmail = function(email) {
  let userExists = false;
  for (let user in users) {
    let userInfo = users[user];
    if (userInfo['email'] === email) {
      userExists = true;
    }
  }
  return userExists;
};

const checkPassword = function(passowrd) {
  let match = false;
  for (let user in users) {
    let userInfo = users[user];
    if (bcrypt.compareSync(password, userInfo['password'])) {
      match = true;
    }
  }
  return match;
};

const checkUserID = function(email) {
  let userID = "";
  for (let user in users) {
    let userInfo = users[user];
    if (userInfo['email'] === email) {
      userID = userInfo['id'];
    }
  }
  return userID;
};

module.exports = {
  generateRandomString,
  urlsForUser,
  checkEmail,
  checkPassword,
  checkUserID
};