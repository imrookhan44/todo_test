'use client';

import { FiEdit2, FiTrash2 } from 'react-icons/fi';

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
  user: string;
  createdAt: string;
}

interface TodoItemProps {
  todo: Todo;
  onDelete: (id: string) => void;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (id: string) => void;
}

export default function TodoItem({ todo, onDelete, onToggle, onEdit }: TodoItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo._id, !todo.completed)}
          className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <span
          className={`text-black ${
            todo.completed ? 'line-through text-gray-400' : ''
          }`}
        >
          {todo.title}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(todo._id)}
          className="p-1 text-blue-600 hover:text-blue-800"
          aria-label="Edit"
        >
          <FiEdit2 size={18} />
        </button>
        <button
          onClick={() => onDelete(todo._id)}
          className="p-1 text-red-600 hover:text-red-800"
          aria-label="Delete"
        >
          <FiTrash2 size={18} />
        </button>
      </div>
    </div>
  );
} 