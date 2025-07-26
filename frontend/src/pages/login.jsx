import { useState ,useEffect} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [message, setMessage] = useState('');
   const navigate = useNavigate();
  const [userExists,setuserExists] =useState(false);
   useEffect(() => {
     if (userExists) {
       navigate('/signup'); 
     }
   }, [userExists]);
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/login`, { username, password });
      localStorage.setItem('user', JSON.stringify(res.data.user)); // Save user info in localStorage
      navigate('/');
      setMessage(res.data.message);
      console.log(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4">Login</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded"
          required
        />

        <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Login
        </button>

        <p
         onClick={() => setuserExists(!userExists)}
          className="text-sm text-blue-600 mt-4 cursor-pointer text-center"
        >
         New user? Sign up
        </p>

        {message && <p className="mt-3 text-center text-red-500">{message}</p>}
      </form>
    </div>
  );
}

export default Login;
