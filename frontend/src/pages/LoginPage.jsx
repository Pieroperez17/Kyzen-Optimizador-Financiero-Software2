import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthenticationLayout from '../components/AuthenticationLayout.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { useAuthentication } from '../context/AuthenticationContext.jsx';

export default function LoginPage() {
  const { login } = useAuthentication();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      if (error.data?.requiresVerification) {
        navigate('/verificar', { state: { email: error.data.email } });
        return;
      }
      setStatus({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthenticationLayout title="Iniciar sesión" subtitle="Ingresa a tu panel financiero.">
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Correo electrónico
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
        </label>
        <Link to="/recuperar" className="form-link">¿Olvidaste tu contraseña?</Link>
        <StatusMessage status={status} />
        <button type="submit" className="button" disabled={submitting}>
          {submitting ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
      <p className="form-footer">¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
    </AuthenticationLayout>
  );
}
