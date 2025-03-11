import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

interface CallFormProps {
  onClose: () => void;
}

const CallForm: React.FC<CallFormProps> = ({ onClose}) => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [aiModel, setAiModel] = useState("Zach");
  const [calling, setCalling] = useState(false);
  const [callStatus, setCallStatus] = useState("");

  const socketRef = useRef<WebSocket | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    socketRef.current = new WebSocket("wss://api.thesamodrei.com/ws");
    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
    };

    socketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.status === "ringing") {
        setCallStatus("Calling...");
      } else if (message.status === "answered" || message.status === "in-progress") {
        setCallStatus("Answered");
      } else if (message.status === "busy") {
        setCallStatus("Busy");
        setCalling(false);
      } else if (message.status === "canceled") {
        setCalling(false);
        setCallStatus("Canceled");
      } else if (message.status === "failed") {
        setCalling(false);
        setCallStatus("Failed");
      } else if (message.status === "no-answer") {
        setCalling(false);
        setCallStatus("No Answer");
      } else if (message.status.toLowerCase().includes("not interested")) {
        setCalling(false);
        setCallStatus("Not Interested");
      } else if (message.status.toLowerCase().includes("interested")) {
        setCalling(false);
        setCallStatus("Great Work");
      } else if (message.status.toLowerCase().includes("voice mail")) {
        setCalling(false);
        setCallStatus(message.status);
      } else {
        setCalling(false);
        setCallStatus("Voice Mail");
      }
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    // Close the form if clicked outside
    const handleClickOutside = (event: MouseEvent) => {
      if (!calling && formRef.current && !formRef.current.contains(event.target as Node)) {
        onClose();
      }
    };    

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      socketRef.current?.close();
    };
  }, [onClose, calling]);
  
  const handleSubmit = (e: React.FormEvent) => {
    // Disable the form and start the calling process
    setCalling(true);
    console.log(calling);
    setCallStatus("Calling...");

    // Make the call by calling the FastAPI backend
    fetch("https://api.thesamodrei.com/make_call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        phone_number_to_call: phoneNumber,
        ai_model: aiModel
      }),
    })
      .then((response) => response.json())
      .catch((error) => {
        setCalling(false);
        setCallStatus("Line In Use.");
        console.error("Error making the call:", error);
      });
  };

  return (
    <div className="overlay">
      <div className="blur-overlay"></div>
      <div className="call-form-container" ref={formRef}>
        {calling ? (
          <div className="calling-form">
              {/* Display the call status dynamically */}
              <h2>{callStatus}</h2>
              <p>
              {
                  callStatus === "Calling..." 
                  ? "We are connecting your call..." 
                  : callStatus === "Answered" 
                      ? "Your call has been answered." 
                      : callStatus === "Busy"
                      ? "The call was hung up." 
                      : callStatus === "No Answer" 
                          ? "The call was not answered." 
                          : callStatus === "Canceled"
                          ? "The call has been canceled." 
                          : callStatus === "Failed"
                              ? "The call attempt failed." 
                              : callStatus === "Not Interested"
                              ? "The person is not interested" 
                              : callStatus === "Great Work"
                                  ? "Good Work! The doctor is interested in your proposal." 
                                  : callStatus === "Line In Use"
                                    ? "The Line is in use to call someone."
                                    : callStatus === "Voice Mail"
                                      ? "The call is received by the voice mail."
                                      : "Call status unknown."
                }
              </p>
          
              {/* Update the icon dynamically based on call status */}
              <div className="status-icon">
              {callStatus === "Calling..." && (
                  <span>
                  <img src="https://img.icons8.com/?size=100&id=ttftExb6jtAb&format=png&color=000000" alt="Calling icon" />
                  </span>
              )}
              {callStatus === "Answered" && (
                  <span>
                  <img src="https://img.icons8.com/?size=100&id=LXjdUIlP9Bn0&format=png&color=000000" alt="Answered icon" />
                  </span>
              )}
              {(callStatus === "Busy" || callStatus === "Line In Use") && (
                  <span>
                  <img src="https://img.icons8.com/?size=100&id=IgtuV5JiyIFq&format=png&color=000000" alt="Busy icon" />
                  </span>
              )}
              {(callStatus === "No Answer" || callStatus === "Canceled" || callStatus === "Failed") && (
                  <span>
                  <img src="https://img.icons8.com/?size=100&id=1g8nJFBIq3qC&format=png&color=000000" alt="No Answer/Canceled/Failed icon" />
                  </span>
              )}
              {callStatus === "Not Interested" && (
                  <span>
                  <img src="https://img.icons8.com/?size=100&id=w6Cwmjm16hQ4&format=png&color=000000" alt="Completed icon" />
                  </span>
              )}
              {callStatus === "Great Work" && (
                  <span>
                  <img src="https://img.icons8.com/?size=100&id=FYJ9HNSqf_uK&format=png&color=000000" alt="Completed icon" />
                  </span>
              )}
              {callStatus === "Voice Mail" && (
                  <span>
                  <img src="https://img.icons8.com/?size=100&id=wx1BaAIqQb87&format=png&color=000000" alt="Completed icon" />
                  </span>
              )}
              </div>
          </div>
        ) : (
          <form className="call-form" onSubmit={handleSubmit}>
            <label>
              Name:
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label>
              Phone Number:
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </label>
            <label>
              AI Model:
              <select value={aiModel} onChange={(e) => setAiModel(e.target.value)}>
                <option value="Zach">Zach</option>
                <option value="Sophia">Sophia</option>
              </select>
            </label>
            <div className="call-form-button-container">
              <button type="submit">Call</button>
              <button type="button" onClick={onClose}>
                  Close
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CallForm;
