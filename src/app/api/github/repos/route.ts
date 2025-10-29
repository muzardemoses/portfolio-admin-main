import { NextResponse } from "next/server";
import type { GitHubRepo as GitHubRepoResponse } from "@/types/project";

const GITHUB_API_BASE = "https://api.github.com";

export async function GET() {
  const token = process.env.GITHUB_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json(
      { message: "GitHub access token not configured." },
      { status: 500 }
    );
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/user/repos?per_page=100&sort=updated`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
      next: { revalidate: 60 },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return NextResponse.json(
      { message: "Unable to fetch repositories from GitHub", error },
      { status: response.status }
    );
  }

  const data = (await response.json()) as GitHubRepoResponse[];

  const mapped = data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    html_url: repo.html_url,
    homepage: repo.homepage,
    language: repo.language,
    topics: repo.topics,
    updated_at: repo.updated_at,
    owner: {
      login: repo.owner.login,
      avatar_url: repo.owner.avatar_url,
      html_url: repo.owner.html_url,
    },
    private: repo.private,
  }));

  return NextResponse.json(mapped);
}
