import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useApi(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { immediate = true, params = {} } = options;

  const fetchData = useCallback(async (overrideParams) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(url, { params: overrideParams || params });
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (immediate) fetchData();
  }, [immediate, fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function usePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const post = async (url, body) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post(url, body);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const put = async (url, body) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.put(url, body);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { post, put, loading, error };
}
