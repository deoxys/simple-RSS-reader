"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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
  const [dateTime, setDateTime] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setDateTime(new Date(post.pubDate).toLocaleString());
    setDescription(post.description.replaceAll("h2", "h3"));
  }, [post.description, post.pubDate]);

  return (
    <div className="card rounded-none sm:rounded-xl bg-base-100 sm:w-[640px] shadow-xl">
      {post.imageUrl ? (
        <figure className="h-90">
          <Image
            src={post.imageUrl}
            alt="Post Image"
            width={640}
            height={100}
          />
        </figure>
      ) : null}
      <div className="card-body">
        <article className="prose">
          <h2>{post.title}</h2>
          <p>{dateTime}</p>
          <p
            dangerouslySetInnerHTML={{
              __html: description,
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
