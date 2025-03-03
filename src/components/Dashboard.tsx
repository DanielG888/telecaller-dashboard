import React, { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState(false); // Loading for call logs
  const [showModal, setShowModal] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [recordingLink, setRecordingLink] = useState("");
  const [transcriptionLoading, setTranscriptionLoading] = useState(false); // Loading for transcription data

  const fetchCallLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api.thesamodrei.com/get_call_logs", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to fetch call logs");
      }
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
    fetchCallLogs(); // Trigger data fetch after closing form
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handlePlay = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch("https://api.thesamodrei.com/get_recording", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sid: id
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch recording details");
      }
  
      const data = await response.json();
  
      if (data.recordingLink) {
        setRecordingLink(data.recordingLink);
      } else {
        console.error("Recording link is missing in the response");
      }
  
      if (data.transcription) {
        setTranscription(data.transcription);
      } else {
        console.error("Transcription is missing in the response");
      }
  
    } catch (error) {
      console.error("Error fetching recording:", error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchCallLogs(); // Initial fetch when the component mounts
  }, []);

  return (
    <div className="dashboard">
      <h1>Samodrei AI Telecaller Dashboard</h1>
      <button className="call-button" onClick={() => setShowForm(true)}>
        <img
          src="https://img.icons8.com/?size=50&id=48193&format=png&color=000000"
          className="call-button-img"
          alt="call icon"
        />
      </button>

      {/* Show loading state while fetching data */}
      {loading ? (
        <p>Loading call logs...</p>
      ) : (
        <CallLogTable users={callLogs} handlePlay={handlePlay}/>
      )}

      {showForm && <CallForm onClose={handleCloseForm} />}

      {/* Only show modal if transcription data is loaded */}
      {showModal && (
        <Modal
          recordingLink = {recordingLink}
          transcription={transcription}
          onClose={handleCloseModal}
          loading={transcriptionLoading} // Pass transcription loading state to modal
        />
      )}
    </div>
  );
};

export default Dashboard;
