import { useState } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError('');
      if (newPin.length === 4) {
        handleSubmit(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleSubmit = async (pinValue: string) => {
    setLoading(true);
    const result = await login(pinValue);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'PIN invalid');
      setPin('');
    }
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

  return (
    <div className="h-screen flex items-center justify-center bg-bg-primary p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="card p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Pizzeria Baracca</h1>
            <p className="text-text-muted mt-1">KDS Bucătărie — Takeaway</p>
          </div>

          {/* PIN Display */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    i < pin.length ? 'bg-primary scale-110' : 'bg-border-subtle'
                  }`}
                />
              ))}
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-red-400 text-sm text-center mt-2"
              >
                {error}
              </motion.p>
            )}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3">
            {digits.map((digit) => (
              <motion.button
                key={digit}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (digit === 'C') {
                    setPin('');
                    setError('');
                  } else if (digit === '⌫') {
                    handleDelete();
                  } else {
                    handleDigit(digit);
                  }
                }}
                disabled={loading && digit !== 'C'}
                className={`h-16 rounded-xl text-xl font-semibold transition-colors ${
                  digit === 'C'
                    ? 'bg-status-new/10 text-status-new hover:bg-status-new/20'
                    : digit === '⌫'
                    ? 'bg-border-subtle/50 text-text-muted hover:bg-border-subtle'
                    : 'bg-bg-card-hover text-text-primary hover:bg-border-subtle'
                } disabled:opacity-50`}
              >
                {loading && digit !== 'C' ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  digit
                )}
              </motion.button>
            ))}
          </div>

          <p className="text-text-muted text-xs text-center mt-6">
            Introdu PIN-ul de 4 cifre pentru a accesa KDS
          </p>
        </div>
      </motion.div>
    </div>
  );
}
