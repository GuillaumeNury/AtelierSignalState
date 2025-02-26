import { computed, ErrorHandler, inject } from '@angular/core';
import { withLoadingAction } from '@lucca/cdk/signal-store';
import { handleError, onLoadingStateChange } from '@lucca/cdk/utils';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { filter, pipe, switchMap, tap } from 'rxjs';
import { withLangSupport } from './feature/with-lang.feature';
import { withPokemonTypes } from './feature/with-types.feature';
import { Pokemon } from './poke.models';
import { PokemonQuery, PokeService } from './poke.service';

type PokemonState = {
  pokemons: Pokemon[];
  pokemonCount:number;
  search: string;
};

export const PokemonStore = signalStore(
  withState<PokemonState>({
    pokemons: [],
    pokemonCount: 0,
    search: '',
  }),
  withLoadingAction('load'),
  withLangSupport(),
  withPokemonTypes(),
  withComputed(store => ({
    canShowMore: computed(() => store.pokemons().length !== store.pokemonCount()),
    _pokemonQuery: computed((): PokemonQuery | null => {
      const selectedLang = store.selectedLang();
      if (!selectedLang) {
        return null
      }

      const query: PokemonQuery = { lang: selectedLang, search: store.search() };
      const selectedType = store.selectedType();

      if (selectedType) {
        query.typeId = selectedType.id;
      }

      return query;
    })
  })),
  withMethods((store, service = inject(PokeService), errorHandler = inject(ErrorHandler)) => ({
    _loadPokemons: rxMethod<PokemonQuery | null>(
      pipe(
        filter(query => query !== null),
        switchMap(query => service.getPokemons(query).pipe(
          onLoadingStateChange(store.setLoadActionLoading),
          handleError(errorHandler)
        )),
        tap(collection => patchState(store, { pokemons: collection.items, pokemonCount: collection.count })),
      )
    ),
    setSearch(search: string) {
      patchState(store, { search });
    },
  })),
  withHooks((store) => ({
    onInit() {
      store._loadTypes(store.selectedLang);
      store._loadPokemons(store._pokemonQuery);
    }
  })),
);
