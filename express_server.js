const express = require("express"); // require express
const app = express(); // execute express
const PORT = 8080;
const bodyParser = require("body-parser"); // require bodyparser
const cookieParser = require('cookie-parser'); //require cookieparser
app.use(bodyParser.urlencoded({extended: true})); // execute badyparser
app.use(cookieParser()); // execute cookie parser
app.set("view engine", "ejs"); // set the template/view engine to ejs

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

const checkEmail = function(email) {
  for (const id in users) {
    console.log(users[id].email, email);
    if (users[id].email === email) {
      return id;
    }
  }
};

const checkPassword = function(passowrd) {
  for (const id in users) {
    if (users[id].password === passowrd)
      return true;
  }
  return false;
};

const generateRandomString = function()  {
  let r = Math.random().toString(36).substring(7);
  return r;
};

// use res.render to load up an ejs view file
app.get("/", (req, res) => {
  res.send("Hello");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//route handler for urls
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["userID"]]
  };
  res.render("urls_index", templateVars);
});

//route handler for new urls form
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["userID"]]
  };
  res.render("urls_new", templateVars);
});

// Render information about a single URL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["userID"]]
  };
  res.render("urls_show", templateVars);
});

//route handler for generating a shortURL and adding that to the urlDatabase
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;// the POST request body added to the urlDatabase
  res.redirect(`/urls/:${shortURL}`); // Redirects to where the short url is generated
});

// route handler for Redirecting any request to "/u/:shortURL" to its longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Create a GET /register endpoint, which returns the register template you just created.
app.get("/register", (req, res) => {
  let templateVars = {user: users[req.cookies["userID"]]};
  res.render("urls_register", templateVars);
});

//Create a POST /register endpoint
/*app.post('/register', (req, res) => {
  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie('userID', userID);
  res.redirect("/urls");
});
*/

app.post('/register', (req, res) => {
  if (req.body.email) {
    if (!(checkEmail(req.body.email))) {
      const userID = generateRandomString();
      users[userID] = {
        id: userID,
        email: req.body.email,
        password: req.body.password
      };
      console.log(users);
      res.cookie('userID', userID);
      res.redirect('/urls');
    } else {
      res.sendStatus(400);
    }

  } else {
    res.sendStatus(400);
  }

});

//route handler POST that removes a URL resource
app.get('/urls/:shortUrl/delete', (req, res) => {
  res.render('urls_index');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//route handler POST that updates a URL resource
app.get('/urls/:shortURL/edit', (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["userID"]]
  };
  let shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`, templateVars);
});

app.post('/urls/:shortURL/edit', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.editedLongURL;
  res.redirect('/urls');
});

//Create a GET /login endpoint, which returns the login template
app.get("/login", (req, res) => {
  let templateVars = {user: users[req.cookies["userID"]]};
  res.render('urls_login', templateVars);
});

//an endpoint to handle a POST to /login in your Express server
app.post('/login', (req, res) => {
  if (req.body.email) {
    if (!(checkEmail(req.body.email))) {
      res.sendStatus(400);
    } else if (!(checkPassword(req.body.password))) {
      res.sendStatus(400);
    } else {
      res.redirect('/urls');
    }
  }
});

//an endpoint to handle a POST to /logout in your Express server
app.post("/logout", (req, res) => {
  res.clearCookie('userID');
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});