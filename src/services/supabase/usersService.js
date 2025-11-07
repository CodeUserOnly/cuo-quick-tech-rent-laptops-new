import { supabase } from '../../supabase/client'

export const usersService = {
  getAll: async () => {
    const { data, error } = await supabase.from('users').select('*')
    if (error) throw error
    return data
  },

  getByEmail: async (email) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  create: async (userData) => {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()
    if (error) throw error
    return data
  },

  // FIXED LOGIN METHOD - Use this one!
  login: async (email, password) => {
    // Just get user by email
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('User not found')
      }
      throw error
    }

    // Check password manually
    if (data.password !== password) {
      throw new Error('Invalid password')
    }

    return data
  },

  // NEW: Sign up method using Supabase Auth
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: userData // Additional user metadata
      }
    });

    if (error) throw error;
    return data;
  },

  // NEW: Get current session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  },

  // NEW: Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  update: async (userId, userData) => {
    try {
      console.log('Updating user:', userId, userData);
      
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', userId)
        .select();
      
      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      console.log('Update response data:', data);

      if (data && data.length > 0) {
        return data[0];
      }

      console.log('No data returned from update, fetching user again...');
      const { data: fetchedUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Fetch error after update:', fetchError);
        console.log('Returning local user data since fetch failed');
        return { id: userId, ...userData };
      }

      return fetchedUser;
      
    } catch (error) {
      console.error('Error in usersService.update:', error);
      throw error;
    }
  },

  updateSimple: async (userId, userData) => {
    const { error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', userId);
    
    if (error) throw error;
    
    return { id: userId, ...userData };
  },

  delete: async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  getById: async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  }
}