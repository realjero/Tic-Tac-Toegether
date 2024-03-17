import Cookies from 'js-cookie';
import { toast } from 'sonner';

export async function authorizedFetch(route: string, init?: RequestInit | undefined) {
    const url = `http://localhost:3000/api/v1/${route}`;
    try {
        return await fetch(url, {
            ...init,
            headers: {
                ...init?.headers,
                Authorization: `Bearer ${Cookies.get('sessionToken')}`
            }
        });
    } catch (err) {
        toast.error('Unable to fetch data from the API. Please try again later.');
    }
}

export async function fetchApi(route: string, init?: RequestInit | undefined) {
    const url = `http://localhost:3000/api/v1/${route}`;
    try {
        return await fetch(url, init);
    } catch (err) {
        toast.error('Unable to fetch data from the API. Please try again later.');
    }
}

export async function register(username: string, password: string) {
    const result = await fetchApi('register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });

    return result;
}

export async function login(username: string, password: string) {
    const result = await fetchApi('login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });
    return result;
}

export async function updateUsername(username: string) {
    const result = await authorizedFetch('profiles/own', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username })
    });
    return result;
}

export async function updatePassword(password: string) {
    const result = await authorizedFetch('profiles/own/password', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword: password })
    });
    return result;
}

export async function getOwnProfile() {
    const result = await authorizedFetch('profiles/own', {
        method: 'GET'
    });
    return result;
}

export async function getProfileImage(username: string) {
    const result = await authorizedFetch(`profiles/${username}/image`, {
        method: 'GET'
    });
    return result;
}

export async function getOwnHistory() {
    const result = await authorizedFetch('profiles/own/history', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return result;
}

export async function setProfileImage(image: Blob) {
    const formData = new FormData();
    formData.append('image', image);
    const result = await authorizedFetch('profiles/own/image', {
        method: 'PUT',
        body: formData
    });
    return result;
}

export async function getProfile(username: string) {
    const result = await authorizedFetch(`profiles/${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return result;
}

export async function getProfiles() {
    const result = await authorizedFetch('profiles', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return result;
}

export async function getHistory(username: string) {
    const result = await authorizedFetch(`profiles/${username}/history`, {
        method: 'GET'
    });
    return result;
}

export async function getQueue() {
    const result = await authorizedFetch('admin/queue', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return result;
}

export async function getMatches() {
    const result = await authorizedFetch('admin/games', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return result;
}
