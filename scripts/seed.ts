/**
 * Database Seed Script
 * Populates the database with initial data for development
 */

import db from '../src/config/database';
import logger from '../src/config/logger';

async function seedDatabase() {
  logger.info('Starting database seed process...');

  try {
    // Connect to database
    await db.initialize();
    
    // Use transaction to ensure all operations succeed or fail together
    await db.transaction(async (client) => {
      logger.info('Seeding users table...');
      // Create sample users
      await client.query(`
        INSERT INTO users (
          email, username, name, avatar_url, bio, reputation, email_verified, created_at, updated_at
        ) VALUES
        ('priya@example.com', 'priya', 'Priya Sharma', 'https://randomuser.me/api/portraits/women/1.jpg', 'ML Engineer with 5 years of experience', 100, true, NOW(), NOW()),
        ('miguel@example.com', 'miguel', 'Miguel Rodriguez', 'https://randomuser.me/api/portraits/men/2.jpg', 'AI Researcher and PhD student', 75, true, NOW(), NOW()),
        ('sofia@example.com', 'sofia', 'Sofia Chen', 'https://randomuser.me/api/portraits/women/3.jpg', 'AI Enthusiast and Career-Switcher', 50, true, NOW(), NOW()),
        ('david@example.com', 'david', 'David Kim', 'https://randomuser.me/api/portraits/men/4.jpg', 'Enterprise CTO interested in AI adoption', 25, true, NOW(), NOW()),
        ('admin@community.io', 'admin', 'Admin User', 'https://randomuser.me/api/portraits/men/10.jpg', 'Community Administrator', 9999, true, NOW(), NOW())
        ON CONFLICT (email) DO NOTHING;
      `);
      
      logger.info('Seeding topics table...');
      // Create sample topics
      await client.query(`
        INSERT INTO topics (
          name, slug, description, parent_id, created_at, updated_at
        ) VALUES
        ('Machine Learning', 'machine-learning', 'Topics related to machine learning', NULL, NOW(), NOW()),
        ('Natural Language Processing', 'nlp', 'Topics related to NLP', 1, NOW(), NOW()),
        ('Computer Vision', 'computer-vision', 'Topics related to computer vision', 1, NOW(), NOW()),
        ('AI Tools', 'ai-tools', 'AI tools and platforms', NULL, NOW(), NOW()),
        ('LLMs', 'llms', 'Large language models', 2, NOW(), NOW()),
        ('Generative AI', 'generative-ai', 'Generative AI technologies', NULL, NOW(), NOW()),
        ('Community Resources', 'community-resources', 'Learning resources and guides', NULL, NOW(), NOW()),
        ('Getting Started', 'getting-started', 'Resources for beginners in AI', 7, NOW(), NOW()),
        ('Ethics & Safety', 'ethics-safety', 'Discussions about AI ethics and safety', NULL, NOW(), NOW()),
        ('AI Research', 'ai-research', 'Latest AI research papers and findings', NULL, NOW(), NOW()),
        ('MLOps', 'mlops', 'Machine Learning Operations', 1, NOW(), NOW()),
        ('Multimodal Models', 'multimodal', 'Models that work across different modalities', 6, NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;
      `);
      
      logger.info('Seeding tags table...');
      // Create sample tags
      await client.query(`
        INSERT INTO tags (
          name, slug, description, created_at, updated_at
        ) VALUES
        ('python', 'python', 'Python programming language', NOW(), NOW()),
        ('tensorflow', 'tensorflow', 'TensorFlow ML framework', NOW(), NOW()),
        ('pytorch', 'pytorch', 'PyTorch ML framework', NOW(), NOW()),
        ('gpt', 'gpt', 'GPT models from OpenAI', NOW(), NOW()),
        ('claude', 'claude', 'Claude models from Anthropic', NOW(), NOW()),
        ('huggingface', 'huggingface', 'Hugging Face libraries and models', NOW(), NOW()),
        ('prompt-engineering', 'prompt-engineering', 'Techniques for effective prompting', NOW(), NOW()),
        ('fine-tuning', 'fine-tuning', 'Model fine-tuning techniques', NOW(), NOW()),
        ('rag', 'rag', 'Retrieval augmented generation', NOW(), NOW()),
        ('beginner', 'beginner', 'Content suitable for beginners', NOW(), NOW()),
        ('langchain', 'langchain', 'LangChain framework for LLM applications', NOW(), NOW()),
        ('vector-databases', 'vector-databases', 'Databases for storing and querying vector embeddings', NOW(), NOW()),
        ('transformers', 'transformers', 'Transformer-based neural network architectures', NOW(), NOW()),
        ('stable-diffusion', 'stable-diffusion', 'Stable Diffusion image generation model', NOW(), NOW()),
        ('dalle', 'dalle', 'DALL-E image generation model', NOW(), NOW()),
        ('midjourney', 'midjourney', 'Midjourney image generation tool', NOW(), NOW()),
        ('openai', 'openai', 'OpenAI company and its products', NOW(), NOW()),
        ('anthropic', 'anthropic', 'Anthropic company and its products', NOW(), NOW()),
        ('llama', 'llama', 'Meta\'s Llama family of models', NOW(), NOW()),
        ('mistral', 'mistral', 'Mistral AI and its models', NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;
      `);
      
      logger.info('Seeding badges table...');
      // Create sample badges
      await client.query(`
        INSERT INTO badges (
          name, description, icon_url, level, created_at
        ) VALUES
        ('Welcome', 'Complete your profile', 'badge-welcome.svg', 'bronze', NOW()),
        ('First Post', 'Create your first post', 'badge-first-post.svg', 'bronze', NOW()),
        ('First Answer', 'Post your first answer', 'badge-first-answer.svg', 'bronze', NOW()),
        ('Curious', 'Ask your first question', 'badge-curious.svg', 'bronze', NOW()),
        ('Helpful', 'First accepted answer', 'badge-helpful.svg', 'bronze', NOW()),
        ('Popular Post', 'Post with 10 upvotes', 'badge-popular-post.svg', 'silver', NOW()),
        ('Valuable Answer', 'Answer with 10 upvotes', 'badge-valuable-answer.svg', 'silver', NOW()),
        ('Expert', 'Answer with 25 upvotes', 'badge-expert.svg', 'gold', NOW()),
        ('Great Question', 'Question with 25 upvotes', 'badge-great-question.svg', 'gold', NOW()),
        ('Reviewer', 'Submit 5 reviews for AI tools', 'badge-reviewer.svg', 'silver', NOW())
        ON CONFLICT DO NOTHING;
      `);

      logger.info('Seeding content table...');
      // Create sample content
      await client.query(`
        INSERT INTO content (
          type, title, body, body_html, author_id, parent_id, is_accepted, upvotes, downvotes, views, status, created_at, updated_at
        ) VALUES
        (
          'question',
          'What is the best way to fine-tune a GPT model for domain-specific tasks?',
          'I am working on a project where we need to fine-tune a GPT model for medical terminology. What approaches have worked best for domain adaptation with limited training data (around 5000 examples)?

Should we use full fine-tuning or parameter-efficient techniques like LoRA? Any tips on preventing the model from "forgetting" its general capabilities during fine-tuning would be appreciated.',
          '<p>I am working on a project where we need to fine-tune a GPT model for medical terminology. What approaches have worked best for domain adaptation with limited training data (around 5000 examples)?</p><p>Should we use full fine-tuning or parameter-efficient techniques like LoRA? Any tips on preventing the model from "forgetting" its general capabilities during fine-tuning would be appreciated.</p>',
          1, NULL, FALSE, 15, 0, 320, 'published', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'
        ),
        (
          'answer',
          NULL,
          'For domain-specific fine-tuning with limited data (5000 examples), I strongly recommend using parameter-efficient techniques like LoRA rather than full fine-tuning.

Here''s why:

1. **Resource efficiency**: LoRA requires much less compute and memory than full fine-tuning
2. **Catastrophic forgetting**: LoRA helps mitigate the "forgetting" problem you mentioned by only modifying a small subset of parameters
3. **Data efficiency**: Works better with limited domain-specific data

For your medical terminology task, I would recommend:

- Use LoRA with a rank of 8 or 16
- Keep a low learning rate (1e-4 or 5e-5)
- Implement early stopping based on validation performance
- Consider using a domain-specific evaluation metric

Also, make sure your 5000 examples are high quality and representative of the medical terminology you''re targeting. In my experience, data quality matters more than quantity for these specialized domains.',
          '<p>For domain-specific fine-tuning with limited data (5000 examples), I strongly recommend using parameter-efficient techniques like LoRA rather than full fine-tuning.</p><p>Here''s why:</p><ol><li><strong>Resource efficiency</strong>: LoRA requires much less compute and memory than full fine-tuning</li><li><strong>Catastrophic forgetting</strong>: LoRA helps mitigate the "forgetting" problem you mentioned by only modifying a small subset of parameters</li><li><strong>Data efficiency</strong>: Works better with limited domain-specific data</li></ol><p>For your medical terminology task, I would recommend:</p><ul><li>Use LoRA with a rank of 8 or 16</li><li>Keep a low learning rate (1e-4 or 5e-5)</li><li>Implement early stopping based on validation performance</li><li>Consider using a domain-specific evaluation metric</li></ul><p>Also, make sure your 5000 examples are high quality and representative of the medical terminology you''re targeting. In my experience, data quality matters more than quantity for these specialized domains.</p>',
          2, 1, TRUE, 27, 0, 0, 'published', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'
        ),
        (
          'answer',
          NULL,
          'I''ve worked on similar medical domain adaptation projects, and I have a slightly different take.

While LoRA is excellent (as mentioned in the accepted answer), I've found that QLoRA can be even better for this specific use case. With QLoRA, you get:

1. The parameter efficiency of LoRA
2. Further memory reduction through quantization
3. Comparable or better performance on domain-specific tasks

For your 5000 medical examples, I would suggest:

- 4-bit quantization with QLoRA
- Using a larger base model than you might with standard LoRA (since QLoRA is more memory-efficient)
- Double-check for medical hallucinations using domain expert review

One additional technique that worked well for us was starting with instruction tuning on general medical knowledge first, then fine-tuning on your specific terminology dataset. This "two-stage" approach helped retain general capabilities while still adapting to our specific sub-domain.',
          '<p>I''ve worked on similar medical domain adaptation projects, and I have a slightly different take.</p><p>While LoRA is excellent (as mentioned in the accepted answer), I've found that QLoRA can be even better for this specific use case. With QLoRA, you get:</p><ol><li>The parameter efficiency of LoRA</li><li>Further memory reduction through quantization</li><li>Comparable or better performance on domain-specific tasks</li></ol><p>For your 5000 medical examples, I would suggest:</p><ul><li>4-bit quantization with QLoRA</li><li>Using a larger base model than you might with standard LoRA (since QLoRA is more memory-efficient)</li><li>Double-check for medical hallucinations using domain expert review</li></ul><p>One additional technique that worked well for us was starting with instruction tuning on general medical knowledge first, then fine-tuning on your specific terminology dataset. This "two-stage" approach helped retain general capabilities while still adapting to our specific sub-domain.</p>',
          3, 1, FALSE, 12, 1, 0, 'published', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
        ),
        (
          'post',
          'Getting Started with RAG: A Practical Guide',
          '# Introduction to Retrieval-Augmented Generation (RAG)

Retrieval-Augmented Generation (RAG) has become one of the most important techniques for building practical LLM applications. RAG addresses a critical limitation of LLMs - their knowledge cutoff and inability to access private or recent data.

## What is RAG?

RAG combines information retrieval with text generation:

1. First, relevant documents are retrieved from an external knowledge source
2. Then, these documents are provided as context to the LLM
3. Finally, the LLM generates a response based on both the prompt and the retrieved context

## Building a Basic RAG System

Here''s a simple architecture for a RAG system:

1. **Document Collection**: Gather all the documents you want your LLM to access
2. **Text Chunking**: Split documents into manageable chunks (typically 500-1000 tokens)
3. **Embedding Generation**: Create vector embeddings for each chunk
4. **Vector Storage**: Store these embeddings in a vector database
5. **Retrieval**: When a query arrives, convert it to an embedding and find similar chunks
6. **Augmented Generation**: Send the query and retrieved chunks to the LLM

## Code Example

Here''s a simplified example using LangChain:

```python
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.llms import OpenAI
from langchain.chains import RetrievalQA
from langchain.document_loaders import DirectoryLoader

# 1. Load documents
loader = DirectoryLoader("./documents/", glob="**/*.pdf")
documents = loader.load()

# 2. Split into chunks
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = text_splitter.split_documents(documents)

# 3. Create embeddings and store in vector DB
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(chunks, embeddings)

# 4. Create a retrieval chain
qa_chain = RetrievalQA.from_chain_type(
    llm=OpenAI(),
    chain_type="stuff",
    retriever=vectorstore.as_retriever()
)

# 5. Ask questions
result = qa_chain.run("What is the capital of France?")
print(result)
```

## Advanced RAG Techniques

Basic RAG works well, but there are several techniques to improve performance:

- **Hybrid Search**: Combine semantic (vector) and keyword (BM25) search
- **Multi-query Retrieval**: Generate multiple search queries from a single user question
- **Re-ranking**: Use a second model to re-rank retrieved documents by relevance
- **Query Transformation**: Rewrite the user''s query to improve retrieval

## Conclusion

RAG is a powerful technique that allows LLMs to access up-to-date and private information. While there are challenges in implementation (chunking strategy, retrieval quality, etc.), the benefits make it worthwhile for most production LLM applications.

In future posts, I''ll dive deeper into specific RAG enhancements and real-world case studies.

What RAG implementations have you tried? What challenges did you face?',
          '<h1>Introduction to Retrieval-Augmented Generation (RAG)</h1><p>Retrieval-Augmented Generation (RAG) has become one of the most important techniques for building practical LLM applications. RAG addresses a critical limitation of LLMs - their knowledge cutoff and inability to access private or recent data.</p><h2>What is RAG?</h2><p>RAG combines information retrieval with text generation:</p><ol><li>First, relevant documents are retrieved from an external knowledge source</li><li>Then, these documents are provided as context to the LLM</li><li>Finally, the LLM generates a response based on both the prompt and the retrieved context</li></ol><h2>Building a Basic RAG System</h2><p>Here''s a simple architecture for a RAG system:</p><ol><li><strong>Document Collection</strong>: Gather all the documents you want your LLM to access</li><li><strong>Text Chunking</strong>: Split documents into manageable chunks (typically 500-1000 tokens)</li><li><strong>Embedding Generation</strong>: Create vector embeddings for each chunk</li><li><strong>Vector Storage</strong>: Store these embeddings in a vector database</li><li><strong>Retrieval</strong>: When a query arrives, convert it to an embedding and find similar chunks</li><li><strong>Augmented Generation</strong>: Send the query and retrieved chunks to the LLM</li></ol><h2>Code Example</h2><p>Here''s a simplified example using LangChain:</p><pre><code class="language-python">from langchain.embeddings import OpenAIEmbeddings\\nfrom langchain.vectorstores import Chroma\\nfrom langchain.text_splitter import RecursiveCharacterTextSplitter\\nfrom langchain.llms import OpenAI\\nfrom langchain.chains import RetrievalQA\\nfrom langchain.document_loaders import DirectoryLoader\\n\\n# 1. Load documents\\nloader = DirectoryLoader("./documents/", glob="**/*.pdf")\\ndocuments = loader.load()\\n\\n# 2. Split into chunks\\ntext_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)\\nchunks = text_splitter.split_documents(documents)\\n\\n# 3. Create embeddings and store in vector DB\\nembeddings = OpenAIEmbeddings()\\nvectorstore = Chroma.from_documents(chunks, embeddings)\\n\\n# 4. Create a retrieval chain\\nqa_chain = RetrievalQA.from_chain_type(\\n    llm=OpenAI(),\\n    chain_type="stuff",\\n    retriever=vectorstore.as_retriever()\\n)\\n\\n# 5. Ask questions\\nresult = qa_chain.run("What is the capital of France?")\\nprint(result)</code></pre><h2>Advanced RAG Techniques</h2><p>Basic RAG works well, but there are several techniques to improve performance:</p><ul><li><strong>Hybrid Search</strong>: Combine semantic (vector) and keyword (BM25) search</li><li><strong>Multi-query Retrieval</strong>: Generate multiple search queries from a single user question</li><li><strong>Re-ranking</strong>: Use a second model to re-rank retrieved documents by relevance</li><li><strong>Query Transformation</strong>: Rewrite the user''s query to improve retrieval</li></ul><h2>Conclusion</h2><p>RAG is a powerful technique that allows LLMs to access up-to-date and private information. While there are challenges in implementation (chunking strategy, retrieval quality, etc.), the benefits make it worthwhile for most production LLM applications.</p><p>In future posts, I''ll dive deeper into specific RAG enhancements and real-world case studies.</p><p>What RAG implementations have you tried? What challenges did you face?</p>',
          1, NULL, FALSE, 32, 0, 750, 'published', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'
        ),
        (
          'question',
          'Comparing Claude and GPT-4: Strengths and Weaknesses?',
          'I''m trying to decide between using Claude (from Anthropic) and GPT-4 (from OpenAI) for my application. 

My use case involves summarizing long technical documents and answering questions about them. I need strong reasoning capabilities but also need to be budget-conscious.

For those who have used both extensively:

1. What are the main strengths and weaknesses of each model?
2. Which performs better for long-context reasoning?
3. Is there a significant difference in hallucination rates?
4. How do they compare in terms of pricing for production use?

Any real-world experiences or benchmarks would be especially helpful. Thanks!',
          '<p>I''m trying to decide between using Claude (from Anthropic) and GPT-4 (from OpenAI) for my application.</p><p>My use case involves summarizing long technical documents and answering questions about them. I need strong reasoning capabilities but also need to be budget-conscious.</p><p>For those who have used both extensively:</p><ol><li>What are the main strengths and weaknesses of each model?</li><li>Which performs better for long-context reasoning?</li><li>Is there a significant difference in hallucination rates?</li><li>How do they compare in terms of pricing for production use?</li></ol><p>Any real-world experiences or benchmarks would be especially helpful. Thanks!</p>',
          3, NULL, FALSE, 8, 0, 214, 'published', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
        )
        ON CONFLICT DO NOTHING;
      `);

      logger.info('Linking content to tags and topics...');
      // Create relationships between content and tags/topics
      await client.query(`
        -- Link question about fine-tuning
        INSERT INTO content_tags (content_id, tag_id) VALUES 
        (1, (SELECT id FROM tags WHERE slug = 'fine-tuning')),
        (1, (SELECT id FROM tags WHERE slug = 'gpt')),
        (1, (SELECT id FROM tags WHERE slug = 'openai'))
        ON CONFLICT DO NOTHING;

        INSERT INTO content_topics (content_id, topic_id) VALUES
        (1, (SELECT id FROM topics WHERE slug = 'machine-learning')),
        (1, (SELECT id FROM topics WHERE slug = 'nlp'))
        ON CONFLICT DO NOTHING;

        -- Link post about RAG
        INSERT INTO content_tags (content_id, tag_id) VALUES 
        (4, (SELECT id FROM tags WHERE slug = 'rag')),
        (4, (SELECT id FROM tags WHERE slug = 'langchain')),
        (4, (SELECT id FROM tags WHERE slug = 'vector-databases')),
        (4, (SELECT id FROM tags WHERE slug = 'python'))
        ON CONFLICT DO NOTHING;

        INSERT INTO content_topics (content_id, topic_id) VALUES
        (4, (SELECT id FROM topics WHERE slug = 'nlp')),
        (4, (SELECT id FROM topics WHERE slug = 'ai-tools'))
        ON CONFLICT DO NOTHING;

        -- Link question about Claude vs GPT-4
        INSERT INTO content_tags (content_id, tag_id) VALUES 
        (5, (SELECT id FROM tags WHERE slug = 'claude')),
        (5, (SELECT id FROM tags WHERE slug = 'gpt')),
        (5, (SELECT id FROM tags WHERE slug = 'anthropic')),
        (5, (SELECT id FROM tags WHERE slug = 'openai'))
        ON CONFLICT DO NOTHING;

        INSERT INTO content_topics (content_id, topic_id) VALUES
        (5, (SELECT id FROM topics WHERE slug = 'ai-tools')),
        (5, (SELECT id FROM topics WHERE slug = 'llms'))
        ON CONFLICT DO NOTHING;
      `);

      logger.info('Seeding tools table...');
      // Create sample AI tools
      await client.query(`
        INSERT INTO tools (
          name, slug, description, website_url, logo_url, pricing_info, features, is_verified, vendor_id, upvotes, status, created_at, updated_at
        ) VALUES
        (
          'Claude', 
          'claude', 
          'Claude is a family of AI assistants created by Anthropic. Known for its conversational ability, safety features, and strong context window.',
          'https://www.anthropic.com/claude',
          'claude-logo.png',
          '{"free_tier": true, "paid_tiers": true, "starting_price": "Free (limited) - $20/mo"}',
          '{"features": ["Long context window", "Accurate reasoning", "Great with text and code", "Constitutional AI approaches"]}',
          true,
          NULL,
          25,
          'active',
          NOW() - INTERVAL '30 days',
          NOW() - INTERVAL '30 days'
        ),
        (
          'ChatGPT', 
          'chatgpt', 
          'ChatGPT is an AI chatbot developed by OpenAI, based on the GPT family of large language models. It is both a consumer-facing app and available via API.',
          'https://chat.openai.com',
          'chatgpt-logo.png',
          '{"free_tier": true, "paid_tiers": true, "starting_price": "Free (limited) - $20/mo for Plus"}',
          '{"features": ["GPT-3.5 and GPT-4 models", "Web browsing", "Image generation with DALL-E", "Voice conversations", "Custom GPTs"]}',
          true,
          NULL,
          35,
          'active',
          NOW() - INTERVAL '45 days',
          NOW() - INTERVAL '45 days'
        ),
        (
          'LangChain',
          'langchain',
          'LangChain is a framework for developing applications powered by language models. It enables applications that are context-aware, reason, and learn from interactions.',
          'https://langchain.com',
          'langchain-logo.png',
          '{"free_tier": true, "paid_tiers": true, "starting_price": "Open Source + Cloud offering"}',
          '{"features": ["Prompt management", "Multi-model support", "RAG capabilities", "Agents framework", "Memory and state management"]}',
          true,
          NULL,
          28,
          'active',
          NOW() - INTERVAL '25 days',
          NOW() - INTERVAL '25 days'
        ),
        (
          'LlamaIndex',
          'llamaindex',
          'LlamaIndex (formerly GPT Index) is a data framework for building LLM applications. It helps with connecting custom data sources to large language models.',
          'https://www.llamaindex.ai',
          'llamaindex-logo.png',
          '{"free_tier": true, "paid_tiers": true, "starting_price": "Open Source + Cloud offering"}',
          '{"features": ["Data connectors", "Indexing strategies", "Query engines", "Agent frameworks", "Evaluation tools"]}',
          true,
          NULL,
          18,
          'active',
          NOW() - INTERVAL '20 days',
          NOW() - INTERVAL '20 days'
        ),
        (
          'Stable Diffusion',
          'stable-diffusion',
          'Stable Diffusion is an open-source text-to-image model that generates detailed images based on text descriptions (prompts).',
          'https://stability.ai',
          'stablediffusion-logo.png',
          '{"free_tier": true, "paid_tiers": true, "starting_price": "Open Source + API pricing"}',
          '{"features": ["Text-to-image generation", "Image-to-image editing", "Inpainting", "Outpainting", "Multiple model versions"]}',
          true,
          NULL,
          22,
          'active',
          NOW() - INTERVAL '35 days',
          NOW() - INTERVAL '35 days'
        )
        ON CONFLICT DO NOTHING;
      `);

      logger.info('Linking tools to tags...');
      // Create relationships between tools and tags
      await client.query(`
        -- Link Claude to tags
        INSERT INTO tool_tags (tool_id, tag_id) VALUES 
        (1, (SELECT id FROM tags WHERE slug = 'claude')),
        (1, (SELECT id FROM tags WHERE slug = 'anthropic')),
        (1, (SELECT id FROM tags WHERE slug = 'llms'))
        ON CONFLICT DO NOTHING;

        -- Link ChatGPT to tags
        INSERT INTO tool_tags (tool_id, tag_id) VALUES 
        (2, (SELECT id FROM tags WHERE slug = 'gpt')),
        (2, (SELECT id FROM tags WHERE slug = 'openai')),
        (2, (SELECT id FROM tags WHERE slug = 'llms'))
        ON CONFLICT DO NOTHING;

        -- Link LangChain to tags
        INSERT INTO tool_tags (tool_id, tag_id) VALUES 
        (3, (SELECT id FROM tags WHERE slug = 'langchain')),
        (3, (SELECT id FROM tags WHERE slug = 'rag')),
        (3, (SELECT id FROM tags WHERE slug = 'python'))
        ON CONFLICT DO NOTHING;

        -- Link LlamaIndex to tags
        INSERT INTO tool_tags (tool_id, tag_id) VALUES 
        (4, (SELECT id FROM tags WHERE slug = 'rag')),
        (4, (SELECT id FROM tags WHERE slug = 'vector-databases')),
        (4, (SELECT id FROM tags WHERE slug = 'python'))
        ON CONFLICT DO NOTHING;

        -- Link Stable Diffusion to tags
        INSERT INTO tool_tags (tool_id, tag_id) VALUES 
        (5, (SELECT id FROM tags WHERE slug = 'stable-diffusion')),
        (5, (SELECT id FROM tags WHERE slug = 'generative-ai')),
        (5, (SELECT id FROM tags WHERE slug = 'pytorch'))
        ON CONFLICT DO NOTHING;
      `);

      logger.info('Adding tool reviews...');
      // Create sample tool reviews
      await client.query(`
        INSERT INTO tool_reviews (
          tool_id, user_id, rating, title, content, upvotes, status, created_at, updated_at
        ) VALUES
        (
          1, 
          2, 
          5, 
          'Excellent reasoning capabilities',
          'I''ve been using Claude for advanced reasoning tasks in my research work, and it consistently outperforms other models for tasks requiring nuanced understanding. The long context window is game-changing for analyzing research papers. Highly recommended for academic use cases.',
          3,
          'published',
          NOW() - INTERVAL '20 days',
          NOW() - INTERVAL '20 days'
        ),
        (
          1, 
          3, 
          4, 
          'Great but expensive for production',
          'Claude is an incredible model with stellar capabilities for handling nuanced instructions. The 100K context window is amazing for document analysis. However, be aware that costs can add up quickly in production environments. Would give 5 stars if pricing was more competitive.',
          2,
          'published',
          NOW() - INTERVAL '18 days',
          NOW() - INTERVAL '18 days'
        ),
        (
          2, 
          1, 
          5, 
          'The standard for LLM interfaces',
          'ChatGPT has become my daily driver for everything from coding to creative writing. The Plus subscription is well worth it for GPT-4 access. The web browsing and DALL-E integration make it a complete package. The custom GPTs feature is still evolving but shows great promise.',
          4,
          'published',
          NOW() - INTERVAL '30 days',
          NOW() - INTERVAL '30 days'
        ),
        (
          2, 
          4, 
          4, 
          'Powerful but occasional reliability issues',
          'ChatGPT with GPT-4 is impressive for business use cases. I use it daily for content creation and research. The only downsides are occasional server issues during peak hours and some inconsistency between sessions. Still, it''s become an indispensable productivity tool.',
          2,
          'published',
          NOW() - INTERVAL '25 days',
          NOW() - INTERVAL '25 days'
        ),
        (
          3, 
          1, 
          5, 
          'Essential framework for LLM apps',
          'LangChain has become the backbone of all my LLM projects. The abstractions it provides save weeks of development time, and the community support is excellent. The documentation has improved significantly in recent months. If you''re building anything beyond basic chatbots, this is essential.',
          3,
          'published',
          NOW() - INTERVAL '15 days',
          NOW() - INTERVAL '15 days'
        ),
        (
          5, 
          3, 
          4, 
          'Democratizing image generation',
          'Stable Diffusion has completely changed what''s possible with image generation. Being open source means you can run it locally with enough GPU power. The results are impressive, though still require good prompting skills. The community around it is fantastic and constantly developing new techniques.',
          1,
          'published',
          NOW() - INTERVAL '10 days',
          NOW() - INTERVAL '10 days'
        )
        ON CONFLICT DO NOTHING;
      `);

      logger.info('Adding user badges...');
      // Award some badges to users
      await client.query(`
        INSERT INTO user_badges (
          user_id, badge_id, awarded_at
        ) VALUES
        (1, 1, NOW() - INTERVAL '40 days'),  -- Welcome badge for Priya
        (1, 2, NOW() - INTERVAL '38 days'),  -- First Post badge for Priya
        (1, 4, NOW() - INTERVAL '35 days'),  -- Curious badge for Priya
        (1, 6, NOW() - INTERVAL '30 days'),  -- Popular Post badge for Priya
        
        (2, 1, NOW() - INTERVAL '42 days'),  -- Welcome badge for Miguel
        (2, 3, NOW() - INTERVAL '40 days'),  -- First Answer badge for Miguel
        (2, 5, NOW() - INTERVAL '38 days'),  -- Helpful badge for Miguel
        (2, 7, NOW() - INTERVAL '30 days'),  -- Valuable Answer badge for Miguel
        (2, 8, NOW() - INTERVAL '25 days'),  -- Expert badge for Miguel
        
        (3, 1, NOW() - INTERVAL '35 days'),  -- Welcome badge for Sofia
        (3, 3, NOW() - INTERVAL '32 days'),  -- First Answer badge for Sofia
        (3, 4, NOW() - INTERVAL '30 days'),  -- Curious badge for Sofia
        
        (4, 1, NOW() - INTERVAL '30 days'),  -- Welcome badge for David
        (4, 10, NOW() - INTERVAL '20 days')  -- Reviewer badge for David
        ON CONFLICT DO NOTHING;
      `);

      logger.info('Seed data inserted successfully');
    });
    
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  } finally {
    // Close database connection
    await db.close();
  }
  
  logger.info('Database seed process completed');
}

// Run the seed function if the script is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default seedDatabase;