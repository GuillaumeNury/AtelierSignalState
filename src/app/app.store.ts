
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, pipe, switchMap, tap } from 'rxjs';
import { withLanguageFeature } from './features';
import { PokemonCollection, PokemonType } from './poke.models';
import { PokeService, PokemonQuery } from './poke.service';
import { signalPipe, stripUndefinedValues } from './utils';
import { computed, inject } from '@angular/core';

type PokeState = {
  types: PokemonType[];
  collection: PokemonCollection;
  page: number;
  selectedTypeId: number | undefined;
  search: string;
}

export const PokeStore = signalStore(
  withLanguageFeature(),
  withState<PokeState>({
    types: [],
    collection: { count: 0, items: [] },
    page: 1,
    search: '',
    selectedTypeId: undefined,
  }),
  withComputed((store) => ({
    debouncedSearch: signalPipe(store.search, debounceTime(300), { requiredSync: true }),
  })),
  withComputed((store) => ({
    pokemonQuery: computed(() => stripUndefinedValues({
      page: store.page(),
      typeId: store.selectedTypeId(),
      search: store.debouncedSearch(),
      lang: store.selectedLang(),
    })),
  })),
  withMethods((store, pokeService = inject(PokeService)) => ({
    loadTypes: rxMethod<string>(pipe(
      switchMap(lang => pokeService.getTypes({ lang })),
      tap(types => patchState(store, { types }))
    )),
    loadLanguages: rxMethod<void>(pipe(
      switchMap(() => pokeService.getLanguages()),
      tap(languages => patchState(store, { languages }))
    )),
    loadPokemons: rxMethod<PokemonQuery>(pipe(
      switchMap(query => pokeService.getPokemons(query)),
      tap(collection => patchState(store, s => ({
        collection: store.page() === 1 ? collection : {
          count: collection.count,
          items: [...s.collection.items, ...collection.items],
        },
      })))
    )),
    setTypeId(typeId: number | undefined) {
      patchState(store, { selectedTypeId: typeId === store.selectedTypeId() ? undefined : typeId, page: 1 });
    },
    setSearch(search: string) {
      patchState(store, { search, page: 1 });
    },
    loadMore() {
      patchState(store, { page: store.page() + 1 });
    },
  })),
  withHooks({
    onInit(store) {
      store.loadTypes(store.selectedLang);
      store.loadPokemons(store.pokemonQuery);
    },
  })
);
