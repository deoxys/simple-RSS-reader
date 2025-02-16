import FullPost from "@/components/FullPost";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

const getPost = unstable_cache(
  async (guid) => {
    return await prisma.item.findFirst({
      where: { guid: guid },
      include: { channel: true },
      skip: 0,
      take: 10,
    });
  },
  ["post"],
  { revalidate: 3600, tags: ["post"] },
);

export default async function Post({
  params,
}: {
  params: Promise<{ guid: string }>;
}) {
  const decoded = decodeURIComponent((await params).guid);
  const post = await getPost(decoded);
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="grid grid-cols-1 gap-8 row-start-2 items-center sm:items-start">
        {post ? (
          <FullPost post={post} />
        ) : (
          <p>No Post was found with the given id "{decoded}"</p>
        )}
      </main>
    </div>
  );
}
