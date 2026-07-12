type PostMediaGridProps = {
  images: string[];
};

export function PostMediaGrid({ images }: PostMediaGridProps) {
  const items = images.slice(0, 4);
  const shellClassName =
    'overflow-hidden rounded-2xl border border-[#f2d9a8]/10 bg-[#05070d]/50';

  if (items.length === 1) {
    return (
      <div className={shellClassName}>
        <PostMediaImage
          src={items[0]!}
          className="max-h-[min(510px,70vh)] w-full object-cover"
        />
      </div>
    );
  }

  if (items.length === 2) {
    return (
      <div className={`grid h-[254px] grid-cols-2 gap-px ${shellClassName}`}>
        {items.map(src => (
          <PostMediaImage
            key={src}
            src={src}
            className="size-full object-cover"
          />
        ))}
      </div>
    );
  }

  if (items.length === 3) {
    return (
      <div
        className={`grid h-[254px] grid-cols-2 grid-rows-2 gap-px ${shellClassName}`}
      >
        <PostMediaImage
          src={items[0]!}
          className="row-span-2 size-full object-cover"
        />
        <PostMediaImage src={items[1]!} className="size-full object-cover" />
        <PostMediaImage src={items[2]!} className="size-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`grid h-[254px] grid-cols-2 grid-rows-2 gap-px ${shellClassName}`}
    >
      {items.map(src => (
        <PostMediaImage
          key={src}
          src={src}
          className="size-full object-cover"
        />
      ))}
    </div>
  );
}

function PostMediaImage({
  src,
  className,
}: {
  src: string;
  className: string;
}) {
  return (
    <div className="overflow-hidden bg-[#05070d]/80">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className={className} loading="lazy" />
    </div>
  );
}
