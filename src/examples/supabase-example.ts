/**
 * Supabase Usage Examples
 * 
 * This file provides examples of how to use the Supabase integration
 * in the community platform for various common tasks.
 */

import { supabase, supabaseAdmin } from '../config/supabase';
import {
  getById,
  getMany,
  create,
  update,
  remove,
  textSearch,
  rawQuery,
  executeQuery
} from '../utils/supabaseUtils';

/**
 * Example: User Management
 * 
 * This example demonstrates how to manage users with Supabase Auth.
 */
async function userManagementExample() {
  console.log('--- User Management Example ---');
  
  // Example: Sign up a new user
  async function signUpUser(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      console.error('Error signing up:', error.message);
      return null;
    }
    
    console.log('User signed up successfully:', data.user?.id);
    return data.user;
  }
  
  // Example: Sign in a user
  async function signInUser(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Error signing in:', error.message);
      return null;
    }
    
    console.log('User signed in successfully:', data.user?.id);
    return data.user;
  }
  
  // Example: Get the current user
  async function getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting user:', error.message);
      return null;
    }
    
    return data.user;
  }
  
  // Example: Update user profile
  async function updateUserProfile(userId: string, userData: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating profile:', error.message);
      return null;
    }
    
    console.log('Profile updated successfully:', data.id);
    return data;
  }
  
  // (These would actually be called in a real application)
  console.log('User management functions available:');
  console.log('- signUpUser(email, password)');
  console.log('- signInUser(email, password)');
  console.log('- getCurrentUser()');
  console.log('- updateUserProfile(userId, userData)');
}

/**
 * Example: Data Management
 * 
 * This example demonstrates CRUD operations using the utility functions.
 */
async function dataManagementExample() {
  console.log('--- Data Management Example ---');

  interface Post {
    id?: string;
    title: string;
    content: string;
    author_id: string;
    published: boolean;
    created_at?: string;
    updated_at?: string;
  }
  
  // Example: Create a new post
  async function createPost(postData: Partial<Post>) {
    const result = await create<Post>('posts', postData);
    
    if (result.error) {
      console.error('Error creating post:', result.error);
      return null;
    }
    
    console.log('Post created successfully:', result.data?.id);
    return result.data;
  }
  
  // Example: Get a post by ID
  async function getPost(postId: string) {
    const result = await getById<Post>('posts', postId);
    
    if (result.error) {
      console.error('Error fetching post:', result.error);
      return null;
    }
    
    return result.data;
  }
  
  // Example: Update a post
  async function updatePost(postId: string, updateData: Partial<Post>) {
    const result = await update<Post>('posts', postId, updateData);
    
    if (result.error) {
      console.error('Error updating post:', result.error);
      return null;
    }
    
    console.log('Post updated successfully:', result.data?.id);
    return result.data;
  }
  
  // Example: Delete a post
  async function deletePost(postId: string) {
    const result = await remove<Post>('posts', postId);
    
    if (result.error) {
      console.error('Error deleting post:', result.error);
      return false;
    }
    
    console.log('Post deleted successfully:', postId);
    return true;
  }
  
  // Example: List posts with filtering and pagination
  async function listPosts(authorId?: string, limit = 10, offset = 0) {
    const filters = authorId ? { author_id: authorId } : {};
    
    const result = await getMany<Post>('posts', {
      limit,
      offset,
      orderBy: 'created_at',
      orderDirection: 'desc',
      filters,
    });
    
    if (result.error) {
      console.error('Error listing posts:', result.error);
      return [];
    }
    
    return result.data;
  }
  
  // Example: Search posts
  async function searchPosts(query: string) {
    const result = await textSearch<Post>('posts', 'content', query);
    
    if (result.error) {
      console.error('Error searching posts:', result.error);
      return [];
    }
    
    return result.data;
  }
  
  // (These would actually be called with real data in a real application)
  console.log('Data management functions available:');
  console.log('- createPost(postData)');
  console.log('- getPost(postId)');
  console.log('- updatePost(postId, updateData)');
  console.log('- deletePost(postId)');
  console.log('- listPosts(authorId?, limit?, offset?)');
  console.log('- searchPosts(query)');
}

