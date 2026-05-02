import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { setAuthData } from '../lib/auth';

const getFieldErrors = (errors = []) =>
  errors.reduce((accumulator, error) => {
    accumulator[error.field] = error.message;
    return accumulator;
  }, {});

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setFieldErrors({});

      const response = await api.post('/api/auth/login', formData);
      setAuthData({
        token: response.data.token,
        user: response.data.user
      });

      const nextPath = location.state?.from?.pathname || '/';
      navigate(nextPath, { replace: true });
    } catch (error) {
      const payload = error.response?.data;
      setFieldErrors(getFieldErrors(payload?.errors));
      showToast({
        message: payload?.message || 'Unable to sign in right now.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#fce7f3,transparent_35%),linear-gradient(135deg,#fff8f1,#eef2ff)] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[36px] bg-white shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-pink-200">Instagram Clone</p>
            <h1 className="mt-6 text-5xl font-black leading-tight">
              Share posts, stories, reels, and chats in real time.
            </h1>
            <p className="mt-6 max-w-md text-sm text-slate-300">
              This upgraded build uses JWT auth, real notifications, stories, saved posts,
              explore search, and live messaging.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Now Included</p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {['JWT auth', 'Stories', 'Realtime chat', 'Explore', 'Reels'].map((item) => (
                <span key={item} className="rounded-full bg-white/10 px-3 py-2">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <div className="mx-auto max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-500">Welcome Back</p>
            <h2 className="mt-4 text-4xl font-black text-slate-900">Sign in to continue.</h2>
            <p className="mt-3 text-sm text-slate-500">
              Your token stays attached automatically once you sign in.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                  placeholder="yourusername"
                />
                {fieldErrors.username ? <p className="mt-2 text-xs text-red-500">{fieldErrors.username}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                  placeholder="Minimum 8 characters"
                />
                {fieldErrors.password ? <p className="mt-2 text-xs text-red-500">{fieldErrors.password}</p> : null}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-500">
              New here?{' '}
              <Link to="/signup" className="font-semibold text-pink-600">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
