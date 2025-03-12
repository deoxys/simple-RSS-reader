"use client";

import { Channel, Item } from "@prisma/client";
import { Calendar } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface NewsCardProps {
  item: Item & { channel: Channel | null };
}

export default function NewsCard({ item }: NewsCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Format the publication date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Extract a short excerpt from the content
  const getExcerpt = (content: string, maxLength = 150) => {
    // Remove HTML tags
    const plainText = content.replace(/<[^>]+>/g, "");

    if (plainText.length <= maxLength) return plainText;

    // Find the last space before maxLength
    const lastSpace = plainText.substring(0, maxLength).lastIndexOf(" ");
    return `${plainText.substring(0, lastSpace)}...`;
  };

  return (
    <Card className={`h-full flex flex-col border w-full max-w-lg`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {item.title}
            </a>
          </CardTitle>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="w-fit">
            {item.channel?.title}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {item.imageUrl && !imageError && (
          <div className="mb-4 overflow-hidden rounded-md w-full">
            <div
              className={`w-full transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            >
              <Image
                src={item.imageUrl || "/placeholder.svg"}
                alt={item.title}
                width={500}
                height={300}
                className="w-full h-auto rounded-md"
                style={{ maxWidth: "100%" }}
                onError={() => setImageError(true)}
                onLoad={() => setImageLoaded(true)}
                priority={false}
              />
            </div>
          </div>
        )}
        <CardDescription className="text-sm dark:text-gray-300">
          {getExcerpt(item.description)}
        </CardDescription>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground flex items-center">
        <Calendar className="h-3 w-3 mr-1" />
        {formatDate(item.pubDate)}
      </CardFooter>
    </Card>
  );
}
