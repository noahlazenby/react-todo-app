import supabase from '../supabaseClient';

// Table name in Supabase
const TABLE_NAME = 'todos';

/**
 * Fetch all todos for a specific user
 */
export async function getTodos() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

/**
 * Add a new todo
 */
export async function addTodo(text, category = 'personal') {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('You must be logged in to create a todo');
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([{ 
      text, 
      completed: false,
      category,
      user_id: user.id 
    }])
    .select();
  
  if (error) throw error;
  return data?.[0];
}

/**
 * Delete a todo by id
 */
export async function deleteTodo(id) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

/**
 * Toggle the completed status of a todo
 */
export async function toggleTodoComplete(id, currentStatus) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ completed: !currentStatus })
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data?.[0];
}

/**
 * Update a todo's text and category
 */
export async function updateTodoText(id, text, category) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ text, category })
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data?.[0];
} 