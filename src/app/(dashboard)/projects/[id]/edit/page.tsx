"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { clientDb } from "@/config/firebaseClient";
import type { Project } from "@/types/project";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";

type EditProjectForm = {
  name: string;
  description: string;
  repositoryUrl: string;
  liveUrl: string;
  videoUrl: string;
  thumbnailUrl: string;
  technologies: string;
  features: string;
};

const fields: Array<{ name: keyof EditProjectForm; label: string; type?: string }> = [
  { name: "name", label: "Project Name" },
  { name: "description", label: "Description" },
  { name: "repositoryUrl", label: "Repository URL" },
  { name: "liveUrl", label: "Live URL" },
  { name: "videoUrl", label: "Demo Video URL" },
  { name: "thumbnailUrl", label: "Thumbnail Image URL" },
  { name: "technologies", label: "Technologies (comma-separated)" },
  { name: "features", label: "Key Features (one per line)" },
];

async function fetchProject(id: string): Promise<Project | null> {
  const ref = doc(clientDb, "projects", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  const raw = snap.data() as Partial<Project>;

  return {
    id: snap.id,
    githubId: raw.githubId ?? null,
    repositoryUrl: raw.repositoryUrl ?? "",
    name: raw.name ?? "Untitled project",
    description: raw.description ?? "",
    thumbnail: raw.thumbnail ?? { url: "", alt: "" },
    gallery: raw.gallery ?? [],
    liveUrl: raw.liveUrl ?? null,
    videoUrl: raw.videoUrl ?? null,
    technologies: raw.technologies ?? [],
    features: raw.features ?? [],
    isActive: Boolean(raw.isActive),
    isCollaborated: Boolean(raw.isCollaborated),
    isClientProject: Boolean(raw.isClientProject),
    isPublicRepo: raw.isPublicRepo ?? true,
    isMine: raw.isMine ?? true,
    createdAt: raw.createdAt as Timestamp,
    updatedAt: raw.updatedAt as Timestamp,
  };
}

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<EditProjectForm>();

  useEffect(() => {
    const loadProject = async () => {
      setIsLoading(true);
      const data = await fetchProject(params.id);
      setProject(data ?? null);
      if (data) {
        reset({
          name: data.name,
          description: data.description,
          repositoryUrl: data.repositoryUrl,
          liveUrl: data.liveUrl ?? "",
          videoUrl: data.videoUrl ?? "",
          thumbnailUrl: data.thumbnail.url,
          technologies: data.technologies.join(", "),
          features: data.features.join("\n"),
        });
      }
      setIsLoading(false);
    };

    loadProject();
  }, [params.id, reset]);

  const onSubmit = async (values: EditProjectForm) => {
    if (!project) return;

    setIsSaving(true);

    try {
      const ref = doc(clientDb, "projects", project.id);

      await updateDoc(ref, {
        name: values.name,
        description: values.description,
        repositoryUrl: values.repositoryUrl,
        liveUrl: values.liveUrl || null,
        videoUrl: values.videoUrl || null,
        thumbnail: {
          url: values.thumbnailUrl,
          alt: project.thumbnail.alt,
        },
        technologies: values.technologies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        features: values.features
          .split(/\r?\n/)
          .map((item) => item.trim())
          .filter(Boolean),
        updatedAt: Timestamp.now(),
      });

      router.replace(`/projects/${project.id}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <span className="text-muted-foreground text-sm">Loading project…</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Project not found</CardTitle>
            <CardDescription>
              The project you are trying to edit could not be located.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Project</CardTitle>
          <CardDescription>
            Update project details and click save when you’re done.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.name === "description" || field.name === "features" ? (
                  <Textarea
                    id={field.name}
                    rows={field.name === "description" ? 4 : 3}
                    {...register(field.name)}
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={field.type ?? (field.name.includes("Url") ? "url" : "text")}
                    {...register(field.name)}
                  />
                )}
              </div>
            ))}
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
