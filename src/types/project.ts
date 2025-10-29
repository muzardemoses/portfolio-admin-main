import type { Timestamp } from "firebase/firestore";
import type { Timestamp as AdminTimestamp } from "firebase-admin/firestore";

type FirestoreTimestamp = Timestamp | AdminTimestamp;

export interface ProjectImage {
  url: string;
  alt: string;
}

export interface Project {
  id: string;
  githubId: number | null;
  repositoryUrl: string;
  name: string;
  description: string;
  thumbnail: ProjectImage;
  gallery: ProjectImage[];
  liveUrl: string | null;
  videoUrl: string | null;
  technologies: string[];
  features: string[];
  isActive: boolean;
  isCollaborated: boolean;
  isClientProject: boolean;
  isPublicRepo: boolean;
  isMine: boolean;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  private: boolean;
};


export type GalleryPreview = {
  url: string;
  file?: File;
};

export type CreateProjectForm = {
  repoId: string;
  name: string;
  description: string;
  repositoryUrl: string;
  liveUrl: string;
  videoUrl: string;
  thumbnailUrl: string;
  thumbnailAlt: string;
  gallery: { url: string; alt: string }[];
  technologies: string[];
  features: string[];
  isActive: boolean;
  isCollaborated: boolean;
  isClientProject: boolean;
  isPublicRepo: boolean;
  isMine: boolean;
};
