import { inject } from '@angular/core';
import { signalStoreFeature, withState, withMethods, withHooks, type } from '@ngrx/signals';
import { pipe, switchMap, tap } from 'rxjs';
import { PokeService } from '../poke.service';
import { patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

export type LanguageFeatureState = {
  languages: string[];
  selectedLang: string;
}

export function withLanguageFeature() {
  return signalStoreFeature(
    { state: type<{ page: number }>() },
    withState<LanguageFeatureState>({ languages: [], selectedLang: 'en' }),
    withMethods((store, pokeService = inject(PokeService)) => ({
      loadLanguages: rxMethod<void>(pipe(
        switchMap(() => pokeService.getLanguages()),
        tap(languages => patchState(store, { languages })),
      )),
      setLang: (selectedLang: string) => patchState(store, { selectedLang, page: 1 }),
    })),
    withHooks({
      onInit(store) {
        store.loadLanguages();
      },
    }),
  );
}
