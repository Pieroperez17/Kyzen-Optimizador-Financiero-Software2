import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthenticationLayout from '../components/AuthenticationLayout.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import FormValidator from '../domain/FormValidator.js';
import { authenticationService } from '../services/AuthenticationService.js';

const STEP_TITLES = {
  email: 'Recuperar contraseña',
  code: 'Ingresa el código',
  password: 'Crea una nueva contraseña',
  done: 'Contraseña actualizada'
};

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const run = async (action) => {
    setStatus(null);
    setSubmitting(true);
    try {
      await action();
    } catch (error) {
      setStatus({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmail = (event) => {
    event.preventDefault();
    run(async () => {
      const result = await authenticationService.forgotPassword(email);
      setStatus({ type: 'success', text: result.message });
      setStep('code');
    });
  };

  const handleCode = (event) => {
    event.preventDefault();
    run(async () => {
      await authenticationService.verifyResetCode(email, code);
      setStep('password');
    });
  };

  const handlePassword = (event) => {
    event.preventDefault();
    if (!FormValidator.isValidPassword(password)) {
      setStatus({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres, con letras y números.' });
      return;
    }
    if (password !== confirmation) {
      setStatus({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }
    run(async () => {
      await authenticationService.resetPassword(email, code, password);
      setStep('done');
    });
  };

  return (
    <AuthenticationLayout title={STEP_TITLES[step]}>
      {step === 'email' && (
        <form className="form" onSubmit={handleEmail}>
          <p className="muted">Te enviaremos un código para restablecer tu contraseña.</p>
          <label>
            Correo electrónico
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <StatusMessage status={status} />
          <button type="submit" className="button" disabled={submitting}>Enviar código</button>
        </form>
      )}

      {step === 'code' && (
        <form className="form" onSubmit={handleCode}>
          <StatusMessage status={status} />
          <label>
            Código de 6 dígitos
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
          <button type="submit" className="button" disabled={submitting || code.length !== 6}>Verificar código</button>
        </form>
      )}

      {step === 'password' && (
        <form className="form" onSubmit={handlePassword}>
          <label>
            Nueva contraseña
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required />
          </label>
          <label>
            Confirmar contraseña
            <input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" required />
          </label>
          <StatusMessage status={status} />
          <button type="submit" className="button" disabled={submitting}>Guardar contraseña</button>
        </form>
      )}

      {step === 'done' && (
        <div className="form">
          <p className="status status-success">Tu contraseña fue actualizada. Ya puedes iniciar sesión.</p>
          <Link to="/login" className="button">Ir a iniciar sesión</Link>
        </div>
      )}

      {step !== 'done' && <p className="form-footer"><Link to="/login">Volver al inicio de sesión</Link></p>}
    </AuthenticationLayout>
  );
}
