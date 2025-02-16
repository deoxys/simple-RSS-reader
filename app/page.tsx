import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import Link from "next/link";

const getPosts = unstable_cache(
  async () => {
    return await prisma.item.findMany({ orderBy: { pubDate: "desc" } });
  },
  ["posts"],
  { revalidate: 3600, tags: ["posts"] },
);

export default async function Home() {
  const allPosts = await getPosts();
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="grid grid-cols-2 gap-8 row-start-2 items-center sm:items-start">
        {allPosts.map((post, key) => (
          <div key={key} className="card bg-base-100 w-[30em] shadow-xl">
            {post.imageUrl ? (
              <figure>
                <img src={post.imageUrl} alt="Shoes" width="fit-content" />
              </figure>
            ) : null}
            <div className="card-body prose">
              <h3>{post.title}</h3>
              <div className="card-actions justify-end">
                <button className="btn btn-primary">Read</button>
                <Link
                  href={`/post/${encodeURIComponent(post.guid)}`}
                  className="btn btn-secondary"
                >
                  Open Link
                </Link>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
