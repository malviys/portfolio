import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// Keep this consistent with the previous shape used in page components
export interface BlogPost {
  title: string;
  description: string;
  createdAt?: string;
  publishedAt?: string;
  updatedAt?: string;
  slug: string;
  tags?: string[];
  content: string;
}

const contentDirectory = path.join(process.cwd(), "src/content");

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (!fs.existsSync(contentDirectory)) return [];

  const fileNames = fs.readdirSync(contentDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(contentDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      const matterResult = matter(fileContents);

      return {
        slug,
        title: matterResult.data.title || "",
        description: matterResult.data.description || "",
        createdAt: matterResult.data.createdAt || matterResult.data.date, // fallback for legacy data
        publishedAt: matterResult.data.publishedAt,
        updatedAt: matterResult.data.updatedAt,
        tags: matterResult.data.tags || [],
        content: matterResult.content,
        // include any other meta from gray-matter
      } as BlogPost;
    });

  return allPostsData.sort((a, b) => {
    const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
    const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
    return dateB - dateA;
  });
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  const fullPath = path.join(contentDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return undefined;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);

  return {
    slug,
    title: matterResult.data.title || "",
    description: matterResult.data.description || "",
    createdAt: matterResult.data.createdAt || matterResult.data.date,
    publishedAt: matterResult.data.publishedAt,
    updatedAt: matterResult.data.updatedAt,
    tags: matterResult.data.tags || [],
    content: matterResult.content,
  } as BlogPost;
}
