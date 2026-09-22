import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { MessageSquare, Star, CheckCircle2, X, Send, Sparkles, User, ThumbsUp } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [role, setRole] = useState<'borrower' | 'lender' | 'auditor' | 'developer'>('borrower');
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<'privacy' | 'performance' | 'ui' | 'circuits'>('privacy');
  const [comments, setComments] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) return;

    // Persist locally for feedback loop tracking
    try {
      const existing = JSON.parse(localStorage.getItem('shieldscore_user_feedback') || '[]');
      existing.push({
        id: Date.now(),
        role,
        rating,
        category,
        comments,
        submittedAt: new Date().toISOString(),
      });
      localStorage.setItem('shieldscore_user_feedback', JSON.stringify(existing));
    } catch (e) {}

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setComments('');
      onClose();
    }, 2200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-lg"
          >
            <GlassCard glow className="p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-1 text-cyan-400 font-mono text-xs uppercase tracking-wider font-semibold">
                <MessageSquare className="w-4 h-4" />
                <span>Level 5 & 6 Living Feedback Loop</span>
              </div>

              <h3 className="font-display text-2xl font-bold text-white tracking-tight">
                Submit Product Feedback
              </h3>
              <p className="font-sans text-xs text-slate-300 mt-1 leading-relaxed">
                Help shape the future of confidential credit on Midnight. Your input directly influences our circuit features and underwriting roadmaps.
              </p>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center text-center space-y-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-display text-lg font-bold text-white">Feedback Recorded!</h4>
                  <p className="text-xs font-sans text-slate-300 max-w-xs leading-relaxed">
                    Thank you for participating in our testnet user feedback loop. Your response has been added to our development ledger.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  {/* Persona Selector */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Your Participant Role
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'borrower', label: 'Borrower' },
                        { id: 'lender', label: 'Lender' },
                        { id: 'auditor', label: 'Auditor' },
                        { id: 'developer', label: 'Developer' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setRole(item.id as any)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-mono font-medium transition-all text-center border ${
                            role === item.id
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                              : 'bg-white/[0.03] text-slate-400 border-white/5 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex justify-between">
                      <span>Overall Experience Rating</span>
                      <span className="font-mono text-cyan-300 font-bold">{rating} / 5 Stars</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= rating
                                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                                : 'text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Feedback Topic
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-xl bg-canvas-input border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-400 transition-all"
                    >
                      <option value="privacy">Zero-Knowledge Privacy Guarantee & Disclosures</option>
                      <option value="performance">Prover Speed & Client-Side Proof Generation</option>
                      <option value="ui">User Interface, Animations & Typography</option>
                      <option value="circuits">Compact Smart Contract Circuit Logic</option>
                    </select>
                  </div>

                  {/* Comments */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Your Insights & Suggestions
                    </label>
                    <textarea
                      rows={3}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="e.g. The client-side proof generation felt instant. I would like to see support for multi-asset collateral ratios in Tier B..."
                      className="w-full px-4 py-2.5 rounded-xl bg-canvas-input border border-white/10 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400 transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!comments.trim()}
                    className="w-full py-3.5 rounded-xl font-display font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 transition-all flex items-center justify-center gap-2 text-xs tracking-tight shadow-[0_0_20px_rgba(0,240,255,0.3)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit to Feedback Ledger</span>
                  </motion.button>
                </form>
              )}
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
