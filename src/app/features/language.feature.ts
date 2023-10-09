import { inject } from '@angular/core';
import { signalStoreFeature, withState, withMethods, rxMethod, withHooks, SignalStateUpdater } from '@ngrx/signal-store';
import { pipe, switchMap, tap } from 'rxjs';
import { PokeService } from '../poke.service';

export type LanguageFeatureState = {
  languages: string[];
  selectedLang: string;
}

export function withLanguageFeature() {
  return signalStoreFeature(
    withState<LanguageFeatureState>({ languages: [], selectedLang: 'en' }),
    withMethods(({ $update }, pokeService = inject(PokeService)) => ({
      loadLanguages: rxMethod<void>(pipe(
        switchMap(() => pokeService.getLanguages()),
        tap(languages => $update({ languages })),
      )),
    })),
    withHooks({
      onInit(store) {
        store.loadLanguages();
      },
    }),
  );
}

export function setLang(selectedLang: string): SignalStateUpdater<LanguageFeatureState> {
  return { selectedLang };
}
