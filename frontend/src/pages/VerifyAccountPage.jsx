import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthenticationLayout from '../components/AuthenticationLayout.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { useAuthentication } from '../context/AuthenticationContext.jsx';
import { authenticationService } from '../services/AuthenticationService.js';

export default function VerifyAccountPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyAccount } = useAuthentication();
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState(
    location.state?.email ? { type: 'success', text: `Enviamos un código de 6 dígitos a ${location.state.email}.` } : null
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await verifyAccount(email, code);
      navigate('/');
    } catch (error) {
      setStatus({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      const result = await authenticationService.resendCode(email);
      setStatus({ type: 'success', text: result.message });
    } catch (error) {
      setStatus({ type: 'error', text: error.message });
    }
  };

  return (
    <AuthenticationLayout title="Verifica tu correo" subtitle="Ingresa el código que recibiste para activar tu cuenta.">
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Correo electrónico
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Código de verificación
          <input
            className="code-input"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            required
          />
        </label>
        <StatusMessage status={status} />
        <button type="submit" className="button" disabled={submitting || code.length !== 6}>
          {submitting ? 'Verificando...' : 'Verificar cuenta'}
        </button>
        <button type="button" className="button button-secondary" onClick={handleResend} disabled={!email}>
          Reenviar código
        </button>
      </form>
      <p className="form-footer"><Link to="/login">Volver al inicio de sesión</Link></p>
    </AuthenticationLayout>
  );
}
