"use client";

import Link from "next/link";

type Post = {
  guid: string;
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  imageUrl: string | null;
  channelId: number | null;
  channel: {
    link: string;
    id: number;
    title: string;
    description: string;
    feedLink: string;
    language: string;
  } | null;
};

export default function FullPost({ post }: { post: Post }) {
  return (
    <div className="card bg-base-100 w-[640px] shadow-xl">
      {post.imageUrl ? (
        <figure>
          <img src={post.imageUrl} alt="Shoes" width="fit-content" />
        </figure>
      ) : null}
      <div className="card-body">
        <article className="prose">
          <h2>{post.title}</h2>
          <p>{post.pubDate.toLocaleString()}</p>
          <p
            dangerouslySetInnerHTML={{
              __html: post.description.replaceAll("h2", "h3"),
            }}
          ></p>
        </article>
        <div className="divider divider-neutral"></div>
        <div className="card-actions prose justify-between">
          <Link target="_blank" href={post.link}>
            {post.link}
          </Link>
          {post.channel ? <span>{post.channel.title}</span> : null}
        </div>
      </div>
    </div>
  );
}
