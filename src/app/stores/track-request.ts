import { runInAction } from 'mobx';

/** Every store exposes these two fields so the UI can show spinners and errors. */
export interface RequestState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Runs an API call and keeps the store's `isLoading` / `error` fields up to date.
 * Resolves to `true` on success and `false` on failure (the message is shown in the app's error banner).
 */
export async function trackRequest(store: RequestState, errorMessage: string, work: () => Promise<void>): Promise<boolean> {
  runInAction(() => {
    store.isLoading = true;
    store.error = null;
  });

  try {
    await work();
    return true;
  } catch (error) {
    console.error(errorMessage, error);
    runInAction(() => (store.error = errorMessage));
    return false;
  } finally {
    runInAction(() => (store.isLoading = false));
  }
}
