import { Accessor, createEffect, createSignal, onCleanup } from "solid-js";

export interface GsiScriptLoadOptions {
	/**
	 * Nonce applied to GSI script tag. Propagates to GSI's inline style tag
	 */
	nonce?: string;
	/**
	 * Callback fires on load [gsi](https://accounts.google.com/gsi/client) script success
	 */
	onScriptLoadSuccess?: () => void;
	/**
	 * Callback fires on load [gsi](https://accounts.google.com/gsi/client) script failure
	 */
	onScriptLoadError?: () => void;
}

export function createGsiScriptLoad(options: GsiScriptLoadOptions = {}): Accessor<boolean> {
	const [scriptLoaded, setScriptLoaded] = createSignal(false);

	createEffect(() => {
		let script = document.querySelector("script[src='https://accounts.google.com/gsi/client']") as HTMLScriptElement | null;
		if (script && window.google) {
			setScriptLoaded(true);
			return;
		}

		script = document.createElement("script");
		script.src = "https://accounts.google.com/gsi/client";
		script.async = true;
		script.defer = true;
		script.nonce = options.nonce;
		script.onload = () => {
			setScriptLoaded(true);
			options.onScriptLoadSuccess?.();
		};
		script.onerror = () => {
			setScriptLoaded(false);
			options.onScriptLoadError?.();
		};

		document.body.appendChild(script);

		onCleanup(() => document.body.removeChild(script));
	});

	return scriptLoaded;
}
