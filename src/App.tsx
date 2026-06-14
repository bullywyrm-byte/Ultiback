import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously,
  signInWithCustomToken,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  getDocs,
  setDoc
} from 'firebase/firestore';
import { 
  BookOpen, PackageSearch, CalendarDays, Settings,
  Wifi, WifiOff, Loader2, Plus, Edit2, X, Trash2, 
  ChefHat, Scale, Minus, ChevronLeft, ListPlus, 
  Utensils, Save, ClipboardList,
  TrendingUp, Download, Upload, AlertTriangle, FileJson, CheckCircle,
  Calculator, Coins, Percent, Receipt, LogOut, Lock, Mail, Key, Activity, Target
} from 'lucide-react';

// ==========================================
// 1. KONFIGURATION & INITIALISIERUNG
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyDve4SUXdVVJ0tc1aGnkXO9I4AS2pRaTME",
  authDomain: "com-example-danielsbackz-ab8de.firebaseapp.com",
  projectId: "com-example-danielsbackz-ab8de",
  storageBucket: "com-example-danielsbackz-ab8de.firebasestorage.app",
  messagingSenderId: "621450545649",
  appId: "1:621450545649:web:a1a3e227a2b8050e22dc50"
};

const SECRET_INVITE_CODE = "31123112";
const appId = firebaseConfig.projectId;
console.log("ACHTUNG! Der aktuell geladene Key ist:", firebaseConfig.apiKey);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

// ==========================================
// 2. HAUPT-APP KOMPONENTE
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        currentUser.displayEmail = localStorage.getItem('gastro_pro_email') || 'bäcker@lokal.de';
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center flex-col text-stone-500">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
        <p className="text-sm font-semibold tracking-wide uppercase">Lade Arbeitsumgebung...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'inventory': return <InventoryView user={user} />;
      case 'recipes': return <RecipesView user={user} />;
      case 'production': return <ProductionView user={user} />;
      case 'calculation': return <CalculationView user={user} />;
      case 'settings': return <SettingsView user={user} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col pb-20 md:pb-0 md:flex-row font-sans text-stone-900 selection:bg-orange-200">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-stone-200/50 px-5 py-4 flex items-center justify-between md:hidden sticky top-0 z-30 transition-all">
        <h1 className="text-2xl font-black text-stone-800 tracking-tight flex items-center">
          <ChefHat className="w-6 h-6 mr-2 text-orange-600" />
          Daniels <span className="text-orange-600 ml-1">Ulti-Back</span>
        </h1>
        {isOffline ? (
          <span className="flex items-center text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-full shadow-sm"><WifiOff className="w-3.5 h-3.5 mr-1" /> Offline</span>
        ) : (
          <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-full shadow-sm"><Wifi className="w-3.5 h-3.5 mr-1" /> Online</span>
        )}
      </header>

      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-stone-200 shadow-sm min-h-screen z-20 relative">
        <div className="p-8 border-b border-stone-100 flex flex-col gap-2">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-2 shadow-sm">
            <ChefHat className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-stone-800 tracking-tight">Daniels<br/><span className="text-orange-600">Ulti-Back</span></h1>
        </div>
        <div className="px-8 py-4 bg-stone-50/50">
           {isOffline ? (
            <span className="flex items-center text-xs font-bold text-rose-600"><WifiOff className="w-4 h-4 mr-2" /> Offline Modus aktiv</span>
          ) : (
            <span className="flex items-center text-xs font-bold text-emerald-600"><Wifi className="w-4 h-4 mr-2" /> Verbunden & Synchronisiert</span>
          )}
        </div>
        <nav className="flex-1 p-5 space-y-2.5">
          <NavItem icon={<PackageSearch />} label="Lagerbestand" value="inventory" current={activeTab} onClick={setActiveTab} />
          <NavItem icon={<BookOpen />} label="Rezepte" value="recipes" current={activeTab} onClick={setActiveTab} />
          <NavItem icon={<CalendarDays />} label="Produktion" value="production" current={activeTab} onClick={setActiveTab} />
          <NavItem icon={<Calculator />} label="Kalkulation" value="calculation" current={activeTab} onClick={setActiveTab} />
          <NavItem icon={<Settings />} label="Einstellungen" value="settings" current={activeTab} onClick={setActiveTab} />
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 md:max-w-7xl mx-auto w-full overflow-y-auto overflow-x-hidden">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
          {renderContent()}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-stone-200/50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] flex justify-around items-center pb-safe pt-1 z-50">
        <MobileNavItem icon={<PackageSearch />} label="Lager" value="inventory" current={activeTab} onClick={setActiveTab} />
        <MobileNavItem icon={<BookOpen />} label="Rezepte" value="recipes" current={activeTab} onClick={setActiveTab} />
        <MobileNavItem icon={<CalendarDays />} label="Produktion" value="production" current={activeTab} onClick={setActiveTab} />
        <MobileNavItem icon={<Calculator />} label="Kalkulation" value="calculation" current={activeTab} onClick={setActiveTab} />
        <MobileNavItem icon={<Settings />} label="Menü" value="settings" current={activeTab} onClick={setActiveTab} />
      </nav>
    </div>
  );
}

