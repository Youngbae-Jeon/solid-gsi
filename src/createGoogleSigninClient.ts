import { createMemo } from "solid-js";
import { createGsiScriptLoad } from "./createGsiScriptLoad";

type TokenClient = google.accounts.oauth2.TokenClient;
type TokenClientConfig = google.accounts.oauth2.TokenClientConfig;
type TokenResponse = google.accounts.oauth2.TokenResponse;
type CodeClient = google.accounts.oauth2.CodeClient;
type CodeClientConfig = google.accounts.oauth2.CodeClientConfig;
type CodeResponse = google.accounts.oauth2.CodeResponse;
type ClientConfigError = google.accounts.oauth2.ClientConfigError;

interface ImplicitFlowOptions extends Omit<TokenClientConfig, "callback"> {
	onSuccess?: (tokenResponse: Omit<TokenResponse, "error" | "error_description" | "error_uri">) => void;
	onError?: (errorResponse: Pick<TokenResponse, "error" | "error_description" | "error_uri">) => void;
	onNonOAuthError?: (nonOAuthError: ClientConfigError) => void;
}

interface AuthCodeFlowOptions extends Omit<CodeClientConfig, "callback"> {
	onSuccess?: (codeResponse: Omit<CodeResponse, "error" | "error_description" | "error_uri">) => void;
	onError?: (errorResponse: Pick<CodeResponse, "error" | "error_description" | "error_uri">) => void;
	onNonOAuthError?: (nonOAuthError: ClientConfigError) => void;
}

export type GoogleSigninOptionsImplicitFlow = { flow?: "implicit" } & ImplicitFlowOptions;
export type GoogleSigninOptionsAuthCodeFlow = { flow?: "auth-code" } & AuthCodeFlowOptions;
export type GoogleSigninOptions = GoogleSigninOptionsImplicitFlow | GoogleSigninOptionsAuthCodeFlow;

export function createGoogleSigninClient(opts: GoogleSigninOptionsImplicitFlow): TokenClient;
export function createGoogleSigninClient(opts: GoogleSigninOptionsAuthCodeFlow): CodeClient;

export function createGoogleSigninClient(opts: GoogleSigninOptions): unknown {
	const scriptLoaded = createGsiScriptLoad();

	const client = createMemo(() => {
		if (!scriptLoaded()) return;

		const {
			flow = "implicit",
			onSuccess,
			onError,
			onNonOAuthError,
			...otherOptions
		} = opts;

		const initMethodName = flow === "implicit" ? "initTokenClient" : "initCodeClient";
		return window.google.accounts.oauth2[initMethodName]({
			callback: (response: TokenResponse | CodeResponse) => {
				if (response.error) return opts.onError?.(response);

				opts.onSuccess?.(response as any);
			},
			error_callback: err => opts.onNonOAuthError?.(err),
			...otherOptions,
		});
	});

	if (opts.flow === "implicit") {
		return client() as TokenClient;

	} else {
		return client() as CodeClient;
	}
}
