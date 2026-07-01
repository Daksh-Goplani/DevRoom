import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
})

export const extractApiErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
    if (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error') {
        return 'Unable to reach the server. Please check your connection and try again.'
    }

    const data = err?.response?.data

    if (!data) {
        return err?.message || fallback
    }

    if (Array.isArray(data.errors) && data.errors.length) {
        return data.errors.map((item) => item.msg || item.message || JSON.stringify(item)).join(', ')
    }

    if (Array.isArray(data.error) && data.error.length) {
        return data.error.map((item) => item.msg || item.message || JSON.stringify(item)).join(', ')
    }

    if (typeof data === 'string') {
        return data
    }

    return data.message || data.error || fallback
}

export default axiosInstance