import React from 'react';
import './AnimatedTransactionIcon.css';

export default function AnimatedTransactionIcon({ type = 'incoming', amount = 100 }) {
  const isIncoming = type === 'incoming';
  
  return (
    <div className={`transaction-icon-container ${type}`}>
      <div className="icon-wrapper">
        <div className={`animated-arrow ${isIncoming ? 'arrow-down' : 'arrow-up'}`}>
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {isIncoming ? (
              <path d="M12 5v14M19 12l-7 7-7-7" />
            ) : (
              <path d="M12 19V5M5 12l7-7 7 7" />
            )}
          </svg>
        </div>
      </div>
      <div className="amount-display">
        <span className={`sign ${isIncoming ? 'plus' : 'minus'}`}>
          {isIncoming ? '+' : '-'}
        </span>
        <span className="value">${amount}</span>
      </div>
    </div>
  );
}
