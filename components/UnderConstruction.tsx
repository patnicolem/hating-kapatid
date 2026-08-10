import { Construction } from "lucide-react";

type UnderConstructionProps = {
  title: string;
  description: string;
};

export default function UnderConstruction({
  title,
  description,
}: UnderConstructionProps) {
  return (
    <div className="
      flex
      min-h-[calc(100vh-4rem)]
      items-center
      justify-center
      px-6
      py-12
    ">
      <div className="
        w-full
        max-w-xl
        rounded-2xl
        border
        border-hk-border
        bg-hk-surface
        px-8
        py-12
        text-center
        shadow-sm
      ">

        {/* Icon */}
        <div className="
          mx-auto
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-full
          bg-hk-accent
          text-hk-primary
        ">
          <Construction size={32} />
        </div>

        {/* Title */}
        <h1 className="
          mt-6
          text-3xl
          font-bold
          text-hk-primary
        ">
          {title}
        </h1>

        {/* Description */}
        <p className="
          mx-auto
          mt-3
          max-w-md
          text-hk-text-secondary
        ">
          {description}
        </p>

        {/* Status */}
        <div className="
          mt-6
          inline-flex
          items-center
          rounded-full
          border
          border-hk-border
          bg-hk-background
          px-4
          py-2
          text-sm
          font-medium
          text-hk-text-secondary
        ">
          🚧 Under Construction
        </div>

      </div>
    </div>
  );
}