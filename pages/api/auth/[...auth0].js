// Importing authentication functions from the Auth0 Next.js library
import { handleAuth, handleLogin } from "@auth0/nextjs-auth0";

// Defining a Next.js API route that handles authentication
export default handleAuth({
    // Configuring the authentication handler for the signup scenario
    signup: handleLogin({
        // Adding custom parameters to the authorization request
        authorizationParams: { screen_hint: "signup" }
    }),
});
