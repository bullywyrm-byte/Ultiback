import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Box, ListPlus, Settings, Plus, Minus, Search, Trash2, Edit2, X, AlertCircle, RefreshCw, Layers, Check, Thermometer, Clock, FileText, UserPlus, LogIn, Lock } from 'lucide-react';

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
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Da ist etwas schiefgelaufen</h2>
          <p className="text-stone-600 mb-6">Bitte lade die Seite neu, um fortzufahren.</p>
          <button onClick={() => window.location.reload()} className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold">
            Seite neu laden
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Login & Registrierungs Komponenten ---

function AuthScreen({ onLogin }) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    setLoginError('');

    if (loginCode !== 'DANIELS-BACKSTUBE-2026') {
      setLoginError('Ungültiger Inhaber-Code!');
      return;
    }
    
    if (!loginEmail.includes('@') || loginPass.length < 6) {
      setLoginError('Bitte gültige E-Mail und sicheres Passwort (min. 6 Zeichen) eingeben.');
      return;
    }
    
    // Nach erfolgreicher Prüfung direkt einloggen. 
    // Wir nutzen den Teil vor dem @ als Benutzernamen in der App.
    onLogin(loginEmail.split('@')[0]);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-stone-900 p-8 text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
             <Layers className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Schwind.cc</h1>
          <p className="text-orange-400 font-bold uppercase tracking-widest text-sm mt-1">Ulti-Back</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleRegister} className="space-y-6">
            <h2 className="text-xl font-bold text-stone-800 text-center flex items-center justify-center gap-2">
              <LogIn className="w-6 h-6 text-stone-400" />
              Anmeldung
            </h2>

            {loginError && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{loginError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-600 mb-1">E-Mail Adresse</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-stone-50 border-2 border-stone-200 rounded-xl px-4 py-3 text-lg font-medium focus:border-orange-500 focus:bg-white outline-none transition-all"
                  placeholder="bäcker@beispiel.de"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-600 mb-1">Passwort</label>
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full bg-stone-50 border-2 border-stone-200 rounded-xl px-4 py-3 text-lg focus:border-orange-500 focus:bg-white outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div className="bg-stone-100 p-4 rounded-xl border border-stone-200 mt-6">
                <label className="block text-sm font-bold text-stone-800 flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-orange-500" />
                  Inhaber-Code (Sicherheit)
                </label>
                <p className="text-xs text-stone-500 mb-3">Wird zur Verifizierung benötigt.</p>
                <input
                  type="text"
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value)}
                  className="w-full bg-white border-2 border-stone-300 rounded-lg px-4 py-3 font-mono text-center text-lg focus:border-orange-500 outline-none transition-all tracking-widest uppercase"
                  placeholder="CODE EINGEBEN"
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold text-lg py-4 rounded-xl shadow-md transition-colors">
              Einloggen
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- Haupt App ---

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [activeTab, setActiveTab] = useState('lager');
  
  const [ingredients, setIngredients] = useLocalDB('ulti-back-ingredients', [
    { id: '1', name: 'Weizenmehl 550', price: 0.85, unit: 'kg' },
    { id: '2', name: 'Wasser', price: 0.002, unit: 'kg' },
    { id: '3', name: 'Salz', price: 0.45, unit: 'kg' },
    { id: '4', name: 'Hefe (frisch)', price: 2.10, unit: 'kg' },
  ]);

  const [recipes, setRecipes] = useLocalDB('ulti-back-recipes', []);
  const [productionLogs, setProductionLogs] = useLocalDB('ulti-back-production-logs-v2', []);

  if (!isAuthenticated) {
    return <AuthScreen onLogin={(username) => {
      setCurrentUser(username);
      setIsAuthenticated(true);
    }} />;
  }

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser('');
  };

  const tabs = [
    { id: 'lager', icon: Box, label: 'Lager' },
    { id: 'rezepte', icon: ListPlus, label: 'Rezepte' },
    { id: 'kalkulation', icon: Activity, label: 'Kalkulation' },
    { id: 'produktion', icon: Layers, label: 'Produktion' },
    { id: 'settings', icon: Settings, label: 'Einstellungen' },
  ];

  const updateIngredientPrice = (id, newPrice) => {
    setIngredients(ingredients.map(ing => ing.id === id ? { ...ing, price: parseFloat(newPrice) || 0 } : ing));
  };

  const addIngredient = (name, price, unit) => {
    setIngredients([...ingredients, { id: Date.now().toString(), name, price: parseFloat(price) || 0, unit }]);
  };

  const deleteIngredient = (id) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-stone-100 font-sans text-stone-800 pb-24 md:pb-0">
        
        {/* Header / Desktop Sidebar Spacer */}
        <div className="bg-stone-900 text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-40">
           <div className="flex items-center gap-3">
             <div className="bg-orange-500 p-2 rounded-xl">
               <Layers className="w-6 h-6 text-white" />
             </div>
             <div>
                <h1 className="text-xl font-black tracking-tight leading-none">Schwind.cc</h1>
                <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">Ulti-Back</span>
             </div>
           </div>
           
           <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 bg-stone-800 py-1 px-3 rounded-full text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-stone-300">Eingeloggt als <strong className="text-white">{currentUser}</strong></span>
             </div>
             <button onClick={logout} className="text-stone-400 hover:text-white p-2">
                <LogIn className="w-5 h-5 rotate-180" />
             </button>
           </div>
        </div>

        <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
          {/* Navigation - Bottom on Mobile, Side on Desktop */}
          <nav className="fixed bottom-0 w-full bg-white border-t border-stone-200 flex justify-around p-2 z-50 md:relative md:w-64 md:flex-col md:justify-start md:border-t-0 md:border-r md:min-h-[calc(100vh-72px)] md:p-6 md:gap-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-3 rounded-2xl transition-all ${
                    isActive 
                      ? 'bg-stone-900 text-white shadow-md transform md:translate-x-2' 
                      : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'text-orange-400' : ''}`} />
                  <span className={`text-[10px] md:text-sm font-bold ${isActive ? 'text-white' : ''}`}>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Main Content Area */}
          <main className="flex-1 p-4 md:p-8 w-full max-w-5xl mx-auto">
            {activeTab === 'lager' && (
              <InventoryView 
                ingredients={ingredients} 
                updateIngredientPrice={updateIngredientPrice} 
                addIngredient={addIngredient}
                deleteIngredient={deleteIngredient}
              />
            )}
            {activeTab === 'rezepte' && (
              <RecipeView 
                recipes={recipes} 
                setRecipes={setRecipes} 
                ingredients={ingredients} 
              />
            )}
            {activeTab === 'kalkulation' && (
              <CalculationView 
                recipes={recipes} 
                ingredients={ingredients} 
              />
            )}
            {activeTab === 'produktion' && (
              <ProductionView 
                recipes={recipes} 
                ingredients={ingredients}
                logs={productionLogs}
                setLogs={setProductionLogs}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsView 
                setIngredients={setIngredients}
                setRecipes={setRecipes}
                setLogs={setProductionLogs}
              />
            )}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}

// ==========================================
// VIEWS (Unverändert, bis auf kleinere Styling-Anpassungen falls nötig)
// ==========================================

function InventoryView({ ingredients, updateIngredientPrice, addIngredient, deleteIngredient }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newUnit, setNewUnit] = useState('kg');

  const filtered = ingredients.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAdd = () => {
    if (newName && newPrice) {
      addIngredient(newName, newPrice, newUnit);
      setNewName(''); setNewPrice(''); setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6 animation-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-stone-800">Lager & Preise</h2>
          <p className="text-stone-500 font-medium mt-1">Verwalte deine Rohstoffe und Einkaufspreise</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md transition-colors w-full sm:w-auto justify-center"
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? 'Abbrechen' : 'Neue Zutat'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-orange-200 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-stone-500 mb-2 uppercase tracking-wide">Name der Zutat</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:border-orange-500 outline-none" placeholder="z.B. Dinkelmehl 630" />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2 uppercase tracking-wide">Preis pro Einheit</label>
            <div className="flex border border-stone-200 rounded-xl bg-stone-50 overflow-hidden focus-within:border-orange-500">
              <input type="number" step="0.01" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="w-full bg-transparent p-3 outline-none" placeholder="0.00" />
              <select value={newUnit} onChange={e => setNewUnit(e.target.value)} className="bg-stone-100 border-l border-stone-200 px-3 font-bold text-stone-600 outline-none">
                <option value="kg">/ kg</option>
                <option value="l">/ l</option>
                <option value="Stk">/ Stk</option>
              </select>
            </div>
          </div>
          <button onClick={handleAdd} className="bg-stone-800 hover:bg-stone-900 text-white p-3 rounded-xl font-bold transition-colors">Speichern</button>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-100 bg-stone-50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input 
              type="text" 
              placeholder="Zutat suchen..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:border-orange-500 outline-none transition-colors font-medium"
            />
          </div>
        </div>
        
        <div className="divide-y divide-stone-100">
          {filtered.map(ing => (
            <div key={ing.id} className="p-4 hover:bg-stone-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold text-lg">
                  {ing.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 text-lg">{ing.name}</h3>
                  <p className="text-stone-400 text-sm">Zutat #{ing.id.slice(-4)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center bg-white border border-stone-200 rounded-xl overflow-hidden focus-within:border-orange-500 flex-1 sm:flex-none">
                  <span className="pl-3 text-stone-400">€</span>
                  <input 
                    type="number" 
                    step="0.01"
                    value={ing.price}
                    onChange={(e) => updateIngredientPrice(ing.id, e.target.value)}
                    className="w-24 p-3 font-bold text-stone-800 outline-none bg-transparent"
                  />
                  <span className="pr-4 text-stone-400 font-medium">/ {ing.unit}</span>
                </div>
                <button 
                  onClick={() => deleteIngredient(ing.id)}
                  className="p-3 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Löschen"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
             <div className="p-12 text-center text-stone-400">
               <Box className="w-12 h-12 mx-auto mb-3 opacity-20" />
               <p>Keine Zutaten gefunden.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RecipeView({ recipes, setRecipes, ingredients }) {
  const [editingId, setEditingId] = useState(null);

  const handleCreate = () => {
    const newRecipe = {
      id: Date.now().toString(),
      name: 'Neues Rezept',
      yieldAmount: 1,
      yieldUnit: 'Stk',
      items: [],
      instructions: '',
      prepDetails: {
        kneadTimeSlow: '',
        kneadTimeFast: '',
        doughTemp: '',
        restTime: '',
        bakeTemp: '',
        bakeTime: ''
      }
    };
    setRecipes([newRecipe, ...recipes]);
    setEditingId(newRecipe.id);
  };

  const handleDelete = (id) => {
    if(confirm('Rezept wirklich löschen?')) {
      setRecipes(recipes.filter(r => r.id !== id));
      if (editingId === id) setEditingId(null);
    }
  };

  const handleSave = (updatedRecipe) => {
    setRecipes(recipes.map(r => r.id === updatedRecipe.id ? updatedRecipe : r));
    setEditingId(null);
  };

  if (editingId) {
    const recipeToEdit = recipes.find(r => r.id === editingId);
    return <RecipeEditor 
      recipe={recipeToEdit} 
      ingredients={ingredients} 
      recipes={recipes} // Übergebe alle Rezepte (für Vorstufen)
      onSave={handleSave} 
      onCancel={() => setEditingId(null)} 
    />;
  }

  return (
    <div className="space-y-6 animation-fade-in">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-stone-800">Rezepte</h2>
          <p className="text-stone-500 font-medium mt-1">Deine Backstuben-Geheimnisse</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-stone-800 hover:bg-stone-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Neues Rezept
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recipes.map(recipe => (
          <div key={recipe.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-stone-800 leading-tight">{recipe.name}</h3>
                <p className="text-stone-500 font-medium mt-1">Ertrag: {recipe.yieldAmount} {recipe.yieldUnit}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingId(recipe.id)} className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors">
                  <Edit2 className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(recipe.id)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
               <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-bold">
                 {recipe.items.length} Posten
               </span>
               {recipe.prepDetails?.bakeTime && (
                 <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                   <Clock className="w-3 h-3" /> {recipe.prepDetails.bakeTime} Min.
                 </span>
               )}
            </div>
          </div>
        ))}
        {recipes.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-3xl border-2 border-dashed border-stone-200 text-center">
            <ListPlus className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-stone-800 mb-2">Noch keine Rezepte</h3>
            <p className="text-stone-500">Erstelle dein erstes Rezept, um mit der Kalkulation zu beginnen.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RecipeEditor({ recipe, ingredients, recipes, onSave, onCancel }) {
  const [edited, setEdited] = useState({ ...recipe, prepDetails: recipe.prepDetails || {} });
  
  // WICHTIG: Hier deinen API Key einfügen
  const apiKey = "DEIN_AIzaSy_KEY_HIER_EINTRAGEN"; 
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);

  const addItem = (type = 'ingredient') => {
    setEdited({
      ...edited,
      items: [...edited.items, { 
        id: Date.now().toString(), 
        type: type, // 'ingredient' oder 'recipe' (Vorstufe)
        refId: '', 
        amount: 0 
      }]
    });
  };

  const updateItem = (id, field, value) => {
    setEdited({
      ...edited,
      items: edited.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    });
  };

  const removeItem = (id) => {
    setEdited({
      ...edited,
      items: edited.items.filter(item => item.id !== id)
    });
  };

  const updatePrepDetail = (field, value) => {
    setEdited({
      ...edited,
      prepDetails: { ...edited.prepDetails, [field]: value }
    });
  };

  const analyzeFile = async (base64Data) => {
    setIsAnalyzing(true);
    setAnalyzeError(null);

    // Sicherheitscheck
    if (!apiKey || !apiKey.startsWith("AIzaSy")) {
      setAnalyzeError("Fehler: API-Key fehlt oder ist ungültig. Bitte im Code in Zeile 346 einen gültigen 'AIzaSy' Key eintragen.");
      setIsAnalyzing(false);
      return;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ 
              parts: [
                { 
                  text: `Analysiere dieses Bäckerei-Rezept.
                  Extrahiere den Titel, alle Zutaten mit Mengen in GRAMM (Wichtig: Rechne Kilo in Gramm um, z.B. 1kg = 1000g), und die Zubereitungsanweisungen.
                  Extrahiere auch, falls vorhanden: Knetzeit langsam (Minuten), Knetzeit schnell (Minuten), Teigtemperatur (°C), Teigruhe (Minuten), Backtemperatur (°C) und Backzeit (Minuten).
                  
                  Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt in diesem exakten Format:
                  {
                    "name": "Rezeptname",
                    "yieldAmount": 1,
                    "ingredients": [
                      { "name": "Zutat 1", "amountInGramm": 1000 },
                      { "name": "Zutat 2", "amountInGramm": 20 }
                    ],
                    "instructions": "Hier die Anleitung...",
                    "prepDetails": {
                      "kneadTimeSlow": "5",
                      "kneadTimeFast": "2",
                      "doughTemp": "24",
                      "restTime": "30",
                      "bakeTemp": "230",
                      "bakeTime": "45"
                    }
                  }
                  Wenn Werte nicht im Text stehen, setze sie als leeren String "".
                  Kein Markdown, keine Erklärungen, nur das JSON.` 
                }, 
                { inlineData: { mimeType: "application/pdf", data: base64Data } } // Nimmt PDF oder Bild
              ] 
            }]
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || `Google Server Fehler ${response.status}`);
      }

      let jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!jsonText) throw new Error("Keine Text-Antwort von der KI erhalten.");

      // Bereinige Markdown Blöcke, falls die KI sie trotz Verbot mitschickt
      jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsedData = JSON.parse(jsonText);

      // Daten in den aktuellen State mergen
      const newItems = parsedData.ingredients.map(ing => {
        // Versuche, die Zutat im Lager zu finden (case-insensitive)
        const matchedIng = ingredients.find(i => i.name.toLowerCase() === ing.name.toLowerCase());
        return {
          id: Date.now().toString() + Math.random(),
          type: 'ingredient',
          refId: matchedIng ? matchedIng.id : '', // Leer lassen, wenn nicht im Lager gefunden
          amount: ing.amountInGramm,
          _tempName: matchedIng ? '' : ing.name // Speichere Namen temporär, falls manuell angelegt werden muss
        };
      });

      setEdited(prev => ({
        ...prev,
        name: parsedData.name || prev.name,
        instructions: parsedData.instructions || prev.instructions,
        items: [...prev.items, ...newItems],
        prepDetails: {
          ...prev.prepDetails,
          ...parsedData.prepDetails
        }
      }));

    } catch (err) {
      console.error("KI Analyse Fehler:", err);
      setAnalyzeError(err.message || "Das Dokument konnte nicht verarbeitet werden.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result.split(',')[1];
      analyzeFile(base64String);
    };
    reader.readAsDataURL(file);
    // Reset input
    e.target.value = null;
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-stone-200 overflow-hidden animation-fade-in">
      <div className="bg-stone-900 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Edit2 className="w-5 h-5 text-orange-400" />
          Rezept bearbeiten
        </h3>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-stone-300 hover:text-white font-medium transition-colors">Abbrechen</button>
          <button onClick={() => onSave(edited)} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-bold shadow-md transition-colors">Speichern</button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* --- KI SCANNER BEREICH --- */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
             <div>
               <h4 className="font-bold text-orange-800 text-lg flex items-center gap-2">
                 <FileText className="w-5 h-5" />
                 PDF / Foto scannen (KI)
               </h4>
               <p className="text-orange-900/70 text-sm mt-1 max-w-md">Lade ein Rezept-PDF oder ein abfotografiertes Rezept hoch. Die KI füllt alle Felder unten automatisch aus.</p>
             </div>
             
             <label className={`relative flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white shadow-md transition-all cursor-pointer ${isAnalyzing ? 'bg-stone-400' : 'bg-orange-600 hover:bg-orange-700'}`}>
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" /> Analysiere...
                  </span>
                ) : (
                  <span>Dokument auswählen</span>
                )}
                <input 
                  type="file" 
                  accept="application/pdf,image/*" 
                  onChange={handleFileUpload} 
                  className="hidden"
                  disabled={isAnalyzing}
                />
             </label>
           </div>
           
           {analyzeError && (
             <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-xl text-sm font-bold flex items-start gap-2 border border-red-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{analyzeError}</p>
             </div>
           )}
        </div>

        {/* --- GRUNDDATEN --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-stone-500 mb-2 uppercase tracking-wide">Rezeptname</label>
            <input 
              type="text" 
              value={edited.name} 
              onChange={e => setEdited({...edited, name: e.target.value})}
              className="w-full bg-stone-50 border-2 border-stone-200 rounded-xl p-4 text-xl font-bold focus:border-stone-800 focus:bg-white outline-none transition-all"
              placeholder="z.B. Opa's Bauernbrot"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-500 mb-2 uppercase tracking-wide">Standard-Ertrag</label>
            <div className="flex border-2 border-stone-200 rounded-xl bg-stone-50 overflow-hidden focus-within:border-stone-800 focus-within:bg-white transition-all">
              <input 
                type="number" 
                value={edited.yieldAmount} 
                onChange={e => setEdited({...edited, yieldAmount: parseFloat(e.target.value) || 1})}
                className="w-full bg-transparent p-4 font-bold text-xl outline-none"
              />
              <select 
                value={edited.yieldUnit} 
                onChange={e => setEdited({...edited, yieldUnit: e.target.value})}
                className="bg-stone-100 border-l-2 border-stone-200 px-4 font-bold text-stone-600 outline-none"
              >
                <option value="Stk">Stk</option>
                <option value="kg">kg</option>
                <option value="Blech">Blech</option>
              </select>
            </div>
          </div>
        </div>

        <div className="h-px bg-stone-200 w-full" />

        {/* --- ZUTATEN & VORSTUFEN --- */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-stone-800">Zusammensetzung</h4>
            <div className="flex gap-2">
              <button onClick={() => addItem('ingredient')} className="text-orange-600 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-1">
                <Plus className="w-4 h-4" /> Zutat
              </button>
              <button onClick={() => addItem('recipe')} className="text-stone-600 bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-1">
                <Layers className="w-4 h-4" /> Vorstufe (Rezept)
              </button>
            </div>
          </div>

          <div className="space-y-3 border-2 border-stone-100 rounded-2xl p-2 bg-stone-50">
            {edited.items.map((item, index) => (
              <div key={item.id} className={`flex flex-col sm:flex-row gap-3 p-3 rounded-xl border ${item.type === 'recipe' ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-stone-200 shadow-sm'}`}>
                
                {/* Visual Indicator */}
                <div className="hidden sm:flex items-center justify-center w-8">
                  <span className="text-stone-300 font-bold text-sm">{index + 1}.</span>
                </div>

                <div className="flex-1">
                  {item.type === 'recipe' ? (
                     <select 
                      value={item.refId} 
                      onChange={e => updateItem(item.id, 'refId', e.target.value)}
                      className="w-full bg-transparent font-bold text-indigo-900 outline-none p-2"
                    >
                      <option value="">-- Vorstufe / Rezept wählen --</option>
                      {recipes.filter(r => r.id !== edited.id).map(r => ( // Verhindere Selbst-Referenzierung
                        <option key={r.id} value={r.id}>[Vorstufe] {r.name}</option>
                      ))}
                    </select>
                  ) : (
                    <select 
                      value={item.refId} 
                      onChange={e => updateItem(item.id, 'refId', e.target.value)}
                      className={`w-full bg-transparent font-bold text-stone-800 outline-none p-2 ${!item.refId && item._tempName ? 'text-red-500' : ''}`}
                    >
                      <option value="">{item._tempName ? `⚠️ "${item._tempName}" (Bitte im Lager anlegen)` : '-- Zutat aus Lager wählen --'}</option>
                      {ingredients.map(ing => (
                        <option key={ing.id} value={ing.id}>{ing.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                
                <div className="flex items-center gap-2 sm:w-48">
                  <div className="flex-1 flex items-center bg-stone-100 rounded-lg overflow-hidden border border-transparent focus-within:border-stone-300 focus-within:bg-white transition-all">
                    <input 
                      type="number" 
                      value={item.amount} 
                      onChange={e => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                      className="w-full p-2 font-bold text-right outline-none bg-transparent"
                      placeholder="0"
                    />
                    <span className="pr-3 text-stone-500 font-medium text-sm">
                      {item.type === 'recipe' ? 'Stk/Einheit' : 'g / ml'}
                    </span>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {edited.items.length === 0 && (
              <div className="text-center p-8 text-stone-400">
                Füge Zutaten oder Vorstufen hinzu, um das Rezept aufzubauen.
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-stone-200 w-full" />

        {/* --- ZUBEREITUNG & BACKPARAMETER --- */}
        <div>
           <h4 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
             <Thermometer className="w-5 h-5 text-stone-400" />
             Aufarbeitung & Backen
           </h4>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                 <label className="block text-xs font-bold text-stone-500 mb-1">Kneten langsam</label>
                 <div className="flex items-center">
                    <input type="text" value={edited.prepDetails?.kneadTimeSlow || ''} onChange={e => updatePrepDetail('kneadTimeSlow', e.target.value)} className="w-full bg-transparent font-bold outline-none" placeholder="z.B. 5" />
                    <span className="text-xs text-stone-400">Min</span>
                 </div>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                 <label className="block text-xs font-bold text-stone-500 mb-1">Kneten schnell</label>
                 <div className="flex items-center">
                    <input type="text" value={edited.prepDetails?.kneadTimeFast || ''} onChange={e => updatePrepDetail('kneadTimeFast', e.target.value)} className="w-full bg-transparent font-bold outline-none" placeholder="z.B. 2" />
                    <span className="text-xs text-stone-400">Min</span>
                 </div>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                 <label className="block text-xs font-bold text-stone-500 mb-1">Teigruhe</label>
                 <div className="flex items-center">
                    <input type="text" value={edited.prepDetails?.restTime || ''} onChange={e => updatePrepDetail('restTime', e.target.value)} className="w-full bg-transparent font-bold outline-none" placeholder="z.B. 30" />
                    <span className="text-xs text-stone-400">Min</span>
                 </div>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                 <label className="block text-xs font-bold text-stone-500 mb-1">Teigtemperatur</label>
                 <div className="flex items-center">
                    <input type="text" value={edited.prepDetails?.doughTemp || ''} onChange={e => updatePrepDetail('doughTemp', e.target.value)} className="w-full bg-transparent font-bold outline-none" placeholder="z.B. 24" />
                    <span className="text-xs text-stone-400">°C</span>
                 </div>
              </div>
              
              <div className="bg-orange-50 p-3 rounded-xl border border-orange-200 md:col-start-1 md:col-span-2">
                 <label className="block text-xs font-bold text-orange-800 mb-1 flex items-center gap-1"><Thermometer className="w-3 h-3"/> Backtemperatur</label>
                 <div className="flex items-center">
                    <input type="text" value={edited.prepDetails?.bakeTemp || ''} onChange={e => updatePrepDetail('bakeTemp', e.target.value)} className="w-full bg-transparent font-bold text-orange-900 outline-none" placeholder="z.B. 230 fallend auf 210" />
                    <span className="text-xs text-orange-600">°C</span>
                 </div>
              </div>
              <div className="bg-orange-50 p-3 rounded-xl border border-orange-200 md:col-span-2">
                 <label className="block text-xs font-bold text-orange-800 mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Backzeit</label>
                 <div className="flex items-center">
                    <input type="text" value={edited.prepDetails?.bakeTime || ''} onChange={e => updatePrepDetail('bakeTime', e.target.value)} className="w-full bg-transparent font-bold text-orange-900 outline-none" placeholder="z.B. 45-50" />
                    <span className="text-xs text-orange-600">Min</span>
                 </div>
              </div>
           </div>

          <label className="block text-sm font-bold text-stone-500 mb-2 uppercase tracking-wide">Freitext Anleitung</label>
          <textarea 
            value={edited.instructions || ''} 
            onChange={e => setEdited({...edited, instructions: e.target.value})}
            className="w-full bg-stone-50 border-2 border-stone-200 rounded-xl p-4 min-h-[150px] focus:border-stone-800 focus:bg-white outline-none transition-all leading-relaxed"
            placeholder="Beschreibe die genaue Aufarbeitung, Besonderheiten beim Schwaden, etc..."
          />
        </div>

      </div>
    </div>
  );
}

function CalculationView({ recipes, ingredients }) {
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [factor, setFactor] = useState(300); // % Aufschlag
  const [fixedCost, setFixedCost] = useState(0); // Fester Euro Betrag

  // Hilfsfunktion: Berechnet die Kosten für eine Referenz (Zutat oder Vorstufe) rekursiv
  const calculateItemCost = (item, currentAmount) => {
    if (item.type === 'ingredient') {
      const ing = ingredients.find(i => i.id === item.refId);
      if (!ing) return 0;
      // Umrechnung: Preis ist pro kg/l (1000g), Menge ist in Gramm
      return (ing.price / 1000) * currentAmount;
    } 
    
    if (item.type === 'recipe') {
      const subRecipe = recipes.find(r => r.id === item.refId);
      if (!subRecipe) return 0;
      
      // Berechne die Gesamtkosten des Unterrezepts für EINE Einheit
      let subRecipeTotalCost = 0;
      subRecipe.items.forEach(subItem => {
         subRecipeTotalCost += calculateItemCost(subItem, subItem.amount);
      });
      const costPerSubUnit = subRecipeTotalCost / subRecipe.yieldAmount;
      
      // Multipliziere mit der benötigten Menge im Hauptrezept
      return costPerSubUnit * currentAmount;
    }
    return 0;
  };

  const recipe = recipes.find(r => r.id === selectedRecipeId);
  
  let materialCost = 0;
  let breakdown = [];

  if (recipe) {
    recipe.items.forEach(item => {
      const cost = calculateItemCost(item, item.amount);
      materialCost += cost;
      
      let name = "Unbekannt";
      if(item.type === 'ingredient') {
         const ing = ingredients.find(i => i.id === item.refId);
         if(ing) name = ing.name;
      } else if (item.type === 'recipe') {
         const sub = recipes.find(r => r.id === item.refId);
         if(sub) name = `[Vorstufe] ${sub.name}`;
      }

      breakdown.push({ name, amount: item.amount, cost, type: item.type });
    });
  }

  const costPerUnit = recipe ? materialCost / recipe.yieldAmount : 0;
  const suggestedPrice = costPerUnit * (factor / 100) + fixedCost;
  
  // Berechne ab wie vielen verkauften Stücken die Materialkosten gedeckt sind
  const breakEvenUnits = suggestedPrice > 0 ? (materialCost / suggestedPrice).toFixed(1) : 0;

  return (
    <div className="space-y-6 animation-fade-in">
      <div>
        <h2 className="text-3xl font-black text-stone-800">Preiskalkulation</h2>
        <p className="text-stone-500 font-medium mt-1">Sichere deine Margen</p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
        <label className="block text-sm font-bold text-stone-500 mb-2 uppercase tracking-wide">Rezept auswählen</label>
        <select 
          value={selectedRecipeId} 
          onChange={e => setSelectedRecipeId(e.target.value)}
          className="w-full bg-stone-50 border-2 border-stone-200 rounded-xl p-4 text-xl font-bold text-stone-800 outline-none focus:border-orange-500 transition-colors"
        >
          <option value="">-- Bitte wählen --</option>
          {recipes.map(r => (
            <option key={r.id} value={r.id}>{r.name} ({r.yieldAmount} {r.yieldUnit})</option>
          ))}
        </select>
      </div>

      {recipe && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
             <div className="bg-stone-50 p-4 border-b border-stone-100">
                <h3 className="font-bold text-stone-800">Kostenaufschlüsselung (Gesamtteig)</h3>
             </div>
             <div className="p-4 space-y-3">
              {breakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm border-b border-stone-100 pb-2 last:border-0">
                  <div>
                    <span className={`font-medium ${item.type === 'recipe' ? 'text-indigo-600' : 'text-stone-700'}`}>{item.name}</span>
                    <span className="text-stone-400 ml-2">{item.amount} {item.type === 'recipe' ? 'Einheiten' : 'g'}</span>
                  </div>
                  <span className="font-mono text-stone-600">{item.cost.toFixed(3)} €</span>
                </div>
              ))}
             </div>
             <div className="bg-stone-900 text-white p-4 flex justify-between items-center">
                <span className="font-bold">Materialkosten gesamt:</span>
                <span className="font-mono text-xl">{materialCost.toFixed(2)} €</span>
             </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 space-y-6">
              
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-sm font-bold text-stone-500 uppercase tracking-wide">Gewinnaufschlag (Faktor)</label>
                  <span className="text-2xl font-black text-orange-500">{factor}%</span>
                </div>
                <input 
                  type="range" min="100" max="1000" step="10" 
                  value={factor} onChange={e => setFactor(Number(e.target.value))}
                  className="w-full accent-orange-500 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-500 mb-2 uppercase tracking-wide">Fix-Betrag (z.B. Energie, Personal) pro Stück</label>
                <div className="flex border-2 border-stone-200 rounded-xl bg-stone-50 overflow-hidden focus-within:border-stone-800">
                   <span className="pl-4 py-3 text-stone-400 font-bold">€</span>
                   <input 
                     type="number" step="0.01" 
                     value={fixedCost} onChange={e => setFixedCost(parseFloat(e.target.value) || 0)}
                     className="w-full bg-transparent p-3 font-bold outline-none"
                   />
                </div>
              </div>

            </div>

            <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl shadow-lg p-6 text-white text-center">
              <p className="text-orange-100 font-bold uppercase tracking-widest text-sm mb-2">Empfohlener Verkaufspreis</p>
              <div className="text-6xl font-black mb-2 tracking-tight">
                {suggestedPrice.toFixed(2)} €
              </div>
              <p className="text-orange-100">pro {recipe.yieldUnit}</p>
              
              <div className="mt-6 bg-white/20 rounded-2xl p-4 text-sm font-medium">
                 Stückkosten (Material): {costPerUnit.toFixed(2)} €<br/>
                 <span className="block mt-2 pt-2 border-t border-white/20">
                   Gewinnschwelle: Ab <strong className="text-xl">{breakEvenUnits}</strong> verkauften {recipe.yieldUnit} sind die gesamten Rohstoffkosten des Teiges gedeckt.
                 </span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

function ProductionView({ recipes, ingredients, logs, setLogs }) {
  const [targetYields, setTargetYields] = useState({});
  const [view, setView] = useState('plan'); // 'plan' oder 'log'

  // --- LOGBUCH STATE ---
  const [logText, setLogText] = useState('');
  
  // Format YYYY-MM-DD for grouping
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const handleUpdateYield = (recipeId, amount) => {
    setTargetYields(prev => ({ ...prev, [recipeId]: amount }));
  };

  // Komplexe Bedarfsberechnung inklusive rekursiver Vorstufen
  const calculateTotalNeeds = () => {
    const needs = {}; // { ingredientId: amountInGramm }

    const addIngredientNeed = (ingId, amount) => {
      if (!needs[ingId]) needs[ingId] = 0;
      needs[ingId] += amount;
    };

    // Rekursive Funktion zum Auflösen eines Rezepts
    const processRecipe = (recipeToProcess, multiplier) => {
      recipeToProcess.items.forEach(item => {
        if (item.type === 'ingredient') {
           addIngredientNeed(item.refId, item.amount * multiplier);
        } else if (item.type === 'recipe') {
           const subRecipe = recipes.find(r => r.id === item.refId);
           if (subRecipe) {
             // Wie viel vom Unterrezept brauchen wir?
             const subMultiplier = (item.amount * multiplier) / subRecipe.yieldAmount;
             processRecipe(subRecipe, subMultiplier);
           }
        }
      });
    };

    // Gehe alle Rezepte durch, für die eine Zielmenge eingetragen wurde
    Object.entries(targetYields).forEach(([recipeId, targetAmount]) => {
      if (targetAmount > 0) {
        const recipe = recipes.find(r => r.id === recipeId);
        if (recipe) {
          const multiplier = targetAmount / recipe.yieldAmount;
          processRecipe(recipe, multiplier);
        }
      }
    });

    return needs;
  };

  const totalNeeds = calculateTotalNeeds();

  // --- LOGBUCH FUNKTIONEN ---
  const addLog = (e) => {
     e.preventDefault();
     if(!logText.trim()) return;

     const newLog = {
       id: Date.now().toString(),
       date: getTodayString(),
       timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
       text: logText.trim()
     };

     setLogs([newLog, ...logs]);
     setLogText('');
  };

  const deleteLog = (id) => {
     setLogs(logs.filter(l => l.id !== id));
  };

  // Gruppiere Logs nach Datum
  const groupedLogs = logs.reduce((acc, log) => {
     if(!acc[log.date]) acc[log.date] = [];
     acc[log.date].push(log);
     return acc;
  }, {});

  return (
    <div className="space-y-6 animation-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-stone-800">Produktion</h2>
          <p className="text-stone-500 font-medium mt-1">Wochenplan & Tagesgeschäft</p>
        </div>
        
        <div className="flex bg-stone-200 p-1 rounded-xl w-full sm:w-auto">
          <button 
            onClick={() => setView('plan')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-bold text-sm transition-all ${view === 'plan' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Wochenplan
          </button>
          <button 
            onClick={() => setView('log')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-bold text-sm transition-all ${view === 'log' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Tages-Logbuch
          </button>
        </div>
      </div>

      {view === 'plan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Linke Seite: Eingabe der Mengen */}
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6">
             <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-orange-500" />
                Mengen eintragen
             </h3>
             <div className="space-y-3">
               {recipes.map(recipe => (
                 <div key={recipe.id} className="flex justify-between items-center p-3 hover:bg-stone-50 rounded-xl transition-colors border border-transparent hover:border-stone-100">
                   <div>
                     <div className="font-bold text-stone-700">{recipe.name}</div>
                     <div className="text-xs text-stone-400">Standard: {recipe.yieldAmount} {recipe.yieldUnit}</div>
                   </div>
                   <div className="flex items-center gap-2">
                     <input 
                       type="number" 
                       min="0"
                       placeholder="0"
                       value={targetYields[recipe.id] || ''}
                       onChange={(e) => handleUpdateYield(recipe.id, parseFloat(e.target.value) || 0)}
                       className="w-20 bg-stone-100 border border-stone-200 rounded-lg p-2 text-center font-bold text-stone-800 focus:border-orange-500 outline-none"
                     />
                     <span className="text-sm font-medium text-stone-500 w-8">{recipe.yieldUnit}</span>
                   </div>
                 </div>
               ))}
               {recipes.length === 0 && (
                 <p className="text-stone-400 text-sm text-center py-4">Bitte lege zuerst Rezepte an.</p>
               )}
             </div>
          </div>

          {/* Rechte Seite: Berechnete Einkaufsliste */}
          <div className="bg-stone-900 rounded-3xl shadow-lg p-6 text-white relative overflow-hidden">
             {/* Background Decoration */}
             <Activity className="absolute -right-10 -bottom-10 w-48 h-48 text-stone-800 opacity-50" />
             
             <div className="relative z-10">
               <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  Fertige Einkaufsliste
               </h3>
               
               {Object.keys(totalNeeds).length > 0 ? (
                 <div className="space-y-4">
                   {Object.entries(totalNeeds)
                    .sort(([, a], [, b]) => b - a) // Sortiere nach Menge absteigend
                    .map(([ingId, amount]) => {
                     const ing = ingredients.find(i => i.id === ingId);
                     if (!ing) return null;
                     
                     // Formatierung: Ab 1000g in kg anzeigen
                     let displayAmount = `${Math.round(amount)} g`;
                     if (amount >= 1000) {
                        displayAmount = `${(amount / 1000).toFixed(2)} kg`;
                     }

                     return (
                       <div key={ingId} className="flex justify-between items-end border-b border-stone-700 pb-2">
                         <span className="text-stone-300 font-medium">{ing.name}</span>
                         <span className="text-xl font-mono text-orange-400 font-bold">{displayAmount}</span>
                       </div>
                     );
                   })}
                 </div>
               ) : (
                 <div className="text-center py-12 text-stone-500">
                   Trage links Mengen ein, um den Gesamtrohstoffbedarf für die Woche zu berechnen.
                 </div>
               )}
             </div>
          </div>
        </div>
      )}

      {view === 'log' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Eingabe Formular (Links) */}
          <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-stone-200 p-6 h-fit sticky top-24">
            <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-orange-500" />
              Neuer Eintrag
            </h3>
            <form onSubmit={addLog}>
              <label className="block text-sm font-bold text-stone-500 mb-2 uppercase tracking-wide">Freitext Notiz</label>
              <textarea 
                 value={logText}
                 onChange={e => setLogText(e.target.value)}
                 className="w-full bg-stone-50 border-2 border-stone-200 rounded-xl p-4 min-h-[150px] focus:border-orange-500 focus:bg-white outline-none transition-all resize-y mb-4"
                 placeholder="z.B. '10x Bauernbrot extra gebacken', 'Sondertorte Hochzeit Müller' oder 'Gutes Wetter, alles ausverkauft'"
                 autoFocus
              />
              <button 
                 type="submit"
                 disabled={!logText.trim()}
                 className="w-full bg-stone-800 hover:bg-stone-900 disabled:bg-stone-300 text-white font-bold py-3 rounded-xl transition-colors"
              >
                 Eintrag speichern
              </button>
            </form>
          </div>

          {/* Historie Ansicht (Rechts) */}
          <div className="lg:col-span-2 space-y-8">
            {Object.keys(groupedLogs).length === 0 ? (
               <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-stone-200 text-stone-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Noch keine Einträge im Logbuch.</p>
               </div>
            ) : (
               Object.keys(groupedLogs).sort((a,b) => new Date(b) - new Date(a)).map(date => {
                 // Formatiere Datum für Anzeige
                 const dateObj = new Date(date);
                 const dateString = dateObj.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                 
                 return (
                   <div key={date} className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
                     <div className="bg-stone-100 px-6 py-3 border-b border-stone-200">
                       <h4 className="font-bold text-stone-800">{dateString}</h4>
                     </div>
                     <div className="divide-y divide-stone-100">
                        {groupedLogs[date].map(log => (
                          <div key={log.id} className="p-6 flex gap-4 hover:bg-stone-50 transition-colors group">
                            <div className="text-xs font-mono text-stone-400 pt-1 w-12 flex-shrink-0">
                               {log.timestamp}
                            </div>
                            <div className="flex-1 text-stone-700 whitespace-pre-wrap leading-relaxed">
                               {log.text}
                            </div>
                            <button 
                               onClick={() => deleteLog(log.id)}
                               className="opacity-0 group-hover:opacity-100 p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                               title="Eintrag löschen"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                     </div>
                   </div>
                 )
               })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsView({ setIngredients, setRecipes, setLogs }) {
  const handleExport = () => {
    const data = {
      ingredients: JSON.parse(localStorage.getItem('ulti-back-ingredients') || '[]'),
      recipes: JSON.parse(localStorage.getItem('ulti-back-recipes') || '[]'),
      logs: JSON.parse(localStorage.getItem('ulti-back-production-logs-v2') || '[]'),
      users: JSON.parse(localStorage.getItem('ulti-back-users') || '[]'),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ulti-back-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!confirm('Achtung: Dies überschreibt ALLE aktuellen Daten mit dem Backup. Fortfahren?')) {
      e.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.ingredients) setIngredients(data.ingredients);
        if (data.recipes) setRecipes(data.recipes);
        if (data.logs) setLogs(data.logs);
        if (data.users) localStorage.setItem('ulti-back-users', JSON.stringify(data.users));
        alert('Backup erfolgreich importiert! Lade Seite neu...');
        window.location.reload();
      } catch (err) {
        alert('Fehler beim Lesen der Backup-Datei.');
        console.error(err);
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleResetUsers = () => {
     if(confirm('ACHTUNG: Möchtest du wirklich alle Benutzerkonten löschen? Du musst dich danach mit dem Inhaber-Code neu registrieren. Rezepte bleiben erhalten.')) {
        localStorage.removeItem('ulti-back-users');
        window.location.reload();
     }
  }

  return (
    <div className="space-y-6 animation-fade-in max-w-2xl mx-auto">
        <div>
          <h2 className="text-3xl font-black text-stone-800">Einstellungen</h2>
          <p className="text-stone-500 font-medium mt-1">Sicherheit & Daten</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-6 border-b border-stone-100 bg-stone-50">
            <h3 className="font-bold text-stone-800 flex items-center gap-2">
              <Box className="w-5 h-5 text-orange-500" /> Datensicherung (Backup)
            </h3>
            <p className="text-stone-500 text-sm mt-1">Da deine Daten nicht im Internet, sondern sicher auf diesem Gerät gespeichert werden, solltest du regelmäßig ein Backup als Datei herunterladen.</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={handleExport} className="flex flex-col items-center justify-center p-6 bg-stone-800 text-white rounded-2xl hover:bg-stone-900 transition-colors group">
                <Box className="w-8 h-8 mb-3 text-stone-400 group-hover:text-white transition-colors" />
                <span className="font-bold text-lg">Backup speichern</span>
                <span className="text-xs text-stone-400 mt-1">.json Datei herunterladen</span>
              </button>

              <label className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-stone-300 text-stone-600 rounded-2xl hover:border-orange-400 hover:bg-orange-50 cursor-pointer transition-colors group">
                <RefreshCw className="w-8 h-8 mb-3 text-stone-400 group-hover:text-orange-500 transition-colors" />
                <span className="font-bold text-lg">Backup laden</span>
                <span className="text-xs text-stone-400 mt-1">Daten überschreiben</span>
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-3xl border border-red-200 p-6 mt-8">
           <h3 className="font-bold text-red-800 flex items-center gap-2 mb-2">
             <AlertCircle className="w-5 h-5" /> Gefahrenzone
           </h3>
           <p className="text-red-700 text-sm mb-4">Hier kannst du alle Anmeldedaten des Geräts zurücksetzen. Deine Rezepte und Zutaten bleiben dabei unberührt.</p>
           <button onClick={handleResetUsers} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
              Alle Benutzerkonten löschen
           </button>
        </div>
        
        <div className="text-center pt-8">
          <p className="text-stone-400 font-bold text-sm">Schwind.cc Ulti-Back v1.1.0</p>
          <p className="text-stone-300 text-xs mt-1">Alle Daten werden sicher lokal im Browser gespeichert.</p>
        </div>
    </div>
  );
}