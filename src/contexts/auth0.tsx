'use client'
import { Auth0Provider } from '@auth0/auth0-react';
const Auth0ProviderWithHistory = ({ children }: { children: React.ReactNode }) => {
    return (
        <Auth0Provider
            domain="dev-ya6wj7x0wk88hoog.us.auth0.com"
            clientId="q8V6Yg9r1BtWEvuCbxDJxTSEPJibaY0r"
            authorizationParams={{
                redirect_uri: 'http://localhost:3000/dashboard'
            }}
        >
            {children}
        </Auth0Provider>
    )
}

export default Auth0ProviderWithHistory;