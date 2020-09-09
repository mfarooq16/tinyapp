const express = require("express"); // require express
const app = express(); // execute express
const PORT = 8080; //default port
const bodyParser = require("body-parser"); // require bodyparser
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

app.set("view engine", "ejs"); // set the template/view engine to ejs

const {
  generateRandomString,
  urlsForUser,
  checkEmail,
  checkPassword,
  checkUserID
} = require('./helpers');


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


// use res.render to load up an ejs view file
app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// route handler for urls
app.get("/urls", (req, res) => {

  let templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id]
  };
  
  res.render("urls_index", templateVars);
});

// route handler for new urls form
app.get("/urls/new", (req, res) => {

  let templateVars = {
    user: users[req.session.user_id]
  };
    
  res.render("urls_new", templateVars);

});

// route handler for generating a shortURL and adding that to the urlDatabase*
app.post("/urls", (req, res) => {

  let shortURL = generateRandomString();

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: users[req.session.user_id]['id']
  };
  // the POST request body added to the urlDatabase
  //res.redirect(`/urls/:${shortURL}`); // Redirects to where the short url is generated

  res.redirect(`/urls/${shortURL}`);

});

// route handler for Redirecting any request to "/u/:shortURL" to its longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Render information about a single URL
app.get("/urls/:shortURL", (req, res) => {

  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    id: urlDatabase[req.params.shortURL]['userID'],
    user: users[req.session.user_id]
  };
  
  res.render('urls_show', templateVars);

});

// route handler GET that removes a URL resource
app.get('/urls/:shortUrl/delete', (req, res) => {
  res.render('urls_index');
});

// route handler POST that removes a URL resource*
app.post('/urls/:shortURL/delete', (req, res) => {

  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {

    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");

  } else {

    res.redirect('/login');

  }
  
});

// route handler POST that updates a URL resource
app.get('/urls/:shortURL/edit', (req, res) => {
  const userID = req.session.user_id;

  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[userID]
  };

  res.redirect('/urls', templateVars);
});

app.post('/urls/:shortURL/edit', (req, res) => {
  const userID = req.session.user_id;

  if (urlDatabase[req.params.shortURL].userID === userID) {

    urlDatabase[req.params.shortURL] = {longURL, userID };
    res.redirect('/urls');

  } else {

    res.send('<html><body><h2>Access forbidden </h2></body></html>');

  }

});

// Create a GET /register endpoint, which returns the register template you just created
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };

  res.render("urls_register", templateVars);

});

// Create a POST /register endpoint
app.post('/register', (req, res) => {

  if (req.body.email === '' || req.body.password === '' || checkEmail(req.body.email)) {

    res.sendStatus(400);

  } else {

    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password , saltRounds)
    };

    console.log(users);
    req.session.user_id = userID;
    res.redirect('/urls');
  }
});

// an endpoint to handle a POST to /login in your Express server
app.post('/login', (req, res) => {
  const userEmail = checkEmail(req.body.email);
  const userPassword = checkPassword(req.body.passowrd);

  if (!userEmail) {
    res.sendStatus(400);
  } else if (userEmail) {
    if (userPassword) {
      req.session.user_id = checkUserID(req.body.email);
      res.redirect('/urls');
    } else {
      res.redirect('/login');
    }
  }
});

// Create a GET /login endpoint, which returns the login template
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };

  res.render("urls_login", templateVars);

});

// an endpoint to handle a POST to /logout in your Express server*
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`TinyAapp listening on port ${PORT}!`);
});