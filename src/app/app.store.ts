
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, pipe, switchMap, tap } from 'rxjs';
import { withCollectionFeature, withLanguageFeature, withPaginationFeature, withTypesFeature } from './features';
import { Pokemon } from './poke.models';
import { PokeService, PokemonQuery } from './poke.service';
import { signalPipe, stripUndefinedValues } from './utils';
import { computed, inject } from '@angular/core';

type PokeState = {
  search: string;
}

export const PokeStore = signalStore(
  withState<PokeState>({
    search: '',
  }),
  withCollectionFeature<Pokemon>(),
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
      tap(collection => {
        store.page() === 1 ? store.setCollection(collection) : store.mergeCollection(collection)
    }),
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
