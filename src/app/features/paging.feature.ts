import { SignalStateUpdater, signalStoreFeature, withMethods, withState } from '@ngrx/signal-store';

export type PaginationFeatureState = {
  page: number;
};

export function withPaginationFeature() {
  return signalStoreFeature(
    withState<{ page: number }>({ page: 1 }),
    withMethods(({ $update, page }) => ({
      loadMore() {
        $update({ page: page() + 1 });
      },
    })),
  )
}

export function resetPage(): SignalStateUpdater<PaginationFeatureState> {
  return { page: 1 };
}
