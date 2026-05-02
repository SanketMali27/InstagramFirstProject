import { FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';

import LoadingSkeleton from './LoadingSkeleton';

function UserConnectionsModal({ open, title, users, loading, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[32px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h3 className="text-xl font-black text-slate-900">{title}</h3>
          <button type="button" className="rounded-full p-2 text-slate-600" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">
          {loading ? (
            <LoadingSkeleton variant="list" count={3} />
          ) : users.length ? (
            <div className="space-y-3">
              {users.map((user) => (
                <Link
                  key={user._id}
                  to={`/userprofile/${user._id}/${user.username}`}
                  className="flex items-center gap-3 rounded-3xl border border-slate-100 p-3 hover:bg-slate-50"
                  onClick={onClose}
                >
                  <img
                    src={user.avatar || 'https://i.pravatar.cc/120'}
                    alt={user.username}
                    className="h-12 w-12 rounded-full object-cover"
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

export default UserConnectionsModal;
