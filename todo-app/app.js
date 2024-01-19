const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");

app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Middleware for handling errors
app.use((err, req, res, next) => {
  if (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } else {
    next(); // Pass control to the next middleware
  }
});

app.get("/", async (request, response) => {
  try {
    const allTodos = await Todo.getTodos(); // Assuming getTodos is a static method in your model
    if (request.accepts("html")) {
      response.render("index.ejs", {
        allTodos,
      });
    } else {
      response.json({
        allTodos,
      });
    }
  } catch (error) {
    console.error(error);
    response.status(500).send('Internal Server Error');
  }
});

app.get("/todos", async (request, response) => {
  try {
    const todos = await Todo.findAll();
    response.json(todos);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get("/todos/:id", async (request, response) => {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.error(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async (request, response) => {
  try {
    const todo = await Todo.addTodo(request.body);
    return response.json(todo);
  } catch (error) {
    console.error(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async (request, response) => {
  try {
    const todo = await Todo.findByPk(request.params.id);
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.error(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async (request, response) => {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (todo) {
      await todo.destroy();
      response.send(true);
    } else {
      response.send(false);
    }
  } catch (error) {
    console.error(error);
    response.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
