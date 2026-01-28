"use client";

import { useState } from "react";

type RatingModalProps = {
  projectId: string | null;
  onClose: () => void;
  onSubmit: (rating: number) => void;
};

export function RatingModal({ onClose, onSubmit }: RatingModalProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  function handleSubmit() {
    if (selectedRating) {
      onSubmit(selectedRating);
      onClose();
    }
  }

  function handleSkip() {
    onClose();
  }

  const displayRating = hoveredRating ?? selectedRating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-4 text-center">
          <h2 className="text-lg font-semibold text-white">
            How does this look?
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Rate this draft to help us improve
          </p>
        </div>

        <div className="mb-6 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => setSelectedRating(rating)}
              onMouseEnter={() => setHoveredRating(rating)}
              onMouseLeave={() => setHoveredRating(null)}
              className={`text-3xl transition-transform hover:scale-110 ${
                displayRating && rating <= displayRating
                  ? "text-yellow-400"
                  : "text-zinc-600"
              }`}
              aria-label={`Rate ${rating} stars`}
            >
              ★
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedRating}
            className="flex-1 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
