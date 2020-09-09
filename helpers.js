const bcrypt = require('bcrypt');

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

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

const checkUserID = function(email, users) {
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