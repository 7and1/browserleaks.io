'use client';

import { useState, useCallback, useMemo } from 'react';
import { LabShell } from '@/components/layout/LabShell';

interface PasswordAnalysis {
  password: string;
  length: number;
  entropy: number;
  strength: 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong';
  crackTime: {
    online: string;
    offline: string;
    massiveParallel: string;
  };
  characterSets: {
    lowercase: boolean;
    uppercase: boolean;
    numbers: boolean;
    symbols: boolean;
    spaces: boolean;
    unicode: boolean;
  };
  patterns: {
    hasSequence: boolean;
    hasKeyboardWalk: boolean;
    hasRepeating: boolean;
    hasDictionary: boolean;
    hasDate: boolean;
  };
  suggestions: string[];
}

const COMMON_PASSWORDS = [
  'password', '123456', 'qwerty', 'abc123', 'monkey', 'master', 'dragon',
  'letmein', 'login', 'admin', 'welcome', 'football', 'baseball', 'iloveyou',
  'trustno1', 'sunshine', 'princess', 'starwars', 'whatever', 'shadow',
];

const KEYBOARD_ROWS = [
  'qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890',
  'qwertyuiop'.split('').reverse().join(''),
];

export default function PasswordStrengthPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);

  const analyzePassword = useCallback((pwd: string) => {
    if (!pwd) {
      setAnalysis(null);
      return;
    }

    // Character set detection
    const hasLowercase = /[a-z]/.test(pwd);
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{}|;':",./<>?`~\\]/.test(pwd);
    const hasSpaces = /\s/.test(pwd);
    const hasUnicode = /[^\x00-\x7F]/.test(pwd);

    // Calculate character pool size
    let poolSize = 0;
    if (hasLowercase) poolSize += 26;
    if (hasUppercase) poolSize += 26;
    if (hasNumbers) poolSize += 10;
    if (hasSymbols) poolSize += 32;
    if (hasSpaces) poolSize += 1;
    if (hasUnicode) poolSize += 100; // Approximation

    // Calculate entropy
    const rawEntropy = pwd.length * Math.log2(Math.max(poolSize, 1));

    // Pattern detection
    const lowerPwd = pwd.toLowerCase();

    // Sequence detection (123, abc, etc.)
    const hasSequence = /(?:012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(pwd);

    // Keyboard walk detection
    const hasKeyboardWalk = KEYBOARD_ROWS.some(row => {
      for (let i = 0; i <= row.length - 4; i++) {
        if (lowerPwd.includes(row.slice(i, i + 4))) return true;
      }
      return false;
    });

    // Repeating characters
    const hasRepeating = /(.)\1{2,}/.test(pwd);

    // Dictionary word detection (simplified)
    const hasDictionary = COMMON_PASSWORDS.some(common => lowerPwd.includes(common));

    // Date pattern detection
    const hasDate = /(?:19|20)\d{2}|(?:0?[1-9]|1[0-2])[\/\-](?:0?[1-9]|[12]\d|3[01])/.test(pwd);

    // Adjust entropy for patterns
    let adjustedEntropy = rawEntropy;
    if (hasSequence) adjustedEntropy *= 0.7;
    if (hasKeyboardWalk) adjustedEntropy *= 0.6;
    if (hasRepeating) adjustedEntropy *= 0.8;
    if (hasDictionary) adjustedEntropy *= 0.3;
    if (hasDate) adjustedEntropy *= 0.5;

    // Determine strength
    let strength: PasswordAnalysis['strength'] = 'very-weak';
    if (adjustedEntropy >= 80) strength = 'very-strong';
    else if (adjustedEntropy >= 60) strength = 'strong';
    else if (adjustedEntropy >= 40) strength = 'fair';
    else if (adjustedEntropy >= 25) strength = 'weak';

    // Calculate crack times
    // Based on: 10 billion guesses/second for offline, 1000/second for online
    const combinations = Math.pow(2, adjustedEntropy);

    const formatTime = (seconds: number): string => {
      if (seconds < 1) return 'instant';
      if (seconds < 60) return `${Math.round(seconds)} seconds`;
      if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
      if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
      if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
      if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} years`;
      if (seconds < 31536000 * 1000000) return `${Math.round(seconds / (31536000 * 1000))}K years`;
      if (seconds < 31536000 * 1000000000) return `${Math.round(seconds / (31536000 * 1000000))}M years`;
      return 'centuries+';
    };

    const onlineTime = combinations / 1000 / 2; // 1K guesses/sec, average case
    const offlineTime = combinations / 10000000000 / 2; // 10B guesses/sec
    const massiveTime = combinations / 1000000000000 / 2; // 1T guesses/sec (GPU cluster)

    // Generate suggestions
    const suggestions: string[] = [];
    if (pwd.length < 12) suggestions.push('Add more characters (12+ recommended)');
    if (!hasUppercase) suggestions.push('Add uppercase letters');
    if (!hasNumbers) suggestions.push('Add numbers');
    if (!hasSymbols) suggestions.push('Add symbols (!@#$%^&*)');
    if (hasDictionary) suggestions.push('Avoid common words and passwords');
    if (hasSequence) suggestions.push('Avoid sequential characters (123, abc)');
    if (hasKeyboardWalk) suggestions.push('Avoid keyboard patterns (qwerty)');
    if (hasRepeating) suggestions.push('Avoid repeating characters (aaa)');
    if (hasDate) suggestions.push('Avoid dates (they\'re easily guessed)');
    if (suggestions.length === 0) suggestions.push('Excellent! Consider a passphrase for even better security.');

    setAnalysis({
      password: pwd,
      length: pwd.length,
      entropy: Math.round(adjustedEntropy * 10) / 10,
      strength,
      crackTime: {
        online: formatTime(onlineTime),
        offline: formatTime(offlineTime),
        massiveParallel: formatTime(massiveTime),
      },
      characterSets: {
        lowercase: hasLowercase,
        uppercase: hasUppercase,
        numbers: hasNumbers,
        symbols: hasSymbols,
        spaces: hasSpaces,
        unicode: hasUnicode,
      },
      patterns: {
        hasSequence,
        hasKeyboardWalk,
        hasRepeating,
        hasDictionary,
        hasDate,
      },
      suggestions,
    });
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    analyzePassword(value);
  }, [analyzePassword]);

  const statusReadings = useMemo(() => [
    {
      label: 'Strength',
      value: analysis?.strength.toUpperCase().replace('-', ' ') || '---',
      tone: analysis?.strength === 'very-strong' || analysis?.strength === 'strong'
        ? 'active' as const
        : analysis?.strength === 'weak' || analysis?.strength === 'very-weak'
          ? 'alert' as const
          : 'neutral' as const,
    },
    {
      label: 'Entropy',
      value: analysis ? `${analysis.entropy} bits` : '---',
      tone: analysis && analysis.entropy >= 60 ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'Length',
      value: analysis?.length.toString() || '0',
      tone: analysis && analysis.length >= 12 ? 'active' as const : 'neutral' as const,
    },
  ], [analysis]);

  const getStrengthColor = (strength: PasswordAnalysis['strength']) => {
    switch (strength) {
      case 'very-strong': return 'text-green-400';
      case 'strong': return 'text-cyan-400';
      case 'fair': return 'text-yellow-400';
      case 'weak': return 'text-orange-400';
      default: return 'text-red-400';
    }
  };

  const getStrengthWidth = (strength: PasswordAnalysis['strength']) => {
    switch (strength) {
      case 'very-strong': return 'w-full';
      case 'strong': return 'w-4/5';
      case 'fair': return 'w-3/5';
      case 'weak': return 'w-2/5';
      default: return 'w-1/5';
    }
  };

  return (
    <LabShell statusReadings={statusReadings}>
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Utility Kit</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">Password Strength Analyzer</h1>
          <p className="mt-2 text-sm text-slate-400">
            Calculate password entropy, estimate crack times, and get actionable recommendations.
            <span className="text-cyan-400 ml-1">100% local — your password never leaves your browser.</span>
          </p>
        </header>

        <div className="lab-panel p-6">
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
            Enter Password
          </p>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter a password to analyze..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded text-lg text-slate-200 font-mono focus:border-cyan-500 focus:outline-none transition-colors"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          {analysis && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${getStrengthColor(analysis.strength)}`}>
                  {analysis.strength.replace('-', ' ').toUpperCase()}
                </span>
                <span className="text-sm text-slate-500">{analysis.entropy} bits entropy</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getStrengthWidth(analysis.strength)} ${
                    analysis.strength === 'very-strong' ? 'bg-green-500' :
                    analysis.strength === 'strong' ? 'bg-cyan-500' :
                    analysis.strength === 'fair' ? 'bg-yellow-500' :
                    analysis.strength === 'weak' ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        {analysis && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="lab-panel p-6">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
                Crack Time Estimates
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-slate-800/40 rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Online Attack</span>
                    <span className="text-sm text-cyan-300 font-mono">{analysis.crackTime.online}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">~1,000 guesses/second (rate-limited)</p>
                </div>

                <div className="p-3 bg-slate-800/40 rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Offline Attack</span>
                    <span className="text-sm text-orange-300 font-mono">{analysis.crackTime.offline}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">~10B guesses/second (single GPU)</p>
                </div>

                <div className="p-3 bg-slate-800/40 rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Massive Parallel</span>
                    <span className="text-sm text-red-300 font-mono">{analysis.crackTime.massiveParallel}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">~1T guesses/second (GPU cluster)</p>
                </div>
              </div>
            </div>

            <div className="lab-panel p-6">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
                Character Analysis
              </p>

              <div className="grid grid-cols-2 gap-2">
                {Object.entries(analysis.characterSets).map(([key, present]) => (
                  <div
                    key={key}
                    className={`p-2 rounded flex items-center justify-between ${
                      present ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-slate-800/40'
                    }`}
                  >
                    <span className="text-xs text-slate-400 capitalize">{key}</span>
                    <span className={`text-xs ${present ? 'text-cyan-400' : 'text-slate-600'}`}>
                      {present ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mt-6 mb-3">
                Pattern Detection
              </p>

              <div className="space-y-2">
                {Object.entries(analysis.patterns).map(([key, detected]) => (
                  <div
                    key={key}
                    className={`p-2 rounded flex items-center justify-between ${
                      detected ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-slate-800/40'
                    }`}
                  >
                    <span className="text-xs text-slate-400">
                      {key.replace(/([A-Z])/g, ' $1').replace('has ', '')}
                    </span>
                    <span className={`text-xs ${detected ? 'text-orange-400' : 'text-slate-600'}`}>
                      {detected ? '⚠ Found' : 'None'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {analysis && analysis.suggestions.length > 0 && (
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Recommendations
            </p>

            <ul className="space-y-2">
              {analysis.suggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className={analysis.strength === 'very-strong' ? 'text-green-400' : 'text-orange-400'}>
                    {analysis.strength === 'very-strong' ? '✓' : '→'}
                  </span>
                  <span className="text-slate-300">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            Password Security: Beyond &quot;Make It Complex&quot;
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              Most password strength meters are garbage. They check for arbitrary rules — uppercase,
              lowercase, number, symbol — without understanding what actually makes a password secure.
              Real security is about entropy: the mathematical unpredictability of your password.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">What Is Entropy?</h3>
            <p>
              Entropy measures randomness in bits. Each bit doubles the number of possible combinations.
              A password with 40 bits of entropy has 2^40 (about 1 trillion) possible combinations.
              Here&apos;s what different entropy levels mean:
            </p>
            <table className="w-full text-sm my-4">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-300">Entropy</th>
                  <th className="text-left py-2 text-slate-300">Strength</th>
                  <th className="text-left py-2 text-slate-300">Combinations</th>
                  <th className="text-left py-2 text-slate-300">Example</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-800">
                  <td className="py-2">&lt;25 bits</td>
                  <td className="py-2 text-red-400">Very Weak</td>
                  <td className="py-2">~33 million</td>
                  <td className="py-2 font-mono">password1</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">25-40 bits</td>
                  <td className="py-2 text-orange-400">Weak</td>
                  <td className="py-2">~1 trillion</td>
                  <td className="py-2 font-mono">Summer2024</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">40-60 bits</td>
                  <td className="py-2 text-yellow-400">Fair</td>
                  <td className="py-2">~1 quadrillion</td>
                  <td className="py-2 font-mono">Tr0ub4dor&3</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">60-80 bits</td>
                  <td className="py-2 text-cyan-400">Strong</td>
                  <td className="py-2">~1 quintillion</td>
                  <td className="py-2 font-mono">correct-horse-battery</td>
                </tr>
                <tr>
                  <td className="py-2">&gt;80 bits</td>
                  <td className="py-2 text-green-400">Very Strong</td>
                  <td className="py-2">~1 septillion+</td>
                  <td className="py-2 font-mono">Uj8#mK2$pL9@nW4!</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl text-slate-200 mt-8">The Passphrase Revolution</h3>
            <p>
              Here&apos;s something that surprises people: &quot;correct horse battery staple&quot; is often
              stronger than &quot;Tr0ub4dor&3&quot;. Why? Length beats complexity. Four random common words
              give you about 44 bits of entropy, plus they&apos;re actually memorable.
            </p>
            <div className="bg-slate-800/50 p-4 rounded my-4">
              <p className="text-sm text-slate-300 font-medium mb-2">The math:</p>
              <ul className="text-sm space-y-1">
                <li><strong className="text-slate-300">&quot;Tr0ub4dor&3&quot;</strong> — ~28 bits (common substitutions are predictable)</li>
                <li><strong className="text-slate-300">&quot;correct horse battery staple&quot;</strong> — ~44 bits (4 random words)</li>
                <li><strong className="text-slate-300">&quot;correct-horse-battery-staple-!&quot;</strong> — ~52 bits (with separator and symbol)</li>
              </ul>
            </div>

            <h3 className="text-xl text-slate-200 mt-8">Modern Attack Speeds</h3>
            <p>
              Password cracking hardware has gotten terrifyingly fast:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">Online attacks</strong> — ~1,000/second (rate-limited by servers)</li>
              <li><strong className="text-slate-300">Offline (MD5)</strong> — ~100 billion/second (single GPU)</li>
              <li><strong className="text-slate-300">Offline (bcrypt)</strong> — ~30,000/second (bcrypt is designed to be slow)</li>
              <li><strong className="text-slate-300">GPU cluster</strong> — Can test 1 trillion+ MD5 hashes/second</li>
            </ul>
            <p>
              This is why the hashing algorithm matters as much as your password. A strong password
              with MD5 hashing is weaker than a moderate password with bcrypt.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">What Actually Works</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Use a password manager</strong> — Generate truly random
                passwords. Let the manager remember them. This is non-negotiable.
              </li>
              <li>
                <strong className="text-slate-300">Length over complexity</strong> — A 20-character passphrase
                beats an 8-character complex password every time.
              </li>
              <li>
                <strong className="text-slate-300">Enable 2FA everywhere</strong> — Even the best password
                can be phished. 2FA is your backup.
              </li>
              <li>
                <strong className="text-slate-300">Unique passwords for everything</strong> — Credential
                stuffing attacks reuse passwords across sites.
              </li>
              <li>
                <strong className="text-slate-300">Check for breaches</strong> — Use haveibeenpwned.com to
                see if your passwords have been leaked.
              </li>
            </ol>

            <h3 className="text-xl text-slate-200 mt-8">The Pattern Problem</h3>
            <p>
              Humans are terrible at being random. Common patterns include:
            </p>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-orange-300 font-medium mb-2">Predictable Substitutions</h4>
                <p className="text-sm font-mono">
                  a → @, e → 3, i → 1, o → 0, s → $
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Crackers know these. They add almost zero entropy.
                </p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-orange-300 font-medium mb-2">Keyboard Patterns</h4>
                <p className="text-sm font-mono">
                  qwerty, asdf, zxcvbn, 1qaz2wsx
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  These are in every cracking dictionary.
                </p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-orange-300 font-medium mb-2">Dates</h4>
                <p className="text-sm font-mono">
                  1990, 2024, 01/15, birthday years
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  There are only ~40K commonly used dates.
                </p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-orange-300 font-medium mb-2">Common Suffixes</h4>
                <p className="text-sm font-mono">
                  123, 1234, !, !!, 2024, @123
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Adding &quot;123&quot; to a weak password doesn&apos;t help much.
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Key Takeaways</h4>
              <ul className="text-sm space-y-2">
                <li>Entropy (randomness) matters more than complexity rules</li>
                <li>Passphrases are often stronger than complex short passwords</li>
                <li>Modern GPUs can test 100B+ password guesses per second</li>
                <li>Use a password manager — don&apos;t try to be random yourself</li>
                <li>2FA is essential even with strong passwords</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </LabShell>
  );
}
