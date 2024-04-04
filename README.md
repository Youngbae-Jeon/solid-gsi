# Google Sign-In for SolidJs

## Installing
```sh
npm install @gomdle/solid-gsi
```

## Google Default Signin Button
```jsx
import { GoogleSignin } from "@gomdle/solid-gsi";

<GoogleSignin
	client_id="your_google_oauth_client_id"
	useOneTap
	cancel_on_tap_outside={false}
	onSuccess={credential => console.log('*** success', credential)}
	onError={() => console.error('*** error')}
/>
```

## One Tab Signin UI Only
```js
import { createGoogleOneTapSignin } from "@gomdle/solid-gsi";

createGoogleOneTapSignin({
	client_id: "your_google_oauth_client_id",
	cancel_on_tap_outside: false,
	hosted_domain: "autostock.co.kr",
	onSuccess: credential => console.log('*** success', credential),
	onError: () => console.error('*** error')
});
```