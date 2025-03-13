const Todo = require('../models/Todo');

// Get all todos for a user
const getAllTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.userId }).sort('-createdAt');
    res.status(200).json({ todos, count: todos.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new todo
const createTodo = async (req, res) => {
  try {
    req.body.user = req.user.userId;
    const todo = await Todo.create(req.body);
    res.status(201).json({ todo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single todo
const getTodo = async (req, res) => {
  try {
    const { id: todoId } = req.params;
    const todo = await Todo.findOne({
      _id: todoId,
      user: req.user.userId
    });
    
    if (!todo) {
      return res.status(404).json({ error: `No todo with id: ${todoId}` });
    }
    
    res.status(200).json({ todo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a todo
const updateTodo = async (req, res) => {
  try {
    const { id: todoId } = req.params;
    
    const todo = await Todo.findOneAndUpdate(
      { _id: todoId, user: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!todo) {
      return res.status(404).json({ error: `No todo with id: ${todoId}` });
    }
    
    res.status(200).json({ todo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a todo
const deleteTodo = async (req, res) => {
  try {
    const { id: todoId } = req.params;
    
    const todo = await Todo.findOneAndDelete({
      _id: todoId,
      user: req.user.userId
    });
    
    if (!todo) {
      return res.status(404).json({ error: `No todo with id: ${todoId}` });
    }
    
    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTodos,
  createTodo,
  getTodo,
  updateTodo,
  deleteTodo
}; 