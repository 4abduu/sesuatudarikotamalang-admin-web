"use client";

import { useMemo, useState } from "react";

export interface UseClientPaginationOptions {
  pageSize?: number;
  resetKey?: string | number | null;
}

export interface UseClientPaginationReturn<T> {
  pageItems: T[];
  page: number;
  setPage: (page: number | ((prev: number) => number)) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  total: number;
  totalPages: number;
}

export function useClientPagination<T>(
  items: T[],
  options: UseClientPaginationOptions = {}
): UseClientPaginationReturn<T> {
  const { pageSize: initialPageSize = 10, resetKey } = options;
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);
  const [prevResetKey, setPrevResetKey] = useState(resetKey);

  // Jika resetKey berubah (misal filter/search berubah), kembali ke halaman 1
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setPage(1);
  }

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Clamp page jika data berkurang
  const validPage = Math.min(Math.max(1, page), totalPages);
  if (validPage !== page) {
    setPage(validPage);
  }

  const pageItems = useMemo(() => {
    const start = (validPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, validPage, pageSize]);

  return {
    pageItems,
    page: validPage,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalPages,
  };
}

