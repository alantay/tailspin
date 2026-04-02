import MediaCard from "@/components/MediaCard";
import type { UploadRow } from "@/lib/types";

type Props = {
  uploads: UploadRow[];
  petName: string;
};

export default function PhotoGrid({ uploads, petName }: Props) {
  if (uploads.length === 0) {
    return (
      <div className="mt-16 text-center">
        <p className="text-4xl mb-3">😴</p>
        <p className="font-semibold">Nothing here yet.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your boarder is probably busy giving belly rubs. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {uploads.map((upload) => (
        <MediaCard key={upload.id} upload={upload} petName={petName} />
      ))}
    </div>
  );
}
