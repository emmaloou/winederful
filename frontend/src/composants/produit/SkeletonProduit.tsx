'use client';

export default function SkeletonProduit() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-200 animate-pulse">
      {/* Image skeleton */}
      <div className="relative h-72 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
      </div>

      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        {/* Badges */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
        </div>

        {/* Titre */}
        <div className="space-y-2">
          <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
        </div>

        {/* Producteur */}
        <div className="h-5 w-2/3 bg-gray-200 rounded"></div>

        {/* Région */}
        <div className="h-8 w-full bg-gray-100 rounded-xl"></div>

        {/* Prix et bouton */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="space-y-1">
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
            <div className="h-3 w-32 bg-gray-100 rounded"></div>
          </div>
          <div className="h-12 w-28 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
}