/**
 * Example: Real-time Subscriptions
 * 
 * This example demonstrates how to use Supabase's real-time capabilities.
 */
async function realtimeExample() {
  console.log('--- Real-time Subscriptions Example ---');
  
  // Example: Subscribe to all changes in the posts table
  function subscribeToAllPosts(callback: (payload: any) => void) {
    const subscription = supabase
      .channel('posts-channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'posts' 
        },
        callback
      )
      .subscribe();
    
    console.log('Subscribed to all post changes');
    
    // Return the subscription to allow unsubscribing later
    return subscription;
  }
  
  // Example: Subscribe to changes for a specific post
  function subscribeToPost(postId: string, callback: (payload: any) => void) {
    const subscription = supabase
      .channel(`post-${postId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'posts',
          filter: `id=eq.${postId}`
        },
        callback
      )
      .subscribe();
    
    console.log(`Subscribed to changes for post ${postId}`);
    
    // Return the subscription to allow unsubscribing later
    return subscription;
  }
  
  // Example: Unsubscribe from changes
  function unsubscribe(subscription: any) {
    supabase.removeChannel(subscription);
    console.log('Unsubscribed from changes');
  }
  
  // Example handler for real-time updates
  function handlePostUpdate(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    console.log(`Received ${eventType} event:`);
    
    switch (eventType) {
      case 'INSERT':
        console.log('New post created:', newRecord);
        break;
      case 'UPDATE':
        console.log('Post updated:', newRecord);
        console.log('Previous values:', oldRecord);
        break;
      case 'DELETE':
        console.log('Post deleted:', oldRecord);
        break;
    }
  }
  
  // (These would actually be called in a real application)
  console.log('Realtime functions available:');
  console.log('- subscribeToAllPosts(callback)');
  console.log('- subscribeToPost(postId, callback)');
  console.log('- unsubscribe(subscription)');
  console.log('- handlePostUpdate(payload) - example callback');
}

/**
 * Example: Storage Management
 * 
 * This example demonstrates how to use Supabase Storage.
 */
async function storageExample() {
  console.log('--- Storage Example ---');
  
  const BUCKET_NAME = 'uploads';
  
  // Example: Upload a file
  async function uploadFile(filePath: string, fileData: File | Blob) {
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload(filePath, fileData, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading file:', error.message);
      return null;
    }
    
    console.log('File uploaded successfully:', data.path);
    return data;
  }
  
  // Example: Get a public URL for a file
  function getPublicUrl(filePath: string) {
    const { data } = supabase
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }
  
  // Example: Download a file
  async function downloadFile(filePath: string) {
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .download(filePath);
    
    if (error) {
      console.error('Error downloading file:', error.message);
      return null;
    }
    
    return data;
  }
  
  // Example: List files in a folder
  async function listFiles(folderPath: string) {
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .list(folderPath);
    
    if (error) {
      console.error('Error listing files:', error.message);
      return [];
    }
    
    return data;
  }
  
  // Example: Delete a file
  async function deleteFile(filePath: string) {
    const { error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting file:', error.message);
      return false;
    }
    
    console.log('File deleted successfully:', filePath);
    return true;
  }
  
  // (These would actually be called in a real application)
  console.log('Storage functions available:');
  console.log('- uploadFile(filePath, fileData)');
  console.log('- getPublicUrl(filePath)');
  console.log('- downloadFile(filePath)');
  console.log('- listFiles(folderPath)');
  console.log('- deleteFile(filePath)');
}

/**
 * Run all examples
 */
async function runExamples() {
  try {
    await userManagementExample();
    console.log('\n');
    
    await dataManagementExample();
    console.log('\n');
    
    await realtimeExample();
    console.log('\n');
    
    await storageExample();
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Export individual examples for selective use
export {
  userManagementExample,
  dataManagementExample,
  realtimeExample,
  storageExample,
  runExamples
};

// Only run examples if this file is executed directly
if (require.main === module) {
  runExamples().then(() => {
    console.log('Examples completed');
    process.exit(0);
  }).catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}