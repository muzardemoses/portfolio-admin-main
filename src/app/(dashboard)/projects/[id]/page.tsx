"use server";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminDb } from "@/config/firebaseAdmin";
import type { Project } from "@/types/project";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

async function getProject(id: string): Promise<Project | null> {
    const snapshot = await adminDb.collection("projects").doc(id).get();
    if (!snapshot.exists) {
        return null;
    }
    const data = snapshot.data() as Project;
    return { ...data, id: snapshot.id };
}

export default async function ProjectDetailsPage({
    params,
}: {
    params: { id: string };
}) {
    const project = await getProject(params.id);

    if (!project) {
        notFound();
    }

    const createdAt = "toDate" in project.createdAt ? project.createdAt.toDate() : null;
    const updatedAt = "toDate" in project.updatedAt ? project.updatedAt.toDate() : null;

    const statusBadges = [
        { label: "Active", active: project.isActive, variant: "default" as const },
        { label: "Collaborated", active: project.isCollaborated, variant: "secondary" as const },
        { label: "Client Project", active: project.isClientProject, variant: "outline" as const },
        { label: "Public Repo", active: project.isPublicRepo, variant: "outline" as const },
        { label: "Personal", active: project.isMine, variant: "outline" as const },
    ];

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{project.name}</h1>
                    <p className="text-[0.85rem] text-muted-foreground md:text-sm">
                        {project.description || "No description provided yet."}
                    </p>
                </div>
                <div className="flex gap-2 flex-row">
                    <Button variant="outline" asChild>
                        <Link href={`/projects/${project.id}/edit`}>
                            Edit Project
                        </Link>
                    </Button>
                    {project.liveUrl ? (
                        <Button variant="secondary" asChild>
                            <Link href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                                View Live
                            </Link>
                        </Button>
                    ) : null}
                    <Button variant="secondary" asChild>
                        <Link href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                            View Repo
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Media</CardTitle>
                    <CardDescription>
                        Thumbnail, gallery, and demo assets for this project.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Thumbnail</h3>
                        <div className="mt-2 flex items-center justify-center rounded-lg border border-dashed p-4">
                            {project.thumbnail?.url ? (
                                <Image
                                    src={project.thumbnail.url}
                                    alt={project.thumbnail.alt || `${project.name} thumbnail`}
                                    width={480}
                                    height={270}
                                    className="h-auto w-full max-w-xl rounded-md object-cover"
                                    unoptimized
                                />
                            ) : (
                                <span className="text-xs text-muted-foreground">No thumbnail uploaded.</span>
                            )}
                        </div>
                    </div>

                    {project.gallery?.length ? (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Gallery</h3>
                            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {project.gallery.map((image, index) => (
                                    <div
                                        key={`${image.url}-${index}`}
                                        className="overflow-hidden rounded-lg border"
                                    >
                                        <Image
                                            src={image.url}
                                            alt={image.alt || `${project.name} screenshot ${index + 1}`}
                                            width={320}
                                            height={200}
                                            className="h-44 w-auto object-cover place-self-center"
                                            unoptimized
                                        />
                                        {image.alt ? (
                                            <p className="px-3 py-2 text-xs text-muted-foreground">{image.alt}</p>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {project.videoUrl ? (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Demo Video</h3>
                            <div className="mt-2 overflow-hidden rounded-lg border">
                                <video
                                    src={project.videoUrl}
                                    controls
                                    className="aspect-video w-full bg-black"
                                />
                            </div>
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                    <CardDescription>Project metadata and categorisation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {statusBadges.map(({ label, active, variant }) =>
                            active ? (
                                <Badge key={label} variant={variant}>
                                    {label}
                                </Badge>
                            ) : null
                        )}
                    </div>
                    <Separator />
                    <dl className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <dt className="text-xs font-medium uppercase text-muted-foreground">
                                Created
                            </dt>
                            <dd className="mt-1 text-sm">
                                {createdAt ? createdAt.toLocaleString() : "Unknown"}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-muted-foreground">
                                Updated
                            </dt>
                            <dd className="mt-1 text-sm">
                                {updatedAt ? updatedAt.toLocaleString() : "Unknown"}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-muted-foreground">
                                Technologies
                            </dt>
                            <dd className="mt-1 text-sm">
                                {project.technologies.length
                                    ? project.technologies.join(", ")
                                    : "Not specified"}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-muted-foreground">
                                GitHub ID
                            </dt>
                            <dd className="mt-1 text-sm">{project.githubId ?? "Not linked"}</dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Highlights</CardTitle>
                    <CardDescription>Key selling points and accomplishments.</CardDescription>
                </CardHeader>
                <CardContent>
                    {project.features.length ? (
                        <ul className="list-disc space-y-2 pl-5 text-sm">
                            {project.features.map((feature, index) => (
                                <li key={`${feature}-${index}`}>{feature}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No highlights have been added for this project yet.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
