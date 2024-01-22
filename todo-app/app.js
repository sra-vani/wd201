const express = require("express");
var csrf = require("tiny-csrf");
const app = express();
const { Todo, User } = require("./models");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const path = require("path");

const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const flash = require("connect-flash");
//const path = require("path");
app.set("views", path.join(__dirname, "views"));
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
//const { next } = require('cheerio/lib/api/traversing');

const saltRounds = 10;

app.use(flash());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh!some secret string,I am King"));
app.use(csrf("abcdefghijklmnopqrstuvwxyz123456", ["POST", "PUT", "DELETE"]));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "my-super-secret-key-21728172615261562",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async function (user) {
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid password" });
          }
        })
        .catch((error) => {
          return done(error);
        });
    },
  ),
);

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

app.get("/", async (request, response) => {
  if (request.isAuthenticated()) {
    return response.redirect("/todos");
  }
  response.render("index", {
    csrfToken: request.csrfToken(),
  });
});

// app.get("/", function (request, response) {
//   response.send("Hello World");
// });

app.get("/signup", function (request, response) {
  response.render("signup.ejs", {
    csrfToken: request.csrfToken(),
  });
});

app.post("/users", async function (request, response) {
  const hashedPwd = await bcrypt.hash(request.body.password, saltRounds);
  console.log(hashedPwd);

  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: hashedPwd,
    });
    request.login(user, (err) => {
      if (err) {
        console.log(err);
      }
      response.redirect("/todos");
    });
  } catch (error) {
    request.flash("error", "FirstName & E-Mail cannot be empty!");
    console.log(error);
    response.redirect("/signup");
  }
});

app.get("/login", (request, response) => {
  response.render("login", {
    csrfToken: request.csrfToken(),
  });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (request, response) {
    console.log(request.user);
    response.redirect("/todos");
  },
);

app.get("/signout", (request, response, next) => {
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});

app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const dt = new Date().toISOString().split("T")[0];
    const allTodos = await Todo.getTodos(request.user.id);
    let odTodos = [],
      dtTodos = [],
      ciTodos = [],
      dlTodos = [];
    await allTodos.forEach((i) => {
      if (i.completed) ciTodos.push(i);
      else if (i.dueDate < dt) odTodos.push(i);
      else if (i.dueDate == dt) dtTodos.push(i);
      else dlTodos.push(i);
    });
    if (request.accepts("html")) {
      response.render("todo.ejs", {
        odTodos,
        dtTodos,
        dlTodos,
        ciTodos,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({
        odTodos,
        dtTodos,
        dlTodos,
        ciTodos,
      });
    }
  },
);

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    try {
      await Todo.addTodo({
        title: request.body.title,
        dueDate: request.body.dueDate,
        userId: request.user.id,
      });
      return response.redirect("/todos");
    } catch (error) {
      console.log(error);
      request.flash("error", "To-do len atleast 5!");
      return response.redirect("/todos");
    }
  },
);

app.put(
  "/todos/:id/setCompletionStatus",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    const todo = await Todo.findByPk(request.params.id);
    try {
      if (todo.completed) {
        const updatedTodo = await todo.setCompletionStatus(false);
        return response.json(updatedTodo);
      } else {
        const updatedTodo = await todo.setCompletionStatus(true);
        return response.json(updatedTodo);
      }
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);

app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    console.log("Delete a todo by ID: ", request.params.id);
    try {
      await Todo.remove(request.params.id, request.user.id);
      return response.json({ success: true });
    } catch (error) {
      return response.status(422).json(error);
    }
  },
);

module.exports = app;
