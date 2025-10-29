"use client";

// always use Image from "next/image"; instead of <img> for optimization
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useForm, Controller } from "react-hook-form";

import { clientDb, clientStorage } from "@/config/firebaseClient";
import type { Project, ProjectImage } from "@/types/project";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

type GitHubRepo = {
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
  technologies: string;
  features: string;
  isActive: boolean;
  isCollaborated: boolean;
  isClientProject: boolean;
  isPublicRepo: boolean;
  isMine: boolean;
};

const defaultValues: CreateProjectForm = {
  repoId: "",
  name: "",
  description: "",
  repositoryUrl: "",
  liveUrl: "",
  videoUrl: "",
  thumbnailUrl: "",
  thumbnailAlt: "",
  gallery: [{ url: "", alt: "" }],
  technologies: "",
  features: "",
  isActive: true,
  isCollaborated: false,
  isClientProject: false,
  isPublicRepo: true,
  isMine: true,
};

const galleryPlaceholder: ProjectImage = { url: "", alt: "" };

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });

const sanitizeFileName = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");

export default function AddProjectPage() {
  const router = useRouter();
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [galleryFiles, setGalleryFiles] = useState<(File | undefined)[]>([undefined]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([""]);

  const { register, control, handleSubmit, setValue, watch, reset } =
    useForm<CreateProjectForm>({ defaultValues });

  const selectedRepoId = watch("repoId");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const gallery = watch("gallery") ?? [galleryPlaceholder];

  useEffect(() => {
    const loadRepositories = async () => {
      setIsLoadingRepos(true);
      setLoadingError(null);
      try {
        const response = await fetch("/api/github/repos");
        if (!response.ok) {
          const { message } = await response.json();
          throw new Error(message ?? "Failed to retrieve repositories.");
        }
        const repositories: GitHubRepo[] = await response.json();
        setRepos(
          repositories.sort((a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )
        );
      } catch (error) {
        setLoadingError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while fetching repositories."
        );
      } finally {
        setIsLoadingRepos(false);
      }
    };

    loadRepositories();
  }, []);

  useEffect(() => {
    if (!selectedRepoId) return;
    const repo = repos.find((candidate) => String(candidate.id) === selectedRepoId);
    if (!repo) return;

    setValue("name", repo.name ?? "");
    setValue("description", repo.description ?? "");
    setValue("repositoryUrl", repo.html_url);
    setValue("liveUrl", repo.homepage ?? "");
    setValue(
      "technologies",
      repo.language
        ? [repo.language, ...(repo.topics ?? [])].join(", ")
        : (repo.topics ?? []).join(", ")
    );
    setValue("isPublicRepo", true);
    setValue("isMine", repo.owner.login.toLowerCase() === "muzardemoses");
  }, [selectedRepoId, repos, setValue]);

  const thumbnailUrlValue = watch("thumbnailUrl");
  const thumbnailAltValue = watch("thumbnailAlt");
  const projectNameValue = watch("name");

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreview(thumbnailUrlValue ?? "");
    }
  }, [thumbnailUrlValue, thumbnailFile]);

  useEffect(() => {
    setGalleryPreviews((prev) =>
      gallery.map((item, index) => {
        if (galleryFiles[index]) {
          return prev[index] ?? "";
        }
        return item?.url ?? "";
      })
    );
  }, [gallery, galleryFiles]);

  useEffect(() => {
    setGalleryFiles((prev) => {
      if (prev.length === gallery.length) {
        return prev;
      }
      if (prev.length < gallery.length) {
        return [...prev, ...Array(gallery.length - prev.length).fill(undefined)];
      }
      return prev.slice(0, gallery.length);
    });
  }, [gallery.length]);

  const addGalleryItem = () => {
    setValue("gallery", [...gallery, { ...galleryPlaceholder }]);
    setGalleryFiles((prev) => [...prev, undefined]);
    setGalleryPreviews((prev) => [...prev, ""]);
  };

  const uploadImage = async (file: File, path: string) => {
    const storageRef = ref(clientStorage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  };

  const removeGalleryItem = (index: number) => {
    if (gallery.length <= 1) return;
    setValue(
      "gallery",
      gallery.filter((_, idx) => idx !== index)
    );
    setGalleryFiles((prev) => prev.filter((_, idx) => idx !== index));
    setGalleryPreviews((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleThumbnailFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setThumbnailFile(file);

    if (file) {
      const dataUrl = await readFileAsDataUrl(file);
      setThumbnailPreview(dataUrl);
      setValue("thumbnailUrl", "", { shouldDirty: true });
    } else {
      setThumbnailPreview(thumbnailUrlValue ?? "");
    }
  };

  const handleThumbnailFileReset = () => {
    setThumbnailFile(null);
    setThumbnailPreview(thumbnailUrlValue ?? "");
  };

  const handleGalleryFileChange = async (
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    setGalleryFiles((prev) => {
      const next = [...prev];
      next[index] = file ?? undefined;
      return next;
    });

    if (file) {
      const dataUrl = await readFileAsDataUrl(file);
      setGalleryPreviews((prev) => {
        const next = [...prev];
        next[index] = dataUrl;
        return next;
      });

      const items = [...gallery];
      if (!items[index]) {
        items[index] = { ...galleryPlaceholder };
      }
      setValue("gallery", items, { shouldDirty: true });
    } else {
      setGalleryPreviews((prev) => {
        const next = [...prev];
        next[index] = gallery[index]?.url ?? "";
        return next;
      });
    }
  };

  const clearGalleryFile = (index: number) => {
    setGalleryFiles((prev) => {
      const next = [...prev];
      next[index] = undefined;
      return next;
    });
    setGalleryPreviews((prev) => {
      const next = [...prev];
      next[index] = gallery[index]?.url ?? "";
      return next;
    });
  };

  const onSubmit = async (values: CreateProjectForm) => {
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      const repo = repos.find((candidate) => String(candidate.id) === values.repoId);
      const projectRef = doc(collection(clientDb, "projects"));
      const storageBasePath = `projects/${projectRef.id}`;

      let resolvedThumbnailUrl = values.thumbnailUrl.trim();
      if (thumbnailFile) {
        resolvedThumbnailUrl = await uploadImage(
          thumbnailFile,
          `${storageBasePath}/thumbnail-${Date.now()}-${sanitizeFileName(
            thumbnailFile.name
          )}`
        );
      }

      if (!resolvedThumbnailUrl) {
        throw new Error("Please provide a thumbnail image by uploading a file or entering a URL.");
      }

      const galleryEntries = await Promise.all(
        (values.gallery ?? []).map(async (item, index) => {
          const file = galleryFiles[index];
          const urlInput = item.url.trim();

          if (!file && !urlInput) {
            return null;
          }

          let resolvedUrl = urlInput;
          if (file) {
            resolvedUrl = await uploadImage(
              file,
              `${storageBasePath}/gallery-${index}-${Date.now()}-${sanitizeFileName(
                file.name
              )}`
            );
          }

          return {
            url: resolvedUrl,
            alt: item.alt.trim() || `${values.name} screenshot ${index + 1}`,
          };
        })
      );

      const payload: Omit<Project, "id"> = {
        githubId: repo?.id ?? null,
        repositoryUrl: values.repositoryUrl,
        name: values.name,
        description: values.description,
        thumbnail: {
          url: resolvedThumbnailUrl,
          alt: values.thumbnailAlt.trim() || `${values.name} thumbnail`,
        },
        gallery: galleryEntries.filter(Boolean) as ProjectImage[],
        liveUrl: values.liveUrl ? values.liveUrl.trim() : null,
        videoUrl: values.videoUrl ? values.videoUrl.trim() : null,
        technologies: values.technologies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        features: values.features
          .split(/\r?\n/)
          .map((item) => item.trim())
          .filter(Boolean),
        isActive: values.isActive,
        isCollaborated: values.isCollaborated,
        isClientProject: values.isClientProject,
        isPublicRepo: values.isPublicRepo,
        isMine: values.isMine,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(projectRef, payload);

      reset(defaultValues);
      setThumbnailFile(null);
      setThumbnailPreview("");
      setGalleryFiles([undefined]);
      setGalleryPreviews([""]);
      router.replace(`/projects/${projectRef.id}`);
    } catch (error) {
      setSubmissionError(
        error instanceof Error ? error.message : "Failed to create project. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const repoOptions = useMemo(
    () =>
      repos.map((repo) => (
        <SelectItem key={repo.id} value={String(repo.id)}>
          {repo.full_name}
        </SelectItem>
      )),
    [repos]
  );


  return (
    <div className="space-y-6 p-6">
      <Card className="overflow-hidden border-0 shadow-none">
        <CardHeader>
          <CardTitle>Create a Project</CardTitle>
          <CardDescription>
            Start by selecting one of your GitHub repositories. You can always
            adjust the details before saving.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {submissionError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {submissionError}
            </div>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="repo">Select GitHub repository</Label>
            <Controller
              control={control}
              name="repoId"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoadingRepos || !!loadingError}
                >
                  <SelectTrigger id="repo">
                    <SelectValue placeholder={isLoadingRepos ? "Loading repositories…" : "Choose a repository"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {repoOptions}
                  </SelectContent>
                </Select>
              )}
            />
            {loadingError ? (
              <p className="text-sm text-red-500">{loadingError}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Repositories fetched using your GitHub access token.
              </p>
            )}
          </div>

          <Separator />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card className="border">
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>
                  Provide the basic information about this project.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Project name</Label>
                  <Input id="name" {...register("name", { required: true })} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    {...register("description", { required: true })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="repositoryUrl">Repository URL</Label>
                    <Input
                      id="repositoryUrl"
                      type="url"
                      {...register("repositoryUrl", { required: true })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="liveUrl">Live URL</Label>
                    <Input id="liveUrl" type="url" {...register("liveUrl")} />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="videoUrl">Demo video URL</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    {...register("videoUrl")}
                  />
                </div>
                <Separator />

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="thumbnailUrl">Thumbnail image URL</Label>
                    <Input
                      id="thumbnailUrl"
                      type="url"
                      {...register("thumbnailUrl", { required: true })}
                      disabled={!!thumbnailFile}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="thumbnailAlt">Thumbnail alt text</Label>
                    <Input
                      id="thumbnailAlt"
                      placeholder="e.g. Homepage hero section"
                      {...register("thumbnailAlt")}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-[2fr,1fr] gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="thumbnail-file">Upload thumbnail</Label>
                    <Input
                      id="thumbnail-file"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailFileChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Uploading a file will override the URL above. Supported formats: PNG, JPG, GIF.
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleThumbnailFileReset}
                      disabled={!thumbnailFile}
                    >
                      Clear upload
                    </Button>
                  </div>
                  <div className="flex items-center justify-center rounded-md border border-dashed p-2">
                    {thumbnailPreview || thumbnailUrlValue ? (
                      <Image
                        src={thumbnailPreview || thumbnailUrlValue || ""}
                        alt={thumbnailAltValue || "Thumbnail preview"}
                        className="h-40 w-auto max-w-full rounded-md object-cover"
                        width={160}
                        height={160}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Thumbnail preview will appear here
                      </span>
                    )}
                  </div>
                </div>
                <Separator />

                <div className="space-y-3">
                  <Label>Gallery images</Label>
                  <p className="text-xs text-muted-foreground">
                    Provide additional screenshots. Leave URL blank to skip.
                  </p>
                  <div className="space-y-4">
                    {gallery.map((item, index) => {

                      return (
                        <GalleryImage
                          key={index}
                          index={index}
                          item={item}
                          gallery={gallery}
                          setValue={setValue}
                          galleryFiles={galleryFiles}
                          galleryPreviews={galleryPreviews}
                          handleGalleryFileChange={handleGalleryFileChange}
                          removeGalleryItem={removeGalleryItem}
                          projectNameValue={projectNameValue}
                          clearGalleryFile={clearGalleryFile}
                        />
                      )
                    })}
                    <Button type="button" variant="outline" size="sm" onClick={addGalleryItem}>
                      Add another image
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border">
              <CardHeader>
                <CardTitle>Content & Metadata</CardTitle>
                <CardDescription>
                  Technology stack, key bullet points, and taxonomy.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="technologies">Technologies (comma separated)</Label>
                  <Input
                    id="technologies"
                    placeholder="Next.js, Firebase, Tailwind CSS"
                    {...register("technologies")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="features">Highlights (one per line)</Label>
                  <Textarea
                    id="features"
                    rows={4}
                    placeholder={"Responsive design\nAdmin dashboard\nEdge rendering"}
                    {...register("features")}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border">
              <CardHeader>
                <CardTitle>Project Status</CardTitle>
                <CardDescription>
                  Flag the project so it appears in the right sections of your portfolio.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {(
                  [
                    { name: "isActive", label: "Active project" },
                    { name: "isCollaborated", label: "Collaborated with other developers" },
                    { name: "isClientProject", label: "Client engagement" },
                    { name: "isPublicRepo", label: "Public GitHub repository" },
                    { name: "isMine", label: "Personal project" },
                  ] as Array<{ name: keyof CreateProjectForm; label: string }>
                ).map((toggle) => (
                  <Controller
                    key={toggle.name}
                    control={control}
                    name={toggle.name as keyof CreateProjectForm}
                    render={({ field }) => (
                      <div className="flex items-center justify-between rounded-md border px-3 py-2">
                        <Label className="text-sm font-medium">{toggle.label}</Label>
                        <Switch
                          checked={Boolean(field.value)}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                    )}
                  />
                ))}
              </CardContent>
            </Card>

            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : "Create project"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
