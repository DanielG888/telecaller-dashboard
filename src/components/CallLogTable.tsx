import React, { useEffect, useState } from "react";
import 'font-awesome/css/font-awesome.min.css';

interface CallLog {
  id: string;
  name: string;
  phoneNumber: string;
  aiModel: string;
  feedback: string;
  flaggedDate: string;
  recordingLink: string;
}

interface CallLogTableProps {
  users: CallLog[];
  handlePlay: (id: string) => void; // Handle the play button click
}

const CallLogTable: React.FC<CallLogTableProps> = ({ users, handlePlay }) => {
  const [callLog, setCallLog] = useState<CallLog[]>([]);
  const [sortBy, setSortBy] = useState<string>('flaggedDate'); // Default sorting by flaggedDate
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Initial order as 'desc' for latest to oldest

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://api.thesamodrei.com/get_call_logs", { method: "POST" });
        if (!response.ok) {
          throw new Error("Failed to fetch call logs");
        }
        const data = await response.json();
        
        // Sort the data by flaggedDate from latest to oldest (desc)
        const sortedData = data.sort((a: CallLog, b: CallLog) => {
          const dateA = new Date(a.flaggedDate);
          const dateB = new Date(b.flaggedDate);
          return dateB.getTime() - dateA.getTime(); // Descending order for latest first
        });

        setCallLog(sortedData);
      } catch (error) {
        console.error("Error fetching call logs:", error);
      }
    };

    fetchData();
  }, []);

  const handleSort = (column: string) => {
    const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortOrder(newSortOrder);
  };

  const sortedCallLogs = [...callLog].sort((a, b) => {
    const valueA = a[sortBy as keyof CallLog];
    const valueB = b[sortBy as keyof CallLog];

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortOrder === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    }
    return 0;
  });

  const renderSortArrow = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <table className="call-log-table">
      <thead>
        <tr>
          <th>ID</th>
          <th onClick={() => handleSort('name')}>Name {renderSortArrow('name')}</th>
          <th onClick={() => handleSort('phoneNumber')}>Phone Number {renderSortArrow('phoneNumber')}</th>
          <th onClick={() => handleSort('aiModel')}>AI Model {renderSortArrow('aiModel')}</th>
          <th onClick={() => handleSort('feedback')}>Feedback {renderSortArrow('feedback')}</th>
          <th onClick={() => handleSort('flaggedDate')}>Start Time{renderSortArrow('flaggedDate')}</th>
          <th>Recording</th>
        </tr>
      </thead>
      <tbody>
        {sortedCallLogs.length === 0 ? (
          <tr>
            <td colSpan={7}>No call logs found</td>
          </tr>
        ) : (
          sortedCallLogs.map((log, index) => (
            <tr key={log.id}>
              <td>{index + 1}</td>
              <td>{log.name}</td>
              <td>{log.phoneNumber}</td>
              <td>{log.aiModel}</td>
              <td>{log.feedback}</td>
              <td>{log.flaggedDate}</td>
              <td>
                <button
                  className="play-button"
                  type="button" // Ensure type="button" to prevent default form behavior
                  onClick={() => handlePlay(log.id)}
                  style={{ marginLeft: "10px" }}
                >
                  ▶
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default CallLogTable;
