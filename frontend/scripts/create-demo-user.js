// Script to create a demo user in Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or key is missing. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDemoUser() {
  const email = 'demo@community.io';
  const password = 'Demo123!';
  const username = 'demouser';

  try {
    // Check if user already exists
    const { data: existingUsers, error: searchError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email);

    if (searchError) {
      console.error('Error checking for existing user:', searchError);
      return;
    }

    if (existingUsers && existingUsers.length > 0) {
      console.log('Demo user already exists. You can login with:');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      return;
    }

    // Create the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: 'Demo User',
        },
      },
    });

    if (error) {
      console.error('Error creating demo user:', error);
      return;
    }

    console.log('Demo user created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('User data:', data);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createDemoUser();
