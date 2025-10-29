"use client";

import type { CreateProjectForm, GalleryPreview, ProjectImage } from "@/types/project";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { UseFormSetValue } from "react-hook-form";
import { ChangeEvent } from "react";


interface GalleryImageProps {
    item: ProjectImage;
    gallery: ProjectImage[];
    galleryFiles: (File | undefined)[];
    galleryPreviews: GalleryPreview[];
    index: number;
    setValue: UseFormSetValue<CreateProjectForm>;
    clearGalleryFile: (index: number) => void;
    projectNameValue: string;
    handleGalleryFileChange: (index: number, event: ChangeEvent<HTMLInputElement>) => void;
    removeGalleryItem: (index: number) => void;
}

export const GalleryImage = (props: GalleryImageProps) => {
    const {
        item,
        gallery,
        galleryFiles,
        galleryPreviews,
        index,
        setValue,
        clearGalleryFile,
        projectNameValue,
        handleGalleryFileChange,
        removeGalleryItem,
    } = props;

    const imageURL = galleryPreviews[index]?.url || item.url || "";
    const previewSrc = imageURL.trim();
    const hasPreview = previewSrc.length > 0;

    const altText = item.alt || `${projectNameValue || "Project"} screenshot ${index + 1}`;


    return (
        <>
            <Card key={`gallery-${index}`} className="border-muted/40">
                <CardContent className="grid md:grid-cols-[repeat(2,minmax(0,1fr))] gap-4 pt-6">
                    <div className="grid gap-2">
                        <Label htmlFor={`gallery-url-${index}`}>Image URL</Label>
                        <Input
                            id={`gallery-url-${index}`}
                            type="url"
                            value={item.url}
                            onChange={(event) => {
                                const newGallery = [...gallery];
                                newGallery[index] = {
                                    ...newGallery[index],
                                    url: event.target.value,
                                };
                                setValue("gallery", newGallery, { shouldDirty: true });
                            }}
                            disabled
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`gallery-alt-${index}`}>Alt text</Label>
                        <Input
                            id={`gallery-alt-${index}`}
                            value={item.alt}
                            onChange={(event) => {
                                const newGallery = [...gallery];
                                newGallery[index] = {
                                    ...newGallery[index],
                                    alt: event.target.value,
                                };
                                setValue("gallery", newGallery, { shouldDirty: true });
                            }}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`gallery-file-${index}`}>Upload image</Label>
                        <Input
                            id={`gallery-file-${index}`}
                            type="file"
                            accept="image/*"
                            onChange={(event) => handleGalleryFileChange(index, event)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Uploading a file will override the URL above for this image.
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => clearGalleryFile(index)}
                            disabled={!galleryFiles[index]}
                        >
                            Clear upload
                        </Button>
                    </div>
                    <div className="md:col-span-2 rounded-md border border-dashed p-2">
                        {hasPreview ? (
                            <Image
                                src={previewSrc}
                                alt={altText}
                                className="h-40 w-auto max-w-full rounded-md object-cover"
                                width={160}
                                height={160}
                            />
                        ) : (
                            <span className="text-xs text-muted-foreground">Image preview will appear here</span>
                        )}
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeGalleryItem(index)}
                            disabled={gallery.length <= 1}
                        >
                            Remove
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
