import { User, ExpertiseLevel, Post, Event, Resource, ResourceType, Comment } from '../types';

export const users: User[] = [
  {
    id: '1',
    name: 'Alex Morgan',
    username: 'alexmorgan',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600',
    bio: 'AI researcher focused on NLP and transformers. Currently working on fine-tuning large language models for specialized domains.',
    expertise: ExpertiseLevel.Expert,
    interests: ['NLP', 'Transformers', 'Fine-tuning'],
    joined: '2023-05-15',
    followers: 1243,
    following: 328
  },
  {
    id: '2',
    name: 'Maya Patel',
    username: 'mayapatel',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
    bio: 'Machine learning engineer with a focus on computer vision applications in healthcare.',
    expertise: ExpertiseLevel.Advanced,
    interests: ['Computer Vision', 'Healthcare AI', 'Medical Imaging'],
    joined: '2023-07-22',
    followers: 856,
    following: 402
  },
  {
    id: '3',
    name: 'Jordan Lee',
    username: 'jordanlee',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600',
    bio: 'AI ethics advocate and researcher. Exploring responsible AI development practices and governance frameworks.',
    expertise: ExpertiseLevel.Intermediate,
    interests: ['AI Ethics', 'Responsible AI', 'Governance'],
    joined: '2023-09-10',
    followers: 1092,
    following: 215
  },
  {
    id: '4',
    name: 'Sam Cooper',
    username: 'samcooper',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600',
    bio: 'Beginner AI enthusiast learning the fundamentals. Currently building my first image classification model.',
    expertise: ExpertiseLevel.Beginner,
    interests: ['Deep Learning Basics', 'Python', 'Image Classification'],
    joined: '2024-01-18',
    followers: 124,
    following: 587
  },
  {
    id: '5',
    name: 'Taylor Kim',
    username: 'taylorkim',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=600',
    bio: 'Multimodal AI researcher working at the intersection of language and vision. Passionate about creating models that can reason across different modalities.',
    expertise: ExpertiseLevel.Expert,
    interests: ['Multimodal Models', 'Visual Reasoning', 'Cross-modal Learning'],
    joined: '2023-04-05',
    followers: 2187,
    following: 156
  }
];

export const posts: Post[] = [
  {
    id: '1',
    userId: '1',
    user: users[0],
    title: 'Fine-tuning Strategies for Domain-Specific LLMs',
    content: 'I recently completed a project fine-tuning an LLM for medical text understanding with remarkable results. Here are my key findings and strategies that led to a 34% improvement in domain-specific tasks while maintaining general capabilities...',
    tags: ['LLM', 'Fine-tuning', 'Medical AI'],
    likes: 342,
    comments: 48,
    createdAt: '2024-05-28T14:32:00Z'
  },
  {
    id: '2',
    userId: '2',
    user: users[1],
    title: 'Implementing Vision Transformers for Medical Image Analysis',
    content: 'Vision Transformers (ViT) are showing promising results in medical imaging. In this post, I share my implementation approach and the challenges I overcame when applying ViTs to detect abnormalities in X-ray images...',
    tags: ['Computer Vision', 'Transformers', 'Healthcare'],
    likes: 278,
    comments: 36,
    createdAt: '2024-05-27T10:15:00Z'
  },
  {
    id: '3',
    userId: '5',
    user: users[4],
    title: 'Breaking New Ground: Multimodal Models That Can Reason',
    content: 'Our research team has developed a novel architecture that enables true cross-modal reasoning. This post explores how we\'ve structured the attention mechanisms to allow for more sophisticated understanding between text and visual inputs...',
    tags: ['Multimodal', 'Research', 'Attention Mechanisms'],
    likes: 523,
    comments: 87,
    createdAt: '2024-05-26T08:45:00Z'
  },
  {
    id: '4',
    userId: '3',
    user: users[2],
    title: 'Ethical Considerations for Generative AI Systems',
    content: 'As generative AI becomes more prevalent, we must address several ethical concerns. This post outlines a framework for evaluating the ethical implications of generative models before deployment...',
    tags: ['AI Ethics', 'Generative AI', 'Responsible AI'],
    likes: 417,
    comments: 62,
    createdAt: '2024-05-25T16:20:00Z'
  },
  {
    id: '5',
    userId: '4',
    user: users[3],
    title: 'My Journey Learning AI: First Steps and Resources',
    content: 'I\'m documenting my learning journey in AI from scratch. Here are the resources that have helped me the most and the initial projects I\'ve completed with surprisingly good results despite being a beginner...',
    tags: ['Learning', 'Beginners', 'Resources'],
    likes: 189,
    comments: 45,
    createdAt: '2024-05-24T12:10:00Z'
  }
];

