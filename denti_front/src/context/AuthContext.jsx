import { createContext, useContext, useEffect, useState } from 'react';
import { getLoginUser } from '../api/accountAPI';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [loginUser, setLoginUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkSession() {
            try {
                const user = await getLoginUser();
                setLoginUser(user);
            } catch (err) {
                setLoginUser(null);
            } finally {
                setLoading(false);
            }
        }
        checkSession();
    }, []);

    return (
        <AuthContext.Provider value={{ loginUser, setLoginUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}