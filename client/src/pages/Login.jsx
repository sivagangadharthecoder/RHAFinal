import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const { addToast } = useToast();

  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContent);

  const [state, setState] = useState('Sign Up');
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    rollNumber: '',
    password: ''
  });

  const validateName = (value) => {
    if (value.length > 14) {
      setErrors(prev => ({ ...prev, name: 'Name must be 14 characters or less' }));
      return false;
    }
    setErrors(prev => ({ ...prev, name: '' }));
    return true;
  };

  const validateRollNumber = (value) => {
    if (value.length > 14) {
      setErrors(prev => ({ ...prev, rollNumber: 'Roll number must be 14 characters or less' }));
      return false;
    }
    setErrors(prev => ({ ...prev, rollNumber: '' }));
    return true;
  };

  const validatePassword = (value) => {
    if (value.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      return false;
    }
    setErrors(prev => ({ ...prev, password: '' }));
    return true;
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    if (value.length <= 14) {
      setName(value);
      validateName(value);
    }
  };

  const handleRollNumberChange = (e) => {
    const value = e.target.value;
    if (value.length <= 10) {
      setRollNumber(value);
      validateRollNumber(value);
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();

      const isNameValid = state === 'Sign Up' ? validateName(name) : true;
      const isRollNumberValid = validateRollNumber(rollNumber);
      const isPasswordValid = validatePassword(password);

      if (!isNameValid || !isRollNumberValid || !isPasswordValid) {
        return;
      }

      axios.defaults.withCredentials = true;

      if (state === 'Sign Up') {
        const response = await axios.post(`${backendUrl}/api/auth/register`, {
          name,
          rollNumber,
          email,
          password
        });

        if (response.data.success) {
          await getUserData();
          setIsLoggedin(true);
          addToast(
            { title: 'Success', body: 'Welcome To RequestHub !!' },
            'success'
          );
          addToast(
            { title: 'Info', body: 'Verify To Access Dashboard !' },
            'info'
          );
          navigate('/');
        } else {
          addToast(
            { title: 'Error', body: 'Failed To Register !' },
            'error'
          );
        }
      } else {
        const response = await axios.post(`${backendUrl}/api/auth/login`, {
          rollNumber,
          email,
          password
        });

        if (response.data.success) {
          await getUserData();
          setIsLoggedin(true);
          addToast(
            { title: 'Success', body: 'Welcome Back !' },
            'success'
          );
          navigate('/');
        } else {
          addToast(
            { title: 'Error', body: 'Login Failed !' },
            'error'
          );
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      addToast(
        { title: 'Error', body: errorMessage },
        'error'
      );
    }
  };

  return (
    <>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8f8f8',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
      }}>
        <header
          style={{
            padding: '20px',
            fontSize: '24px',
            fontWeight: '700',
            color: '#222',
            cursor: 'pointer',
            textAlign: 'center',
            borderBottom: '1px solid #eee',
            backgroundColor: 'white'
          }}
          onClick={() => navigate('/')}
        >
          RequestHub
        </header>

        <div style={{
          maxWidth: '420px',
          width: '90%',
          margin: '30px auto',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #eee'
          }}>
            <h2 style={{
              margin: '0',
              fontSize: '20px',
              color: '#222',
              fontWeight: '600'
            }}>
              {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p style={{
              margin: '8px 0 0',
              fontSize: '14px',
              color: '#666'
            }}>
              {state === 'Sign Up' ? 'Get started with your account' : 'Log in to continue'}
            </p>
          </div>

          <form onSubmit={onSubmitHandler} style={{ padding: '24px' }}>
            {state === 'Sign Up' && (
              <>
                <div style={{ position: 'relative', marginBottom: '4px' }}>
                  <span style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '16px',
                    color: '#666'
                  }}>👤</span>
                  <input
                    onChange={handleNameChange}
                    value={name}
                    type="text"
                    placeholder="Full Name - At Most 14"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      border: errors.name ? '1px solid #ff4444' : '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      color: '#222',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                {errors.name && (
                  <p style={{
                    color: '#ff4444',
                    fontSize: '12px',
                    margin: '0 0 12px 0',
                    textAlign: 'right'
                  }}>
                    {errors.name}
                  </p>
                )}
              </>
            )}

            <div style={{ position: 'relative', marginBottom: '4px' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '16px',
                color: '#666'
              }}>🪪</span>
              <input
                onChange={handleRollNumberChange}
                value={rollNumber}
                type="text"
                placeholder="Roll.No - Capitals Only"
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: errors.rollNumber ? '1px solid #ff4444' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  color: '#222',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            {errors.rollNumber && (
              <p style={{
                color: '#ff4444',
                fontSize: '12px',
                margin: '0 0 12px 0',
                textAlign: 'right'
              }}>
                {errors.rollNumber}
              </p>
            )}

            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '16px',
                color: '#666'
              }}>📧</span>
              <input
                onChange={e => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="College Mail"
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  color: '#222',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ position: 'relative', marginBottom: '4px' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '16px',
                color: '#666'
              }}>🔒</span>
              <input
                onChange={handlePasswordChange}
                value={password}
                type="password"
                placeholder="Password"
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: errors.password ? '1px solid #ff4444' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  color: '#222',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            {errors.password && (
              <p style={{
                color: '#ff4444',
                fontSize: '12px',
                margin: '0 0 12px 0',
                textAlign: 'right'
              }}>
                {errors.password}
              </p>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '20px'
            }}>
              <span
                style={{
                  fontSize: '13px',
                  color: '#555',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
                onClick={() => navigate('/reset-password')}
              >
                Forgot Password?
              </span>
            </div>

            <button type="submit" style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#222',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              marginTop: '8px'
            }}>
              {state}
            </button>
          </form>

          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #eee',
            textAlign: 'center',
            fontSize: '14px',
            color: '#666'
          }}>
            {state === 'Sign Up' ? (
              <p>
                Already Have An Account?{' '}
                <span
                  style={{
                    color: '#222',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                  onClick={() => setState('Login')}
                >
                  Log In
                </span>
              </p>
            ) : (
              <p>
                Don't Have An Account?{' '}
                <span
                  style={{
                    color: '#222',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                  onClick={() => setState('Sign Up')}
                >
                  Sign up
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
