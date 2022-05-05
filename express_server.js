const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

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

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


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
  const username = req.cookies.username;
  const templateVars = { urls: urlDatabase, username: username || null };
  res.render("urls_index", templateVars);
});

//Create a new url
app.get("/urls/new", (req, res) => {
  const username = req.cookies.username;
  const templateVars = {username};
  res.render("urls_new",templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const username = req.cookies.username;

  const templateVars = { shortURL,longURL, username};
  res.render("urls_show", templateVars);
 
});

//tap the shortURL and bring to the long url page
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// user register an account
app.get("/register", (req, res) => {
  const username = req.cookies.username;
  const templateVars = {username};
  console.log('aaaaaaaa');
  res.render("register",templateVars);
});

//register a new user
app.post("/register", (req, res) => {
  if (req.body.email) {
    let alreadyExists = false;
    Object.keys(users).forEach((key) => {
      const currentUser = users[key]
      const currentUserEmail = currentUser.email;
      if (req.body.email === currentUserEmail) {
        alreadyExists = true;
      }
    })
    if (alreadyExists) {
      res.status(400);
      res.send('User already exists')
      return;
    }
  }
  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('status: ' + res.statusCode);
  } else {
    const newUser = generateRandomString();
  users[newUser] = {
    id: newUser,
    email: req.body.email,
    password:req.body.password
  }
  const username = newUser;
  res.cookie('user_id', username);
  res.redirect('/urls');
  }
})



//add a new url
app.post("/urls", (req, res) => {
  const key = generateRandomString();
  urlDatabase[key] = req.body.longURL;
   res.redirect(`urls/${key}`);        
});

//Delete a url
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
   res.redirect('/urls');
})

//edit a url
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  
  const longURL = req.body.longURL;
  console.log(shortURL);
  console.log(longURL);
  urlDatabase[shortURL] = longURL;
   res.redirect('/urls');
})

//login to a account
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls')
})


//logout the account
app.post("/logout", (req, res) => {
  const username = req.body.username;
  res.clearCookie('username', username);
  res.redirect('/urls')
})




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});