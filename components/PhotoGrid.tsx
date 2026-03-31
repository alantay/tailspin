import Image from "next/image";
import type { UploadRow } from "@/lib/types";
import { relativeTime } from "@/lib/utils";

type Props = {
  uploads: UploadRow[];
  petName: string;
};

export default function PhotoGrid({ uploads, petName }: Props) {
  if (uploads.length === 0) {
    return (
      <div className="mt-12 text-center text-neutral-400">
        <p>No photos yet.</p>
        <p className="mt-1 text-sm">Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {uploads.map((upload) => (
        <div key={upload.id}>
          <div className="overflow-hidden rounded-2xl">
            <Image
              src={upload.file_url}
              alt={upload.caption ?? petName}
              width={800}
              height={600}
              className="w-full object-cover"
            />
          </div>
          <div className="mt-2 flex items-start justify-between gap-2 px-1">
            {upload.caption ? (
              <p className="text-sm text-neutral-700">{upload.caption}</p>
            ) : (
              <span />
            )}
            <p className="shrink-0 text-xs text-neutral-400">
              {relativeTime(upload.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
