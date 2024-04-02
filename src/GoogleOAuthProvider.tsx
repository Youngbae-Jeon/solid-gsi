import { createContext, JSX, useContext } from "solid-js";
import { useLoadGsiScript, UseLoadGsiScriptOptions } from "./useLoadGsiScript";

interface GoogleOAuthContextProps {
	clientId: string;
	scriptLoadedSuccessfully: boolean;
}

const GoogleOAuthContext = createContext<GoogleOAuthContextProps>(null!);

interface GoogleOAuthProviderProps extends UseLoadGsiScriptOptions {
	clientId: string;
	children: JSX.Element | JSX.Element[];
}

export function GoogleOAuthProvider(props: GoogleOAuthProviderProps) {
	const scriptLoadedSuccessfully = useLoadGsiScript({
		nonce: props.nonce,
		onScriptLoadSuccess: props.onScriptLoadSuccess,
		onScriptLoadError: props.onScriptLoadError,
	});

	const contextValue = () => ({
		clientId: props.clientId,
		scriptLoadedSuccessfully: scriptLoadedSuccessfully(),
	});

	return (
		<GoogleOAuthContext.Provider value={contextValue()}>
			{props.children}
		</GoogleOAuthContext.Provider>
	);
}

export function useGoogleOAuth() {
	const context = useContext(GoogleOAuthContext);
	if (!context) {
		throw new Error("Google OAuth components must be used within GoogleOAuthProvider");
	}
	return context;
}
