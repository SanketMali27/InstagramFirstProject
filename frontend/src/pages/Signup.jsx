import { useState ,useEffect} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SignUp() {
  const [username, setUsername] = useState('');
  
  const [fullName, setUserfullname] = useState('');
  const [bio, setUserbio] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();


  const handleSubmit = async e => {
    e.preventDefault();
    try {
      console.log("Password :",password);
     const res = await axios.post('http://localhost:5000/api/auth/signup', {
  username,
  password,
  fullName,
  bio,
  email
});
      setMessage(res.data.message);
      console.log(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded"
          required
        />
          <input
          type="text"
          placeholder="Userfullname"
          value={fullName}
          onChange={e => setUserfullname(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded"
          required
        />

          <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded"
          required
        />
        
          <input
          type="text"
          placeholder="Bio"
          value={bio}
          onChange={e => setUserbio(e.target.value)}
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
          Sign Up
        </button>

        <p
      onClick={() => navigate('/login')}
         className="text-sm text-blue-600 mt-4 cursor-pointer text-center"
      




        >
          Already have an account? Login
        </p>

        {message && <p className="mt-3 text-center text-red-500">{message}</p>}
      </form>
    </div>
  );
}

export default SignUp;
