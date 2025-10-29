"use client";

// always use Image from "next/image"; instead of <img> for optimization
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useForm, Controller } from "react-hook-form";
import CreatableSelect from 'react-select/creatable';
import { clientDb, clientStorage } from "@/config/firebaseClient";
import type {
  Project,
  ProjectImage,
  CreateProjectForm,
  GalleryPreview,
  GitHubRepo,
} from "@/types/project";
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
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { GalleryImage } from "@/components/projects/gallery-image";
import { Option, technologiesOptions } from "@/lib/technologies";
import { featuresOptions } from "@/lib/features";
import { cn } from "@/lib/utils";
import { normalizeAndDedupe, normalizeTechName } from "@/utils/normalizeTech";
import { toast } from "sonner";


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
  technologies: [],
  features: [],
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

const githubUsername = process.env.NEXT_PUBLIC_GITHUB_USERNAME;

export default function AddProjectPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [galleryFiles, setGalleryFiles] = useState<(File | undefined)[]>([undefined]);
  const [galleryPreviews, setGalleryPreviews] = useState<GalleryPreview[]>([
    { url: "" },
  ]);
  const [featOptions, setFeatOptions] = useState(featuresOptions);
  const [techOptions, setTechOptions] = useState(technologiesOptions);

  const { register, control, handleSubmit, setValue, watch, reset, clearErrors } =
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
    const rawTechs = repo.language
      ? [repo.language, ...(repo.topics ?? [])]
      : (repo.topics ?? []);
    const techs = normalizeAndDedupe(rawTechs);

    setTechOptions((prev) => {
      const existing = new Set(prev.map((o) => o.value.toLowerCase()));
      const toAdd = techs
        .filter((t) => !existing.has(t.toLowerCase()))
        .map((t) => ({ value: t, label: t }));
      return [...prev, ...toAdd];
    });
    setValue("technologies", techs, { shouldDirty: true });
    setValue("isPublicRepo", !repo.private);
    setValue("isMine", repo.owner.login.toLowerCase() === githubUsername);
    setValue("isClientProject", repo.owner.login.toLowerCase() !== githubUsername);
  }, [selectedRepoId, repos, setValue]);

  const thumbnailUrlValue = watch("thumbnailUrl");
  const thumbnailAltValue = watch("thumbnailAlt");
  const projectNameValue = watch("name");
  const videoUrlValue = watch("videoUrl");

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreview(thumbnailUrlValue ?? "");
    }
  }, [thumbnailUrlValue, thumbnailFile]);

  useEffect(() => {
    if (!videoFile) {
      setVideoPreview(videoUrlValue ?? "");
    }
  }, [videoUrlValue, videoFile]);

  useEffect(() => {
    setGalleryPreviews((prev) =>
      gallery.map((item, index) => {
        const existing = prev[index];
        if (existing?.file) {
          return existing;
        }
        return { url: item?.url ?? "" };
      })
    );
  }, [gallery]);

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
    setGalleryPreviews((prev) => [...prev, { url: "" }]);
  };

  const uploadFile = async (file: File, path: string) => {
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
      clearErrors("thumbnailUrl"); // ✅ important
    } else {
      setThumbnailPreview(thumbnailUrlValue ?? "");
    }
  };

  const handleThumbnailFileReset = () => {
    setThumbnailFile(null);
    setThumbnailPreview(thumbnailUrlValue ?? "");
  };

  const handleVideoFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setVideoFile(file);

    if (file) {
      const dataUrl = await readFileAsDataUrl(file);
      setVideoPreview(dataUrl);
      setValue("videoUrl", "", { shouldDirty: true });
      clearErrors("videoUrl"); // ✅ important
    } else {
      setVideoPreview(videoUrlValue ?? "");
    }
  };

  const handleVideoFileReset = () => {
    setVideoFile(null);
    setVideoPreview(videoUrlValue ?? "");
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
        next[index] = { file, url: dataUrl };
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
        next[index] = { url: gallery[index]?.url ?? "" };
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
      next[index] = { url: gallery[index]?.url ?? "" };
      return next;
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFeaturesChange = (newValue: any) => {
    const features = newValue ? newValue.map((option: Option) => option.value) : [];
    setValue("features", features, { shouldDirty: true });
    setFeatOptions((prev) => {
      const existingValues = new Set(prev.map((opt) => opt.value));
      const newOptions = newValue
        ? newValue.filter((opt: Option) => !existingValues.has(opt.value))
        : [];
      return [...prev, ...newOptions];
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTechnologiesChange = (newValue: any) => {
    const picked = (newValue ?? []).map((opt: Option) => normalizeTechName(opt.value));
    const technologies = normalizeAndDedupe(picked);

    setValue("technologies", technologies, { shouldDirty: true });

    // keep your dynamic options list clean & canonical
    setTechOptions((prev) => {
      const existing = new Set(prev.map((o) => o.value.toLowerCase()));
      const toAdd = technologies
        .filter((t) => !existing.has(t.toLowerCase()))
        .map((t) => ({ value: t, label: t }));
      return [...prev, ...toAdd];
    });
  };

  const onSubmit = async (values: CreateProjectForm) => {
    setIsSubmitting(true);
    setSubmissionError(null);

    console.log("Submitting project with values:", values);

    try {
      const repo = repos.find((candidate) => String(candidate.id) === values.repoId);
      const projectRef = doc(collection(clientDb, "projects"));
      const storageBasePath = `projects/${projectRef.id}`;

      let resolvedThumbnailUrl = values.thumbnailUrl.trim();
      if (thumbnailFile) {
        resolvedThumbnailUrl = await uploadFile(
          thumbnailFile,
          `${storageBasePath}/thumbnail-${Date.now()}-${sanitizeFileName(thumbnailFile.name)}`
        );
      }

      if (!resolvedThumbnailUrl) {
        throw new Error("Please provide a thumbnail image by uploading a file or entering a URL.");
      }

      let resolvedVideoUrl = values.videoUrl.trim();
      if (videoFile) {
        resolvedVideoUrl = await uploadFile(
          videoFile,
          `${storageBasePath}/video-${Date.now()}-${sanitizeFileName(videoFile.name)}`
        );
      }

      const galleryEntries = await Promise.all(
        (values.gallery ?? []).map(async (item, index) => {
          const file = galleryFiles[index];
          const urlInput = item.url.trim();

          if (!file && !urlInput) return null;

          let resolvedUrl = urlInput;
          if (file) {
            resolvedUrl = await uploadFile(
              file,
              `${storageBasePath}/gallery-${index}-${Date.now()}-${sanitizeFileName(file.name)}`
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
        videoUrl: resolvedVideoUrl || null,
        technologies: values.technologies,
        features: values.features,
        isActive: values.isActive,
        isCollaborated: values.isCollaborated,
        isClientProject: values.isClientProject,
        isPublicRepo: values.isPublicRepo,
        isMine: values.isMine,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(projectRef, payload);

      // ✅ Success toast
      toast.success("Project created successfully!", {
        description: "Redirecting to project details...",
        duration: 2500,
      });

      // Reset form
      reset(defaultValues);
      setThumbnailFile(null);
      setThumbnailPreview("");
      setVideoFile(null);
      setVideoPreview("");
      setGalleryFiles([undefined]);
      setGalleryPreviews([{ url: "" }]);

      // Navigate after a brief delay (so user sees toast)
      setTimeout(() => {
        router.replace(`/projects/${projectRef.id}`);
      }, 1200);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create project. Please try again.";
      setSubmissionError(message);
      console.error("Error creating project:", error);

      // ❌ Error toast
      toast.error("Failed to create project", {
        description: message,
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const repoOptions = useMemo(
    () =>
      repos.map((repo) => ({
        label: repo.full_name,
        value: repo.full_name.toLowerCase(), // searchable string
        ...repo,
        owner: repo.full_name.split("/")[0] ?? "",
      })),
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
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full max-w-xl justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isLoadingRepos || !!loadingError}
                    >
                      {field.value
                        ? repoOptions.find((r) => String(r.id) === field.value)?.label
                        : isLoadingRepos
                          ? "Loading repositories…"
                          : "Choose a repository"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput placeholder="Search repositories (name, owner, id)..." />
                      <CommandList>
                        <CommandEmpty>No repositories found.</CommandEmpty>
                        <CommandGroup>
                          {repoOptions.map((repo) => (
                            <CommandItem
                              key={repo.id}
                              // Make the item searchable by name, owner and id
                              value={`${repo.value} ${repo.owner.toLowerCase()} ${repo.id}`}
                              keywords={[repo.owner, repo.name, String(repo.id)]}
                              onSelect={() => {
                                field.onChange(String(repo.id));
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === String(repo.id) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {repo.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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

          <form onSubmit={handleSubmit(onSubmit, (errors) => {
            console.error("❌ Validation errors:", errors);
            toast.error("Please fix form errors before submitting.", {
              description: "Check missing or invalid fields.",
            });
          })} className="space-y-6">
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
                <div className="grid md:grid-cols-[2fr,1fr] gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="video-file">Upload video</Label>
                    <Input
                      id="video-file"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Uploading a file will override the URL above. Accepted formats include MP4, WebM, and MOV.
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleVideoFileReset}
                      disabled={!videoFile}
                    >
                      Clear upload
                    </Button>
                  </div>
                  <div className="flex items-center justify-center rounded-md border border-dashed p-2">
                    {videoPreview || videoUrlValue ? (
                      <video
                        src={videoPreview || videoUrlValue || ""}
                        controls
                        autoPlay
                        className="h-40 w-auto max-w-full rounded-md object-cover"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Video preview will appear here
                      </span>
                    )}
                  </div>
                </div>
                <Separator />

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="thumbnailUrl">Thumbnail image URL</Label>
                    <Input
                      id="thumbnailUrl"
                      type="url"
                      {...register("thumbnailUrl", { required: !thumbnailFile})}
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
                        unoptimized
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
                          setValue={setValue} galleryFiles={galleryFiles} galleryPreviews={galleryPreviews} handleGalleryFileChange={handleGalleryFileChange} removeGalleryItem={removeGalleryItem} projectNameValue={projectNameValue}
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
                  <Label htmlFor="technologies">Technologies</Label>
                  <CreatableSelect
                    isMulti
                    onChange={handleTechnologiesChange}
                    options={techOptions}
                    value={techOptions.filter((opt) =>
                      (watch("technologies") || []).includes(opt.value)
                    )}
                    placeholder="Select or type to add technologies..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="features">Highlights</Label>
                  <CreatableSelect
                    isMulti
                    onChange={handleFeaturesChange}
                    options={featOptions}
                    value={featOptions.filter((opt) =>
                      (watch("features") || []).includes(opt.value)
                    )}
                    placeholder="Select or type to add features..."
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
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                {isSubmitting ? "Creating…" : "Create project"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
