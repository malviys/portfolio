import { PrototypeClient } from "@/components/prototype/prototype-client";
import { getBlogPosts } from "@/lib/blog";

export default async function Home() {
  const allPosts = await getBlogPosts();
  const topPosts = allPosts
    .filter((post) => !post.section)
    .slice(0, 3)
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.publishedAt || post.createdAt || new Date().toISOString(),
      tags: post.tags ?? [],
    }));

  return <PrototypeClient posts={topPosts} />;
}
