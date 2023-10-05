
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, pipe, switchMap, tap } from 'rxjs';
import { withLanguageFeature, withPaginationFeature, withTypesFeature } from './features';
import { PokemonCollection, PokemonType } from './poke.models';
import { PokeService, PokemonQuery } from './poke.service';
import { signalPipe, stripUndefinedValues } from './utils';
import { computed, inject } from '@angular/core';

type PokeState = {
  collection: PokemonCollection;
  search: string;
}

export const PokeStore = signalStore(
  withState<PokeState>({
    collection: { count: 0, items: [] },
    search: '',
  }),
  withPaginationFeature(),
  withLanguageFeature(),
  withTypesFeature(),
  withComputed((store) => ({
    debouncedSearch: signalPipe(store.search, debounceTime(300), { initialValue: store.search() }),
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
    loadPokemons: rxMethod<PokemonQuery>(pipe(
      switchMap(query => pokeService.getPokemons(query)),
      tap(collection => patchState(store, s => ({
        collection: store.page() === 1 ? collection : {
          count: collection.count,
          items: [...s.collection.items, ...collection.items],
        },
      })))
    )),
    setSearch(search: string) {
      patchState(store, { search });
      store.resetPage();
    },
  })),
  withHooks({
    onInit(store) {
      store.loadPokemons(store.pokemonQuery);
    },
  })
);
