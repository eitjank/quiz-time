import React from 'react';
import './Leaderboard.css';

function Leaderboard({ results }) {
  return (
    <div>
      <h2>Results</h2>
      <table className="leaderboard">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Participant ID</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {results
            .sort((a, b) => b.score - a.score)
            .map((participant, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{participant.id}</td>
                <td>{participant.score}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;
