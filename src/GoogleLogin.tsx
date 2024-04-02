import { JSX } from "solid-js/jsx-runtime";
import { useGoogleOAuth } from "./GoogleOAuthProvider";
import { createEffect, onCleanup } from "solid-js";

type IdConfiguration = google.accounts.id.IdConfiguration;
type CredentialResponse = google.accounts.id.CredentialResponse;
type PromptMomentNotification = google.accounts.id.PromptMomentNotification;
type GsiButtonConfiguration = google.accounts.id.GsiButtonConfiguration;

const containerHeightMap = { large: 40, medium: 32, small: 20 };

export type GoogleLoginProps = {
	onSuccess: (credentialResponse: CredentialResponse) => void;
	onError?: () => void;
	promptMomentNotification?: (promptMomentNotification: PromptMomentNotification) => void;
	useOneTap?: boolean;
	containerProps?: JSX.DOMAttributes<HTMLDivElement> & { style?: JSX.CSSProperties };
} & Omit<IdConfiguration, "client_id" | "callback"> &
	GsiButtonConfiguration;

export function GoogleLogin(props: GoogleLoginProps) {
	const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();

	onCleanup(() => {
		if (props.useOneTap) window?.google?.accounts?.id?.cancel();
	});

	let divRef: HTMLDivElement | undefined;

	createEffect(() => {
		if (!scriptLoadedSuccessfully) return;

		window?.google?.accounts?.id?.initialize({
			client_id: clientId,
			callback: (credentialResponse: CredentialResponse) => {
				if (!credentialResponse?.credential) {
					return props.onError?.();
				}

				const { credential, select_by } = credentialResponse;
				props.onSuccess({
					credential,
					select_by,
				});
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
			window?.google?.accounts?.id?.prompt(props.promptMomentNotification);
		}
	});

	return (
		<div ref={divRef} {...props.containerProps}
			style={{
				...props.containerProps?.style,
				height: containerHeightMap[props.size || "large"] + "px"
			}}
		/>
	);
}
