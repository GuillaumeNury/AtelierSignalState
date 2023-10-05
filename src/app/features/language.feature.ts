import { inject } from '@angular/core';
import { patchState, signalStoreFeature, type, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { PokeService } from '../poke.service';

export type LanguageFeatureState = {
  languages: string[];
  selectedLang: string;
}

export function withLanguageFeature() {
  return signalStoreFeature(
    { methods: type<{ resetPage: () => void }>() },
    withState<LanguageFeatureState>({ languages: [], selectedLang: 'en' }),
    withMethods((store, pokeService = inject(PokeService)) => ({
      loadLanguages: rxMethod<void>(pipe(
        switchMap(() => pokeService.getLanguages()),
        tap(languages => patchState(store, { languages })),
      )),
      setLang: (selectedLang: string) => {
        patchState(store, { selectedLang });
        store.resetPage();
      },
    })),
    withHooks({
      onInit(store) {
        store.loadLanguages();
      },
    }),
  );
}
