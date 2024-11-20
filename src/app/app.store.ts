import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { PokemonCollection } from './poke.models';
import { PokemonQuery, PokeService } from './poke.service';

type PokeState = {
  collection: PokemonCollection;
  selectedLang: string;
};

export const PokeStore = signalStore(
  withState<PokeState>({
    collection: {
      count: 0,
      items: [],
    },
    selectedLang: 'en',
  }),
  withComputed((store) => ({
    pokemonQuery: computed<PokemonQuery>(() => ({
      lang: store.selectedLang(),
    })),
  })),
  withMethods((store, pokemonService = inject(PokeService)) => ({
    setLang: (selectedLang: string) => patchState(store, { selectedLang }),
    loadPokemon: rxMethod<PokemonQuery>(
      switchMap((query) =>
        pokemonService
          .getPokemons(query)
          .pipe(tap((collection) => patchState(store, { collection })))
      )
    ),
  })),
  withHooks({
    onInit(store) {
      store.loadPokemon(store.pokemonQuery);
    },
  })
);
