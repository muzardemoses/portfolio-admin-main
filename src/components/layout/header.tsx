"use client";

import { Fragment, useMemo } from "react";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { navConfig } from "@/lib/nav";

type Crumb = {
  title: string;
  href: string;
};

const trimTrailingSlash = (path: string) =>
  path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;

const formatSegment = (segment: string) =>
  segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const allSubNavItems = navConfig.navMain.flatMap((item) => item.items ?? []);

const pushCrumb = (crumbs: Crumb[], title: string, href: string) => {
  const cleanedHref = href === "" ? "/" : trimTrailingSlash(href) || "/";
  if (!crumbs.some((crumb) => crumb.href === cleanedHref)) {
    crumbs.push({ title, href: cleanedHref });
  }
};

export const Header = () => {
  const pathname = trimTrailingSlash(usePathname() || "/");

  const crumbs = useMemo<Crumb[]>(() => {
    const entries: Crumb[] = [];

    const rootItem = navConfig.navMain.find((item) => item.url === "/");
    pushCrumb(entries, rootItem?.title ?? "Dashboard", rootItem?.url ?? "/");

    if (pathname === "/") {
      return entries;
    }

    const segments = pathname.split("/").filter(Boolean);
    let accumulator = "";

    segments.forEach((segment) => {
      accumulator += `/${segment}`;
      const currentPath = trimTrailingSlash(accumulator);

      const mainMatch = navConfig.navMain.find(
        (item) => trimTrailingSlash(item.url) === currentPath && item.url !== "/"
      );
      if (mainMatch) {
        pushCrumb(entries, mainMatch.title, mainMatch.url);
        return;
      }

      const subMatch = allSubNavItems.find(
        (item) => trimTrailingSlash(item.url) === currentPath
      );
      if (subMatch) {
        pushCrumb(entries, subMatch.title, subMatch.url);
        return;
      }

      const projectMatch = navConfig.projects.find(
        (project) => trimTrailingSlash(project.url) === currentPath
      );
      if (projectMatch) {
        if (!entries.some((crumb) => crumb.href === "/projects")) {
          pushCrumb(entries, "Projects", "/projects");
        }
        pushCrumb(entries, projectMatch.name, projectMatch.url);
        return;
      }

      pushCrumb(entries, formatSegment(segment), currentPath);
    });

    return entries;
  }, [pathname]);

  return (
    <header className="bg-background w-full sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            const itemClassName = index === 0 ? "hidden md:block" : undefined;

            return (
              <Fragment key={`${crumb.href}-${crumb.title}`}>
                <BreadcrumbItem className={itemClassName}>
                  {isLast ? (
                    <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.href}>
                      {crumb.title}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && (
                  <BreadcrumbSeparator
                    className={index === 0 ? "hidden md:block" : undefined}
                  />
                )}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
};
