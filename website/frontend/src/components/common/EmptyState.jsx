import React from "react";

function EmptyState({
  title,
  subtitle,
  emoji,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="text-7xl mb-8">
        {emoji}
      </div>

      <h2 className="text-4xl font-black mb-4">
        {title}
      </h2>

      <p className="text-white/40 max-w-md">
        {subtitle}
      </p>
    </div>
  );
}

export default EmptyState;