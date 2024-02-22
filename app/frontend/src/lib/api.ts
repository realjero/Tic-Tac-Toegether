async function apiFetch(route: string, init?: RequestInit | undefined) {
    const url = `http://localhost:3000/api/v1/${route}`;
    try {
        return await fetch(url, init);
    } catch (err) {
        throw new Error('Unable to fetch data from the API. Please try again later.');
    }
}

export { apiFetch };
