"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";

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
    <Modal onClose={onClose} size="sm">
      <div className="mb-4 text-center">
        <h2 className="font-serif text-lg text-fg">How does this look?</h2>
        <p className="mt-1 text-sm text-fg-muted">
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
                ? "text-star"
                : "text-fg-subtle"
            }`}
            aria-label={`Rate ${rating} stars`}
          >
            ★
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={handleSkip} className="flex-1">
          Skip
        </Button>
        <Button
          variant="primary"
          disabled={!selectedRating}
          onClick={handleSubmit}
          className="flex-1"
        >
          Submit
        </Button>
      </div>
    </Modal>
  );
}
