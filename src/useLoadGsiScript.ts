import { Accessor, createEffect, createSignal } from "solid-js";

export interface UseLoadGsiScriptOptions {
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

export function useLoadGsiScript(options: UseLoadGsiScriptOptions = {}): Accessor<boolean> {
	const [scriptLoadedSuccessfully, setScriptLoadedSuccessfully] = createSignal(false);

	createEffect(() => {
		const script = document.createElement("script");
		script.src = "https://accounts.google.com/gsi/client";
		script.async = true;
		script.defer = true;
		script.nonce = options.nonce;
		script.onload = () => {
			setScriptLoadedSuccessfully(true);
			options.onScriptLoadSuccess?.();
		};
		script.onerror = () => {
			setScriptLoadedSuccessfully(false);
			options.onScriptLoadError?.();
		};

		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	});

	return scriptLoadedSuccessfully;
}
