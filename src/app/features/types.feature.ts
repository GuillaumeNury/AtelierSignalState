import { inject } from '@angular/core';
import { patchState, signalStoreFeature, type, withHooks, withMethods, withState } from '@ngrx/signals';
import { pipe, switchMap, tap } from 'rxjs';
import { PokemonType } from '../poke.models';
import { PokeService } from '../poke.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

export type TypesFeatureState = {
  types: PokemonType[];
  selectedTypeId: number | undefined;
}

export function withTypesFeature() {
  return signalStoreFeature(
    {
      // selectedLang should be available in the state
      state: type<{ selectedLang: string }>(),
      methods: type<{ resetPage: () => void }>(),
    },
    withState<TypesFeatureState>({ types: [], selectedTypeId: undefined }),
    withMethods((store, pokeService = inject(PokeService)) => ({
      loadTypes: rxMethod<string>(pipe(
        switchMap(lang => pokeService.getTypes({ lang })),
        tap(types => patchState(store, { types })),
      )),
      setPokemonTypeId: (selectedTypeId: number | undefined) => {
        patchState(store, {
          selectedTypeId: store.selectedTypeId() === selectedTypeId ? undefined : selectedTypeId,
        });
        store.resetPage();
      },
    })),
    withHooks({
      onInit(store) {
        store.loadTypes(store.selectedLang);
      },
    }),
  );
}
