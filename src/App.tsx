// ... existing code ...
  const [productionLogs, setProductionLogs] = useLocalDB('ulti_back_production', []);
  const [weeklyPlan, setWeeklyPlan] = useLocalDB('ulti_back_weekly_plan', []);

  const [accounts, setAccounts] = useLocalDB('ulti_back_accounts', {});
  const [isRegisterMode, setIsRegisterMode] = useState(Object.keys(accounts).length === 0);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleSubmit = () => {
    if (isRegisterMode) {
      if (loginCode !== '31123112') {
        setLoginError('Ungültiger Inhaber-Code!');
        return;
      }
      if (loginUsername.trim().length < 3 || loginPass.length < 4) {
        setLoginError('Bitte gültigen Benutzernamen (min. 3 Zeichen) und Passwort eingeben.');
        return;
      }
      if (accounts[loginUsername]) {
        setLoginError('Benutzername existiert bereits.');
        return;
      }
      setAccounts({ ...accounts, [loginUsername]: loginPass });
      setUser({ username: loginUsername, uid: 'local_user_' + Date.now() });
    } else {
      if (!accounts[loginUsername]) {
        setLoginError('Benutzername nicht gefunden. Bitte registrieren.');
        return;
      }
      if (accounts[loginUsername] !== loginPass) {
        setLoginError('Falsches Passwort.');
        return;
      }
      setUser({ username: loginUsername, uid: 'local_user_' + Date.now() });
    }
    setLoginError('');
  };

  const handleLogout = () => {
// ... existing code ...
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl w-full max-w-md border border-stone-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-stone-800 tracking-tight">Ulti-Back</h1>
            <p className="text-orange-600 font-bold mt-1">{isRegisterMode ? 'Registrierung' : 'Login'}</p>
          </div>
          
          {loginError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" /> {loginError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Benutzername</label>
              <input type="text" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium" placeholder="Dein Benutzername" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Passwort</label>
              <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium" placeholder="••••••••" />
            </div>
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Geheimer Inhaber-Code</label>
                <input type="text" value={loginCode} onChange={e => setLoginCode(e.target.value)} className="w-full bg-orange-50 border border-orange-200 text-orange-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-black tracking-widest text-center" placeholder="CODE EINGEBEN" />
              </div>
            )}
            
            <button onClick={handleSubmit} className="w-full bg-stone-800 text-white mt-4 py-4 rounded-2xl font-bold shadow-md hover:bg-stone-900 transition-colors text-lg active:scale-95">
              {isRegisterMode ? 'Account erstellen' : 'Einloggen'}
            </button>

            <div className="text-center mt-4">
              <button onClick={() => { setIsRegisterMode(!isRegisterMode); setLoginError(''); }} className="text-sm font-bold text-stone-500 hover:text-orange-600 transition-colors">
                {isRegisterMode ? 'Bereits registriert? Hier einloggen.' : 'Noch kein Account? Hier registrieren.'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
// ... existing code ...
        <div className="space-y-8">
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-1">Angemeldet als</p>
              <p className="font-black text-xl text-stone-800">{user.username || user.email}</p>
            </div>
            <button onClick={onLogout} className="px-4 py-2 bg-white border border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-100 transition-colors">
              Abmelden
// ... existing code ...