import { inject } from "@angular/core";
import { patchState, signalStoreFeature, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { filter, pipe, switchMap, tap } from "rxjs";
import { PokemonType } from "../poke.models";
import { PokeService } from "../poke.service";

type PokemonTypeState = {
  types: PokemonType[];
  selectedType: PokemonType | null;
};

export function withPokemonTypes() {
  return signalStoreFeature(
    withState<PokemonTypeState>({
      types: [],
      selectedType: null,
    }),
    withMethods((store, service = inject(PokeService)) => ({
      _loadTypes: rxMethod<string | null>(
        pipe(
          filter(lang => lang !== null),
          switchMap(lang => service.getTypes({ lang })),
          tap(types => patchState(store, { types })),
        )
      ),
      toggleType(type: PokemonType) {
        patchState(store, { selectedType: type === store.selectedType() ? null : type });
      },
    })),
  )
}
