"use server";

import Link from "next/link";
import Image from "next/image";
import { adminDb } from "@/config/firebaseAdmin";
import type { Project } from "@/types/project";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

async function getInactiveProjects(): Promise<Project[]> {
    const snapshot = await adminDb
        .collection("projects")
        .where("isActive", "==", false)
        .orderBy("updatedAt", "desc")
        .get();

    return snapshot.docs.map((doc) => {
        const data = doc.data() as Project;
        return { ...data, id: doc.id };
    });
}

export default async function InactiveProjectsPage() {
    const projects = await getInactiveProjects();

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Inactive Projects</h1>
                    <p className="text-[0.85rem] text-muted-foreground md:text-sm">
                        Archived or paused projects remain accessible here for reference.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/projects">Back to Projects
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/projects/add">
                            Create Project
                        </Link>
                    </Button>
                </div>
            </div>

            {projects.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                        <p className="text-muted-foreground text-sm">No inactive projects found.</p>
                        <Button size="sm" variant="outline" asChild>
                            <Link href="/projects">
                                View active projects
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}
        </div>
    );
}

const ProjectCard = ({ project }: { project: Project }) => {
    const updatedAt =
        "toDate" in project.updatedAt ? project.updatedAt.toDate() : null;

    return (
        <Card className="flex h-full flex-col">
            <CardHeader className="space-y-4">
                <div className="flex items-start gap-4">
                    <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md border">
                        {project.thumbnail?.url ? (
                            <Image
                                src={project.thumbnail.url}
                                alt={project.thumbnail.alt || `${project.name} thumbnail`}
                                fill
                                className="object-cover"
                                sizes="112px"
                                unoptimized
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted">
                                <span className="text-xs text-muted-foreground">No image</span>
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-xl leading-tight">{project.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                            {project.description || "No description provided."}
                        </CardDescription>
                        <div className="flex flex-wrap gap-2">
                            {project.isClientProject ? <Badge variant="outline">Client</Badge> : null}
                            {project.isCollaborated ? (
                                <Badge variant="secondary">Collaborated</Badge>
                            ) : null}
                            {project.isPublicRepo ? <Badge variant="outline">Public Repo</Badge> : null}
                            {!project.isClientProject && !project.isCollaborated && !project.isPublicRepo ? (
                                <Badge variant="outline">Archive</Badge>
                            ) : null}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div>
                        <span className="font-medium text-foreground">Last updated:</span>{" "}
                        {updatedAt ? updatedAt.toLocaleString() : "Unknown"}
                    </div>
                    <Separator />
                    <div className="space-y-1">
                        <span className="font-medium text-foreground">Technologies</span>
                        <p>
                            {project.technologies.length
                                ? project.technologies.join(", ")
                                : "Technologies not specified."}
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <Button size="sm" variant="outline" asChild>
                        <Link href={`/projects/${project.id}`}>
                            View details
                        </Link>
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                        <Link href={`/projects/${project.id}/edit`}>
                            Edit
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
