import React, { useState } from "react";

const MenuBar: React.FC = () => {
  return (
    <nav className="menu-bar">
      <ul className="menu-list">
        <li className="menu-item"><a href="/home">Home</a></li>
        <li className="menu-item"><a href="/doctors">Doctors</a></li>
        <li className="menu-item"><a href="/call-log">Call Log</a></li>
        <li className="menu-item"><a href="/login">Login</a></li>
      </ul>
    </nav>
  );
};

export default MenuBar;
