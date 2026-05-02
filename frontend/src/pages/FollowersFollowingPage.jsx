import { useEffect, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Link, useLocation, useParams } from 'react-router-dom';

import api from '../api/axios';
import LoadingSkeleton from '../components/LoadingSkeleton';

function FollowersFollowingPage() {
  const { id, username } = useParams();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const type = location.pathname.includes('/followers') ? 'followers' : 'following';

  useEffect(() => {
    let active = true;

    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/users/${id}/${type}`);

        if (active) {
          setUsers(response.data.users || []);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load users');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      active = false;
    };
  }, [id, type]);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 pb-28">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-[36px] bg-white shadow-xl">
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <Link to={`/userprofile/${id}/${username}`} className="rounded-full bg-slate-100 p-3 text-slate-700">
              <FiArrowLeft />
            </Link>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Connections</p>
              <h1 className="text-2xl font-black text-slate-900">
                {type === 'followers' ? 'Followers' : 'Following'}
              </h1>
            </div>
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <LoadingSkeleton variant="list" count={4} />
          ) : error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-500">{error}</p>
          ) : users.length ? (
            <div className="space-y-3">
              {users.map((user) => (
                <Link
                  key={user._id}
                  to={`/userprofile/${user._id}/${user.username}`}
                  className="flex items-center gap-3 rounded-[28px] border border-slate-100 p-4 hover:bg-slate-50"
                >
                  <img
                    src={user.avatar || 'https://i.pravatar.cc/120'}
                    alt={user.username}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{user.username}</p>
                    <p className="text-sm text-slate-500">{user.fullName}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No users to show yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FollowersFollowingPage;
