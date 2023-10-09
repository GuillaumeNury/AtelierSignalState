import { Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { OperatorFunction, merge } from 'rxjs';

// type Typify<T> = {
//   [K in keyof T]: T[K] extends object ? Typify<T[K]> : T[K];
// }

export function signalPipe<T, R>(
  signal: Signal<T>,
  operator: OperatorFunction<T, R>,
  options: { requiredSync?: true } | { initialValue: R } = { requiredSync: true },
): Signal<R> {
  const source$ = toObservable(signal);
  const result$ = source$.pipe(operator);

  return 'initialValue' in options
    ? toSignal(result$, { initialValue: options.initialValue })
    : toSignal(result$, { requireSync: true });
}

export function stripUndefinedValues<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Partial<T> = {};

  for (const key in obj) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }

  return result;
}

export type MergeSignalsResult<T extends ReadonlyArray<Signal<unknown>>> = T extends ReadonlyArray<Signal<infer R>> ? Signal<R> : never;

export function mergeSignals<T extends ReadonlyArray<Signal<unknown>>>(...signals: T): MergeSignalsResult<T> {
  return toSignal(merge(...signals.map(s => toObservable(s)))) as MergeSignalsResult<T>;
}
