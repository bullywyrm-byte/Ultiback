import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Box, ListPlus, Settings, Plus, Trash2, Edit2, X, AlertCircle, RefreshCw, Layers, Check, Thermometer, Clock, FileText } from 'lucide-react';

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
        <div className="md:hidden flex justify-between items-center mb-6 px-2">
          <h1 className="text-2xl font-black text-stone-800 tracking-tight">Ulti-Back</h1>
          <div className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">v1.0.0</div>
        </div>

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

function InventoryView({ inventory, setInventory }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', stock: '', unit: 'kg', step: '25' });

  const handleAdd = () => {
    if (!newItem.name) return;
    const item = { ...newItem, id: Date.now().toString(), stock: parseFloat(newItem.stock) || 0, step: parseFloat(newItem.step) || 1 };
    setInventory([item, ...inventory]);
    setNewItem({ name: '', stock: '', unit: 'kg', step: '25' });
    setShowAdd(false);
  };

  const updateStock = (id, change) => {
    setInventory(inventory.map(item => {
      if (item.id === id) {
        const newStock = Math.max(0, item.stock + change);
        return { ...item, stock: newStock };
      }
      return item;
    }));
  };

  const deleteItem = (id) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-black text-stone-800 tracking-tight">Lager</h2>
          <p className="text-stone-500 font-medium">Ultra-Fast Bestandspflege</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-orange-600 text-white p-3 rounded-2xl shadow-lg hover:bg-orange-700 active:scale-95 transition-all">
          {showAdd ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm mb-6 border border-stone-200 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Bezeichnung</label>
              <input type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="z.B. Weizenmehl Typ 550" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Bestand</label>
              <input type="number" value={newItem.stock} onChange={e => setNewItem({...newItem, stock: e.target.value})} placeholder="0" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Einheit</label>
              <select value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl outline-none font-bold">
                <option value="kg">kg</option><option value="Liter">Liter</option><option value="Stk">Stück</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-2">1-Klick Schritt</label>
              <input type="number" value={newItem.step} onChange={e => setNewItem({...newItem, step: e.target.value})} placeholder="25" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
            </div>
          </div>
          <button onClick={handleAdd} className="w-full bg-stone-800 text-white px-6 py-4 rounded-xl font-bold hover:bg-stone-900 transition-colors">Produkt anlegen</button>
        </div>
      )}

      {inventory.length === 0 && !showAdd && (
        <div className="text-center p-12 bg-white rounded-[2rem] border border-dashed border-stone-300">
          <Box className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-stone-700">Dein Lager ist leer</h3>
          <p className="text-stone-500 mt-2">Klicke oben auf das Plus, um Rohstoffe hinzuzufügen.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inventory.map(item => (
          <div key={item.id} className="bg-white rounded-[2rem] p-2 flex items-center justify-between shadow-sm border border-stone-200 relative overflow-hidden group">
            <button 
              onClick={() => updateStock(item.id, -item.step)}
              className="flex-1 flex flex-col justify-center px-6 py-6 hover:bg-red-50 rounded-2xl transition-colors text-left"
            >
              <span className="font-black text-xl text-stone-800 line-clamp-1">{item.name}</span>
              <div className="flex items-baseline mt-1 space-x-2">
                <span className={`font-black text-3xl tracking-tighter ${item.stock <= item.step ? 'text-red-500' : 'text-stone-600'}`}>
                  {item.stock}
                </span>
                <span className="text-stone-400 font-bold">{item.unit}</span>
              </div>
              <div className="text-xs font-bold text-stone-400 mt-2 bg-stone-100 inline-block px-2 py-1 rounded-md">
                Klick zieht {item.step}{item.unit} ab
              </div>
            </button>
            
            <div className="flex flex-col gap-2 p-2 shrink-0">
              <button onClick={() => updateStock(item.id, item.step)} className="w-14 h-14 bg-stone-100 hover:bg-emerald-100 text-stone-600 hover:text-emerald-600 rounded-2xl flex items-center justify-center transition-colors active:scale-95">
                <Plus className="w-6 h-6" />
              </button>
              <button onClick={() => deleteItem(item.id)} className="w-14 h-14 bg-stone-50 hover:bg-red-100 text-stone-400 hover:text-red-500 rounded-2xl flex items-center justify-center transition-colors active:scale-95">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecipeView({ recipes, setRecipes }) {
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [scalingMultiplier, setScalingMultiplier] = useState({});

  const handleCreate = () => {
    const newRecipe = {
      id: Date.now().toString(),
      title: 'Neues Rezept',
      baseYield: 10,
      yieldUnit: 'Stück',
      ingredients: [],
      instructions: '',
      bakeTemp: '',
      bakeTime: ''
    };
    setEditingRecipe(newRecipe);
  };

  const saveRecipe = (recipe) => {
    if (recipes.find(r => r.id === recipe.id)) {
      setRecipes(recipes.map(r => r.id === recipe.id ? recipe : r));
    } else {
      setRecipes([recipe, ...recipes]);
    }
    setEditingRecipe(null);
  };

  const deleteRecipe = (id) => {
    setRecipes(recipes.filter(r => r.id !== id));
    if(editingRecipe?.id === id) setEditingRecipe(null);
  };

  if (editingRecipe) {
    return <RecipeEditor 
      recipe={editingRecipe} 
      allRecipes={recipes}
      onSave={saveRecipe} 
      onCancel={() => setEditingRecipe(null)} 
    />;
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300 pb-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-black text-stone-800 tracking-tight">Rezepte</h2>
          <p className="text-stone-500 font-medium">Intelligente Skalierung</p>
        </div>
        <button onClick={handleCreate} className="bg-orange-600 text-white px-5 py-3 rounded-2xl shadow-lg hover:bg-orange-700 active:scale-95 transition-all font-bold flex items-center">
          <Plus className="w-5 h-5 mr-2" /> Neu
        </button>
      </div>

      {recipes.length === 0 && (
        <div className="text-center p-12 bg-white rounded-[2rem] border border-dashed border-stone-300">
          <ListPlus className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-stone-700">Noch keine Rezepte</h3>
          <p className="text-stone-500 mt-2">Lege dein erstes Rezept an, um die Kalkulation zu nutzen.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {recipes.map(recipe => {
          const currentScale = scalingMultiplier[recipe.id] || recipe.baseYield;
          const factor = currentScale / recipe.baseYield;

          return (
            <div key={recipe.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-stone-200">
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4 border-b border-stone-100 pb-6">
                <div>
                  <h3 className="text-2xl font-black text-stone-800">{recipe.title}</h3>
                  <p className="text-stone-400 font-medium text-sm mt-1">Basis: {recipe.baseYield} {recipe.yieldUnit}</p>
                </div>
                <div className="flex items-center gap-3 bg-stone-50 p-2 rounded-2xl border border-stone-100">
                  <span className="text-xs font-bold text-stone-400 uppercase ml-2 tracking-wider">Ziel-Menge:</span>
                  <input 
                    type="number" 
                    value={currentScale}
                    onChange={(e) => setScalingMultiplier({...scalingMultiplier, [recipe.id]: parseFloat(e.target.value) || 1})}
                    className="w-24 bg-white border border-stone-200 rounded-xl px-3 py-2 text-center font-black text-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <span className="text-sm font-bold text-stone-500 mr-2">{recipe.yieldUnit}</span>
                </div>
              </div>

              <div className="mb-6">
                <ul className="space-y-2">
                  {recipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex justify-between items-center py-2 px-3 hover:bg-stone-50 rounded-xl transition-colors">
                      <span className="font-bold text-stone-700 flex items-center">
                        {ing.type === 'recipe' && <Layers className="w-4 h-4 mr-2 text-orange-500" />}
                        {ing.type === 'recipe' ? (recipes.find(r => r.id === ing.refId)?.title || 'Unbekanntes Rezept') : ing.name}
                      </span>
                      <span className="font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">
                        {parseFloat((ing.amount * factor).toFixed(2))} <span className="text-xs text-orange-800/60 ml-1">{ing.unit}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {(recipe.bakeTemp || recipe.bakeTime || recipe.instructions) && (
                <div className="mb-6 bg-stone-50 rounded-2xl p-4 border border-stone-100">
                  <div className="flex flex-wrap gap-4 mb-4">
                    {recipe.bakeTemp && (
                      <div className="flex items-center text-stone-600 bg-white px-3 py-2 rounded-xl border border-stone-200 shadow-sm">
                        <Thermometer className="w-5 h-5 mr-2 text-orange-500" />
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">Backtemperatur</span>
                          <span className="font-bold">{recipe.bakeTemp}</span>
                        </div>
                      </div>
                    )}
                    {recipe.bakeTime && (
                      <div className="flex items-center text-stone-600 bg-white px-3 py-2 rounded-xl border border-stone-200 shadow-sm">
                        <Clock className="w-5 h-5 mr-2 text-orange-500" />
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">Backzeit</span>
                          <span className="font-bold">{recipe.bakeTime}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {recipe.instructions && (
                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                      <h4 className="flex items-center text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                        <FileText className="w-4 h-4 mr-2" /> Aufarbeitung & Hinweise
                      </h4>
                      <p className="text-stone-700 whitespace-pre-wrap font-medium text-sm">{recipe.instructions}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button onClick={() => setEditingRecipe(recipe)} className="flex items-center px-4 py-2 text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold transition-colors">
                  <Edit2 className="w-4 h-4 mr-2" /> Bearbeiten
                </button>
                <button onClick={() => deleteRecipe(recipe.id)} className="flex items-center px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold transition-colors">
                  <Trash2 className="w-4 h-4 mr-2" /> Löschen
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecipeEditor({ recipe, allRecipes, onSave, onCancel }) {
  const [edited, setEdited] = useState({...recipe});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');

  const updateField = (field, value) => setEdited({...edited, [field]: value});

  const addIngredient = () => {
    setEdited({...edited, ingredients: [...edited.ingredients, { type: 'ingredient', name: '', amount: '', unit: 'g' }]});
  };

  const addRecipeReference = () => {
    setEdited({...edited, ingredients: [...edited.ingredients, { type: 'recipe', refId: '', amount: '', unit: 'kg' }]});
  };

  const updateIngredient = (index, field, value) => {
    const newIngs = [...edited.ingredients];
    newIngs[index][field] = value;
    setEdited({...edited, ingredients: newIngs});
  };

  const removeIngredient = (index) => {
    setEdited({...edited, ingredients: edited.ingredients.filter((_, i) => i !== index)});
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey || !apiKey.startsWith("AQ.")) {
      setAnalyzeError("Fehler: Bitte einen gültigen API-Key im Code eintragen.");
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
          let mimeType = file.type || 'application/pdf';

          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ 
                parts: [
                  { text: 'Analysiere das beigefügte Rezept. Gebe exakt und ausschließlich valides JSON zurück. Keine Erklärungen. Format: {"title": "String", "baseYield": Number, "yieldUnit": "String", "instructions": "String", "bakeTemp": "String", "bakeTime": "String", "ingredients": [{"name": "String", "amount": Number, "unit": "String"}]}' }, 
                  { inlineData: { mimeType: mimeType, data: base64Data } }
                ] 
              }],
              generationConfig: { responseMimeType: "application/json" }
            })
          });

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
            yieldUnit: data.yieldUnit || prev.yieldUnit,
            instructions: data.instructions || prev.instructions,
            bakeTemp: data.bakeTemp || prev.bakeTemp,
            bakeTime: data.bakeTime || prev.bakeTime,
            ingredients: [...prev.ingredients, ...data.ingredients.map(i => ({...i, type: 'ingredient'}))]
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

  const availableRecipes = allRecipes.filter(r => r.id !== edited.id);

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-stone-200 animate-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-8 border-b border-stone-100 pb-4">
        <h3 className="text-2xl font-black text-stone-800">Rezept bearbeiten</h3>
        <button onClick={onCancel} className="p-2 text-stone-400 hover:bg-stone-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
      </div>

      <div className="space-y-6">
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h4 className="font-bold text-orange-900 flex items-center">
              <Activity className="w-5 h-5 mr-2" /> PDF oder Foto importieren
            </h4>
            <p className="text-sm text-orange-800/70 mt-1">Lade ein Rezept hoch. Unsere KI liest es für dich aus.</p>
          </div>
          
          <div className="w-full md:w-auto">
            {isAnalyzing ? (
              <div className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center opacity-80 cursor-wait">
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Analysiere...
              </div>
            ) : (
              <label className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-orange-700 active:scale-95 transition-all cursor-pointer flex items-center justify-center whitespace-nowrap">
                <Plus className="w-5 h-5 mr-2" /> Rezept scannen
                <input 
                  type="file" 
                  accept="application/pdf, image/jpeg, image/png" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>
            )}
          </div>
        </div>
        
        {analyzeError && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold border border-red-200 flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" /> 
            <div>{analyzeError}</div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Rezept Name</label>
          <input type="text" value={edited.title} onChange={e => updateField('title', e.target.value)} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-xl" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Basis-Ertrag (Menge)</label>
            <input type="number" value={edited.baseYield} onChange={e => updateField('baseYield', parseFloat(e.target.value) || 1)} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Einheit Ertrag</label>
            <input type="text" value={edited.yieldUnit} onChange={e => updateField('yieldUnit', e.target.value)} placeholder="z.B. Stück, Laibe" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
          </div>
        </div>

        <div className="pt-6 border-t border-stone-100">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-bold text-stone-800 uppercase tracking-wider">Zutaten & Vorstufen</label>
          </div>
          
          <div className="space-y-3 mb-6">
            {edited.ingredients.map((ing, idx) => (
              <div key={idx} className={`flex flex-wrap md:flex-nowrap gap-2 items-center p-2 rounded-xl border ${ing.type === 'recipe' ? 'bg-orange-50/50 border-orange-100' : 'bg-stone-50 border-stone-200'}`}>
                {ing.type === 'recipe' ? (
                  <div className="flex-1 min-w-[200px] flex gap-2">
                    <Layers className="w-10 h-10 p-2 bg-orange-100 text-orange-600 rounded-lg shrink-0" />
                    <select 
                      value={ing.refId} 
                      onChange={e => updateIngredient(idx, 'refId', e.target.value)}
                      className="flex-1 bg-white border border-orange-200 px-3 py-2 rounded-lg font-bold outline-none text-orange-900"
                    >
                      <option value="">Vorstufe auswählen...</option>
                      {availableRecipes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                    </select>
                  </div>
                ) : (
                  <input type="text" placeholder="Zutat" value={ing.name} onChange={e => updateIngredient(idx, 'name', e.target.value)} className="flex-1 min-w-[150px] bg-white border border-stone-200 px-3 py-2 rounded-lg font-bold outline-none" />
                )}
                
                <div className="flex gap-2 ml-auto">
                  <input type="number" placeholder="Menge" value={ing.amount} onChange={e => updateIngredient(idx, 'amount', e.target.value)} className="w-20 bg-white border border-stone-200 px-3 py-2 rounded-lg font-bold text-center outline-none" />
                  <select value={ing.unit} onChange={e => updateIngredient(idx, 'unit', e.target.value)} className="w-20 bg-white border border-stone-200 px-2 py-2 rounded-lg font-bold outline-none">
                    <option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option><option value="Liter">L</option><option value="Stk">Stk</option>
                  </select>
                  <button onClick={() => removeIngredient(idx)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={addIngredient} className="flex-1 flex items-center justify-center border-2 border-dashed border-stone-300 hover:border-stone-400 text-stone-600 px-4 py-3 rounded-xl font-bold transition-colors">
              <Plus className="w-4 h-4 mr-2" /> Zutat (Manuell)
            </button>
            <button onClick={addRecipeReference} className="flex-1 flex items-center justify-center border-2 border-dashed border-orange-200 hover:border-orange-400 text-orange-600 bg-orange-50/50 px-4 py-3 rounded-xl font-bold transition-colors">
              <Layers className="w-4 h-4 mr-2" /> Vorstufe (Rezept)
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-100">
          <label className="block text-sm font-bold text-stone-800 uppercase tracking-wider mb-4">Zubereitung & Backen</label>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Backtemperatur</label>
              <div className="relative">
                <Thermometer className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input type="text" value={edited.bakeTemp || ''} onChange={e => updateField('bakeTemp', e.target.value)} placeholder="z.B. 240°C" className="w-full bg-stone-50 border border-stone-200 pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Backzeit</label>
              <div className="relative">
                <Clock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input type="text" value={edited.bakeTime || ''} onChange={e => updateField('bakeTime', e.target.value)} placeholder="z.B. 45 Min" className="w-full bg-stone-50 border border-stone-200 pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Aufarbeitung & Hinweise</label>
            <textarea 
              value={edited.instructions || ''} 
              onChange={e => updateField('instructions', e.target.value)} 
              placeholder="Teigruhe, Knetzeiten, Aufarbeitungsschritte..." 
              rows={4}
              className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold resize-y" 
            />
          </div>
        </div>

        <button onClick={() => onSave(edited)} className="w-full bg-stone-800 text-white px-6 py-4 rounded-xl font-black text-lg hover:bg-stone-900 shadow-md active:scale-95 transition-all mt-8">
          Rezept speichern
        </button>
      </div>
    </div>
  );
}

function CalculationView({ customPrices, setCustomPrices, recipes }) {
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [markup, setMarkup] = useState(300);
  const [fixedAddition, setFixedAddition] = useState('');
  const [editingPrice, setEditingPrice] = useState(null);
  const [tempPrice, setTempPrice] = useState('');

  const STANDARD_PRICES = {
    'weizenmehl': 0.60, 'dinkelmehl': 1.20, 'roggenmehl': 0.75,
    'zucker': 0.90, 'butter': 6.50, 'milch': 1.05, 'wasser': 0.002,
    'salz': 0.40, 'hefe': 2.50, 'ei': 0.25, 'sauerteig': 0.80
  };

  const handleMarkupChange = (e) => {
    let val = parseInt(e.target.value.replace(/\D/g, ''), 10);
    if (isNaN(val)) val = '';
    else if (val < 1) val = 1;
    else if (val > 999) val = 999;
    setMarkup(val);
  };

  const handleFixedBlur = () => {
    const val = parseFloat(fixedAddition);
    if (!isNaN(val)) {
      setFixedAddition(val.toFixed(2));
    } else {
      setFixedAddition('');
    }
  };

  const saveCustomPrice = (ingredientName, priceStr) => {
    const newPrice = parseFloat(priceStr);
    if (!isNaN(newPrice)) {
      setCustomPrices({ ...customPrices, [ingredientName]: newPrice });
    }
    setEditingPrice(null);
  };

  const calculateIngredientCost = (ing) => {
    if (ing.type === 'recipe') {
      const subRecipe = recipes.find(r => r.id === ing.refId);
      if (!subRecipe) return { cost: 0, label: 'Unbekanntes Rezept', basePrice: 0 };
      
      let subTotal = 0;
      subRecipe.ingredients.forEach(subIng => {
        subTotal += calculateIngredientCost(subIng).cost;
      });
      
      const subYieldAmt = parseFloat(subRecipe.baseYield) || 1;
      const subCostPerUnit = subTotal / subYieldAmt;
      
      const neededAmt = parseFloat(ing.amount) || 0;
      let factor = 0;
      const u = (ing.unit || '').toLowerCase();
      if (u === 'g' || u === 'ml') factor = neededAmt / 1000;
      else if (u === 'kg' || u === 'l' || u === 'liter') factor = neededAmt;
      else factor = neededAmt;

      return { 
        cost: factor * subCostPerUnit, 
        label: subRecipe.title,
        basePrice: subCostPerUnit,
        isRecipe: true
      };
    } else {
      const neededAmt = parseFloat(ing.amount) || 0;
      const u = (ing.unit || '').toLowerCase();
      let factor = 0;
      
      if (u === 'g' || u === 'ml') factor = neededAmt / 1000;
      else if (u === 'kg' || u === 'l' || u === 'liter' || u === 'stk') factor = neededAmt;
      else if (u === 'el') factor = neededAmt * 0.015;
      else if (u === 'tl') factor = neededAmt * 0.005;
      else factor = neededAmt / 1000;

      const searchName = (ing.name || '').toLowerCase();
      let basePrice = 1.50;
      let isCustom = false;

      if (customPrices[ing.name] !== undefined) {
        basePrice = parseFloat(customPrices[ing.name]);
        isCustom = true;
      } else {
        for (const key of Object.keys(STANDARD_PRICES)) {
          if (searchName.includes(key)) {
            basePrice = STANDARD_PRICES[key];
            break;
          }
        }
      }
      return { cost: factor * basePrice, label: ing.name, basePrice, isCustom, isRecipe: false };
    }
  };

  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);

  const calculationData = useMemo(() => {
    if (!selectedRecipe) return null;
    let totalMaterialCost = 0;
    const details = selectedRecipe.ingredients.map(ing => {
      const result = calculateIngredientCost(ing);
      totalMaterialCost += result.cost;
      return { ...ing, ...result };
    });
    return { details, totalMaterialCost };
  }, [selectedRecipe, customPrices, recipes]);

  const pieceCost = selectedRecipe && calculationData ? (calculationData.totalMaterialCost / selectedRecipe.baseYield) : 0;
  const suggestedPrice = (pieceCost * (markup / 100)) + parseFloat(fixedAddition || '0');
  const breakEven = suggestedPrice > 0 ? Math.ceil(calculationData?.totalMaterialCost / suggestedPrice) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-stone-200">
        <h2 className="text-3xl font-black text-stone-800 mb-6 flex items-center">
          <Activity className="w-8 h-8 mr-3 text-orange-600" /> Kalkulation & Preise
        </h2>

        <div>
          <label className="block text-sm font-bold text-stone-600 mb-2">Rezept zur Live-Kalkulation auswählen</label>
          <select 
            className="w-full px-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-lg font-medium shadow-inner"
            value={selectedRecipeId}
            onChange={(e) => setSelectedRecipeId(e.target.value)}
          >
            <option value="">Bitte Rezept wählen...</option>
            {recipes.map(r => (
              <option key={r.id} value={r.id}>{r.title} (Ertrag: {r.baseYield} {r.yieldUnit})</option>
            ))}
          </select>
        </div>
      </div>

      {calculationData && selectedRecipe && (
        <div className="animate-in slide-in-from-bottom-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-stone-800 text-white p-6 rounded-[2rem] shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-stone-400 font-bold uppercase tracking-wider text-sm mb-2 block">Materialkosten (Gesamt)</span>
                <div className="text-4xl font-black">{calculationData.totalMaterialCost.toFixed(2)} €</div>
                <div className="mt-2 text-stone-300 font-medium">Gesamte Charge ({selectedRecipe.baseYield} {selectedRecipe.yieldUnit})</div>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-700/50 flex justify-between items-center">
                <span className="text-stone-400 font-medium">Reine Stückkosten:</span>
                <span className="font-bold text-2xl text-orange-400">{pieceCost.toFixed(2)} €</span>
              </div>
            </div>

            <div className="bg-orange-600 text-white p-6 rounded-[2rem] shadow-md relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-orange-200 font-bold uppercase tracking-wider text-sm mb-2 block">Empfohlener Verkaufspreis</span>
                <div className="text-5xl font-black">{suggestedPrice.toFixed(2)} €</div>
                <div className="mt-2 text-orange-200 font-medium">pro {selectedRecipe.yieldUnit.replace(/s$/i, '').replace(/e$/i, '')}</div>
              </div>
              
              <div className="mt-6 bg-orange-700/40 p-4 rounded-3xl backdrop-blur-sm border border-orange-500/30 flex flex-row items-center justify-around gap-2 sm:gap-4 shrink-0">
                <div className="flex flex-col items-center flex-1">
                  <label className="text-[10px] uppercase font-black text-orange-200 mb-1.5 tracking-wider text-center">Faktor (%)</label>
                  <div className="flex items-center justify-center bg-white/10 rounded-xl px-2 py-1.5 w-full">
                    <input type="number" value={markup} onChange={handleMarkupChange} className="w-12 sm:w-16 bg-transparent text-white placeholder-white/50 focus:outline-none font-black text-center text-xl" />
                    <span className="text-orange-300 font-bold ml-1">%</span>
                  </div>
                </div>
                <div className="w-px h-10 bg-orange-500/40"></div>
                <div className="flex flex-col items-center flex-1">
                  <label className="text-[10px] uppercase font-black text-orange-200 mb-1.5 tracking-wider text-center">Fix-Betrag</label>
                  <div className="flex items-center justify-center bg-white/10 rounded-xl px-2 py-1.5 w-full">
                    <span className="text-orange-300 font-bold mr-1">+</span>
                    <input type="number" step="0.01" value={fixedAddition} onChange={(e) => setFixedAddition(e.target.value)} onBlur={handleFixedBlur} placeholder="0.00" className="w-16 sm:w-24 bg-transparent text-white placeholder-white/50 focus:outline-none font-black text-center text-xl" />
                    <span className="text-orange-300 font-bold ml-1">€</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-emerald-500 p-6 rounded-[2rem] shadow-sm flex items-center justify-between">
            <div>
              <h4 className="text-emerald-700 font-black text-lg mb-1">Break-Even-Point</h4>
              <p className="text-emerald-600/80 font-medium text-sm">Ab dieser Verkaufsmenge hast du die kompletten Materialkosten wieder drin.</p>
            </div>
            <div className="text-right ml-4">
              <span className="text-4xl font-black text-emerald-600">{breakEven}</span>
              <span className="text-emerald-700 font-bold ml-2">Stück</span>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-stone-200">
            <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center">
              <ListPlus className="w-5 h-5 mr-2 text-stone-400" /> Einzelaufstellung & Eigene Preise
            </h3>
            
            <ul className="divide-y divide-stone-100">
              {calculationData.details.map((ing, idx) => (
                <li key={idx} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 group">
                  <div className="flex-1">
                    <span className="font-bold text-stone-800 flex items-center text-lg">
                      {ing.isRecipe && <Layers className="w-4 h-4 mr-2 text-orange-500" />}
                      {ing.label}
                    </span>
                    <span className="text-stone-500 font-medium text-sm">
                      {ing.amount} {ing.unit} 
                      <span className="mx-2">•</span> 
                      Basis: {ing.basePrice.toFixed(2)} € / {ing.isRecipe ? 'Unit' : 'kg/L/Stk'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {editingPrice === ing.name && !ing.isRecipe ? (
                      <div className="flex items-center space-x-2 bg-stone-100 p-1.5 rounded-xl">
                        <input autoFocus type="number" step="0.01" value={tempPrice} onChange={(e) => setTempPrice(e.target.value)} placeholder="Preis/kg" className="w-20 px-2 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-orange-500 text-sm font-bold text-center" />
                        <button onClick={() => saveCustomPrice(ing.name, tempPrice)} className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingPrice(null)} className="p-1.5 text-stone-400 hover:text-stone-600"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <>
                        {!ing.isRecipe ? (
                          <button 
                            onClick={() => { setTempPrice(ing.basePrice); setEditingPrice(ing.name); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${ing.isCustom ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                          >
                            <Edit2 className="w-3 h-3 inline mr-1" />{ing.isCustom ? 'Eigener Preis' : 'Preis ändern'}
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100">
                            Auto-Kalkuliert
                          </span>
                        )}
                        <div className="w-24 text-right">
                          <span className="font-black text-lg text-stone-900">{ing.cost.toFixed(2)} €</span>
                        </div>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductionView({ productionLogs, setProductionLogs, recipes, weeklyPlan, setWeeklyPlan }) {
  const [activeSubTab, setActiveSubTab] = useState('plan'); 
  
  const [planRecipeId, setPlanRecipeId] = useState('');
  const [planAmount, setPlanAmount] = useState('');

  const [showAddLog, setShowAddLog] = useState(false);
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0,10));
  const [logTags, setLogTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState('');
  
  const [logItems, setLogItems] = useState([{ id: Date.now().toString(), productName: '', sold: '', leftover: '' }]);

  const AVAILABLE_TAGS = ['☀️ Sonne', '🌧️ Regen', '❄️ Schnee', '🌡️ Hitze', '🎒 Ferien', '🎊 Feiertag', '🎪 Event'];

  const handleAddPlan = () => {
    if (!planRecipeId || !planAmount) return;
    const newItem = { id: Date.now().toString(), recipeId: planRecipeId, amount: parseFloat(planAmount) };
    setWeeklyPlan([...weeklyPlan, newItem]);
    setPlanRecipeId('');
    setPlanAmount('');
  };

  const removePlanItem = (id) => {
    setWeeklyPlan(weeklyPlan.filter(item => item.id !== id));
  };

  const getUnitFactor = (unit, amount) => {
    const u = (unit || '').toLowerCase();
    const amt = parseFloat(amount) || 0;
    if (u === 'g' || u === 'ml') return amt / 1000;
    if (u === 'el') return amt * 0.015;
    if (u === 'tl') return amt * 0.005;
    return amt;
  };

  const shoppingList = useMemo(() => {
    const totals = {};
    
    weeklyPlan.forEach(planItem => {
      const recipe = recipes.find(r => r.id === planItem.recipeId);
      if (!recipe) return;

      const baseScale = planItem.amount / recipe.baseYield;

      const resolveIngredients = (recId, currentScale) => {
        const rec = recipes.find(r => r.id === recId);
        if (!rec) return;

        rec.ingredients.forEach(ing => {
          if (ing.type === 'recipe') {
            const subRec = recipes.find(r => r.id === ing.refId);
            if (subRec) {
              const subYieldInKg = getUnitFactor(subRec.yieldUnit, subRec.baseYield) || 1;
              const usageInKg = getUnitFactor(ing.unit, ing.amount) * currentScale;
              if (subYieldInKg > 0) resolveIngredients(ing.refId, usageInKg / subYieldInKg);
            }
          } else {
            const kgAmount = getUnitFactor(ing.unit, ing.amount) * currentScale;
            const name = (ing.name || '').trim();
            if (name) {
              if (!totals[name]) totals[name] = 0;
              totals[name] += kgAmount;
            }
          }
        });
      };
      resolveIngredients(planItem.recipeId, baseScale);
    });
    
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [weeklyPlan, recipes]);

  const toggleTag = (tag) => {
    setLogTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleAddCustomTag = (e) => {
    e.preventDefault();
    const tag = customTagInput.trim();
    if (tag && !logTags.includes(tag)) {
      setLogTags([...logTags, tag]);
    }
    setCustomTagInput('');
  };

  const addLogItemRow = () => {
    setLogItems([...logItems, { id: Date.now().toString(), productName: '', sold: '', leftover: '' }]);
  };

  const updateLogItem = (id, field, value) => {
    setLogItems(logItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeLogItemRow = (id) => {
    setLogItems(logItems.filter(item => item.id !== id));
  };

  const handleSaveDayLog = () => {
    const validItems = logItems.filter(item => item.productName.trim() !== '' && (item.sold !== '' || item.leftover !== ''));
    if (validItems.length === 0) return;

    const newDayLog = { 
      id: 'day_' + Date.now().toString(), 
      date: logDate, 
      tags: logTags,
      items: validItems.map(item => ({
        productName: item.productName,
        sold: parseFloat(item.sold) || 0,
        leftover: parseFloat(item.leftover) || 0
      }))
    };

    setProductionLogs([newDayLog, ...productionLogs]);
    setShowAddLog(false);
    setLogTags([]);
    setCustomTagInput('');
    setLogItems([{ id: Date.now().toString(), productName: '', sold: '', leftover: '' }]);
  };

  const hasValidItems = logItems.some(item => item.productName.trim() !== '' && (item.sold !== '' || item.leftover !== ''));

  const groupedLogs = useMemo(() => {
    const groups = {};
    
    productionLogs.forEach(log => {
      const dateStr = log.date;
      if (!groups[dateStr]) {
        groups[dateStr] = {
          id: dateStr,
          date: dateStr,
          tags: new Set(),
          items: [],
          originalIds: []
        };
      }
      
      groups[dateStr].originalIds.push(log.id);
      if (log.tags) log.tags.forEach(t => groups[dateStr].tags.add(t));

      if (log.items) {
        log.items.forEach(item => groups[dateStr].items.push(item));
      } else {
        let pName = log.productText;
        if (!pName && log.recipeId) {
          const rec = recipes.find(r => r.id === log.recipeId);
          pName = rec ? rec.title : 'Unbekanntes Produkt';
        }
        groups[dateStr].items.push({
          productName: pName,
          sold: parseFloat(log.sold) || 0,
          leftover: parseFloat(log.leftover) || 0
        });
      }
    });

    return Object.values(groups)
      .map(g => ({ ...g, tags: Array.from(g.tags) }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [productionLogs, recipes]);

  const deleteDayGroup = (originalIds) => {
    setProductionLogs(productionLogs.filter(log => !originalIds.includes(log.id)));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-black text-stone-800 tracking-tight">Produktion</h2>
          <p className="text-stone-500 font-medium">Planung, Einkauf & Logbuch</p>
        </div>
      </div>

      <div className="flex bg-stone-200 p-1 rounded-2xl mb-8">
        <button onClick={() => setActiveSubTab('plan')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeSubTab === 'plan' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}>Wochenplan & Einkauf</button>
        <button onClick={() => setActiveSubTab('log')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeSubTab === 'log' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}>Tages-Logbuch</button>
      </div>

      {activeSubTab === 'plan' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-stone-200">
            <h3 className="text-xl font-bold text-stone-800 mb-6 flex items-center"><Activity className="w-5 h-5 mr-2 text-orange-600" /> Wochenmenge festlegen</h3>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Rezept</label>
                <select value={planRecipeId} onChange={e => setPlanRecipeId(e.target.value)} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-stone-800">
                  <option value="">Bitte wählen...</option>
                  {recipes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                </select>
              </div>
              <div className="w-full md:w-32">
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Menge</label>
                <input type="number" value={planAmount} onChange={e => setPlanAmount(e.target.value)} placeholder="z.B. 150" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-black text-lg" />
              </div>
              <button onClick={handleAddPlan} disabled={!planRecipeId || !planAmount} className="w-full md:w-auto bg-stone-800 disabled:bg-stone-300 text-white px-6 py-3 rounded-xl font-bold hover:bg-stone-900 transition-colors h-[50px]">Hinzufügen</button>
            </div>

            {weeklyPlan.length > 0 && (
              <div className="mt-8 pt-6 border-t border-stone-100">
                <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Aktueller Produktionsplan</h4>
                <ul className="space-y-3">
                  {weeklyPlan.map(item => {
                    const rec = recipes.find(r => r.id === item.recipeId);
                    if (!rec) return null;
                    return (
                      <li key={item.id} className="flex justify-between items-center bg-stone-50 p-3 rounded-xl">
                        <span className="font-bold text-stone-800">{rec.title}</span>
                        <div className="flex items-center gap-4">
                          <span className="font-black text-orange-600 bg-orange-100 px-3 py-1 rounded-lg">{item.amount} <span className="text-sm text-orange-800/60 font-medium">{rec.yieldUnit}</span></span>
                          <button onClick={() => removePlanItem(item.id)} className="text-stone-300 hover:text-red-500"><X className="w-5 h-5" /></button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {weeklyPlan.length > 0 && (
            <div className="bg-orange-600 p-6 md:p-8 rounded-[2rem] shadow-md text-white">
              <h3 className="text-2xl font-black mb-2 flex items-center"><ListPlus className="w-6 h-6 mr-3 text-orange-200" /> Benötigter Materialbedarf</h3>
              <p className="text-orange-200 font-medium mb-6">Exakt berechnet aus deinem Wochenplan (inkl. aller Vorstufen)</p>
              <div className="bg-white rounded-[1.5rem] p-2 md:p-6 shadow-inner text-stone-800">
                <ul className="divide-y divide-stone-100">
                  {shoppingList.map(([name, amount]) => {
                    const isSmall = amount < 1;
                    const displayAmount = isSmall ? Math.round(amount * 1000) : amount.toFixed(2);
                    const displayUnit = isSmall ? 'g / ml' : 'kg / L / Stk';
                    return (
                      <li key={name} className="py-3 px-4 flex justify-between items-center hover:bg-stone-50 rounded-xl transition-colors">
                        <span className="font-bold text-lg">{name}</span>
                        <span className="font-black text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-lg shadow-sm">{displayAmount} <span className="text-sm text-orange-800/60 ml-1">{displayUnit}</span></span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'log' && (
        <div className="space-y-6 animate-in fade-in">
          <button onClick={() => setShowAddLog(!showAddLog)} className="w-full bg-white border-2 border-dashed border-stone-300 hover:border-orange-400 hover:bg-orange-50 text-stone-500 hover:text-orange-600 font-bold py-6 rounded-[2rem] transition-all flex flex-col items-center justify-center gap-2 shadow-sm">
            {showAddLog ? <X className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
            <span>{showAddLog ? 'Abbrechen' : 'Neuen Tag erfassen (Tabelle öffnen)'}</span>
          </button>

          {showAddLog && (
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-md border border-stone-200 animate-in slide-in-from-top-4">
              <h3 className="text-2xl font-black text-stone-800 mb-6">Tagestabelle</h3>
              
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Datum wählen</label>
                    <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
                  </div>
                  
                  <div className="md:w-2/3 border-l-0 md:border-l border-stone-100 md:pl-6">
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Besondere Bedingungen (Wetter, Event...)</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {AVAILABLE_TAGS.map(tag => (
                        <button key={tag} onClick={() => toggleTag(tag)} className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-colors active:scale-95 ${logTags.includes(tag) ? 'bg-orange-100 border-orange-300 text-orange-800 shadow-sm' : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'}`}>
                          {tag}
                        </button>
                      ))}
                      {logTags.filter(t => !AVAILABLE_TAGS.includes(t)).map(tag => (
                        <button key={tag} onClick={() => toggleTag(tag)} className="px-4 py-2 rounded-xl text-sm font-bold border-2 transition-colors active:scale-95 bg-orange-100 border-orange-300 text-orange-800 shadow-sm">
                          {tag} <X className="w-3 h-3 inline ml-1" />
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={customTagInput} 
                        onChange={e => setCustomTagInput(e.target.value)} 
                        onKeyDown={e => { if(e.key === 'Enter') handleAddCustomTag(e); }}
                        placeholder="Eigene Bedingung tippen..." 
                        className="flex-1 bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-sm" 
                      />
                      <button onClick={handleAddCustomTag} className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-3 rounded-xl font-bold transition-colors text-sm">Hinzufügen</button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-100">
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-4">Produktions-Liste</label>
                  <div className="border border-stone-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left bg-white">
                      <thead className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                        <tr>
                          <th className="p-3">Produkt / Freitext</th>
                          <th className="p-3 w-28 text-center">Verkauft</th>
                          <th className="p-3 w-28 text-center">Retoure</th>
                          <th className="p-3 w-12 text-center"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {logItems.map((item, index) => (
                          <tr key={item.id} className="border-b border-stone-100 last:border-0 group hover:bg-stone-50 transition-colors">
                            <td className="p-2">
                              <input autoFocus={index === logItems.length -1} type="text" value={item.productName} onChange={e => updateLogItem(item.id, 'productName', e.target.value)} placeholder="z.B. Bauernbrot" className="w-full bg-white border border-stone-200 px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-stone-700 placeholder:font-normal" />
                            </td>
                            <td className="p-2">
                              <input type="number" value={item.sold} onChange={e => updateLogItem(item.id, 'sold', e.target.value)} placeholder="0" className="w-full bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-black text-center" />
                            </td>
                            <td className="p-2">
                              <input type="number" value={item.leftover} onChange={e => updateLogItem(item.id, 'leftover', e.target.value)} placeholder="0" className="w-full bg-red-50 border border-red-200 text-red-900 px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-black text-center" />
                            </td>
                            <td className="p-2 text-center">
                              {logItems.length > 1 && (
                                <button onClick={() => removeLogItemRow(item.id)} className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-5 h-5" /></button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button onClick={addLogItemRow} className="w-full bg-stone-50 text-stone-500 hover:text-stone-800 hover:bg-stone-100 py-3 text-sm font-bold flex items-center justify-center transition-colors border-t border-stone-200">
                      <Plus className="w-4 h-4 mr-2" /> Weitere Zeile hinzufügen
                    </button>
                  </div>
                </div>

                <button onClick={handleSaveDayLog} disabled={!hasValidItems} className="w-full bg-stone-800 disabled:bg-stone-300 text-white px-6 py-4 rounded-2xl font-black text-lg shadow-md transition-all mt-4 hover:bg-stone-900 active:scale-95">
                  Kompletten Tag speichern
                </button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {groupedLogs.map(group => {
              const dateObj = new Date(group.date);
              const dateDisplay = dateObj.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

              return (
                <div key={group.id} className="bg-white rounded-[2rem] shadow-sm border border-stone-200 overflow-hidden">
                  <div className="bg-stone-800 text-white p-6 border-b border-stone-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-black text-2xl mb-2">{dateDisplay}</h4>
                      <div className="flex flex-wrap gap-2">
                        {group.tags.map(t => (
                          <span key={t} className="bg-white/10 border border-white/20 text-white px-3 py-1 rounded-lg text-xs font-bold tracking-wide">{t}</span>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteDayGroup(group.originalIds)} 
                      className="w-12 h-12 shrink-0 bg-stone-700/50 hover:bg-red-500 text-stone-300 hover:text-white rounded-2xl flex items-center justify-center transition-colors"
                      title="Gesamten Tag löschen"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left min-w-[500px]">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-100 text-[10px] font-black text-stone-400 uppercase tracking-wider">
                          <th className="py-4 px-6">Produkt</th>
                          <th className="py-4 px-6 text-center w-32">Verkauft</th>
                          <th className="py-4 px-6 text-center w-32">Retoure</th>
                          <th className="py-4 px-6 text-right w-32">Verkaufsquote</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {group.items.map((item, idx) => {
                          const totalProduced = item.sold + item.leftover;
                          const quote = totalProduced > 0 ? Math.round((item.sold / totalProduced) * 100) : 0;
                          return (
                            <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                              <td className="py-4 px-6 font-bold text-stone-700 text-lg">{item.productName}</td>
                              <td className="py-4 px-6 text-center">
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-black px-4 py-1.5 rounded-xl">{item.sold}</span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className="bg-red-50 text-red-700 border border-red-100 font-black px-4 py-1.5 rounded-xl">{item.leftover}</span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <span className={`font-black text-xl ${quote >= 85 ? 'text-emerald-500' : quote >= 60 ? 'text-orange-500' : 'text-red-500'}`}>{quote}%</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsView({ user, onLogout, data, setData }) {
  const [importStatus, setImportStatus] = useState(null);

  const handleExport = () => {
    const exportData = {
      inventory: data.inventory,
      recipes: data.recipes,
      customPrices: data.customPrices,
      productionLogs: data.productionLogs,
      weeklyPlan: data.weeklyPlan,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ulti-back-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        
        if (imported.inventory && Array.isArray(imported.inventory)) setData.setInventory(imported.inventory);
        if (imported.recipes && Array.isArray(imported.recipes)) setData.setRecipes(imported.recipes);
        if (imported.customPrices) setData.setCustomPrices(imported.customPrices);
        if (imported.productionLogs && Array.isArray(imported.productionLogs)) setData.setProductionLogs(imported.productionLogs);
        if (imported.weeklyPlan && Array.isArray(imported.weeklyPlan)) setData.setWeeklyPlan(imported.weeklyPlan);

        setImportStatus({ type: 'success', msg: 'Daten erfolgreich wiederhergestellt!' });
      } catch (error) {
        console.error("Import Fehler:", error);
        setImportStatus({ type: 'error', msg: 'Fehlerhaftes Dateiformat. Import abgebrochen.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-stone-200">
        <h2 className="text-3xl font-black text-stone-800 mb-6 flex items-center">
          <Settings className="w-8 h-8 mr-3 text-stone-600" /> Einstellungen
        </h2>

        <div className="space-y-8">
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-1">Angemeldet als</p>
              <p className="font-black text-xl text-stone-800">{user.email}</p>
            </div>
            <button onClick={onLogout} className="px-4 py-2 bg-white border border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-100 transition-colors">
              Abmelden
            </button>
          </div>

          <div className="pt-6 border-t border-stone-100">
            <h3 className="text-lg font-black text-stone-800 mb-4">Lokale Daten & Backup</h3>
            
            {importStatus && (
              <div className={`p-4 rounded-xl mb-4 font-bold ${importStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                {importStatus.msg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          <div className="text-center pt-8">
            <p className="text-stone-400 font-bold text-sm">Daniels Ulti-Back v1.0.0 (Release Candidate)</p>
            <p className="text-stone-300 text-xs mt-1">Alle Daten werden sicher lokal im Browser gespeichert.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}