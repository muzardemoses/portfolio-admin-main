"use server";

import Link from "next/link";
import Image from "next/image";
import { adminDb } from "@/config/firebaseAdmin";
import type { Project } from "@/types/project";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { relativeTime } from "@/utils/format";

async function getProjects(): Promise<Project[]> {
    const snapshot = await adminDb
        .collection("projects")
        .orderBy("updatedAt", "desc")
        .get();

    return snapshot.docs.map((doc) => {
        const data = doc.data() as Project;
        return { ...data, id: doc.id };
    });
}

const statusBadges = (project: Project) =>
    [
        { active: project.isActive, label: "Active", variant: "default" as const },
        { active: project.isCollaborated, label: "Collaborated", variant: "secondary" as const },
        { active: project.isClientProject, label: "Client", variant: "outline" as const },
        { active: project.isPublicRepo, label: "Public Repo", variant: "outline" as const },
    ].filter((b) => b.active);

/** Small tech chips with +N overflow */
const TechChips = ({ technologies }: { technologies: string[] }) => {
    if (!technologies?.length) return <span className="text-xs text-muted-foreground">—</span>;
    const shown = technologies.slice(0, 3);
    const rest = technologies.length - shown.length;
    return (
        <div className="flex max-w-[220px] flex-wrap gap-1">
            {shown.map((t) => (
                <Badge key={t} variant="secondary" className="px-1.5 py-0 text-[11px]">
                    {t}
                </Badge>
            ))}
            {rest > 0 && (
                <Badge variant="outline" title={technologies.join(", ")} className="px-1.5 py-0 text-[11px]">
                    +{rest}
                </Badge>
            )}
        </div>
    );
};

export default async function ProjectsPage() {
    const projects = await getProjects();

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Projects</h1>
                    <p className="text-[0.85rem] text-muted-foreground md:text-sm">
                        Manage portfolio projects, update statuses, and keep assets in sync.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/projects/inactive">View Inactive</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/projects/add">Create Project</Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Overview</CardTitle>
                    <CardDescription>A consolidated view of every project in your portfolio.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {projects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center space-y-3 py-16 text-center text-muted-foreground">
                            <p className="text-sm">You haven&apos;t added any projects yet.</p>
                            <Link href="/projects/add">
                                <Button size="sm">Create your first project</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="relative overflow-x-auto">
                            <Table className="[&_th]:whitespace-nowrap">
                                <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                                    <TableRow>
                                        <TableHead className="w-[44%]">Project</TableHead>
                                        <TableHead className="w-[18%]">Status</TableHead>
                                        <TableHead className="w-[20%]">Technology</TableHead>
                                        <TableHead className="hidden w-[12%] lg:table-cell">Updated</TableHead>
                                        <TableHead className="w-[6%] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {projects.map((project, idx) => {
                                        const updatedAt =
                                            "toDate" in project.updatedAt ? project.updatedAt.toDate() : null;

                                        return (
                                            <TableRow
                                                key={project.id}
                                                className={idx % 2 === 0 ? "bg-muted/20" : ""}
                                            >
                                                {/* Project cell (thumb + title + description) */}
                                                <TableCell className="align-top">
                                                    <div className="flex gap-3">
                                                        <div className="relative hidden h-16 w-28 overflow-hidden rounded-md border sm:block">
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
                                                                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                                                    No image
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 space-y-1">
                                                            <Link
                                                                href={`/projects/${project.id}`}
                                                                className="block truncate text-sm font-semibold hover:underline"
                                                                title={project.name}
                                                            >
                                                                {project.name}
                                                            </Link>
                                                            <p
                                                                className="line-clamp-2 max-w-prose text-wrap text-xs text-muted-foreground"
                                                                title={project.description || "No description"}
                                                            >
                                                                {project.description || "No description provided."}
                                                            </p>
                                                            <div className="mt-1 lg:hidden">
                                                                {/* Show updated time on small screens inside main cell */}
                                                                <span className="text-[11px] text-muted-foreground">
                                                                    {updatedAt ? (
                                                                        <span title={updatedAt.toLocaleString()}>
                                                                            {relativeTime(updatedAt)}
                                                                        </span>
                                                                    ) : (
                                                                        "Unknown"
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell className="align-top">
                                                    <div className="flex flex-wrap gap-1">
                                                        {statusBadges(project).map(({ label, variant }) => (
                                                            <Badge key={label} variant={variant}>
                                                                {label}
                                                            </Badge>
                                                        ))}
                                                        {!statusBadges(project).length && (
                                                            <Badge variant="outline">Draft</Badge>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Tech */}
                                                <TableCell className="align-top">
                                                    <TechChips technologies={project.technologies || []} />
                                                </TableCell>

                                                {/* Updated */}
                                                <TableCell className="hidden align-top text-sm text-muted-foreground lg:table-cell">
                                                    {updatedAt ? (
                                                        <span title={updatedAt.toLocaleString()}>
                                                            {relativeTime(updatedAt)}
                                                        </span>
                                                    ) : (
                                                        "Unknown"
                                                    )}
                                                </TableCell>

                                                {/* Actions */}
                                                <TableCell className="align-top">
                                                    <div className="flex justify-end">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                    <span className="sr-only">Open menu</span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-40">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/projects/${project.id}`}>View</Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/projects/${project.id}/edit`}>Edit</Link>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                    <CardDescription>Snapshot of portfolio health.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatTile label="Total projects" value={projects.length} />
                        <StatTile label="Active" value={projects.filter((p) => p.isActive).length} />
                        <StatTile label="Client work" value={projects.filter((p) => p.isClientProject).length} />
                        <StatTile label="Collaborations" value={projects.filter((p) => p.isCollaborated).length} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

const StatTile = ({ label, value }: { label: string; value: number }) => (
    <Card className="border-muted/50">
        <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase text-muted-foreground">
                {label}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-2xl font-semibold">{value}</p>
        </CardContent>
        <Separator />
    </Card>
);
