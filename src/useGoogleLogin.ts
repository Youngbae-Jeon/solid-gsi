import { createMemo } from "solid-js";
import { useGoogleOAuth } from "./GoogleOAuthProvider";

type TokenClient = google.accounts.oauth2.TokenClient;
type TokenClientConfig = google.accounts.oauth2.TokenClientConfig;
type TokenResponse = google.accounts.oauth2.TokenResponse;
type CodeClient = google.accounts.oauth2.CodeClient;
type CodeClientConfig = google.accounts.oauth2.CodeClientConfig;
type CodeResponse = google.accounts.oauth2.CodeResponse;
type OverridableTokenClientConfig = google.accounts.oauth2.OverridableTokenClientConfig;
type ClientConfigError = google.accounts.oauth2.ClientConfigError;

interface ImplicitFlowOptions extends Omit<TokenClientConfig, "client_id" | "scope" | "callback"> {
	onSuccess?: (tokenResponse: Omit<TokenResponse, "error" | "error_description" | "error_uri">) => void;
	onError?: (errorResponse: Pick<TokenResponse, "error" | "error_description" | "error_uri">) => void;
	onNonOAuthError?: (nonOAuthError: ClientConfigError) => void;
	scope?: TokenClientConfig["scope"];
	overrideScope?: boolean;
}

interface AuthCodeFlowOptions extends Omit<CodeClientConfig, "client_id" | "scope" | "callback"> {
	onSuccess?: (codeResponse: Omit<CodeResponse, "error" | "error_description" | "error_uri">) => void;
	onError?: (errorResponse: Pick<CodeResponse, "error" | "error_description" | "error_uri">) => void;
	onNonOAuthError?: (nonOAuthError: ClientConfigError) => void;
	scope?: CodeResponse["scope"];
	overrideScope?: boolean;
}

export type UseGoogleLoginOptionsImplicitFlow = { flow?: "implicit" } & ImplicitFlowOptions;
export type UseGoogleLoginOptionsAuthCodeFlow = { flow?: "auth-code" } & AuthCodeFlowOptions;
export type UseGoogleLoginOptions = UseGoogleLoginOptionsImplicitFlow | UseGoogleLoginOptionsAuthCodeFlow;

export default function useGoogleLogin(options: UseGoogleLoginOptionsImplicitFlow): (overrideConfig?: OverridableTokenClientConfig) => void;
export default function useGoogleLogin(options: UseGoogleLoginOptionsAuthCodeFlow): () => void;

export default function useGoogleLogin(options: UseGoogleLoginOptions): unknown {
	const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();

	const client = createMemo(() => {
		if (!scriptLoadedSuccessfully) return;

		const {
			flow = "implicit",
			scope = "",
			onSuccess,
			onError,
			onNonOAuthError,
			overrideScope,
			state,
			...otherOptions
		} = options;

		const clientMethod = flow === "implicit" ? "initTokenClient" : "initCodeClient";

		return window?.google?.accounts?.oauth2[clientMethod]({
			client_id: clientId,
			scope: overrideScope ? scope : `openid profile email ${scope}`,
			callback: (response: TokenResponse | CodeResponse) => {
				if (response.error) return options.onError?.(response);

				options.onSuccess?.(response as any);
			},
			error_callback: err => options.onNonOAuthError?.(err),
			state,
			...otherOptions,
		});
	});

	if (options.flow === "implicit") {
		return (overrideConfig?: OverridableTokenClientConfig) => {
			return (client() as TokenClient | undefined)?.requestAccessToken?.(overrideConfig);
		};

	} else {
		return () => {
			return (client() as CodeClient | undefined)?.requestCode();
		};
	
	}
}
