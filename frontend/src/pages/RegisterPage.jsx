import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthenticationLayout from '../components/AuthenticationLayout.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import FormValidator from '../domain/FormValidator.js';
import { authenticationService } from '../services/AuthenticationService.js';

const EMPTY_FORM = { firstName: '', lastName: '', birthDate: '', phone: '', email: '', password: '', confirmation: '' };

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const validate = () => {
    if (!FormValidator.isValidEmail(form.email)) return 'Ingresa un correo electrónico válido.';
    if (!FormValidator.isValidPassword(form.password)) return 'La contraseña debe tener al menos 8 caracteres, con letras y números.';
    if (form.password !== form.confirmation) return 'Las contraseñas no coinciden.';
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const error = validate();
    if (error) {
      setStatus({ type: 'error', text: error });
      return;
    }

    setSubmitting(true);
    try {
      const { confirmation, ...data } = form;
      const result = await authenticationService.register(data);
      navigate('/verificar', { state: { email: result.email } });
    } catch (requestError) {
      setStatus({ type: 'error', text: requestError.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthenticationLayout title="Crear cuenta" subtitle="Usa tu correo universitario para registrarte.">
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            Nombre
            <input name="firstName" value={form.firstName} onChange={updateField} autoComplete="given-name" required />
          </label>
          <label>
            Apellido
            <input name="lastName" value={form.lastName} onChange={updateField} autoComplete="family-name" required />
          </label>
        </div>
        <div className="form-row">
          <label>
            Fecha de nacimiento
            <input type="date" name="birthDate" value={form.birthDate} onChange={updateField} required />
          </label>
          <label>
            Celular (opcional)
            <input type="tel" name="phone" value={form.phone} onChange={updateField} autoComplete="tel" />
          </label>
        </div>
        <label>
          Correo electrónico
          <input type="email" name="email" value={form.email} onChange={updateField} autoComplete="email" required />
        </label>
        <div className="form-row">
          <label>
            Contraseña
            <input type="password" name="password" value={form.password} onChange={updateField} autoComplete="new-password" required />
          </label>
          <label>
            Confirmar contraseña
            <input type="password" name="confirmation" value={form.confirmation} onChange={updateField} autoComplete="new-password" required />
          </label>
        </div>
        <p className="hint">Mínimo 8 caracteres, con letras y números.</p>
        <StatusMessage status={status} />
        <button type="submit" className="button" disabled={submitting}>
          {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>
      <p className="form-footer">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
    </AuthenticationLayout>
  );
}
