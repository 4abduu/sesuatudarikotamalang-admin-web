"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { reviews as seedReviews, type Review } from "@/data/reviews";

/**
 * Client-side review store. Seeded from the static product/store reviews so
 * the katalog + product detail pages still show existing reviews, while new
 * reviews submitted from `/akun/ulasan` are appended (and persisted).
 */
type ReviewsState = {
  reviews: Review[];
  addReview: (review: Review) => void;
};

export const useUserReviews = create<ReviewsState>()(
  persist(
    (set) => ({
      reviews: seedReviews,
      addReview: (review) =>
        set((s) => ({ reviews: [review, ...s.reviews] })),
    }),
    { name: "sdkm-user-reviews" },
  ),
);
