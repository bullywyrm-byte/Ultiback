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
          <p className="text-stone-500 mb-6 max-w-md">Die App hat einen unerwarteten Zustand erreicht. Keine Sorge, deine Daten sind sicher lokal gespeichert.</p>
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
        {/* ... Rest der App Views ... */}
        {activeTab === 'inventory' && <InventoryView inventory={inventory} setInventory={setInventory} />}
        {activeTab === 'recipes' && <RecipeView recipes={recipes} setRecipes={setRecipes} />}
        {activeTab === 'kalkulation' && <CalculationView customPrices={customPrices} setCustomPrices={setCustomPrices} recipes={recipes} />}
        {activeTab === 'production' && <ProductionView productionLogs={productionLogs} setProductionLogs={setProductionLogs} recipes={recipes} weeklyPlan={weeklyPlan} setWeeklyPlan={setWeeklyPlan} />}
        {activeTab === 'settings' && <SettingsView user={user} onLogout={handleLogout} data={{inventory, recipes, customPrices, productionLogs, weeklyPlan}} setData={{setInventory, setRecipes, setCustomPrices, setProductionLogs, setWeeklyPlan}} />}
      </main>

      <nav className="md:hidden fixed bottom-0 w-full bg-stone-100/90 backdrop-blur-md border-t border-stone-200/50 pb-safe z-50">
        <div className="flex justify-around items-center p-2">
          <MobileNavButton icon={Box} label="Lager" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
          <MobileNavButton icon={ListPlus} label="Rezepte" active={activeTab === 'recipes'} onClick={() => setActiveTab('recipes')} />
          <MobileNavButton icon={Activity} label="Preise" active={activeTab === 'kalkulation'} onClick={() => setActiveTab('kalkulation')} />
          <MobileNavButton icon={Layers} label="Produktion" active={activeTab === 'production'} onClick={() => setActiveTab('production')} />
          <MobileNavButton icon={Settings} label="Setup" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </div>
      </nav>
    </div>
  );
}

function RecipeEditor({ recipe, allRecipes, onSave, onCancel }) {
  const [edited, setEdited] = useState({...recipe});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');

  const updateField = (field, value) => setEdited({...edited, [field]: value});
  
  // WICHTIG: Hier deinen AIzaSy-Key aus dem Google AI Studio einfügen
  const apiKey = "HIER_AIzaSy_KEY_EINFUEGEN"; 

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!apiKey.startsWith("AIza")) {
      setAnalyzeError("Bitte trage einen gültigen AIza... Key in den Code ein.");
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
          let mimeType = file.type || 'application/pdf';

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ 
                  parts: [
                    { text: 'Analysiere das beigefügte Rezept. Gebe exakt und ausschließlich valides JSON zurück. Format: {"title": "String", "baseYield": Number, "yieldUnit": "String", "ingredients": [{"name": "String", "amount": Number, "unit": "String"}]}' }, 
                    { inlineData: { mimeType: mimeType, data: base64Data } }
                  ] 
                }]
              })
            }
          );

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(`API Fehler (${response.status}): ${errData.error?.message || 'Unbekannt'}`);
          }

          const result = await response.json();
          const jsonText = result.candidates[0].content.parts[0].text;
          const data = JSON.parse(jsonText.replace(/```json/gi, '').replace(/```/g, '').trim());

          setEdited(prev => ({
            ...prev,
            title: data.title || prev.title,
            baseYield: data.baseYield || prev.baseYield,
            ingredients: [...prev.ingredients, ...(data.ingredients || []).map(i => ({...i, type: 'ingredient'}))]
          }));

        } catch (error) {
          console.error(error);
          setAnalyzeError(error.message);
        } finally {
          setIsAnalyzing(false);
          e.target.value = '';
        }
      };
    } catch (err) {
      setAnalyzeError("Dateifehler.");
      setIsAnalyzing(false);
    }
  };

  return (
      /* ... Rest der Editor UI bleibt identisch ... */
      <div className="p-8">... Editor UI ...</div>
  );
}

// [Hier den Rest deiner Komponenten InventoryView, CalculationView, ProductionView, SettingsView, NavButton etc. unverändert einfügen]