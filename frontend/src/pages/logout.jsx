import React, { useEffect, useState } from 'react';


function Logout(){

    const handleLogout = () => {
        localStorage.removeItem('user'); // Remove user session
        window.location.href = '/login'; // Redirect to login page
    };
    return (

        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
  Logout
</button>
);
}

export default Logout;
