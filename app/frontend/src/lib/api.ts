import Cookies from 'js-cookie';
import { toast } from 'sonner';

/**
 * Performs an authorized fetch to the specified route using the session token stored in cookies for authentication.
 * If the fetch operation fails, it displays an error toast.
 * @param {string} route - The API route to fetch data from.
 * @param {RequestInit} init - Optional additional options to configure the fetch operation.
 * @returns {Promise<Response | undefined>} - A promise containing the response from the fetch operation.
 */
export async function authorizedFetch(
    route: string,
    init?: RequestInit | undefined
): Promise<Response | undefined> {
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

/**
 * Performs a fetch to the specified route without authentication.
 * If the fetch operation fails, it displays an error toast.
 * @param {string} route - The API route to fetch data from.
 * @param {RequestInit} init - Optional additional options to configure the fetch operation.
 * @returns {Promise<Response | undefined>} - A promise containing the response from the fetch operation.
 */
export async function fetchApi(
    route: string,
    init?: RequestInit | undefined
): Promise<Response | undefined> {
    const url = `http://localhost:3000/api/v1/${route}`;
    try {
        return await fetch(url, init);
    } catch (err) {
        toast.error('Unable to fetch data from the API. Please try again later.');
    }
}

/**
 * Registers a new user with the provided username and password.
 * @param {string} username - The username of the user to be registered.
 * @param {string} password - The password of the user to be registered.
 * @returns {Promise<Response | undefined>} - A promise containing the response from the registration request.
 */
export async function register(username: string, password: string): Promise<Response | undefined> {
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

/**
 * Logs in an existing user with the provided username and password.
 * @param {string} username - The username of the user to be logged in.
 * @param {string} password - The password of the user to be logged in.
 * @returns {Promise<Response | undefined>} - A promise containing the response from the login request.
 */
export async function login(username: string, password: string): Promise<Response | undefined> {
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

/**
 * Updates the username of the currently logged-in user.
 * @param {string} username - The new username to be updated.
 * @returns {Promise<Response | undefined>} - A promise containing the response from the username update request.
 */
export async function updateUsername(username: string): Promise<Response | undefined> {
    const result = await authorizedFetch('profiles/own', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username })
    });
    return result;
}

/**
 * Updates the password of the currently logged-in user.
 * @param {string} password - The new password to be updated.
 * @returns {Promise<Response | undefined>} - A promise containing the response from the password update request.
 */
export async function updatePassword(password: string): Promise<Response | undefined> {
    const result = await authorizedFetch('profiles/own/password', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword: password })
    });
    return result;
}

/**
 * Retrieves the profile information of the currently logged-in user.
 * @returns {Promise<Response | undefined>} - A promise containing the response with the profile information.
 */
export async function getOwnProfile(): Promise<Response | undefined> {
    const result = await authorizedFetch('profiles/own', {
        method: 'GET'
    });
    return result;
}

/**
 * Retrieves the profile image of a specified user.
 * @param {string} username - The username of the user whose profile image is to be retrieved.
 * @returns {Promise<Response | undefined>} - A promise containing the response with the profile image.
 */
export async function getProfileImage(username: string): Promise<Response | undefined> {
    const result = await authorizedFetch(`profiles/${username}/image`, {
        method: 'GET'
    });
    return result;
}

/**
 * Retrieves the history of matches for the currently logged-in user.
 * @returns {Promise<Response | undefined>} - A promise containing the response with the user's match history.
 */
export async function getOwnHistory(): Promise<Response | undefined> {
    const result = await authorizedFetch('profiles/own/history', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return result;
}

/**
 * Updates the profile image of the currently logged-in user.
 * @param {Blob} image - The new profile image to be set.
 * @returns {Promise<Response | undefined>} - A promise containing the response indicating the success of the operation.
 */
export async function setProfileImage(image: Blob): Promise<Response | undefined> {
    const formData = new FormData();
    formData.append('image', image);
    const result = await authorizedFetch('profiles/own/image', {
        method: 'PUT',
        body: formData
    });
    return result;
}

/**
 * Retrieves the profile information of a specified user.
 * @param {string} username - The username of the user whose profile information is to be retrieved.
 * @returns {Promise<Response | undefined>} - A promise containing the response with the user's profile information.
 */
export async function getProfile(username: string): Promise<Response | undefined> {
    const result = await authorizedFetch(`profiles/${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return result;
}

/**
 * Retrieves the profiles of all users.
 * @returns {Promise<Response | undefined>} - A promise containing the response with the profiles of all users.
 */
export async function getProfiles(): Promise<Response | undefined> {
    const result = await authorizedFetch('profiles', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return result;
}

/**
 * Retrieves the history of games played by a specified user.
 * @param {string} username - The username of the user whose game history is to be retrieved.
 * @returns {Promise<Response | undefined>} - A promise containing the response with the game history of the specified user.
 */
export async function getHistory(username: string): Promise<Response | undefined> {
    const result = await authorizedFetch(`profiles/${username}/history`, {
        method: 'GET'
    });
    return result;
}

/**
 * Retrieves the current queue of players waiting for a match.
 * @returns {Promise<Response | undefined>} - A promise containing the response with the current queue of players.
 */
export async function getQueue(): Promise<Response | undefined> {
    const result = await authorizedFetch('admin/queue', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return result;
}

/**
 * Retrieves information about ongoing matches.
 * @returns {Promise<Response | undefined>} - A promise containing the response with information about ongoing matches.
 */
export async function getMatches(): Promise<Response | undefined> {
    const result = await authorizedFetch('admin/games', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return result;
}
