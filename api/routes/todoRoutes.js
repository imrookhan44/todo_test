const express = require('express');
const router = express.Router();
const {
  getAllTodos,
  createTodo,
  getTodo,
  updateTodo,
  deleteTodo
} = require('../controllers/todoController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

router.route('/')
  .get(getAllTodos)
  .post(createTodo);

router.route('/:id')
  .get(getTodo)
  .patch(updateTodo)
  .delete(deleteTodo);

module.exports = router; 