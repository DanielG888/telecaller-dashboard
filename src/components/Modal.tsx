import React, { useEffect } from "react";
import "./Modal.css";
import { AudioPlayer } from 'react-audio-player-component';
interface ModalProps {
  recordingLink: string;
  transcription: string;
  onClose: () => void;
  loading: boolean;
}

const Modal: React.FC<ModalProps> = ({ recordingLink, transcription, onClose, loading }) => {
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const modal = document.getElementById("modal");
      if (modal && !modal.contains(e.target as Node)) {
        onClose();
      }
    };

    // Add event listener for outside clicks
    document.addEventListener("mousedown", handleOutsideClick);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [onClose]);

  return (
    <div className="overlay">
      {/* Full-screen blur overlay */}
      <div className="blur-overlay"></div>

      {/* Modal itself */}
      <div className="modal-overlay" id="modal">
        <div className="modal">
          <button className="modal-close" onClick={onClose}>✖</button>

          {/* Display loading spinner while transcription is loading */}
          {loading ? (
            <div className="modal-loading">
              <p>Loading transcription...</p>
              <div className="loading-spinner"></div> {/* Customize the spinner */}
            </div>
          ) : (
            // Display transcription data once loaded
            <div className="modal-content">
              <AudioPlayer 
                src= {recordingLink}
                minimal={false}
                width={350}
                trackHeight={75}
                barWidth={1}
                gap={1}

                visualise={true}
                backgroundColor="#FFF8DE"
                barColor="#C1D0B5"
                barPlayedColor="#99A98F"

                skipDuration={2}
                showLoopOption={true}
                showVolumeControl={true}

                seekBarColor="purple"
                volumeControlColor="blue"
                hideSeekBar={true}
                // hideTrackKnobWhenPlaying={true}
              />
              <h3>Transcription:</h3>
              <p>{transcription}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
