import React from 'react';
import Tilt from 'react-parallax-tilt';
import './BalanceCard3D.css';

export default function BalanceCard3D({ balance = 5000 }) {
  return (
    <Tilt
      scale={1.05}
      transitionSpeed={400}
      tiltMaxAngleX={15}
      tiltMaxAngleY={15}
    >
      <div className="balance-card-3d">
        <div className="card-inner">
          <div className="card-top">
            <h3>Total Balance</h3>
            <span className="chip">★</span>
          </div>
          <div className="card-amount">
            <span className="currency">$</span>
            <span className="value">{balance.toLocaleString()}</span>
          </div>
          <div className="card-bottom">
            <div>
              <p className="label">Card Holder</p>
              <p className="name">Your Name</p>
            </div>
            <div>
              <p className="label">Exp Date</p>
              <p className="date">12/26</p>
            </div>
          </div>
          <div className="card-glow"></div>
        </div>
      </div>
    </Tilt>
  );
}
