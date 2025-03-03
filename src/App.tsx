import React, { useState } from "react";
import Dashboard from "./components/Dashboard";

// Sample data for the users
const users = [
  { id: 1, name: "John Doe", phoneNumber: "123-456-7890", aiModel: "Zach", feedback: "Good", flaggedDate: "2025-02-01" },
  { id: 2, name: "Jane Smith", phoneNumber: "987-654-3210", aiModel: "Sophia", feedback: "Excellent", flaggedDate: "2025-02-02" },
  // Add more users if needed
];

const App = () => {
  return (
    <div className="app">
      {/* Pass the users as a prop to the Dashboard */}
      <Dashboard users={users} />
    </div>
  );
};

export default App;
