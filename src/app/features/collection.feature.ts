import { computed } from '@angular/core';
import { SignalStateUpdater, signalStoreFeature, withSignals, withState } from '@ngrx/signal-store';

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
    withSignals(({ collection }) => ({
      hasMoreResults: computed(() => collection.items().length < collection.count()),
    })),
  );
}

export function mergeCollection<T>(collection: Collection<T>): SignalStateUpdater<CollectionFeatureState<T>> {
  return state => ({
    collection: {
      items: [...state.collection.items, ...collection.items],
      count: state.collection.count,
    },
  });
}

export function setCollection<T>(collection: Collection<T>): SignalStateUpdater<CollectionFeatureState<T>> {
  return { collection };
}
