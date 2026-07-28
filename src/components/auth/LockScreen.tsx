import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, ShieldCheck, KeyRound, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';

interface LockScreenProps {
  onUnlock?: () => void;
  onLoginSuccess?: () => void;
  agencyName?: string;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock, onLoginSuccess, agencyName = 'SOLVEX' }) => {
  const handleSuccess = onUnlock || onLoginSuccess;
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  const performUnlock = async (pwdToVerify: string) => {
    setLoading(true);
    setError(null);

    try {
      await api.verifyMasterPassword(pwdToVerify, remember);
      if (handleSuccess) {
        handleSuccess();
      }
    } catch (err: any) {
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);
      setError(err.message || 'Invalid Master Password');

      if (attempts >= 3) {
        setLockoutTimer(15);
        const interval = setInterval(() => {
          setLockoutTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setFailedAttempts(0);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || lockoutTimer > 0) return;
    await performUnlock(password);
  };

  const handleQuickUnlock = async () => {
    setPassword('solvex2026');
    await performUnlock('solvex2026');
  };

  return (
    <div className="min-h-screen bg-[#07080B] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Lighting Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8EF012]/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-[#8EF012]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d0f_1px,transparent_1px),linear-gradient(to_bottom,#1f293d0f_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-40"
      />

      {/* Content Container */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#121620] border border-[#8EF012]/30 shadow-[0_0_30px_rgba(142,240,18,0.2)] mb-4 relative group">
            <ShieldCheck className="w-8 h-8 text-[#8EF012]" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#8EF012] rounded-full animate-ping opacity-75" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#8EF012] rounded-full" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-wider text-white uppercase flex items-center justify-center gap-2">
            {agencyName} <span className="text-xs px-2 py-0.5 rounded bg-[#8EF012]/20 border border-[#8EF012]/40 text-[#8EF012] font-mono normal-case tracking-normal">ENTERPRISE</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1 font-medium tracking-wide">
            Client Management System & Security Vault
          </p>
        </div>

        {/* Lock Box */}
        <div className="bg-[#0F131C]/90 border border-[#222B3D] rounded-2xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          {/* Top Line Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8EF012] to-transparent" />

          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#222B3D]">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#8EF012]" />
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-widest">Master Lock System</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">
              AES-256 PROTECTED
            </span>
          </div>

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">
                Enter Master Authorization Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <KeyRound className="w-4 h-4 text-gray-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={lockoutTimer > 0}
                  placeholder="Master password..."
                  className="w-full pl-10 pr-10 py-3 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#8EF012] focus:ring-1 focus:ring-[#8EF012] transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </motion.div>
            )}

            {lockoutTimer > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Security Lockout: Try again in {lockoutTimer} seconds</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-[#2A344A] bg-[#161B27] text-[#8EF012] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#8EF012]"
                />
                <span>Remember session on this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || lockoutTimer > 0 || !password}
              className="w-full py-3 px-4 bg-[#8EF012] text-black font-bold text-sm rounded-xl hover:bg-[#a2f734] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(142,240,18,0.25)]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Unlock Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick hint for initial startup / demo */}
          <div className="mt-6 pt-4 border-t border-[#1F2738] flex flex-col items-center justify-center gap-2">
            <p className="text-[11px] text-gray-400">
              Default Master Password: {' '}
              <button
                type="button"
                onClick={handleQuickUnlock}
                className="inline-flex items-center gap-1 bg-[#181F2E] hover:bg-[#222c42] border border-[#8EF012]/30 px-2 py-0.5 rounded text-[#8EF012] font-mono text-xs transition-colors cursor-pointer"
                title="Click to auto-fill and unlock"
              >
                <span>solvex2026</span>
                <span className="text-[10px] text-gray-400">(click to unlock)</span>
              </button>
            </p>
          </div>
        </div>

        {/* Security Footer Badges */}
        <div className="mt-8 flex items-center justify-center gap-6 text-[11px] text-gray-500 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-[#8EF012] rounded-full"></span>
            ZERO-TRUST ARCHITECTURE
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-[#8EF012] rounded-full"></span>
            END-TO-END ENCRYPTED
          </span>
        </div>
      </motion.div>
    </div>
  );
};
