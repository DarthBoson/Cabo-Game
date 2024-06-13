import React from 'react';

function Card({ card }) {
  return (
    <div className="card">
      <h4>{card.value}</h4>
    </div>
  );
}

export default Card;
