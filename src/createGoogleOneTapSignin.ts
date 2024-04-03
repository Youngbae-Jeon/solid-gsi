import { createGsiScriptLoad } from "./createGsiScriptLoad";
import { createEffect, onCleanup } from "solid-js";

type IdConfiguration = google.accounts.id.IdConfiguration;
type CredentialResponse = google.accounts.id.CredentialResponse;
type PromptMomentNotification = google.accounts.id.PromptMomentNotification;

interface GoogleOneTapSigninOptions {
	client_id: string;
	cancel_on_tap_outside?: boolean;
	prompt_parent_id?: string;
	state_cookie_domain?: string;
	hosted_domain?: string;
	use_fedcm_for_prompt?: IdConfiguration["use_fedcm_for_prompt"];
	auto_select?: boolean;
	onSuccess: (credentialResponse: CredentialResponse) => void;
	onError?: () => void;
	onPrompt?: (promptMomentNotification: PromptMomentNotification) => void;
}

export function createGoogleOneTapSignin(opts: GoogleOneTapSigninOptions): void {
	const scriptLoaded = createGsiScriptLoad();

	onCleanup(() => {
		window?.google?.accounts?.id?.cancel();
	});

	createEffect(() => {
		if (!scriptLoaded()) return;

		const {client_id, onSuccess, onError, onPrompt, ...otherOptions} = opts;

		window?.google?.accounts?.id?.initialize({
			client_id,
			callback: credentialResponse => {
				if (!credentialResponse?.credential) {
					return opts.onError?.();
				}

				opts.onSuccess(credentialResponse);
			},
			...otherOptions,
		});

		window?.google?.accounts?.id?.prompt(onPrompt);
	});
}
