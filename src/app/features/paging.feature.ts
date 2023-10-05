import { signalStoreFeature, withMethods, withState } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';

export type PaginationFeatureState = {
  page: number;
};

export function withPaginationFeature() {
  return signalStoreFeature(
    withState<{ page: number }>({ page: 1 }),
    withMethods((store) => ({
      loadMore() {
        patchState(store, { page: store.page() + 1 });
      },
      resetPage() {
        patchState(store, { page: 1 });
      },
    })),
  )
}
