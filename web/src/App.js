import { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import firebaseConfig from './firebaseConfig';
import './App.css';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

function App() {
  const [phone, setPhone] = useState('+16505551234');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(0); // 0: enter phone, 1: enter OTP
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [backendResp, setBackendResp] = useState(null);
  const [showRecaptcha, setShowRecaptcha] = useState(true); // toggle for recaptcha widget

  // Global error handler for uncaught errors
  useEffect(() => {
    const handleGlobalError = (event) => {
      setErrorMessage('An unexpected error occurred: ' + (event.reason?.message || event.message || 'Unknown error'));
    };
    window.addEventListener('unhandledrejection', handleGlobalError);
    window.addEventListener('error', handleGlobalError);
    return () => {
      window.removeEventListener('unhandledrejection', handleGlobalError);
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  // reCAPTCHA verifier
  useEffect(() => {
    const initializeRecaptcha = () => {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
          size: showRecaptcha ? 'normal' : 'invisible',
          callback: () => setMessage('reCAPTCHA Success!'),
          'expired-callback': () => setMessage('reCAPTCHA expired. Please complete the challenge again.'),
          'error-callback': () => setMessage('reCAPTCHA error occurred.'),
        });
        window.recaptchaVerifier.render();
      }
    };

    initializeRecaptcha();
  }, [showRecaptcha]);

  const handleError = (error) => {
    const errorMessages = {
      'auth/network-request-failed': 'Network error: Please check your internet connection and try again.',
      'timeout': 'Timeout: The request took too long. Please try again.',
    };
    setMessage(errorMessages[error.code] || error.message || 'An unexpected error occurred.');
  };

  const sendOTP = async () => {
    setMessage('');
    const appVerifier = window.recaptchaVerifier;

    try {
      const confirmationResult = await firebase.auth().signInWithPhoneNumber(phone, appVerifier);
      window.confirmationResult = confirmationResult;
      setStep(1);
      setMessage('OTP sent!');
    } catch (error) {
      handleError(error);
    }
  };

  const verifyOTP = async () => {
    setMessage('');

    try {
      const result = await window.confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      const response = await fetch('http://localhost:8080/verify-id-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await response.json();
      setBackendResp(data);
      setMessage('Signed in!');
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h2 className="auth-title">📱 Phone Sign-In</h2>
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          <label style={{ fontSize: 14, marginRight: 8 }}>
            <input
              type="checkbox"
              checked={showRecaptcha}
              onChange={e => setShowRecaptcha(e.target.checked)}
              style={{ marginRight: 4 }}
            />
            Show reCAPTCHA widget
          </label>
        </div>
        {step === 0 ? (
          <>
            <label className="auth-label">Phone Number</label>
            <input
              type="text"
              placeholder="+18578329806"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="auth-input"
            />
            <div id="recaptcha-container" style={{ marginBottom: 16, display: showRecaptcha ? 'block' : 'none' }}></div>
            <button
              onClick={sendOTP}
              className="auth-btn auth-btn-send"
            >
              Send OTP
            </button>
          </>
        ) : (
          <>
            <label className="auth-label">Enter OTP</label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              className="auth-input"
            />
            <button
              onClick={verifyOTP}
              className="auth-btn auth-btn-verify"
            >
              Verify OTP
            </button>
          </>
        )}
        {message && <div className="auth-message">{message}</div>}
        {backendResp && (
          <pre className="auth-backend">{JSON.stringify(backendResp, null, 2)}</pre>
        )}
        {errorMessage && <div className="auth-message">{errorMessage}</div>}
      </div>
    </div>
  );
}

export default App;