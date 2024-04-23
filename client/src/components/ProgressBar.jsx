import React from 'react'

const ProgressBar = ({ width, timeLeft }) => {
  return (
    <div>
    <div className="progress-container">
      <div
        className="progress-bar"
        style={{ width: `${width}%` }}
      ></div>
    </div>
    <p>Time left: {timeLeft} seconds</p>
  </div>
  )
}

export default ProgressBar