'use client';

import { useParams as useNextParams } from 'next/navigation';

export function useParams() {
  return useNextParams();
}