import { useRouter } from 'vue-router';

export const useApiService = (url) => {
    const config = useRuntimeConfig();
    const apiUrl = config.public.apiBase;
    const router = useRouter();
    const accessToken = useCookie('accessToken');

    const refreshAccessToken = async () => {
        try {
            const { data, error } = await useFetch(`${apiUrl}/auth/refresh`, {
                method: 'POST',
                body: {
                    token: accessToken.value
                },
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            });
            if (error.value) throw error.value;

            accessToken.value = await Promise.resolve(data.value.access_token);
        } catch (err) {
            router.push('/auth/login');
            throw err;
        }
    };

    const handleRequest = async (requestFunction) => {
        try {
            return await requestFunction();
        } catch (error) {
            await refreshAccessToken();
            return await requestFunction();
        }
    };

    const fetchAll = async (params) => {
        return handleRequest(async () => {
            const queryString = new URLSearchParams(params).toString();
            const urlComplete = queryString ? `${apiUrl}/${url}?${queryString}` : `${apiUrl}/${url}`;
            const { data, error } = await useFetch(urlComplete, {
                headers: {
                    Authorization: `Bearer ${accessToken.value}`,
                    Accept: 'application/json',
                },
            });
            if (error.value) throw error.value;
            return data.value;
        });
    };

    const fetchById = async (id) => {
        return handleRequest(async () => {
            const { data, error } = await useFetch(`${apiUrl}/${url}/${id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken.value}`,
                    Accept: 'application/json',
                },
            });
            if (error.value || !data.value) router.push('/404');
            return data.value;
        });
    };

    const create = async (entity) => {
        return handleRequest(async () => {
            const { data, error } = await useFetch(`${apiUrl}/${url}`, {
                method: 'POST',
                body: JSON.stringify(entity),
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken.value}`,
                },
            });
            if (error.value) throw error.value;
            return data.value;
        });
    };

    const update = async (id, entity) => {
        return handleRequest(async () => {
            const { data, error } = await useFetch(`${apiUrl}/${url}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(entity),
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken.value}`,
                },
            });
            if (error.value) throw error.value;
            return data.value;
        });
    };

    const remove = async (id) => {
        return handleRequest(async () => {
            const { error } = await useFetch(`${apiUrl}/${url}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken.value}`,
                    Accept: 'application/json',
                },
            });
            if (error.value) throw error.value;
        });
    };

    const fetchAllInSearchComponent = async () => {
        return handleRequest(async () => {
            const data = await $fetch(`${apiUrl}/${url}`, {
                headers: {
                    Authorization: `Bearer ${accessToken.value}`,
                    Accept: 'application/json',
                },
            });
            return data;
        });
    };

    const forgotPassword = async (email) => {
        try {
            const { data, error } = await useFetch(`${apiUrl}/auth/forgot-password`, {
                method: 'POST',
                body: JSON.stringify({ email }),
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            });
            if (error.value) throw error.value;
            return data.value;
        } catch (err) {
            console.error('Error en la recuperació de contrasenya:', err);
            throw err;
        }
    };

    return {
        fetchAll,
        fetchById,
        create,
        update,
        remove,
        fetchAllInSearchComponent,
        forgotPassword
    };
};
