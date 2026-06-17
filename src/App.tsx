import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Box, ListPlus, Settings, Plus, Minus, Search, Trash2, Edit2, X, AlertCircle, RefreshCw, Layers, Check, Thermometer, Clock, FileText } from 'lucide-react';

const useLocalDB = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-black text-stone-800 mb-2">Hoppla! Ein Fehler ist aufgetreten.</h1>
          <p className="text-stone-500 mb-6 max-w-md">Die App hat einen unerwarteten Zustand erreicht.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-stone-800 text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-lg active:scale-95 transition-all"
          >
            <RefreshCw className="w-5 h-5 mr-2" /> App neu laden
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [user, setUser] = useLocalDB('ulti_back_user', null);
  const [activeTab, setActiveTab] = useState('inventory');
  
  const [inventory, setInventory] = useLocalDB('ulti_back_inventory', []);
  const [recipes, setRecipes] = useLocalDB('ulti_back_recipes', []);
  const [customPrices, setCustomPrices] = useLocalDB('ulti_back_customPrices', {});
  const [productionLogs, setProductionLogs] = useLocalDB('ulti_back_production', []);
  const [weeklyPlan, setWeeklyPlan] = useLocalDB('ulti_back_weekly_plan', []);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleRegister = () => {
    if (loginCode !== 'DANIELS-BACKSTUBE-2026') {
      setLoginError('Ungültiger Registrierungs-Code!');
      return;
    }
    if (!loginEmail.includes('@') || loginPass.length < 6) {
      setLoginError('Bitte gültige E-Mail und sicheres Passwort eingeben.');
      return;
    }
    setUser({ email: loginEmail, uid: 'local_user_' + Date.now() });
    setLoginError('');
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl w-full max-w-md border border-stone-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-stone-800 tracking-tight">Ulti-Back</h1>
            <p className="text-orange-600 font-bold mt-1">Registrierung & Login</p>
          </div>
          
          {loginError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" /> {loginError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">E-Mail Adresse</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium" placeholder="bäcker@beispiel.de" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Passwort</label>
              <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Geheimer Inhaber-Code</label>
              <input type="text" value={loginCode} onChange={e => setLoginCode(e.target.value)} className="w-full bg-orange-50 border border-orange-200 text-orange-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-black tracking-widest text-center" placeholder="CODE EINGEBEN" />
            </div>
            
            <button onClick={handleRegister} className="w-full bg-stone-800 text-white mt-4 py-4 rounded-2xl font-bold shadow-md hover:bg-stone-900 transition-colors text-lg active:scale-95">
              Account erstellen / Einloggen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 font-sans pb-24 md:pb-0 md:pl-64 flex flex-col">
      <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 h-screen bg-white border-r border-stone-200 z-50">
        <div className="p-8">
          <h1 className="text-2xl font-black text-stone-800 tracking-tight leading-none">Daniels<br/><span className="text-orange-600">Ulti-Back</span></h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <NavButton icon={Box} label="Lager" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
          <NavButton icon={ListPlus} label="Rezepte" active={activeTab === 'recipes'} onClick={() => setActiveTab('recipes')} />
          <NavButton icon={Activity} label="Kalkulation" active={activeTab === 'kalkulation'} onClick={() => setActiveTab('kalkulation')} />
          <NavButton icon={Layers} label="Produktion" active={activeTab === 'production'} onClick={() => setActiveTab('production')} />
        </nav>
        <div className="p-4">
          <NavButton icon={Settings} label="Einstellungen" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 md:max-w-6xl w-full mx-auto">
        {activeTab === 'inventory' && <InventoryView inventory={inventory} setInventory={setInventory} />}
        {activeTab === 'recipes' && <RecipeView recipes={recipes} setRecipes={setRecipes} />}
        {activeTab === 'kalkulation' && <CalculationView customPrices={customPrices} setCustomPrices={setCustomPrices} recipes={recipes} />}
        {activeTab === 'production' && <ProductionView productionLogs={productionLogs} setProductionLogs={setProductionLogs} recipes={recipes} weeklyPlan={weeklyPlan} setWeeklyPlan={setWeeklyPlan} />}
        {activeTab === 'settings' && <SettingsView user={user} onLogout={handleLogout} data={{inventory, recipes, customPrices, productionLogs, weeklyPlan}} setData={{setInventory, setRecipes, setCustomPrices, setProductionLogs, setWeeklyPlan}} />}
      </main>
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center px-4 py-3 rounded-2xl font-bold transition-all ${active ? 'bg-orange-50 text-orange-600' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'}`}
    >
      <Icon className={`w-5 h-5 mr-3 ${active ? 'text-orange-600' : 'text-stone-400'}`} />
      {label}
    </button>
  );
}

function MobileNavButton({ icon: Icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center p-2 min-w-[64px] rounded-xl transition-all ${active ? 'text-orange-600' : 'text-stone-400'}`}
    >
      <div className={`p-1.5 rounded-full mb-1 transition-colors ${active ? 'bg-orange-100' : 'bg-transparent'}`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

function RecipeEditor({ recipe, allRecipes, onSave, onCancel }) {
  const [edited, setEdited] = useState({...recipe});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');

  // HIER DEINEN API KEY EINTRAGEN (muss mit AIzaSy beginnen)
  const apiKey = "DEIN_AIzaSy_KEY_HIER_EINTRAGEN";

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!apiKey || !apiKey.startsWith("AIzaSy")) {
      setAnalyzeError("Fehler: Bitte einen gültigen AIzaSy-API-Key in Zeile 455 eintragen.");
      e.target.value = '';
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeError('');

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64Data = reader.result.split(',')[1];
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ 
                  parts: [
                    { text: 'Analysiere dieses Rezept. Gebe JSON zurück: {"title": "String", "baseYield": Number, "ingredients": [{"name": "String", "amount": Number, "unit": "String"}]}' }, 
                    { inlineData: { mimeType: file.type, data: base64Data } }
                  ] 
                }]
              })
            }
          );

          if (!response.ok) {
             const err = await response.json();
             throw new Error(err.error?.message || "API Fehler");
          }

          const result = await response.json();
          const data = JSON.parse(result.candidates[0].content.parts[0].text.replace(/```json/gi, '').replace(/```/g, ''));
          
          setEdited(prev => ({
            ...prev,
            title: data.title || prev.title,
            ingredients: [...prev.ingredients, ...(data.ingredients || []).map(i => ({...i, type: 'ingredient'}))]
          }));

        } catch (error) {
          setAnalyzeError(error.message);
        } finally {
          setIsAnalyzing(false);
        }
      };
    } catch (err) {
      setAnalyzeError("Dateifehler.");
      setIsAnalyzing(false);
    }
  };

  // ... (Hier der Rest der Editor-Komponente)
  return (
    <div className="p-8 bg-white rounded-3xl border border-stone-200">
        <h2 className="text-xl font-bold mb-4">Editor</h2>
        {/* Hier den Rest der Editor UI einfügen... */}
        <button onClick={() => onSave(edited)} className="mt-4 bg-orange-600 text-white px-6 py-2 rounded-xl font-bold">Speichern</button>
    </div>
  );
}

// Hier die übrigen View-Komponenten (InventoryView, etc.)
// Wichtig: Am Ende der Datei steht der Export!

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}