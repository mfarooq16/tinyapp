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
/*
GET / - if user is logged in: (Minor) redirect to /urls, if user is not logged in: (Minor) redirect to /login -> user stays on / with a "Hello" message
*/
app.get("/", (req, res) => {
  //res.send("Hello");
  if (!req.session.user_id) {
    res.redirect ("/login");
  } else {
    res.redirect ("/urls");
  }
});

// route handler for urls
/*
GET /urls - if user is not logged in: returns HTML with a relevant error message -> users who are not logged in are able to access this page
*/
app.get("/urls", (req, res) => {
/*
  let templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
*/  
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
  
    //filter the urls of the user
    let userUrlDB = {};
    for (let shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userID === req.session.user_id) {
        userUrlDB[shortURL]= urlDatabase[shortURL].longURL;
      }
    }

    let templateVars = { urls: userUrlDB, user: users[req.session.user_id] };

    res.render("urls_index", templateVars);  
  }
});

// route handler for new urls form
/*
GET /urls/new - if user is not logged in: returns HTML with a relevant error message -> users who are not logged in are able to access this page
*/
app.get("/urls/new", (req, res) => {

  if (!req.session.user_id) {
    res.redirect ("/login");
  } else {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  }

});

// an endpoint to handle a POST to /login in your Express server
/*
POST /login - if email and password params don't match an existing user: returns HTML with a relevant error message -> user is redirected to /register with the message "Bad request"
*/
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

// Create a POST /register endpoint
/*
POST /register - if email or password are empty: returns HTML with a relevant error message, if email already exists: returns HTML with a relevant error message -> same as above
*/
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

    //console.log(users);
    req.session.user_id = userID;
    res.redirect('/urls');
  }
});

/*
GET /login & GET /register - if user is logged in: (Minor) redirects to /urls -> user is able to access these pages while logged in with no redirect
*/
// Create a GET /login endpoint, which returns the login template
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };

  res.render("urls_login", templateVars);

});

// Create a GET /register endpoint, which returns the register template you just created
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };

  res.render("urls_register", templateVars);

});

// an endpoint to handle a POST to /logout in your Express server*
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect('/login');
});

//MISSING-GET /urls - after a user saves a new url and returns to this page, it is empty and doesn't show their new url


// Render information about a single URL
/*
GET /urls/:id - if a URL for the given ID does not exist: (Minor) returns HTML with a relevant error message -> user is shown the express error page with message TypeError: Cannot read property 'longURL' of undefined
*/
app.get("/urls/:shortURL", (req, res) => {

  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    id: urlDatabase[req.params.shortURL]['userID'],
    user: users[req.session.user_id]
  };
  
  res.render('urls_show', templateVars);

});

// route handler for Redirecting any request to "/u/:shortURL" to its longURL
/*
GET /urls/:id - if a URL for the given ID does not exist: (Minor) returns HTML with a relevant error message -> user is shown the express error page with message TypeError: Cannot read property 'longURL' of undefined
GET /u/:id - same as above
*/
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// route handler for generating a shortURL and adding that to the urlDatabase
/*
POST /urls - if user is not logged in: (Minor) returns HTML with a relevant error message -> user is given express error page with message "TypeError: Cannot read property 'id' of undefined"
*/
app.post("/urls", (req, res) => {

  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
  
    //save shortURL and longURL into urlDatabase
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: users[req.session.user_id]['id']
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

// route handler GET that removes a URL resource
app.get('/urls/:shortUrl/delete', (req, res) => {
  res.render('urls_index');
});

// route handler POST that removes a URL resource
/*
POST /urls/:id/delete - user is unable to delete urls because GET /urls is always empty and doesn't show their urls
*/
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

// Listening
app.listen(PORT, () => {
  console.log(`TinyAapp listening on port ${PORT}!`);
});