import React, { useState, useEffect, useRef } from "react";
import CallLogTable from "./CallLogTable";
import CallForm from "./CallForm";
import MenuBar from "./MenuBar";
import Modal from "./Modal";

interface DashboardProps {
  users: {
    id: number;
    name: string;
    phoneNumber: string;
    aiModel: string;
    feedback: string;
    flaggedDate: string;
  }[];
}

const Dashboard: React.FC<DashboardProps> = ({ users }) => {
  const [showForm, setShowForm] = useState(false);
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [recordingLink, setRecordingLink] = useState("");
  const [transcriptionLoading, setTranscriptionLoading] = useState(false);
  const [current_doctor, setCurrentDoctor] = useState("");
  const [current_phone_number, setCurrentPhoneNumber] = useState("");
  const [isOnline, setIsOnline] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);

  /** Fetch initial call status */
  const getCurrentCallStatus = async () => {
    try {
      const response = await fetch("https://api.thesamodrei.com/get_current_call_status",{ method: "POST" });
      if (!response.ok) throw new Error("Failed to fetch current call status.");
      const data = await response.json();
      console.log(data);
      setIsOnline(data.call_status);
      setCurrentDoctor(data.doctor_name);
      setCurrentPhoneNumber(data.phone_number);
    } catch (error) {
      console.error("Error fetching current call status:", error);
    }
  };

  /** Initialize WebSocket connection */
  useEffect(() => {
    getCurrentCallStatus(); // Fetch call status on mount

    socketRef.current = new WebSocket("wss://api.thesamodrei.com/auto_call_status");

    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
    };

    socketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("WebSocket Message:", message);
      setCurrentDoctor(message.doctor);
      setCurrentPhoneNumber(message.phone_number);
      fetchCallLogs();
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket disconnected");
      setIsOnline(false);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const fetchCallLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api.thesamodrei.com/get_call_logs", { method: "POST" });
      if (!response.ok) throw new Error("Failed to fetch call logs");

      const data = await response.json();
      setCallLogs(data);
    } catch (error) {
      console.error("Error fetching call logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    fetchCallLogs();
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handlePlay = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch("https://api.thesamodrei.com/get_recording", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sid: id }),
      });

      if (!response.ok) throw new Error("Failed to fetch recording details");

      const data = await response.json();
      setRecordingLink(data.recordingLink || "");
      setTranscription(data.transcription || "");
    } catch (error) {
      console.error("Error fetching recording:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async () => {
    try {
      const response = await fetch("https://api.thesamodrei.com/handle_automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: isOnline }),
      });

      if (isOnline == false && response.status == 404) throw new Error("The system still has ongoing call yet. Please wait and try later.");
      else if (!response.ok) throw new Error("Failed to stop the automation call system.");

      setIsOnline(!isOnline);
    } catch (error) {
      console.error("Error handling status:", error);
    }
  };

  useEffect(() => {
    fetchCallLogs();
  }, []);

  return (
    <div className="dashboard">
      <h1>Samodrei AI Telecaller Dashboard</h1>

      <div className="status-container">
        <button className="call-button" onClick={() => setShowForm(true)}>
          <img
            src="https://img.icons8.com/?size=50&id=48193&format=png&color=000000"
            className="call-button-img"
            alt="call icon"
          />
        </button>

        {/* Status Section */}
        <div className="status-section">
          <span className={`status-indicator ${isOnline ? "online" : "offline"}`}></span>
          <span className="status-text">
            {isOnline ? `Calling Doctor: ${current_doctor} Phone: ${current_phone_number}` : "Offline"}
          </span>
          <button className="toggle-button" onClick={handleStatus}>
            {isOnline ? (
              <img src="https://img.icons8.com/?size=30&id=15166&format=png&color=000000" alt="Stop" />
            ) : (
              <img src="https://img.icons8.com/?size=30&id=GwYlS5m5Goz6&format=png&color=000000" alt="Start" />
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading call logs...</p>
      ) : (
        <CallLogTable users={callLogs} handlePlay={handlePlay} />
      )}

      {showForm && <CallForm onClose={handleCloseForm} />}

      {showModal && (
        <Modal
          recordingLink={recordingLink}
          transcription={transcription}
          onClose={handleCloseModal}
          loading={transcriptionLoading}
        />
      )}
    </div>
  );
};

export default Dashboard;
