import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ width, timeLeft }) => {
  return (
    <div>
      <div className="progress-container">
        <div
          className="progress-bar"
          data-testid="progress-bar"
          style={{ width: `${width}%` }}
        ></div>
      </div>
      <p>Time left: {timeLeft} seconds</p>
    </div>
  );
};

export default ProgressBar;
