import { JSX } from "solid-js/jsx-runtime";
import { createEffect, onCleanup } from "solid-js";
import { createGsiScriptLoad } from "./createGsiScriptLoad";

type IdConfiguration = google.accounts.id.IdConfiguration;
type CredentialResponse = google.accounts.id.CredentialResponse;
type PromptMomentNotification = google.accounts.id.PromptMomentNotification;
type GsiButtonConfiguration = google.accounts.id.GsiButtonConfiguration;

export type GoogleSigninProps = {
	useOneTap?: boolean;
	containerProps?: JSX.DOMAttributes<HTMLDivElement> & { style?: JSX.CSSProperties };
	onMoment?: (promptMomentNotification: PromptMomentNotification) => void;
	onSuccess: (credentialResponse: CredentialResponse) => void;
	onError?: () => void;
} & Omit<IdConfiguration, "callback"> & GsiButtonConfiguration;

export function GoogleSignin(props: GoogleSigninProps) {
	const scriptLoaded = createGsiScriptLoad();

	onCleanup(() => {
		if (props.useOneTap) window?.google?.accounts?.id?.cancel();
	});

	let divRef: HTMLDivElement | undefined;

	createEffect(() => {
		if (!scriptLoaded()) return;

		window?.google?.accounts?.id?.initialize({
			callback: (credentialResponse: CredentialResponse) => {
				if (!credentialResponse?.credential) {
					return props.onError?.();
				}

				props.onSuccess(credentialResponse);
			},
			...props,
		});

		window?.google?.accounts?.id?.renderButton(divRef!, {
			type: props.type,
			theme: props.theme,
			size: props.size,
			text: props.text,
			shape: props.shape,
			logo_alignment: props.logo_alignment,
			width: props.width,
			locale: props.locale,
			click_listener: props.click_listener,
		});

		if (props.useOneTap) {
			window?.google?.accounts?.id?.prompt(props.onMoment);
		}
	});

	return (
		<div ref={divRef} {...props.containerProps} />
	);
}
