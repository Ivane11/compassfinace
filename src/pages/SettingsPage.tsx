import { useState, useRef, useEffect } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { useKeyboardSafeArea } from '@/hooks/useKeyboardSafeArea';
import { useTheme, Theme } from '@/hooks/useTheme';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatFCFA, formatAmount, parseFormattedAmount } from '@/lib/finance';
import { RotateCcw, Info, Save, Plus, Trash2, Edit3, X, Check, User, Wallet, Tag, Palette, ArrowRightLeft, Sun, Moon, Sunset, RefreshCw } from 'lucide-react';

// Live exchange rates from exchangerate-api.com (XOF base)
const EXCHANGE_API_KEY = '80624c26ecd6f0ef1a4dc6be';
const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'CNY', 'AED'];

const CURRENCIES = [
  { code: 'FCFA', name: 'Franc CFA (XOF)', symbol: 'FCFA', flag: '🌍' },
  { code: 'USD', name: 'Dollar Américain', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'Livre Sterling', symbol: '£', flag: '🇬🇧' },
  { code: 'CAD', name: 'Dollar Canadien', symbol: 'C$', flag: '🇨🇦' },
  { code: 'CNY', name: 'Yuan Chinois', symbol: '¥', flag: '🇨🇳' },
  { code: 'AED', name: 'Dirham Emirati', symbol: 'د.إ', flag: '🇦🇪' },
];

const THEMES: { id: Theme; name: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'default',
    name: 'Moderne Sombre',
    description: 'Noir profond, accent Vert Néon',
    icon: <Moon className="w-5 h-5" />
  },
  {
    id: 'nord',
    name: 'Nord',
    description: 'Couleurs arctiques, accents Bleu Ciel',
    icon: <Sun className="w-5 h-5" />
  },
  {
    id: 'crepuscule',
    name: 'Crépuscule',
    description: 'Noir-Violet, accents Ambre/Or',
    icon: <Sunset className="w-5 h-5" />
  },
];

