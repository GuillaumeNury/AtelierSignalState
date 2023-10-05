import { computed } from '@angular/core';
import { patchState, signalStoreFeature, withComputed, withMethods, withState } from '@ngrx/signals';

export type Collection<T> = {
  items: T[];
  count: number;
};

export type CollectionFeatureState<T> = {
  collection: Collection<T>;
};

export function withCollectionFeature<T>() {
  return signalStoreFeature(
    withState<CollectionFeatureState<T>>({
      collection: {
        items: [],
        count: 0,
      },
    }),
    withComputed(({ collection }) => ({
      hasMoreResults: computed(() => collection.items().length < collection.count()),
    })),
    withMethods((store) => ({
      setCollection: (collection: Collection<T>) => {
        patchState(store, { collection });
      },
      mergeCollection: (collection: Collection<T>) => {
        patchState(store, {
          collection: {
            items: [...store.collection.items(), ...collection.items],
            count: store.collection.count(),
          },
        });
      }
    })),
  );
}
