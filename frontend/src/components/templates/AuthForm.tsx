import React, { useEffect, useState } from "react";


export const AuthForm = () => {

    const [token, setToken] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>('');


    const handleSubmit = () => {
        setIsLoading(true);
        setError(null);
        setToken("");
    }

    useEffect(() => {
        if (isLoading) {
            setIsLoading(false);
        }
    }, [isLoading]);

    return (
        <div className="flex flex-col items-center justify-center h-screen">

            <h1 className="text-2xl font-bold">AuthForm</h1>
            <input type="text" placeholder="Token" value={token} onChange={(e) => setToken(e.target.value)} />
            <button onClick={handleSubmit}>Submit</button>
            {isLoading && <p>Loading...</p>}
            {error && <p>{error}</p>}
        </div>
    )
}