// ==========================================
// 2.5 AUTHENTIFIZIERUNGS-SCREEN
// ==========================================
function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!isLogin && inviteCode !== SECRET_INVITE_CODE) {
        throw new Error("Ungültiger Registrierungs-Code!");
      }
      await signInAnonymously(auth);
      localStorage.setItem('gastro_pro_email', email);
    } catch (err) {
      console.error(err);
      if (err.message === "Ungültiger Registrierungs-Code!") {
        setError(err.message);
      } else {
        setError("Ein Fehler ist aufgetreten. Bitte überprüfe deine Eingaben.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 selection:bg-orange-200 w-full relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-bl-full -z-0 opacity-50 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-100 rounded-tr-full -z-0 opacity-50 blur-3xl"></div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-stone-200/60 p-8 sm:p-10 animate-in zoom-in-95 duration-500 z-10 relative overflow-hidden">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-3xl flex items-center justify-center text-orange-600 mb-5 shadow-inner border border-orange-200/50">
            <ChefHat className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-stone-800 tracking-tight text-center">Daniels<br/><span className="text-orange-600">Ulti-Back</span></h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center text-rose-700 animate-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="font-bold text-sm leading-tight">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">E-Mail Adresse</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-stone-50 focus:bg-white border border-stone-200 focus:border-orange-500 rounded-2xl outline-none transition-all font-medium text-stone-800" placeholder="bäcker@beispiel.de" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Passwort</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-stone-50 focus:bg-white border border-stone-200 focus:border-orange-500 rounded-2xl outline-none transition-all font-medium text-stone-800" placeholder="••••••••" />
            </div>
          </div>
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Registrierungs-Code</label>
              <div className="relative">
                <Key className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" />
                <input required type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-orange-50/50 border border-orange-200 focus:border-orange-500 rounded-2xl outline-none transition-all font-black tracking-widest text-orange-700" placeholder="GEHEIM-CODE" />
              </div>
            </div>
          )}
          <button type="submit" disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-70 text-white py-4 rounded-2xl font-bold shadow-xl shadow-orange-600/20 transition-all flex justify-center items-center mt-6 text-lg">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isLogin ? 'Einloggen' : 'Account erstellen')}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-stone-100 pt-6">
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="mt-2 text-orange-600 hover:text-orange-700 font-black tracking-wide text-sm px-4 py-2 hover:bg-orange-50 rounded-xl">
            {isLogin ? 'Hier mit Code registrieren' : 'Zurück zum Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. EINSTELLUNGEN & BACKUP MODUL
// ==========================================
function SettingsView({ user }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [importData, setImportData] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const collections = ['inventory', 'recipes', 'production_logs', 'weekly_standards', 'settings'];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const backup = { app: 'Daniels_Ulti-Back', timestamp: new Date().toISOString(), data: {} };
      for (const col of collections) {
        const snap = await getDocs(collection(db, 'artifacts', appId, 'users', user.uid, col));
        backup.data[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; 
      a.download = `Ulti-Back_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      setMessage({ type: 'success', text: 'Backup erfolgreich heruntergeladen.' });
    } catch (e) {
      setMessage({ type: 'error', text: 'Fehler beim Erstellen des Backups.' });
    }
    setIsExporting(false);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed.app !== 'Daniels_Ulti-Back' && parsed.app !== 'GastroPro') throw new Error("Falsches Format");
        setImportData(parsed.data);
        setShowConfirm(true);
      } catch (err) {
        setMessage({ type: 'error', text: 'Ungültige Backup-Datei.' });
      }
    };
    reader.readAsText(file);
  };

  const executeImport = async () => {
    setIsImporting(true);
    try {
      for (const col in importData) {
        for (const item of importData[col]) {
          const { id, ...data } = item;
          await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, col, id), data);
        }
      }
      setMessage({ type: 'success', text: 'Daten erfolgreich wiederhergestellt.' });
      setShowConfirm(false);
      setImportData(null);
    } catch (e) {
      setMessage({ type: 'error', text: 'Fehler beim Importieren.' });
    }
    setIsImporting(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('gastro_pro_email');
    signOut(auth);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-stone-800 tracking-tight">Einstellungen</h2>
        <button onClick={handleLogout} className="flex items-center px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-xl transition-colors">
          <LogOut className="w-5 h-5 mr-2" /> Abmelden
        </button>
      </div>

      <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl flex items-center text-orange-800 font-medium">
        <Mail className="w-5 h-5 mr-3 text-orange-500" /> Angemeldet als: <strong className="ml-2">{user.displayEmail}</strong>
      </div>
      
      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center shadow-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertTriangle className="w-5 h-5 mr-3" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-stone-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6 shadow-inner">
            <Download className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-xl text-stone-800 mb-3">Daten sichern (Export)</h3>
          <p className="text-stone-500 text-sm mb-8 leading-relaxed">Lade alle deine Rezepte, das Lager und die Produktionsprotokolle als JSON-Datei sicher auf dein Gerät herunter.</p>
          <button onClick={handleExport} disabled={isExporting} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center">
            {isExporting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <FileJson className="w-5 h-5 mr-2" />}
            Backup herunterladen
          </button>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-stone-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-600 mb-6 shadow-inner">
            <Upload className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-xl text-stone-800 mb-3">Daten wiederherstellen</h3>
          <p className="text-stone-500 text-sm mb-8 leading-relaxed">Lade ein zuvor erstelltes Backup hoch. Existierende Daten mit gleicher ID werden sicher überschrieben.</p>
          <label className="block w-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-center py-4 rounded-2xl font-bold cursor-pointer transition-all">
            Backup-Datei auswählen
            <input type="file" accept=".json" className="hidden" onChange={handleFile} />
          </label>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2rem] max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-center text-stone-800 mb-3 tracking-tight">Achtung!</h3>
            <p className="text-stone-500 text-center mb-8 leading-relaxed">Möchtest du die Daten aus dem Backup wirklich importieren? Bestehende Daten werden dabei überschrieben.</p>
            <div className="flex flex-col gap-3">
              <button onClick={executeImport} disabled={isImporting} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-bold flex justify-center items-center transition-all">
                {isImporting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Ja, Importieren'}
              </button>
              <button onClick={() => setShowConfirm(false)} className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 py-4 rounded-2xl font-bold transition-colors">Abbruch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. INVENTORY MODUL (LAGERBESTAND)
// ==========================================
function InventoryView({ user }) {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', quantity: 0, unit: 'kg', step: 1 });

  useEffect(() => {
    if (!user) return;
    const inventoryRef = collection(db, 'artifacts', appId, 'users', user.uid, 'inventory');
    const unsubscribe = onSnapshot(inventoryRef, (snapshot) => {
      const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedItems.sort((a, b) => a.name.localeCompare(b.name));
      setItems(fetchedItems);
    });
    return () => unsubscribe();
  }, [user]);

  const handleUpdateQuantity = async (item, delta) => {
    if (!user) return;
    const newQuantity = Math.max(0, parseFloat((item.quantity + delta).toFixed(3)));
    try {
      const itemRef = doc(db, 'artifacts', appId, 'users', user.uid, 'inventory', item.id);
      await updateDoc(itemRef, { quantity: newQuantity, lastUpdated: new Date().toISOString() });
    } catch (error) {}
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    const inventoryRef = collection(db, 'artifacts', appId, 'users', user.uid, 'inventory');
    const dataToSave = {
      name: formData.name, quantity: parseFloat(formData.quantity),
      unit: formData.unit, step: parseFloat(formData.step) || 1, lastUpdated: new Date().toISOString()
    };
    if (editingItem) {
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'inventory', editingItem.id), dataToSave);
    } else {
      await addDoc(inventoryRef, dataToSave);
    }
    setIsModalOpen(false); setEditingItem(null);
  };

  const handleDelete = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'inventory', id));
    setIsModalOpen(false); setEditingItem(null);
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item); setFormData({ name: item.name, quantity: item.quantity, unit: item.unit, step: item.step || 1 });
    } else {
      setEditingItem(null); setFormData({ name: '', quantity: 0, unit: 'kg', step: 1 });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-black text-stone-800 tracking-tight">Lagerbestand</h2>
        <button onClick={() => openModal()} className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-2xl font-bold flex items-center shadow-lg transition-all active:scale-[0.98]">
          <Plus className="w-5 h-5 mr-1.5" /> Neu
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2rem] border border-stone-200/60 shadow-sm">
          <PackageSearch className="w-10 h-10 text-stone-300 mx-auto mb-6" />
          <p className="text-stone-500 font-medium text-lg">Dein Lager ist noch leer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map(item => (
            <div key={item.id} className="flex bg-white rounded-[1.5rem] shadow-sm border border-stone-200/60 overflow-hidden h-32 hover:shadow-md transition-shadow group">
              <div
                role="button" tabIndex={0}
                onClick={() => handleUpdateQuantity(item, -(item.step || 1))}
                className="flex-1 px-6 py-4 flex flex-col justify-center text-left hover:bg-stone-50 active:bg-orange-50 transition-colors cursor-pointer relative"
              >
                <div className="flex items-start justify-between w-full mb-1">
                  <span className="font-bold text-lg text-stone-800 line-clamp-1 pr-2 pt-1">{item.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); openModal(item); }} className="p-2.5 text-stone-400 hover:text-orange-600 bg-stone-100 hover:bg-orange-100 rounded-xl transition-colors z-10 opacity-70 group-hover:opacity-100">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-baseline space-x-1.5 mt-auto">
                  <span className="text-4xl font-black text-stone-900 tracking-tighter">{item.quantity}</span>
                  <span className="text-lg text-stone-500 font-medium">{item.unit}</span>
                </div>
              </div>
              <button onClick={() => handleUpdateQuantity(item, (item.step || 1))} className="w-24 bg-stone-50 hover:bg-orange-50 active:bg-orange-100 flex flex-col items-center justify-center text-stone-600 hover:text-orange-600 transition-colors border-l border-stone-100">
                <Plus className="w-8 h-8 mb-1.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Auffüllen</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <h3 className="font-black text-2xl text-stone-800 tracking-tight">{editingItem ? 'Produkt anpassen' : 'Neu im Lager'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-3 text-stone-400 hover:text-stone-700 bg-white shadow-sm rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div><label className="block text-sm font-bold text-stone-700 mb-2">Wie heißt das Produkt?</label>
              <input required type="text" className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 font-medium" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div className="flex space-x-4">
                <div className="flex-1"><label className="block text-sm font-bold text-stone-700 mb-2">Menge</label>
                <input required type="number" step="any" className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500 font-bold text-lg" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} /></div>
                <div className="w-[130px]"><label className="block text-sm font-bold text-stone-700 mb-2">Einheit</label>
                <select className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none font-medium" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                  <option value="kg">kg</option><option value="g">g</option><option value="L">Liter</option><option value="ml">ml</option><option value="Stk">Stk</option>
                </select></div>
              </div>
              <div><label className="block text-sm font-bold text-stone-700 mb-1">1-Klick Schrittweite (+/-)</label>
              <input required type="number" step="any" min="0.001" className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500 font-medium" value={formData.step} onChange={e => setFormData({...formData, step: e.target.value})} /></div>
              
              <div className="pt-6 flex space-x-3 mt-4">
                <button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-[0.98]">Speichern</button>
                {editingItem && <button type="button" onClick={() => handleDelete(editingItem.id)} className="px-6 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl transition-colors"><Trash2 className="w-6 h-6" /></button>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. REZEPTVERWALTUNG MODUL
// ==========================================
function RecipesView({ user }) {
  const [recipes, setRecipes] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [targetYield, setTargetYield] = useState(1);
  const [formData, setFormData] = useState({ title: '', baseYield: 1, yieldUnit: 'Portionen', ingredients: [{ name: '', amount: '', unit: 'g' }], instructions: '' });

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'recipes'), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetched.sort((a, b) => a.title.localeCompare(b.title));
      setRecipes(fetched);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    const cleaned = formData.ingredients.filter(ing => ing.name.trim() !== '').map(ing => ({ ...ing, amount: parseFloat(ing.amount) || 0 }));
    const data = { title: formData.title, baseYield: parseFloat(formData.baseYield) || 1, yieldUnit: formData.yieldUnit, ingredients: cleaned, instructions: formData.instructions };
    if (currentRecipe && viewMode === 'form') {
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'recipes', currentRecipe.id), data);
    } else {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'recipes'), { ...data, createdAt: new Date().toISOString() });
    }
    setViewMode('list');
  };

  const openForm = (r = null) => {
    setCurrentRecipe(r);
    setFormData(r ? { ...r } : { title: '', baseYield: 1, yieldUnit: 'Portionen', ingredients: [{ name: '', amount: '', unit: 'g' }], instructions: '' });
    setViewMode('form');
  };

  if (viewMode === 'list') return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-black text-stone-800 tracking-tight">Rezepte</h2>
        <button onClick={() => openForm()} className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-2xl font-bold flex items-center shadow-lg transition-all active:scale-[0.98]">
          <Plus className="w-5 h-5 mr-1.5" /> Neu
        </button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recipes.map(r => (
          <div key={r.id} onClick={() => { setCurrentRecipe(r); setTargetYield(r.baseYield); setViewMode('detail'); }} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-stone-200/60 cursor-pointer hover:shadow-md hover:border-orange-300 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-black text-xl text-stone-800 group-hover:text-orange-700 leading-tight">{r.title}</h3>
              <Utensils className="w-6 h-6 text-stone-200 group-hover:text-orange-200 flex-shrink-0 ml-3"/>
            </div>
            <div className="text-xs font-bold text-stone-600 bg-stone-100 inline-block px-3 py-1.5 rounded-lg mb-3">Ertrag: {r.baseYield} {r.yieldUnit}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if (viewMode === 'detail' && currentRecipe) {
    const scale = targetYield / (currentRecipe.baseYield || 1);
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-8 animate-in slide-in-from-right-8 duration-300">
        <div className="flex justify-between bg-white/60 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-stone-200/50 sticky top-0 z-10">
          <button onClick={() => setViewMode('list')} className="flex items-center text-stone-600 hover:text-stone-900 font-bold px-2 py-1"><ChevronLeft className="w-5 h-5 mr-1"/> Zurück</button>
          <div className="flex gap-2">
            <button onClick={() => openForm(currentRecipe)} className="p-2.5 text-stone-500 hover:text-orange-600 bg-white rounded-xl shadow-sm"><Edit2 className="w-5 h-5"/></button>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-200/60 relative overflow-hidden">
          <h2 className="text-4xl font-black text-stone-900 mb-8 tracking-tight">{currentRecipe.title}</h2>
          <div className="bg-stone-50 p-6 rounded-3xl flex items-center justify-between border border-stone-100">
            <div className="flex items-center"><Scale className="w-8 h-8 mr-4 text-orange-400" /><div><p className="font-bold text-stone-800 text-lg">Skalieren</p></div></div>
            <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-stone-200">
              <button onClick={() => setTargetYield(Math.max(1, targetYield - 1))} className="w-12 h-12 flex items-center justify-center bg-stone-50 hover:bg-orange-50 text-stone-600 hover:text-orange-600 rounded-xl transition-colors"><Minus className="w-6 h-6"/></button>
              <div className="flex flex-col items-center justify-center w-24">
                <input type="number" value={targetYield} onChange={(e) => setTargetYield(parseFloat(e.target.value)||1)} className="w-full text-center font-black text-2xl text-stone-800 outline-none bg-transparent" />
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{currentRecipe.yieldUnit}</span>
              </div>
              <button onClick={() => setTargetYield(targetYield + 1)} className="w-12 h-12 flex items-center justify-center bg-stone-50 hover:bg-orange-50 text-stone-600 hover:text-orange-600 rounded-xl transition-colors"><Plus className="w-6 h-6"/></button>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-200/60 mt-6">
          <h3 className="text-2xl font-black text-stone-800 mb-6 flex items-center"><ListPlus className="w-6 h-6 mr-3 text-orange-400" /> Zutaten</h3>
          <ul className="space-y-2">{currentRecipe.ingredients?.map((ing, i) => (
            <li key={i} className="py-3 px-4 flex justify-between items-center bg-stone-50 rounded-2xl hover:bg-stone-100 transition-colors">
              <span className="font-bold text-stone-700 text-lg">{ing.name}</span>
              <div className="flex items-baseline space-x-1.5"><span className="font-black text-xl text-stone-900">{(ing.amount * scale).toFixed(1)}</span><span className="font-bold text-stone-500">{ing.unit}</span></div>
            </li>
          ))}</ul>
        </div>
      </div>
    );
  }

  if (viewMode === 'form') return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-[2rem] shadow-xl border border-stone-200/60 animate-in slide-in-from-bottom-8 duration-300">
      <div className="flex justify-between items-center mb-8 border-b border-stone-100 pb-4">
        <h3 className="font-black text-2xl text-stone-800">{currentRecipe ? 'Rezept bearbeiten' : 'Kreiere ein Rezept'}</h3>
        <button onClick={() => setViewMode('list')} className="p-2 bg-stone-100 text-stone-500 rounded-full"><X className="w-5 h-5"/></button>
      </div>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Rezept-Titel</label>
          <input required type="text" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none font-bold text-lg" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-bold text-stone-700 mb-2">Ertrag (Basis-Menge)</label>
            <input required type="number" value={formData.baseYield} onChange={e=>setFormData({...formData, baseYield: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none font-bold text-lg" />
          </div>
          <div className="w-1/3">
            <label className="block text-sm font-bold text-stone-700 mb-2">Einheit</label>
            <input required type="text" value={formData.yieldUnit} onChange={e=>setFormData({...formData, yieldUnit: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none font-bold text-lg" />
          </div>
        </div>
        <div className="pt-4">
          <h4 className="font-bold text-stone-800 mb-4 border-b border-stone-100 pb-2">Die Zutaten</h4>
          <div className="space-y-3 mb-4">
            {formData.ingredients.map((ing, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input type="text" value={ing.name} onChange={e => {const n=[...formData.ingredients]; n[idx].name=e.target.value; setFormData({...formData, ingredients: n})}} className="flex-1 p-3 bg-white border border-stone-200 rounded-xl font-medium" placeholder="Zutat" />
                <input type="number" step="any" value={ing.amount} onChange={e => {const n=[...formData.ingredients]; n[idx].amount=e.target.value; setFormData({...formData, ingredients: n})}} className="w-24 p-3 bg-white border border-stone-200 rounded-xl font-bold" placeholder="Menge" />
                <input type="text" value={ing.unit} onChange={e => {const n=[...formData.ingredients]; n[idx].unit=e.target.value; setFormData({...formData, ingredients: n})}} className="w-20 p-3 bg-white border border-stone-200 rounded-xl font-medium" placeholder="g/ml" />
                <button type="button" onClick={() => {const n=formData.ingredients.filter((_,i)=>i!==idx); setFormData({...formData, ingredients: n})}} className="p-3 text-stone-400 hover:text-rose-500 bg-stone-50 rounded-xl"><X className="w-5 h-5"/></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setFormData({...formData, ingredients: [...formData.ingredients, {name:'', amount:'', unit:'g'}]})} className="w-full py-4 border-2 border-dashed border-stone-200 text-stone-500 font-bold rounded-2xl hover:bg-stone-50 transition-colors flex items-center justify-center">
            <Plus className="w-5 h-5 mr-2" /> Weitere Zutat
          </button>
        </div>
        <div>
           <label className="block text-sm font-bold text-stone-700 mb-2">Zubereitungsschritte</label>
           <textarea value={formData.instructions} onChange={e=>setFormData({...formData, instructions: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none font-medium h-40 resize-none" />
        </div>
        <div className="pt-6 border-t border-stone-100 flex gap-4">
          <button type="button" onClick={()=>setViewMode('list')} className="flex-1 py-4 bg-stone-100 text-stone-600 font-bold rounded-2xl">Abbrechen</button>
          <button type="submit" className="flex-[2] bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98]">Speichern</button>
        </div>
      </form>
    </div>
  );
}

// ==========================================
// 6. PRODUKTIONSMODUL (LOGBUCH)
// ==========================================
function ProductionView({ user }) {
  const [activeSubTab, setActiveSubTab] = useState('log');
  const [logs, setLogs] = useState([]);
  const [isEditingLog, setIsEditingLog] = useState(false);
  const [logForm, setLogForm] = useState({ date: new Date().toISOString().split('T')[0], comment: '', items: [] });
  const [newItem, setNewItem] = useState({ name: '', produced: '', returned: '' });
  const [weeklyStandards, setWeeklyStandards] = useState([]);
  const [newStandardName, setNewStandardName] = useState('');
  const [recipeNames, setRecipeNames] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsubLogs = onSnapshot(query(collection(db, 'artifacts', appId, 'users', user.uid, 'production_logs'), orderBy('date', 'desc')), (snap) => setLogs(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubWeekly = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'weekly_standards'), (snap) => {
      const standards = snap.docs.map(d => ({id: d.id, ...d.data()}));
      standards.sort((a,b) => a.name.localeCompare(b.name));
      setWeeklyStandards(standards);
    });
    const unsubRecipes = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'recipes'), (snap) => setRecipeNames(snap.docs.map(d => d.data().title)));
    return () => { unsubLogs(); unsubWeekly(); unsubRecipes(); };
  }, [user]);

  const handleAddLogItem = (e) => {
    e.preventDefault();
    if (!newItem.name) return;
    setLogForm(prev => ({ ...prev, items: [...prev.items, { ...newItem, produced: Number(newItem.produced)||0, returned: Number(newItem.returned)||0 }] }));
    setNewItem({ name: '', produced: '', returned: '' });
  };

  const saveLog = async () => {
    if (!user) return;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'production_logs'), logForm);
    setIsEditingLog(false);
    setLogForm({ date: new Date().toISOString().split('T')[0], comment: '', items: [] });
  };

  const addWeeklyStandard = async (e) => {
    e.preventDefault();
    if (!user || !newStandardName.trim()) return;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'weekly_standards'), { name: newStandardName.trim(), amount: 0 });
    setNewStandardName('');
  };

  const updateWeeklyAmount = async (id, newAmount) => {
    if (!user) return;
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'weekly_standards', id), { amount: Number(newAmount)||0 });
  };

  const deleteWeeklyStandard = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'weekly_standards', id));
  };

  return (
    <div className="space-y-8">
      <div className="flex bg-stone-200/60 p-1.5 rounded-[1.25rem] w-full max-w-sm mx-auto md:mx-0 shadow-inner">
        <button onClick={() => setActiveSubTab('log')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeSubTab==='log' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'}`}>Tages-Logbuch</button>
        <button onClick={() => setActiveSubTab('weekly')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeSubTab==='weekly' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'}`}>Wochen-Standard</button>
      </div>

      {activeSubTab === 'log' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-3xl font-black text-stone-800 tracking-tight">Tages-Protokolle</h2>
            <button onClick={() => setIsEditingLog(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-2xl font-bold flex items-center shadow-lg transition-all active:scale-[0.98]">
              <Plus className="w-5 h-5 mr-1.5" /> Neuer Tag
            </button>
          </div>

          {isEditingLog && (
            <div className="bg-white p-8 rounded-[2rem] border border-stone-200/60 shadow-xl animate-in slide-in-from-top-4 duration-300">
              <h3 className="font-black text-2xl mb-6 text-stone-800">Neuen Merkzettel anlegen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input type="date" value={logForm.date} onChange={e=>setLogForm({...logForm, date: e.target.value})} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl font-bold text-stone-700 outline-none" />
                <input type="text" placeholder="Kommentar (z.B. Stadtfest)" value={logForm.comment} onChange={e=>setLogForm({...logForm, comment: e.target.value})} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl font-medium outline-none" />
              </div>
              <form onSubmit={handleAddLogItem} className="bg-stone-50 p-6 rounded-3xl border border-stone-200 mb-8">
                <h4 className="font-bold text-stone-800 mb-4">Produkte hinzufügen</h4>
                <div className="flex flex-col md:flex-row gap-3">
                  <input required type="text" list="recipes-list" placeholder="Produktname" value={newItem.name} onChange={e=>setNewItem({...newItem, name: e.target.value})} className="flex-1 p-4 bg-white border border-stone-200 rounded-2xl font-medium outline-none" />
                  <datalist id="recipes-list">{recipeNames.map(n => <option key={n} value={n}/>)}</datalist>
                  <input required type="number" placeholder="Produziert" value={newItem.produced} onChange={e=>setNewItem({...newItem, produced: e.target.value})} className="w-full md:w-32 p-4 bg-white border border-stone-200 rounded-2xl font-bold outline-none text-emerald-600" />
                  <input required type="number" placeholder="Retoure" value={newItem.returned} onChange={e=>setNewItem({...newItem, returned: e.target.value})} className="w-full md:w-32 p-4 bg-white border border-stone-200 rounded-2xl font-bold outline-none text-rose-600" />
                  <button type="submit" className="bg-stone-800 hover:bg-stone-900 text-white px-6 py-4 rounded-2xl font-bold transition-colors">Dazu</button>
                </div>
              </form>
              {logForm.items.length > 0 && (
                <ul className="mb-8 space-y-2">
                  {logForm.items.map((item, idx) => (
                    <li key={idx} className="p-4 flex justify-between bg-stone-50 rounded-2xl items-center border border-stone-100">
                      <span className="font-bold text-stone-800 text-lg">{item.name}</span>
                      <div className="flex space-x-6 text-sm">
                        <span className="text-emerald-600 font-black text-lg bg-emerald-50 px-3 py-1 rounded-xl">Prod: {item.produced}</span>
                        <span className="text-rose-600 font-black text-lg bg-rose-50 px-3 py-1 rounded-xl">Ret: {item.returned}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-4 border-t border-stone-100 pt-6">
                <button onClick={() => setIsEditingLog(false)} className="flex-1 p-4 bg-stone-100 hover:bg-stone-200 font-bold rounded-2xl text-stone-600 transition-colors">Abbruch</button>
                <button onClick={saveLog} className="flex-[2] p-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-2xl shadow-lg active:scale-[0.98]">Speichern</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {logs.map(log => (
              <div key={log.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-200/60 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-black text-xl text-stone-800">{new Date(log.date).toLocaleDateString('de-DE')}</h3>
                  <div className="bg-orange-50 p-2 rounded-xl text-orange-500"><ClipboardList className="w-5 h-5" /></div>
                </div>
                {log.comment && <p className="text-sm font-medium text-stone-600 mb-6 bg-stone-50 p-3 rounded-xl border border-stone-100">"{log.comment}"</p>}
                <div className="space-y-3">
                  {log.items?.map((item, i) => {
                    const sold = item.produced - item.returned;
                    const quote = item.produced > 0 ? Math.round((sold / item.produced) * 100) : 0;
                    return (
                      <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm border-b border-stone-100 pb-3 last:border-0">
                        <span className="font-bold text-stone-800 text-base mb-1 sm:mb-0">{item.name}</span>
                        <div className="flex items-center space-x-4 bg-stone-50 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                          <span className="text-stone-500 font-medium">{item.produced}x prod.</span>
                          <span className={`font-black w-14 text-right text-lg ${quote >= 90 ? 'text-emerald-500' : quote >= 70 ? 'text-amber-500' : 'text-rose-500'}`}>{quote}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'weekly' && (
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-black text-stone-800 tracking-tight">Wochen-Referenz</h2>
          </div>
          <div className="bg-white rounded-[2rem] border border-stone-200/60 shadow-sm overflow-hidden">
            <ul className="divide-y divide-stone-100">
              {weeklyStandards.map(std => (
                <li key={std.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-stone-50 transition-colors gap-3">
                  <span className="font-bold text-stone-800 text-lg">{std.name}</span>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <input 
                      type="number" 
                      defaultValue={std.amount} 
                      onBlur={(e) => updateWeeklyAmount(std.id, e.target.value)}
                      className="w-24 p-3 text-center font-black text-xl text-orange-700 bg-orange-50 border border-orange-100 rounded-xl outline-none"
                    />
                    <button onClick={() => deleteWeeklyStandard(std.id)} className="p-3 text-stone-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 className="w-5 h-5"/></button>
                  </div>
                </li>
              ))}
            </ul>
            <form onSubmit={addWeeklyStandard} className="p-5 bg-stone-50 border-t border-stone-100 flex flex-col sm:flex-row gap-3">
              <input type="text" placeholder="Neues Produkt eingeben..." value={newStandardName} onChange={e=>setNewStandardName(e.target.value)} className="flex-1 p-4 border border-stone-200 rounded-2xl outline-none font-medium" />
              <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 font-bold rounded-2xl shadow-md active:scale-95 text-lg">Dazu</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 7. NEUES KALKULATIONS MODUL (Echtzeit & Break-Even)
// ==========================================
function CalculationView({ user }) {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [markup, setMarkup] = useState(300);
  const [fixedAddition, setFixedAddition] = useState(''); // NEU: Fixer Euro-Betrag
  
  const [customPrices, setCustomPrices] = useState({});
  const [editingPrice, setEditingPrice] = useState(null);
  const [tempPrice, setTempPrice] = useState('');

  const STANDARD_PRICES = {
    'weizenmehl': 0.60, 'dinkelmehl': 1.20, 'roggenmehl': 0.75,
    'zucker': 0.90, 'butter': 6.50, 'milch': 1.05, 'wasser': 0.002,
    'salz': 0.40, 'hefe': 2.50, 'ei': 0.25, 'sauerteig': 0.80
  };

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'recipes'), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetched.sort((a, b) => a.title.localeCompare(b.title));
      setRecipes(fetched);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'prices'), (docSnap) => {
      if (docSnap.exists()) setCustomPrices(docSnap.data());
    });
    return () => unsub();
  }, [user]);

  const saveCustomPrice = async (ingredientName, priceStr) => {
    if (!user) return;
    const newPrice = parseFloat(priceStr);
    if (isNaN(newPrice)) return;
    const updatedPrices = { ...customPrices, [ingredientName]: newPrice };
    setCustomPrices(updatedPrices);
    setEditingPrice(null);
    try {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'prices'), updatedPrices, { merge: true });
    } catch (e) { console.error("Fehler beim Speichern:", e); }
  };

  // ECHTZEIT-BERECHNUNG (ohne Button-Klick)
  const calculationData = useMemo(() => {
    const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);
    if (!selectedRecipe || !selectedRecipe.ingredients) return null;

    let totalMaterialCost = 0;
    const calculatedIngredients = selectedRecipe.ingredients.map(ing => {
      const u = ing.unit.toLowerCase();
      const amt = parseFloat(ing.amount) || 0;
      
      let factor = 0;
      if (u === 'g' || u === 'ml') factor = amt / 1000;
      else if (u === 'kg' || u === 'l' || u === 'liter') factor = amt;
      else if (u === 'stk' || u === 'stück' || u === 'stueck') factor = amt;
      else if (u === 'el') factor = amt * 0.015; 
      else if (u === 'tl') factor = amt * 0.005; 
      else factor = amt / 1000;

      const searchName = ing.name.toLowerCase();
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

      const cost = factor * basePrice;
      totalMaterialCost += cost;

      return { ...ing, cost, basePrice, isCustom };
    });

    const pieceCost = totalMaterialCost / selectedRecipe.baseYield;
    const fixedAddNum = parseFloat(fixedAddition) || 0;
    
    // NEUE FORMEL: Stückkosten * (Prozent/100) + Fix-Betrag
    const suggestedPrice = (pieceCost * (markup / 100)) + fixedAddNum;
    const breakEven = suggestedPrice > 0 ? Math.ceil(totalMaterialCost / suggestedPrice) : 0;

    return {
      recipe: selectedRecipe,
      ingredients: calculatedIngredients,
      totalCost: totalMaterialCost,
      pieceCost: pieceCost,
      suggestedPrice: suggestedPrice,
      breakEven: breakEven
    };
  }, [recipes, selectedRecipeId, customPrices, markup, fixedAddition]);

  // Handhabung des dreistelligen, validierten Aufschlag-Inputs
  const handleMarkupChange = (e) => {
    let val = parseInt(e.target.value.replace(/\D/g, ''), 10);
    if (isNaN(val)) val = '';
    else if (val < 1) val = 1;
    else if (val > 999) val = 999;
    setMarkup(val);
  };

  // NEU: Automatische 2-Kommastellen Formatierung für den Fix-Betrag
  const handleFixedBlur = () => {
    const val = parseFloat(fixedAddition);
    if (!isNaN(val)) {
      setFixedAddition(val.toFixed(2));
    } else {
      setFixedAddition('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8 animate-in fade-in zoom-in-95 duration-300">
      
      {/* 1. Rezeptauswahl */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-stone-200">
        <h2 className="text-3xl font-black text-stone-800 mb-6 flex items-center">
          <Calculator className="w-8 h-8 mr-3 text-orange-600" /> Preiskalkulation
        </h2>
        <select 
          className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-lg font-bold text-stone-800 cursor-pointer transition-all"
          value={selectedRecipeId}
          onChange={(e) => setSelectedRecipeId(e.target.value)}
        >
          <option value="">-- Bitte Rezept wählen --</option>
          {recipes.map(r => (
            <option key={r.id} value={r.id}>{r.title} (Ertrag: {r.baseYield} {r.yieldUnit})</option>
          ))}
        </select>
      </div>

      {calculationData && (
        <>
          {/* 2. Dashboards: Kosten, Verkauf & Break-Even */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Kosten */}
            <div className="bg-stone-800 text-white p-6 md:p-8 rounded-[2rem] shadow-md flex flex-col justify-between">
              <div>
                <span className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-2 block flex items-center">
                  <Coins className="w-4 h-4 mr-1.5" /> Materialkosten (Gesamt)
                </span>
                <div className="text-5xl font-black tracking-tight">{calculationData.totalCost.toFixed(2)} €</div>
                <div className="mt-2 text-stone-300 font-medium">für {calculationData.recipe.baseYield} {calculationData.recipe.yieldUnit}</div>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-700/50 flex justify-between items-center">
                <span className="text-stone-400 font-medium">Reine Stückkosten:</span>
                <span className="font-black text-2xl text-stone-200">{calculationData.pieceCost.toFixed(2)} €</span>
              </div>
            </div>

            {/* Verkaufspreis & Marge (Neues Flex-Layout, keine Überschneidung) */}
            <div className="bg-orange-600 text-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-orange-600/20 flex flex-col justify-between gap-6">
              <div>
                <span className="text-orange-200 font-bold uppercase tracking-widest text-xs mb-2 block flex items-center">
                  <Receipt className="w-4 h-4 mr-1.5" /> Empfohlener Verkaufspreis
                </span>
                <div className="text-5xl lg:text-6xl font-black tracking-tighter">{calculationData.suggestedPrice.toFixed(2)} €</div>
                <div className="mt-2 text-orange-200 font-medium">pro {calculationData.recipe.yieldUnit.replace(/s$/i, '').replace(/e$/i, '')}</div>
              </div>
              
              {/* Parameter-Kontrollzentrum */}
              <div className="bg-orange-700/40 p-4 rounded-3xl backdrop-blur-sm border border-orange-500/30 flex flex-row items-center justify-around gap-2 sm:gap-4 shrink-0">
                
                {/* Prozentualer Aufschlag */}
                <div className="flex flex-col items-center flex-1">
                  <label className="text-[10px] uppercase font-black text-orange-200 mb-1.5 tracking-wider text-center">Faktor (%)</label>
                  <div className="flex items-center justify-center bg-white/10 rounded-xl px-2 py-1.5 w-full">
                    <input 
                      type="number" 
                      value={markup}
                      onChange={handleMarkupChange}
                      className="w-12 sm:w-16 bg-transparent text-white placeholder-white/50 focus:outline-none font-black text-center text-xl"
                    />
                    <span className="text-orange-300 font-bold ml-1">%</span>
                  </div>
                </div>

                <div className="w-px h-10 bg-orange-500/40"></div> {/* Trennlinie */}

                {/* Fixer Betrag in Euro */}
                <div className="flex flex-col items-center flex-1">
                  <label className="text-[10px] uppercase font-black text-orange-200 mb-1.5 tracking-wider text-center">Fix-Betrag</label>
                  <div className="flex items-center justify-center bg-white/10 rounded-xl px-2 py-1.5 w-full">
                    <span className="text-orange-300 font-bold mr-1">+</span>
                    <input 
                      type="number" 
                      step="0.01"
                      value={fixedAddition}
                      onChange={(e) => setFixedAddition(e.target.value)}
                      onBlur={handleFixedBlur}
                      placeholder="0.00"
                      className="w-16 sm:w-24 bg-transparent text-white placeholder-white/50 focus:outline-none font-black text-center text-xl"
                    />
                    <span className="text-orange-300 font-bold ml-1">€</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* 3. Break-Even Karte */}
          <div className="bg-emerald-50 border-2 border-emerald-200 p-6 rounded-[2rem] flex items-start gap-4">
            <div className="bg-emerald-500 text-white p-3 rounded-2xl shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-emerald-900 text-lg mb-1">Break-Even Gewinnschwelle</h3>
              <p className="text-emerald-700 font-medium leading-relaxed">
                Sobald du <strong className="font-black text-xl mx-1">{calculationData.breakEven}</strong> von deinen {calculationData.recipe.baseYield} {calculationData.recipe.yieldUnit} verkauft hast, hast du die Materialkosten ({calculationData.totalCost.toFixed(2)} €) wieder komplett eingenommen. 
                <br/>Jeder weitere Verkauf ist dein <strong className="text-emerald-800">Material-Gewinn</strong>.
              </p>
            </div>
          </div>

          {/* 4. Zutaten-Liste mit Inline-Editor für Eigene Preise */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-stone-200">
            <h3 className="text-xl font-black text-stone-800 mb-6 flex items-center">
              <ListPlus className="w-6 h-6 mr-3 text-stone-400" /> Zutaten & Eigene Preise
            </h3>
            
            <ul className="divide-y divide-stone-100">
              {calculationData.ingredients.map((ing, idx) => (
                <li key={idx} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                  <div className="flex-1">
                    <span className="font-black text-stone-800 text-lg">{ing.name}</span>
                    <div className="text-stone-500 font-medium mt-1 flex items-center gap-2">
                      <span className="bg-stone-100 px-2.5 py-1 rounded-lg text-sm">{ing.amount} {ing.unit}</span>
                      <span>Basispreis: {ing.basePrice.toFixed(2)} €</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {editingPrice === ing.name ? (
                      <div className="flex items-center bg-stone-100 p-1.5 rounded-xl border border-stone-300 shadow-inner">
                        <input 
                          autoFocus
                          type="number" 
                          step="0.01"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(e.target.value)}
                          placeholder="€ Preis"
                          className="w-20 px-3 py-2 rounded-lg border-none focus:ring-2 focus:ring-orange-500 font-bold text-center bg-white"
                        />
                        <button onClick={() => saveCustomPrice(ing.name, tempPrice)} className="ml-2 p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button onClick={() => setEditingPrice(null)} className="ml-1 p-2 text-stone-400 hover:text-stone-600 transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => { setTempPrice(ing.basePrice); setEditingPrice(ing.name); }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                            ing.isCustom 
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' 
                              : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
                          }`}
                        >
                          <Edit2 className="w-3.5 h-3.5 inline mr-1.5" />
                          {ing.isCustom ? 'Dein Preis' : 'Preis ändern'}
                        </button>
                        <div className="w-24 text-right">
                          <span className="font-black text-xl text-stone-900">{ing.cost.toFixed(2)} €</span>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

// ==========================================
// 8. HILFSKOMPONENTEN
// ==========================================
function NavItem({ icon, label, value, current, onClick }) {
  const isActive = current === value;
  return (
    <button onClick={() => onClick(value)} className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all duration-200 ${isActive ? 'bg-orange-100 text-orange-700 font-bold shadow-inner' : 'text-stone-600 hover:bg-stone-100 font-semibold'}`}>
      {React.cloneElement(icon, { className: `w-6 h-6 ${isActive ? 'text-orange-600' : 'text-stone-500'}` })}
      <span className="text-lg">{label}</span>
    </button>
  );
}

function MobileNavItem({ icon, label, value, current, onClick }) {
  const isActive = current === value;
  return (
    <button onClick={() => onClick(value)} className={`flex flex-col items-center justify-center w-full py-2.5 transition-colors ${isActive ? 'text-orange-600' : 'text-stone-400'}`}>
      {React.cloneElement(icon, { className: `w-7 h-7 mb-1.5 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}` })}
      <span className={`text-[11px] uppercase tracking-wider ${isActive ? 'font-black' : 'font-bold'}`}>{label}</span>
    </button>
  );
}