export default function SettingsPage() {
  const { settings, updateFirstName, updateSettings, addCategory, editCategory, deleteCategory, resetData, firstName } = useFinance();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(firstName);
  const [income, setIncome] = useState(String(settings.defaultMonthlyIncome));
  const [showConfirm, setShowConfirm] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Currency converter state - Live API
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('FCFA');
  const [toCurrency, setToCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [ratesLastUpdate, setRatesLastUpdate] = useState<string>('');
  const [ratesLoading, setRatesLoading] = useState(false);

  // Fetch live exchange rates from exchangerate-api.com
  const fetchExchangeRates = async () => {
    setRatesLoading(true);
    try {
      const response = await fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/USD`);
      const data = await response.json();
      if (data.result === 'success') {
        // API returns rates from USD base, we need XOF rates
        // XOF rate: 565.6414 XOF = 1 USD, so 1 XOF = 1/565.6414 USD
        const xofToUsd = 1 / data.conversion_rates.XOF;
        const rates: Record<string, number> = {};
        SUPPORTED_CURRENCIES.forEach(code => {
          // Convert from XOF to target: (amount in XOF) * (USD per XOF) * (target per USD)
          rates[code] = xofToUsd * data.conversion_rates[code];
        });
        setExchangeRates(rates);
        const date = new Date(data.time_last_update_utc);
        setRatesLastUpdate(date.toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }));
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    }
    setRatesLoading(false);
  };

  // Fetch rates on mount
  useEffect(() => {
    fetchExchangeRates();
  }, []);

  // Category management state
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Keyboard handling
  const { registerInput, dismissKeyboard } = useKeyboardSafeArea();
  const formRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  // Save name when it changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (name !== firstName) {
        updateFirstName(name);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [name, firstName, updateFirstName]);

  const handleSaveIncome = () => {
    updateSettings({ ...settings, defaultMonthlyIncome: parseFormattedAmount(income) });
  };

  const handleSaveProfile = () => {
    updateFirstName(name);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingCategory(id);
    setEditName(currentName);
  };

  const handleSaveEdit = () => {
    if (editingCategory && editName.trim()) {
      editCategory(editingCategory, { name: editName.trim() });
      setEditingCategory(null);
      setEditName('');
    }
  };

  const handleDeleteCategory = (id: string, isDefault: boolean) => {
    if (isDefault) return;
    deleteCategory(id);
  };

  // Format income input with spaces
  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    if (raw) {
      setIncome(formatAmount(parseInt(raw, 10)));
    } else {
      setIncome('');
    }
  };

  // Currency converter - using live API rates
  const convertCurrency = () => {
    const numAmount = parseFormattedAmount(amount);
    if (numAmount === 0 || !exchangeRates[toCurrency]) return '0.00';

    // Convert from FCFA to target currency using live rates
    const result = numAmount * exchangeRates[toCurrency];

    // Show more decimals for small amounts, fewer for larger amounts
    if (result < 0.01) {
      return result.toLocaleString('fr-FR', { minimumFractionDigits: 6, maximumFractionDigits: 6 });
    } else if (result < 1) {
      return result.toLocaleString('fr-FR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    } else {
      return result.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    if (raw) {
      setAmount(formatAmount(parseInt(raw, 10)));
    } else {
      setAmount('');
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getCurrencySymbol = (code: string) => {
    return CURRENCIES.find(c => c.code === code)?.symbol || code;
  };

  const fromCurrencyData = CURRENCIES.find(c => c.code === fromCurrency);
  const toCurrencyData = CURRENCIES.find(c => c.code === toCurrency);

  return (
    <div ref={formRef} className="space-y-5 animate-fade-in pb-8">
      <h2 className="text-section-title font-bold text-white">Paramètres</h2>

      {/* ===== SECTION A: THÈMES ===== */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Palette size={18} className="text-primary" />
          <h3 className="text-card-title font-semibold text-white">Thèmes</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Personnalisez l'apparence de l'application
        </p>

        <div className="space-y-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${theme === t.id
                ? 'glass bg-primary/10 border-primary/30'
                : 'glass hover:bg-white/5'
                }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme === t.id ? 'bg-primary/20' : 'bg-secondary'
                }`}>
                <span className={theme === t.id ? 'text-primary' : 'text-muted-foreground'}>
                  {t.icon}
                </span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-base font-semibold text-white">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.description}</p>
              </div>
              {theme === t.id && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check size={14} className="text-black" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ===== SECTION B: PROFIL UTILISATEUR ===== */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <User size={18} className="text-primary" />
          <h3 className="text-card-title font-semibold text-white">Profil Utilisateur</h3>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Votre Prénom</label>
          <Input
            ref={(el) => {
              if (el) inputRefs.current.set('name', el);
              registerInput(el);
            }}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Entrez votre prénom"
            className="input-iphone bg-secondary border-none text-base"
            onFocus={() => registerInput(inputRefs.current.get('name') || null)}
          />
          <p className="text-xs text-muted-foreground/70">
            Ce prénom apparaîtra sur votre tableau de bord
          </p>
        </div>

        <Button
          onClick={handleSaveProfile}
          className="btn-iphone w-full bg-primary text-black hover:bg-primary/90 gap-2"
        >
          {profileSaved ? (
            <>
              <Check size={18} /> Sauvegardé !
            </>
          ) : (
            <>
              <Save size={18} /> Sauvegarder le profil
            </>
          )}
        </Button>
      </div>

      {/* ===== SECTION C: CONVERTISSEUR CONNECTWISE ===== */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ArrowRightLeft size={18} className="text-primary" />
          <h3 className="text-card-title font-semibold text-white">Convertisseur ConnectWise</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Convertissez instantanément entre devises
        </p>

        {/* Live Rate Indicator */}
        {ratesLastUpdate && (
          <div className="flex items-center justify-center gap-2 text-xs text-primary/80">
            <RefreshCw size={12} className={ratesLoading ? 'animate-spin' : ''} />
            <span>🔴 Taux mis à jour en direct</span>
            <span className="text-muted-foreground">• {ratesLastUpdate}</span>
          </div>
        )}

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Montant</label>
          <Input
            ref={(el) => {
              if (el) inputRefs.current.set('amount', el);
              registerInput(el);
            }}
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0"
            className="input-iphone bg-secondary border-none text-2xl font-bold text-center"
            onFocus={() => registerInput(inputRefs.current.get('amount') || null)}
          />
        </div>

        {/* Currency Selection */}
        <div className="flex items-center gap-3">
          {/* From Currency */}
          <div className="flex-1 space-y-2">
            <label className="text-sm text-muted-foreground">De</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full h-14 px-4 bg-secondary border-none rounded-xl text-base text-white appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '20px',
              }}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwapCurrencies}
            className="mt-6 w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-primary/20 transition-colors"
          >
            <ArrowRightLeft size={20} className="text-primary" />
          </button>

          {/* To Currency */}
          <div className="flex-1 space-y-2">
            <label className="text-sm text-muted-foreground">Vers</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full h-14 px-4 bg-secondary border-none rounded-xl text-base text-white appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '20px',
              }}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Result Display */}
        {amount && (
          <div className="mt-6 p-6 rounded-2xl glass bg-primary/5 border-primary/20 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {fromCurrencyData?.flag} {parseFormattedAmount(amount).toLocaleString('fr-FR')} {fromCurrency}
            </p>
            <p className="text-3xl font-black text-primary">
              {getCurrencySymbol(toCurrency)} {convertCurrency()}
            </p>
            <p className="text-lg text-muted-foreground mt-1">
              {toCurrencyData?.flag} {toCurrency}
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground/60 text-center">
          💡 Taux de change en temps réel via exchangerate-api.com
        </p>
      </div>

      {/* Default Income - Kept for backward compatibility */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Wallet size={18} className="text-primary" />
          <h3 className="text-card-title font-semibold text-white">Revenu mensuel</h3>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Revenu mensuel par défaut</label>
          <Input
            ref={(el) => {
              if (el) inputRefs.current.set('income', el);
              registerInput(el);
            }}
            type="text"
            inputMode="numeric"
            value={income}
            onChange={handleIncomeChange}
            placeholder="250 000"
            className="input-iphone bg-secondary border-none text-base"
            onFocus={() => registerInput(inputRefs.current.get('income') || null)}
          />
          <p className="text-xs text-muted-foreground/70">
            Utilisé pour les calculs de budget 50/30/20
          </p>
        </div>

        <Button
          onClick={handleSaveIncome}
          className="btn-iphone w-full bg-primary text-black hover:bg-primary/90 gap-2"
        >
          <Check size={18} /> Sauvegarder
        </Button>

        {settings.defaultMonthlyIncome > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Actuel : <span className="text-income font-semibold">{formatFCFA(settings.defaultMonthlyIncome)}</span>
          </p>
        )}
      </div>

      {/* Category Management - Glassmorphism */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-primary" />
            <h3 className="text-card-title font-semibold text-white">Gérer les Libellés</h3>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddCategory(!showAddCategory)}
            className="btn-iphone-sm bg-primary text-black hover:bg-primary/90 gap-1"
          >
            {showAddCategory ? <X size={16} /> : <Plus size={16} />}
            {showAddCategory ? 'Fermer' : 'Ajouter'}
          </Button>
        </div>

        {/* Add New Category Form */}
        {showAddCategory && (
          <div className="p-4 rounded-xl glass animate-scale-in">
            <Input
              ref={(el) => {
                if (el) inputRefs.current.set('newCategory', el);
                registerInput(el);
              }}
              type="text"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              placeholder="Nom de la catégorie"
              className="input-iphone bg-background border-none mb-3"
              onFocus={() => registerInput(inputRefs.current.get('newCategory') || null)}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className="flex-1 bg-primary text-black hover:bg-primary/90"
              >
                <Check size={16} /> Ajouter
              </Button>
              <Button
                variant="secondary"
                onClick={() => { setShowAddCategory(false); setNewCategoryName(''); }}
                className="flex-1"
              >
                <X size={16} /> Annuler
              </Button>
            </div>
          </div>
        )}

        {/* Category List */}
        <div className="space-y-2">
          {settings.customCategories.map(cat => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-3 rounded-xl glass"
            >
              {editingCategory === cat.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    ref={(el) => {
                      if (el) inputRefs.current.set(`edit-${cat.id}`, el);
                      registerInput(el);
                    }}
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="flex-1 bg-background border-none h-10 text-base"
                    onFocus={() => registerInput(inputRefs.current.get(`edit-${cat.id}`) || null)}
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    className="bg-primary text-black hover:bg-primary/90"
                  >
                    <Check size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditingCategory(null)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Tag size={14} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-white">{cat.name}</p>
                      {cat.isDefault && (
                        <p className="text-xs text-muted-foreground/70">Par défaut</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartEdit(cat.id, cat.name)}
                      className="text-muted-foreground hover:text-white"
                    >
                      <Edit3 size={14} />
                    </Button>
                    {!cat.isDefault && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCategory(cat.id, cat.isDefault)}
                        className="text-muted-foreground hover:text-expense"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reset - Glassmorphism */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="text-card-title font-semibold text-expense">Zone dangereuse</h3>
        {!showConfirm ? (
          <Button
            variant="destructive"
            onClick={() => setShowConfirm(true)}
            className="btn-iphone w-full gap-2"
          >
            <RotateCcw size={18} /> Réinitialiser toutes les données
          </Button>
        ) : (
          <div className="space-y-3 animate-scale-in">
            <p className="text-body text-expense text-center">
              Êtes-vous sûr ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <Button
                variant="destructive"
                onClick={() => { resetData(); setShowConfirm(false); setIncome('0'); setName(''); }}
                className="flex-1 btn-iphone"
              >
                Confirmer
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowConfirm(false)}
                className="flex-1 btn-iphone"
              >
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* About - Glassmorphism */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Info size={18} className="text-primary" />
          <h3 className="text-card-title font-semibold text-white">À propos</h3>
        </div>
        <p className="text-body text-muted-foreground">
          CashCompass v1.0 — Gestion intelligente de vos finances personnelles.
        </p>
        <p className="text-sm text-muted-foreground/70 mt-2">
          💾 Données stockées localement sur votre appareil
        </p>
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-sm text-primary font-medium text-center">
            Développé par Ivane Beranger KOUASSi
          </p>
          <p className="text-xs text-muted-foreground/60 text-center mt-1">
            © Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}
