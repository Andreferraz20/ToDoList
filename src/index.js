const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);

  if(!user){
    return response.status(400).json({error: "User not found"});
  }
  request.user = user;
  
  return next();
}

function checksExistsTodo(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  const existsTodo = user.todos.find(todo => todo.id === id);

  if(!existsTodo){
    return response.status(404).json({error: "Todo not found"});
  }

  request.toDo = existsTodo;
  
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userNameAlreadyExists = users.some(user => user.username === username);
  if(userNameAlreadyExists) {
    return response.status(400).json({error: "Username already exists"});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push({
    ...user
  })

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push({
    ...todo
  });

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { title, deadline} = request.body;
  const { toDo } = request;
  
  toDo.title = title;
  toDo.deadline = new Date(deadline);

  return  response.status(201).json(toDo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { username } = request.header;
  const { id } = request.params;
  const { toDo } = request;

  toDo.done = true;

  return response.status(201).json(toDo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { toDo, user } = request;
  
  user.todos.splice(user.todos.indexOf(toDo), 1);

  return response.status(204).send();
});

module.exports = app;