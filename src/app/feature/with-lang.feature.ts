import { inject } from "@angular/core";
import { patchState, signalStoreFeature, withHooks, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap, tap } from "rxjs";
import { PokeService } from "../poke.service";

type LangSupportState = {
  langs: string[];
  selectedLang: string | null;
}

export const withLangSupport = () => signalStoreFeature(
  withState<LangSupportState>({
    langs: [],
    selectedLang: null,
  }),
  withMethods((store, service = inject(PokeService)) => ({
    _loadLangs: rxMethod<void>(
      pipe(
        switchMap(() => service.getLanguages()),
        tap(langs => patchState(store, { langs, selectedLang: langs[0] })),
      )
    ),
    setLang(selectedLang: string) {
      patchState(store, { selectedLang });
    },
  })),
  withHooks((store) => ({
    onInit() {
      store._loadLangs();
    }
  }))
);
