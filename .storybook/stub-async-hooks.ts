// `src/lib/logging/context.ts` is server-only and keeps the request context in an AsyncLocalStorage.
// Vite externalises node:async_hooks to a module that exports nothing, so the preview build cannot
// resolve it. Nothing in a story writes to the log context; the graph just has to resolve.
export class AsyncLocalStorage<T> {
	getStore(): T | undefined {
		return undefined;
	}
	run<R>(_store: T, callback: () => R): R {
		return callback();
	}
	enterWith(_store: T): void {}
	exit<R>(callback: () => R): R {
		return callback();
	}
	disable(): void {}
}