export const comments: Comment[] = [
  {
    id: '1',
    userId: '2',
    user: users[1],
    postId: '1',
    content: 'This is incredibly helpful! Would you mind sharing more details about your hyperparameter tuning approach?',
    likes: 28,
    createdAt: '2024-05-28T15:10:00Z'
  },
  {
    id: '2',
    userId: '3',
    user: users[2],
    postId: '1',
    content: 'Have you considered the ethical implications of applying these models in medical decision-making? I\'d be interested in discussing this further.',
    likes: 36,
    createdAt: '2024-05-28T16:05:00Z'
  },
  {
    id: '3',
    userId: '5',
    user: users[4],
    postId: '1',
    content: 'Excellent work! The cross-domain performance metrics are impressive. Would you be open to collaborating on extending this to multimodal inputs?',
    likes: 42,
    createdAt: '2024-05-28T17:30:00Z'
  }
];

export const events: Event[] = [
  {
    id: '1',
    title: 'Global AI Summit 2025',
    description: 'The largest gathering of AI researchers and practitioners, featuring keynotes from leading experts and showcasing cutting-edge research and applications.',
    date: '2025-03-15',
    time: '09:00 AM',
    location: 'San Francisco, CA',
    organizer: 'World AI Foundation',
    attendees: 5000,
    isVirtual: false,
    image: 'https://images.pexels.com/photos/2833037/pexels-photo-2833037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: '2',
    title: 'Responsible AI Workshop Series',
    description: 'A monthly virtual workshop focusing on different aspects of responsible AI development, ethics, and governance frameworks.',
    date: '2024-06-20',
    time: '02:00 PM',
    location: 'Virtual',
    organizer: 'AI Ethics Coalition',
    attendees: 1200,
    isVirtual: true,
    image: 'https://images.pexels.com/photos/7504837/pexels-photo-7504837.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: '3',
    title: 'LLM Applications in Healthcare Conference',
    description: 'A specialized conference exploring the applications of large language models in healthcare, from diagnosis assistance to medical research and documentation.',
    date: '2024-08-10',
    time: '10:00 AM',
    location: 'Boston, MA',
    organizer: 'Healthcare AI Innovation Hub',
    attendees: 1800,
    isVirtual: false,
    image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: '4',
    title: 'AI for Beginners: Hands-on Workshop',
    description: 'A practical workshop designed for beginners to get started with AI development. No prior experience required, just bring your laptop and enthusiasm!',
    date: '2024-06-05',
    time: '03:30 PM',
    location: 'Virtual',
    organizer: 'AI Education Network',
    attendees: 350,
    isVirtual: true,
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  }
];

export const resources: Resource[] = [
  {
    id: '1',
    title: 'The Definitive Guide to Transformer Architectures',
    description: 'A comprehensive guide to understanding and implementing transformer architectures for various AI applications.',
    type: ResourceType.Tutorial,
    url: 'https://example.com/transformer-guide',
    author: 'Alex Morgan',
    publishedDate: '2024-02-15',
    thumbnail: 'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: '2',
    title: 'Attention Is All You Need Explained',
    description: 'A detailed breakdown of the groundbreaking paper that introduced the transformer architecture, with practical examples.',
    type: ResourceType.Paper,
    url: 'https://example.com/attention-paper',
    author: 'Taylor Kim',
    publishedDate: '2023-11-08',
    thumbnail: 'https://images.pexels.com/photos/7516363/pexels-photo-7516363.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: '3',
    title: 'Deep Learning with Python and PyTorch',
    description: 'A complete course covering the fundamentals of deep learning and practical implementation using PyTorch.',
    type: ResourceType.Course,
    url: 'https://example.com/deep-learning-course',
    author: 'Sam Cooper',
    publishedDate: '2024-01-30',
    thumbnail: 'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: '4',
    title: 'Building Ethical AI Systems',
    description: 'A comprehensive guide to implementing ethical considerations throughout the AI development lifecycle.',
    type: ResourceType.Book,
    url: 'https://example.com/ethical-ai-book',
    author: 'Jordan Lee',
    publishedDate: '2023-09-12',
    thumbnail: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: '5',
    title: 'Computer Vision for Medical Imaging',
    description: 'An in-depth video series exploring the application of computer vision techniques in medical imaging analysis.',
    type: ResourceType.Video,
    url: 'https://example.com/cv-medical-video',
    author: 'Maya Patel',
    publishedDate: '2024-03-22',
    thumbnail: 'https://images.pexels.com/photos/6476783/pexels-photo-6476783.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  }
];