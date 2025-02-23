import { unstable_cache } from "next/cache";

import BackButton from "@/components/BackButton";
import FullPost from "@/components/FullPost";
import { prisma } from "@/lib/prisma";

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
  { revalidate: 3600, tags: ["post"] }
);

export default async function Post({ params }: { params: { guid: string } }) {
  const decoded = decodeURIComponent((await params).guid);
  const post = await getPost(decoded);
  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen p-4 sm:px-8 font-[family-name:var(--font-geist-sans)]">
      {post ? (
        <div className="relative">
          <BackButton url="/" alt="Back to overview" />
          <FullPost post={post} />
        </div>
      ) : (
        <p>No Post was found with the given id &quot;{decoded}&quot;</p>
      )}
    </div>
  );
}
