import { useState } from 'react';
import { X, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Productivity is never an accident. It is always the result of a commitment to excellence.", author: "Paul J. Meyer" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey" },
  { text: "Small deeds done are better than great deeds planned.", author: "Peter Marshall" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "Be present in all things and thankful for all things.", author: "Maya Angelou" },
  { text: "Almost everything will work again if you unplug it for a few minutes.", author: "Anne Lamott" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin" },
  { text: "The first step is you have to say that you can.", author: "Will Smith" },
  { text: "Do what you have to do until you can do what you want to do.", author: "Oprah Winfrey" },
  { text: "Clarity about what matters provides clarity about what does not.", author: "Cal Newport" },
  { text: "You will never find time for anything. You must make it.", author: "Charles Buxton" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Augusta F. Kantra" },
  { text: "An ounce of action is worth a ton of theory.", author: "Ralph Waldo Emerson" },
  { text: "Either run the day, or the day runs you.", author: "Jim Rohn" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
  { text: "One day or day one. You decide.", author: "Unknown" },
];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export default function DailyQuote() {
  const todayStr = getTodayStr();
  const dismissedKey = 'taskflow-quote-dismissed';
  const dismissed = localStorage.getItem(dismissedKey) === todayStr;

  const [hidden, setHidden] = useState(dismissed);

  const quote = QUOTES[getDayOfYear() % QUOTES.length];

  const handleDismiss = () => {
    localStorage.setItem(dismissedKey, todayStr);
    setHidden(true);
  };

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden px-6"
        >
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl mb-3 relative"
            style={{
              background: 'rgba(124,58,237,0.08)',
              borderLeft: '3px solid #7c3aed',
              border: '1px solid rgba(124,58,237,0.2)',
              borderLeftWidth: '3px',
            }}
          >
            <Quote size={14} className="text-purple-400 flex-shrink-0 opacity-60" />
            <p className="text-sm text-white/60 italic flex-1">
              "{quote.text}"
              <span className="not-italic font-medium text-white/40 ml-2">— {quote.author}</span>
            </p>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-white/20 hover:text-white/50 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
