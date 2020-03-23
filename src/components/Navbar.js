import React from 'react';
import '../assets/styles/Navbar.css';


function Navbar() {
  return (
    <div className="navbar">
        <a href="#home">Home</a>
        <a href="mailto:helpyeswrite@gmail.com" target="_blank" rel="noopener noreferrer">Contact</a>
    </div>
  );
}

export default Navbar;
