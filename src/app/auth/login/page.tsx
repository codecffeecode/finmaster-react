'use client'
import { useAuth0 } from '@auth0/auth0-react';

const LoginPage = ()=>{
    const {isAuthenticated, loginWithRedirect} = useAuth0();
    return (
        <div>
            {isAuthenticated ? (
                <div>
                    <h1>Dashboard</h1>
                </div>
            ) : (
                <button onClick={() => loginWithRedirect()}>Login</button>
            )}
        </div>
    )
}

export default LoginPage;