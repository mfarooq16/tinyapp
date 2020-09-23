const express = require('express'); // require express
const app = express(); // execute express
const PORT = 8080; //default port
const bodyParser = require('body-parser'); // require bodyparser
const bcrypt = require('bcrypt'); //require bcrypt
const saltRounds = 10;
const cookieSession = require('cookie-session');

app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
  })
);
app.use(bodyParser.urlencoded({extended: true})); // execute badyparser
app.set('view engine', 'ejs'); // set the template/view engine to ejs

const {
  generateRandomString,
  urlsForUser,
  checkEmail,
  checkPassword,
  checkUserID
} = require('./helpers');
const passowrd1 = bcrypt.hashSync("purple-monkey-dinosaur", 10);
const passowrd2 = bcrypt.hashSync('dishwasher-funk', 10);

const urlDatabase = {
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'aJ48lW' },
  i3BoGr: { longURL: 'https://www.google.ca', userID: 'aJ48lW' }
};

const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: passowrd1
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: passowrd2
  }
};

app.get('/', (req, res) => {
  if (!req.session.userID) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

// route handler for urls
app.get('/urls', (req, res) => {
  if (!req.session.userID) {
    res.redirect('/login');
  } else {
  
    //filter the urls of the user
    let userUrlDB = {};
    for (let shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userID === req.session.userID) {
        userUrlDB[shortURL] = urlDatabase[shortURL];
      }
    }
    let templateVars = { urls: userUrlDB, user: users[req.session.userID] };
    res.render('urls_index', templateVars);
  }
});

// route handler for new urls form
app.get('/urls/new', (req, res) => {

  if (!req.session.userID) {
    res.redirect('/login');
  } else {
    let templateVars = {
      user: users[req.session.userID]
    };
    res.render('urls_new', templateVars);
  }

});

// an endpoint to handle a POST to /login in your Express server
app.post('/login', (req, res) => {
  const userEmail = checkEmail(req.body.email, users);
  const userPassword = checkPassword(req.body.password, users);
  //console.log(userEmail)
  //console.log(users);
  if (!userEmail) {
    res.sendStatus(400);
  } else {
    if (userPassword) {
      req.session.userID = checkUserID(req.body.email, users);
      res.redirect('/urls');
    } else {
      res.redirect('/login');
    }
  }
});

// Create a POST /register endpoint
app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password || checkEmail(req.body.email, users)) {
    res.sendStatus(400);
  } else {
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password , saltRounds)
    };
    //console.log(users);
    req.session.userID = userID;
    res.redirect('/urls');
  }
});

// Create a GET /login endpoint, which returns the login template
app.get('/login', (req, res) => {
  let templateVars = {
    user: users[req.session.userID]
  };
  res.render('urls_login', templateVars);
});

// Create a GET /register endpoint, which returns the register template you just created
app.get('/register', (req, res) => {
  let templateVars = {
    user: users[req.session.userID]
  };
  res.render('urls_register', templateVars);
});

// an endpoint to handle a POST to /logout in your Express server*
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// Render information about a single URL
app.get('/urls/:shortURL', (req, res) => {

  if (!req.session.userID) {
    res.redirect('/login');
  } else {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      id: urlDatabase[req.params.shortURL].userID,
      user: users[req.session.userID]
    };

    res.render('urls_show', templateVars);
  }

});

// route handler for Redirecting any request to '/u/:shortURL' to its longURL
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// route handler for generating a shortURL and adding that to the urlDatabase
app.post('/urls', (req, res) => {

  if (!req.session.userID) {
    res.redirect('/login');
  } else {
  
    //save shortURL and longURL into urlDatabase
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: users[req.session.userID].id
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

// route handler GET that removes a URL resource
app.get('/urls/:shortUrl/delete', (req, res) => {
  //filter the urls of the user
  let userUrlDB = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === req.session.userID) {
      userUrlDB[shortURL] = urlDatabase[shortURL];
    }
  }

  if (userUrlDB[req.params.shortURL]) {
    res.render('urls_index');
  } else {
    res.send('<html><body><h2>Access forbidden</h2></body></html>');
  }
  
});

// route handler POST that removes a URL resource
app.post('/urls/:shortURL/delete', (req, res) => {

  if (req.session.userID) {
    //filter the urls of the user
    let userUrlDB = {};
    for (let shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userID === req.session.userID) {
        userUrlDB[shortURL] = urlDatabase[shortURL];
      }
    }
    userUrlDB[req.params.shortURL].longURL = req.body.longURL;
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.send('<html><body><h2>Access forbidden</h2></body></html>');
  }
});

// route handler POST that updates a URL resource
app.get('/urls/:shortURL/edit', (req, res) => {
  let shortURL = req.params.shortURL;
  //filter the urls of the user
  let userUrlDB = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === req.session.userID) {
      userUrlDB[shortURL] = urlDatabase[shortURL];
    }
  }

  if (userUrlDB[req.params.shortURL]) {
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.send('<html><body><h2>Access forbidden</h2></body></html>');
  }
});

app.post('/urls/:shortURL', (req, res) => {

  if (req.session.userID) {
    //filter the urls of the user
    let userUrlDB = {};
    for (let shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userID === req.session.userID) {
        userUrlDB[shortURL] = urlDatabase[shortURL];
      }
    }
    userUrlDB[req.params.shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.send('<html><body><h2>Access forbidden</h2></body></html>');
  }

});

// Listening
app.listen(PORT, () => {
  console.log(`TinyAapp listening on port ${PORT}!`);
});