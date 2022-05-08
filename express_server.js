const express = require("express");
const bcrypt = require('bcryptjs');
const getUserByEmail = require('./helpers');
const app = express();
const PORT = 8080; 


app.set("view engine", "ejs");
const generateRandomString=() => {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

const urlDatabase = {
  b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
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

const bodyParser = require("body-parser");

const cookieSession = require('cookie-session');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))



//Localhost:8080/
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

//Main Page, user login
app.get("/urls", (req, res) => {
  const loggedInUserCookie = req.session.user_id
  if (!loggedInUserCookie) {
    return res.redirect('/login');
  }

  const dataKeys = Object.keys(urlDatabase);
  const urlsData = dataKeys.map((key) => {
    return {
      shortURL: key,
      longURL: urlDatabase[key].longURL,
      userID: urlDatabase[key].userID,
    }
  })

  const specificUserData = urlsData.filter((data) => {
    return data.userID === loggedInUserCookie;
  })

  const templateVars = {
    urlsData: specificUserData,
    email: users[loggedInUserCookie]?.email,
  };
  res.render("urls_index", templateVars);
});

//Create a new url
app.get("/urls/new", (req, res) => {
 const loggedInUserCookie = req.session.user_id
  if (!loggedInUserCookie) {
    return res.redirect('/login');
  }
  const templateVars = {
    email: users[loggedInUserCookie]?.email,
  };
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  
 
  const loggedInUserCookie = req.session.user_id;

  const templateVars = {
    longURL,
    shortURL,
    email: users[loggedInUserCookie]?.email,
  };
  res.render("urls_show", templateVars);
 
});

//tap the shortURL and bring to the long url page
app.get("/u/:shortURL", (req, res) => {
  
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]?.longURL;
  if (!longURL) {
    res.status(404);
    res.send('404 not found');
    return;
  }
  res.redirect(longURL);
});


// user register an account
app.get("/register", (req, res) => {
  const loggedInUserCookie = req.session.user_id;
  if (loggedInUserCookie) {
    return res.redirect('/urls');
  }

  const templateVars = {
    email: users[loggedInUserCookie]?.email,
  };
  res.render("register", templateVars);
});

//User LOGIN page
app.get("/login", (req, res) => {
 const loggedInUserCookie = req.session.user_id;

  const templateVars = {
 
    email: users[loggedInUserCookie]?.email,
  };
  if (loggedInUserCookie) {
    return res.redirect('/urls')
  }
  res.render("login", templateVars);
});

//register a new user
app.post("/register", (req, res) => {
  if (req.body.email) {
    const databaseUser = getUserByEmail(req.body.email, users);
    
    if (databaseUser) {
      res.status(400);
      res.send('User already exists')
      return;
    }
  }
  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('status: ' + res.statusCode);
    return;
  } else {
    const newUserID = generateRandomString();
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  users[newUserID] = {
    id: newUserID,
    email: req.body.email,
    password: hashedPassword
  }
    req.session.user_id = newUserID;

  res.redirect('/urls');
  }
})


//add a new url
app.post("/urls", (req, res) => {
   const loggedInUserCookie = req.session.user_id;
  if (!loggedInUserCookie) {
    res.status(500);

  }
  const key = generateRandomString();
  urlDatabase[key] = {
    longURL: req.body.longURL,
    userID: loggedInUserCookie
  }
   res.redirect(`urls/${key}`);        
});

//Delete a url
app.post("/urls/:shortURL/delete", (req, res) => {
  const loggedInUserCookie = req.session.user_id;

  const shortURL = req.params.shortURL;
 if (!urlDatabase[shortURL]) {
    res.status(404);
    return res.send('404 not found')
  }
  if (loggedInUserCookie !== urlDatabase[shortURL].userID) {
    res.status(401)
    return res.send('401 unauthorized')
  }
  delete urlDatabase[shortURL];
   res.redirect('/urls');
})

//edit a url
app.post("/urls/:shortURL/edit", (req, res) => {
  const loggedInUserCookie = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.status(404);
    return res.send('404 not found')
  }
  if (loggedInUserCookie !== urlDatabase[shortURL].userID) {
    res.status(401)
    return res.send('401 unauthorized')
  }
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
   res.redirect('/urls');
})

//login to a account
app.post("/login", (req, res) => {
  let matchedUser = null;
  const desiredEmail = req.body.email;

  const databaseUser = getUserByEmail(desiredEmail, users);

  if (databaseUser) {
    if (bcrypt.compareSync(req.body.password, databaseUser.password)) {
        matchedUser = databaseUser;
    }
  }


  if (matchedUser !== null) {
    req.session.user_id = matchedUser.id;
    res.redirect('/urls');  
  } else {
    res.status(403);
    res.send('wrong email or wrong password');
  }
})

//logout the account
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls')
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

