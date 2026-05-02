import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { setAuthData } from '../lib/auth';

const getFieldErrors = (errors = []) =>
  errors.reduce((accumulator, error) => {
    accumulator[error.field] = error.message;
    return accumulator;
  }, {});

function SignUp() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    bio: '',
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

      const response = await api.post('/api/auth/signup', formData);
      setAuthData({
        token: response.data.token,
        user: response.data.user
      });

      navigate('/', { replace: true });
    } catch (error) {
      const payload = error.response?.data;
      setFieldErrors(getFieldErrors(payload?.errors));
      showToast({
        message: payload?.message || 'Unable to create your account right now.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,#dbeafe,transparent_30%),linear-gradient(135deg,#fff7ed,#f8fafc)] px-4 py-10">
      <div className="w-full max-w-3xl rounded-[36px] bg-white p-8 shadow-2xl sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">Create Account</p>
        <h1 className="mt-4 text-4xl font-black text-slate-900">Join the upgraded Instagram clone.</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-500">
          Sign up once and you get stories, explore, realtime chat, saved posts, reels, and notifications.
        </p>

        <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              placeholder="3-20 characters"
            />
            {fieldErrors.username ? <p className="mt-2 text-xs text-red-500">{fieldErrors.username}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              placeholder="Your display name"
            />
            {fieldErrors.fullName ? <p className="mt-2 text-xs text-red-500">{fieldErrors.fullName}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              placeholder="name@example.com"
            />
            {fieldErrors.email ? <p className="mt-2 text-xs text-red-500">{fieldErrors.email}</p> : null}
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
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              placeholder="At least 8 characters"
            />
            {fieldErrors.password ? <p className="mt-2 text-xs text-red-500">{fieldErrors.password}</p> : null}
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows="4"
              value={formData.bio}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              placeholder="Tell people a little about yourself"
            />
            {fieldErrors.bio ? <p className="mt-2 text-xs text-red-500">{fieldErrors.bio}</p> : null}
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-sky-600">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
