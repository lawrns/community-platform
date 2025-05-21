export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  expertise: ExpertiseLevel;
  interests: string[];
  joined: string;
  followers: number;
  following: number;
}

export enum ExpertiseLevel {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
  Expert = "Expert"
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  createdAt: string;
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  postId: string;
  content: string;
  likes: number;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  attendees: number;
  isVirtual: boolean;
  image: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  author: string;
  publishedDate: string;
  thumbnail: string;
}

export enum ResourceType {
  Tutorial = "Tutorial",
  Paper = "Paper",
  Video = "Video",
  Course = "Course",
  Tool = "Tool",
  Book = "Book"
}