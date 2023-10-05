import { inject } from '@angular/core';
import { SignalStateUpdater, rxMethod, signalStoreFeature, type, withHooks, withMethods, withState } from '@ngrx/signal-store';
import { pipe, switchMap, tap } from 'rxjs';
import { PokemonType } from '../poke.models';
import { PokeService } from '../poke.service';

export type TypesFeatureState = {
  types: PokemonType[];
  selectedTypeId: number | undefined;
}

export function withTypesFeature() {
  return signalStoreFeature(
    {
      // selectedLang should be available in the state
      state: type<{ selectedLang: string }>(),
    },
    withState<TypesFeatureState>({ types: [], selectedTypeId: undefined }),
    withMethods(({ $update }, pokeService = inject(PokeService)) => ({
      loadTypes: rxMethod<string>(pipe(
        switchMap(lang => pokeService.getTypes({ lang })),
        tap(types => $update({ types })),
      )),
    })),
    withHooks({
      onInit(store) {
        store.loadTypes(store.selectedLang);
      },
    }),
  );
}

export function setPokemonTypeId(selectedTypeId: number | undefined): SignalStateUpdater<TypesFeatureState> {
  return s => ({ selectedTypeId: s.selectedTypeId === selectedTypeId ? undefined : selectedTypeId });
}
