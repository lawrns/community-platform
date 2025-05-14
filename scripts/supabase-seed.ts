/**
 * Supabase Seed Script
 * Populates the Supabase database with initial data
 */

import { supabase } from '../src/config/supabase';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('Starting Supabase seed process...');

  try {
    // Create admin user
    const adminUser = {
      email: 'admin@community.io',
      username: 'admin',
      name: 'Administrator',
      bio: 'Platform administrator',
      reputation: 10000,
      email_verified: true,
      auth_provider: 'supabase',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Create auth user in Supabase with regular signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminUser.email,
      password: 'Admin123!',
      options: {
        data: {
          username: adminUser.username,
          name: adminUser.name,
        }
      }
    });

    if (authError || !authData.user) {
      console.error('Error creating auth user:', authError || 'No user data returned');
      return;
    }

    console.log('Created auth user:', authData.user.id);

    // Set auth_provider_id to the Supabase auth user ID
    const userInsert = {
      ...adminUser,
      auth_provider_id: authData.user.id,
    };

    // Insert user into our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert(userInsert)
      .select()
      .single();

    if (userError) {
      console.error('Error creating user record:', userError);
      return;
    }

    console.log('Created user record:', userData.id);

    // Create topics
    const topicsData = [
      {
        name: 'General',
        slug: 'general',
        description: 'General discussion about AI',
      },
      {
        name: 'Large Language Models',
        slug: 'large-language-models',
        description: 'Discussion about LLMs like GPT, Claude, etc.',
      },
      {
        name: 'Computer Vision',
        slug: 'computer-vision',
        description: 'Discussion about computer vision AI systems',
      },
      {
        name: 'Machine Learning',
        slug: 'machine-learning',
        description: 'Discussion about machine learning techniques',
      },
      {
        name: 'Deep Learning',
        slug: 'deep-learning',
        description: 'Discussion about deep learning',
      },
    ];

    const { data: topicsResult, error: topicsError } = await supabase
      .from('topics')
      .insert(topicsData)
      .select();

    if (topicsError) {
      console.error('Error creating topics:', topicsError);
      return;
    }

    console.log(`Created ${topicsResult.length} topics`);

    // Create tags
    const tagsData = [
      {
        name: 'GPT-4',
        slug: 'gpt-4',
        description: 'OpenAI\'s GPT-4 model',
      },
      {
        name: 'Claude',
        slug: 'claude',
        description: 'Anthropic\'s Claude models',
      },
      {
        name: 'Prompt Engineering',
        slug: 'prompt-engineering',
        description: 'Techniques for prompting language models',
      },
      {
        name: 'Fine-tuning',
        slug: 'fine-tuning',
        description: 'Fine-tuning language models',
      },
      {
        name: 'RAG',
        slug: 'rag',
        description: 'Retrieval-Augmented Generation',
      },
    ];

    const { data: tagsResult, error: tagsError } = await supabase
      .from('tags')
      .insert(tagsData)
      .select();

    if (tagsError) {
      console.error('Error creating tags:', tagsError);
      return;
    }

    console.log(`Created ${tagsResult.length} tags`);

    // Create sample content
    const contentData = [
      {
        type: 'post',
        title: 'Welcome to the Community.io Platform',
        body: '# Welcome\n\nWelcome to the Community.io platform, a place to discuss AI technologies and techniques.',
        body_html: '<h1>Welcome</h1><p>Welcome to the Community.io platform, a place to discuss AI technologies and techniques.</p>',
        author_id: userData.id,
        status: 'published',
      },
      {
        type: 'question',
        title: 'What is your favorite LLM?',
        body: 'I\'m curious what LLM everyone is using these days. What do you prefer and why?',
        body_html: '<p>I\'m curious what LLM everyone is using these days. What do you prefer and why?</p>',
        author_id: userData.id,
        status: 'published',
      },
    ];

    const { data: contentResult, error: contentError } = await supabase
      .from('content')
      .insert(contentData)
      .select();

    if (contentError) {
      console.error('Error creating content:', contentError);
      return;
    }

    console.log(`Created ${contentResult.length} content items`);

    // Associate content with topics and tags
    const contentTopicsData = [
      {
        content_id: contentResult[0].id,
        topic_id: topicsResult[0].id,
      },
      {
        content_id: contentResult[1].id,
        topic_id: topicsResult[1].id,
      },
    ];

    const { error: contentTopicsError } = await supabase
      .from('content_topics')
      .insert(contentTopicsData);

    if (contentTopicsError) {
      console.error('Error creating content-topics associations:', contentTopicsError);
      return;
    }

    console.log(`Created ${contentTopicsData.length} content-topic associations`);

    const contentTagsData = [
      {
        content_id: contentResult[0].id,
        tag_id: tagsResult[0].id,
      },
      {
        content_id: contentResult[1].id,
        tag_id: tagsResult[0].id,
      },
      {
        content_id: contentResult[1].id,
        tag_id: tagsResult[1].id,
      },
    ];

    const { error: contentTagsError } = await supabase
      .from('content_tags')
      .insert(contentTagsData);

    if (contentTagsError) {
      console.error('Error creating content-tags associations:', contentTagsError);
      return;
    }

    console.log(`Created ${contentTagsData.length} content-tag associations`);

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed error:', error);
  }
}

// Run seed function
seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error during seed:', error);
    process.exit(1);
  });