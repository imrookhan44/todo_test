'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Define the Todo interface
interface Todo {
  _id: string;
  title: string;
  completed: boolean;
  user: string;
  createdAt: string;
}

// Define the TodoItemProps interface
interface TodoItemProps {
  todo: Todo;
  onDelete: (id: string) => void;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (id: string) => void;
}

// Dynamically import TodoItem to fix the module not found error
const TodoItem = dynamic<TodoItemProps>(() => import('../components/TodoItem'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionDebug, setSessionDebug] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Debug session information
    if (session) {
      setSessionDebug(JSON.stringify(session, null, 2));
    }

    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchTodos();
    }
  }, [status, router, session]);

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching todos with session:', session);
      
      const response = await fetch('/api/todos');
      const responseText = await response.text();
      
      try {
        // Try to parse the response as JSON
        const data = JSON.parse(responseText);
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch todos');
        }
        
        setTodos(data.todos);
      } catch (parseError) {
        console.error('Error parsing response:', responseText);
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching todos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTodo }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add todo');
      }

      const data = await response.json();
      setTodos([data.todo, ...todos]);
      setNewTodo('');
      setError('');
    } catch (error: any) {
      setError(error.message || 'An error occurred while adding todo');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete todo');
      }

      setTodos(todos.filter((todo) => todo._id !== id));
      setError('');
    } catch (error: any) {
      setError(error.message || 'An error occurred while deleting todo');
    }
  };

  const handleToggleTodo = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update todo');
      }

      setTodos(
        todos.map((todo) =>
          todo._id === id ? { ...todo, completed } : todo
        )
      );
      setError('');
    } catch (error: any) {
      setError(error.message || 'An error occurred while updating todo');
    }
  };

  const handleRefreshSession = () => {
    window.location.reload();
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Tasks</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={handleRefreshSession}
            className="ml-4 underline text-blue-600 hover:text-blue-800"
          >
            Refresh Session
          </button>
        </div>
      )}

      {/* Debug information */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mb-4 p-4 bg-gray-100 rounded overflow-auto max-h-40 text-xs">
          <p className="font-bold mb-2">Session Debug:</p>
          <pre>{sessionDebug || 'No session'}</pre>
        </div>
      )}

      <form onSubmit={handleAddTodo} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {todos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tasks yet. Add one above!
          </div>
        ) : (
          todos.map((todo) => (
            <TodoItem
              key={todo._id}
              todo={todo}
              onDelete={handleDeleteTodo}
              onToggle={handleToggleTodo}
              onEdit={(id: string) => router.push(`/dashboard/edit/${id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
} 