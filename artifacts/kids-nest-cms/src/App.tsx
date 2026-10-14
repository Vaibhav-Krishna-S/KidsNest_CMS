import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowLeft, ArrowUpRight, Bell, CalendarDays, Check, ChevronDown,
  ChevronRight, CircleHelp, Clock3, CloudUpload, Edit3, ExternalLink, Eye,
  EyeOff, FileImage, Filter, Grid2X2, Image, LayoutDashboard, List, LogOut,
  Menu, MoreHorizontal, Plus, Search, Settings, ShieldCheck, Sparkles, Trash2,
  Users, X, type LucideIcon,
} from 'lucide-react';
import { useLocation } from 'wouter';

type Photo = { id: string; title: string; category: string; status: 'Published' | 'Draft'; date: string; src?: string; palette: string; kind: string };
type EventItem = { id: string; title: string; date: string; time: string; description: string; category: string; status: 'Published' | 'Draft'; cover?: string };
type Screen = 'overview' | 'gallery' | 'events' | 'preview' | 'teachers' | 'announcements' | 'settings';

const categories = ['Classroom Activities', 'Art & Craft', 'Celebrations', 'Outdoor Play', 'Campus', 'Learning Activities'];
const palettes = ['lavender', 'mint', 'sunshine', 'sky', 'coral', 'cream'];
const samplePhotos: Photo[] = [
  { id: 'p1', title: 'Little makers at work', category: 'Art & Craft', status: 'Published', date: '2025-05-18', palette: 'lavender', kind: 'craft' },
  { id: 'p2', title: 'A morning in our garden', category: 'Outdoor Play', status: 'Published', date: '2025-05-16', palette: 'mint', kind: 'garden' },
  { id: 'p3', title: 'Shapes, colours & discovery', category: 'Learning Activities', status: 'Published', date: '2025-05-14', palette: 'sunshine', kind: 'blocks' },
  { id: 'p4', title: 'Our bright learning space', category: 'Campus', status: 'Published', date: '2025-05-12', palette: 'sky', kind: 'room' },
  { id: 'p5', title: 'A day worth celebrating', category: 'Celebrations', status: 'Draft', date: '2025-05-10', palette: 'coral', kind: 'party' },
  { id: 'p6', title: 'Story corner favourites', category: 'Classroom Activities', status: 'Published', date: '2025-05-08', palette: 'cream', kind: 'books' },
];
const dayOffset = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const initialEvents: EventItem[] = [
  { id: 'e1', title: 'Annual Day', date: dayOffset(20), time: '10:00', description: 'A joyful morning of performances, creativity and togetherness for our whole school community.', category: 'School Celebration', status: 'Published' },
  { id: 'e2', title: 'Sports Day', date: dayOffset(38), time: '09:30', description: 'A morning of movement, friendly races and plenty of cheering.', category: 'Outdoor Play', status: 'Published' },
  { id: 'e3', title: 'Art & Craft Exhibition', date: dayOffset(55), time: '11:00', description: 'Come see the colourful ideas and curious creations made in class.', category: 'Art & Craft', status: 'Draft' },
  { id: 'e4', title: 'Festival Celebration', date: dayOffset(-20), time: '10:30', description: 'A warm celebration of traditions, music and community.', category: 'School Celebration', status: 'Published' },
];

const titleFor: Record<Screen, string> = {
  overview: 'Overview', gallery: 'Photo gallery', events: 'Events & celebrations', preview: 'Website preview',
  teachers: 'Teachers', announcements: 'Announcements', settings: 'Settings',
};

function ArtThumb({ photo, className = '' }: { photo: Pick<Photo, 'palette' | 'kind' | 'src' | 'title'>; className?: string }) {
  if (photo.src) return <img className={`art-thumb ${className}`} src={photo.src} alt={photo.title} />;
  return <div className={`art-thumb art-${photo.palette} ${className}`} role="img" aria-label={`Illustration: ${photo.title}`}>
    <div className="art-sun" /><div className="art-hill hill-one" /><div className="art-hill hill-two" />
    <div className={`art-object object-${photo.kind}`}><span /><i /><b /></div>
    <div className="art-spark spark-one" /><div className="art-spark spark-two" />
  </div>;
}

function App() {
  const [path, setPath] = useLocation();
  const [authed, setAuthed] = useState(false);
  const [screen, setScreen] = useState<Screen>('overview');
  const [photos, setPhotos] = useState<Photo[]>(samplePhotos);
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [toast, setToast] = useState('');
  const [drawer, setDrawer] = useState(false);
  const [modal, setModal] = useState<'photo' | 'event' | 'deletePhoto' | 'deleteEvent' | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [deletingId, setDeletingId] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [photoSearch, setPhotoSearch] = useState('');
  const [photoCategory, setPhotoCategory] = useState('All categories');
  const [photoStatus, setPhotoStatus] = useState('All status');
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [sort, setSort] = useState('Newest first');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [eventSearch, setEventSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('All events');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [profileName, setProfileName] = useState('Kids Nest Coimbatore');
   const [profileEmail, setProfileEmail] = useState('manager@example.test');
  const [profileSaved, setProfileSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  useEffect(() => {
    const route = path.split('?')[0].replace(/\/+$/, '') || '/';
    const mapped: Record<string, Screen> = { '/': 'overview', '/gallery': 'gallery', '/events': 'events', '/preview': 'preview', '/teachers': 'teachers', '/announcements': 'announcements', '/settings': 'settings' };
    if (authed && mapped[route]) setScreen(mapped[route]);
  }, [path, authed]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3600);
  };
  const go = (next: Screen) => { setScreen(next); setDrawer(false); setPath(next === 'overview' ? '/' : `/${next}`); };
  const visiblePhotos = useMemo(() => photos
    .filter(p => p.title.toLowerCase().includes(photoSearch.toLowerCase()))
    .filter(p => photoCategory === 'All categories' || p.category === photoCategory)
    .filter(p => photoStatus === 'All status' || p.status === photoStatus)
    .sort((a, b) => sort === 'Newest first' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)), [photos, photoSearch, photoCategory, photoStatus, sort]);
  const visibleEvents = useMemo(() => events
    .filter(e => `${e.title} ${e.category}`.toLowerCase().includes(eventSearch.toLowerCase()))
    .filter(e => {
      const past = new Date(`${e.date}T23:59:59`) < new Date();
      if (eventFilter === 'Upcoming') return !past && e.status === 'Published';
      if (eventFilter === 'Past') return past;
      if (eventFilter === 'Draft') return e.status === 'Draft';
      return true;
    }).sort((a, b) => a.date.localeCompare(b.date)), [events, eventSearch, eventFilter]);

  const enterDemo = () => { setLoginPassword(''); setAuthed(true); setScreen('overview'); setPath('/'); };
  if (!authed) return <Login email={loginEmail} setEmail={setLoginEmail} password={loginPassword} setPassword={setLoginPassword}
    showPassword={showPassword} setShowPassword={setShowPassword} remember={remember} setRemember={setRemember} onEnter={enterDemo} />;

  const navItems: { id: Screen; label: string; icon: LucideIcon; plan?: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'events', label: 'Events', icon: CalendarDays },
    { id: 'preview', label: 'Website Preview', icon: Eye },
    { id: 'teachers', label: 'Teachers', icon: Users, plan: true },
    { id: 'announcements', label: 'Announcements', icon: Bell, plan: true },
  ];
  const addPhoto = () => { setEditingPhoto(null); setSelectedFiles([]); setModal('photo'); };
  const addEvent = () => { setEditingEvent(null); setModal('event'); };
  const liveSite = () => window.open('https://kidsnestcoimbatore.in', '_blank', 'noopener,noreferrer');

  return <div className="app-shell">
    <aside className={`sidebar ${drawer ? 'sidebar-open' : ''}`} aria-label="Main navigation">
      <div className="brand-lockup"><div><strong>kids nest</strong><small>CMS · DEMO</small></div>
        <button className="icon-btn sidebar-close" aria-label="Close menu" data-testid="button-close-menu" onClick={() => setDrawer(false)}><X size={18} /></button>
      </div>
      <div className="workspace-label">YOUR WORKSPACE</div>
      <nav className="nav-list">{navItems.map(item => {
        const Icon = item.icon;
        return <button key={item.id} className={`nav-link ${screen === item.id ? 'active' : ''}`} onClick={() => go(item.id)} data-testid={`nav-${item.id}`}>
          <Icon size={18} strokeWidth={1.8} /><span>{item.label}</span>{item.plan && <span className="nav-plan">Upgrade</span>}
        </button>;
      })}</nav>
      <div className="sidebar-bottom">
       <div className="plan-card"><div className="plan-spark"><Sparkles size={17} /></div><strong>Make room for more</strong><p>Explore the Complete plan for teachers and announcements.</p><button onClick={() => go('teachers')} data-testid="button-sidebar-upgrade">Explore plan <ArrowUpRight size={14} /></button></div>
        <button className="nav-link" onClick={() => go('settings')} data-testid="nav-settings"><Settings size={18} /><span>Settings</span></button>
        <button className="nav-link" onClick={liveSite} data-testid="link-live-site"><ExternalLink size={18} /><span>Visit live website</span></button>
        <div className="side-profile"><div className="avatar">KN</div><div><strong>Kids Nest team</strong><small>Professional plan</small></div><button aria-label="Account settings" className="icon-btn" onClick={() => go('settings')} data-testid="button-account-settings"><MoreHorizontal size={18} /></button></div>
      </div>
    </aside>
    {drawer && <button className="drawer-scrim" aria-label="Close navigation" onClick={() => setDrawer(false)} />}
    <main className="main-area">
      <header className="topbar">
        <button className="icon-btn mobile-menu" aria-label="Open menu" onClick={() => setDrawer(true)} data-testid="button-open-menu"><Menu size={21} /></button>
        <div className="breadcrumb"><span>Kids Nest</span><ChevronRight size={14} /><strong>{titleFor[screen]}</strong></div>
        <div className="topbar-actions"><span className="demo-pill"><span /> DEMO PREVIEW</span><button className="icon-btn help-btn" aria-label="Help" onClick={() => notify('You are viewing a safe, simulated Kids Nest demo.')} data-testid="button-help"><CircleHelp size={19} /></button>
          <div className="top-user"><div className="avatar">KN</div><div><b>Kids Nest team</b><small>Administrator</small></div><ChevronDown size={14} /></div></div>
      </header>
    <div className="mobile-header"><div className="mobile-wordmark"><strong>kids nest</strong></div><button className="button button-primary button-small" onClick={screen === 'events' ? addEvent : addPhoto} data-testid="button-mobile-add"><Plus size={16} />{screen === 'events' ? 'Add Event' : 'Add Photos'}</button></div>
      {screen === 'overview' && <Overview photos={photos} events={events} onNavigate={go} onAddPhoto={addPhoto} onAddEvent={addEvent} />}
      {screen === 'gallery' && <section className="page-wrap">
        <PageHeading eyebrow="A little window into the day" title="Gallery Management" subtitle="Keep parents connected to the wonderful moments happening at Kids Nest." action={<button className="button button-primary" onClick={addPhoto} data-testid="button-add-photos"><Plus size={17} /> Add Photos</button>} />
        <div className="demo-notice"><ShieldCheck size={17} /><span><b>Demo workspace.</b> Publishing here updates this preview only — the live website stays untouched.</span></div>
        <div className="toolbar gallery-toolbar">
          <label className="search-control"><Search size={17} /><input aria-label="Search gallery" placeholder="Search photos..." value={photoSearch} onChange={e => setPhotoSearch(e.target.value)} data-testid="input-gallery-search" /></label>
          <label className="select-wrap"><Filter size={15} /><select aria-label="Filter by category" value={photoCategory} onChange={e => setPhotoCategory(e.target.value)} data-testid="select-gallery-category"><option>All categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select><ChevronDown size={14} /></label>
          <select className="select-simple" aria-label="Filter by status" value={photoStatus} onChange={e => setPhotoStatus(e.target.value)} data-testid="select-gallery-status"><option>All status</option><option>Published</option><option>Draft</option></select>
          <select className="select-simple sort-select" aria-label="Sort photos" value={sort} onChange={e => setSort(e.target.value)} data-testid="select-gallery-sort"><option>Newest first</option><option>Oldest first</option></select>
          {selectedPhotoIds.length > 0 && <button className="button button-danger button-small" onClick={() => { setDeletingId(''); setModal('deletePhoto'); }} data-testid="button-delete-selected-photos"><Trash2 size={14} /> Delete {selectedPhotoIds.length} selected</button>}
          <div className="view-toggle"><button className={layout === 'grid' ? 'selected' : ''} aria-label="Grid view" onClick={() => setLayout('grid')} data-testid="button-grid-view"><Grid2X2 size={17} /></button><button className={layout === 'list' ? 'selected' : ''} aria-label="List view" onClick={() => setLayout('list')} data-testid="button-list-view"><List size={18} /></button></div>
        </div>
        <div className="result-count" data-testid="text-gallery-count"><strong>{visiblePhotos.length}</strong> {visiblePhotos.length === 1 ? 'moment' : 'moments'} <span>·</span> {photos.filter(p => p.status === 'Published').length} published</div>
        {visiblePhotos.length ? <div className={`photo-grid ${layout === 'list' ? 'list-layout' : ''}`}>{visiblePhotos.map(photo => <article className="photo-card" key={photo.id} data-testid={`card-photo-${photo.id}`}>
          <div className="photo-image"><ArtThumb photo={photo} /><label className="photo-select" aria-label={`Select ${photo.title}`}><input type="checkbox" checked={selectedPhotoIds.includes(photo.id)} onChange={e=>setSelectedPhotoIds(prev=>e.target.checked?[...prev,photo.id]:prev.filter(id=>id!==photo.id))} data-testid={`checkbox-select-photo-${photo.id}`} /><span /></label><span className={`status-tag ${photo.status.toLowerCase()}`}>{photo.status}</span><button className="photo-more" aria-label={`Edit ${photo.title}`} onClick={() => { setEditingPhoto(photo); setSelectedFiles([]); setModal('photo'); }} data-testid={`button-edit-photo-${photo.id}`}><Edit3 size={15} /></button></div>
          <div className="photo-info"><div><span className="category-label">{photo.category}</span><h3>{photo.title}</h3><p>Added {formatDate(photo.date)}</p></div><div className="photo-actions"><button className="text-action" onClick={() => { setEditingPhoto(photo); setSelectedFiles([]); setModal('photo'); }} data-testid={`button-caption-photo-${photo.id}`}>Edit</button><button className="icon-btn danger-icon" aria-label={`Delete ${photo.title}`} onClick={() => { setSelectedPhotoIds([]); setDeletingId(photo.id); setModal('deletePhoto'); }} data-testid={`button-delete-photo-${photo.id}`}><Trash2 size={16} /></button></div></div>
        </article>)}</div> : <EmptyState icon={FileImage} title="No moments found" text="Try another search or bring a new moment into your gallery." action={<button className="button button-primary" onClick={addPhoto}><Plus size={16} /> Add Photos</button>} />}
      </section>}
      {screen === 'events' && <section className="page-wrap">
        <PageHeading eyebrow="Mark the moments ahead" title="Event Management" subtitle="Keep school events organized and parents informed." action={<button className="button button-primary" onClick={addEvent} data-testid="button-add-event"><Plus size={17} /> Add Event</button>} />
        <div className="demo-notice"><ShieldCheck size={17} /><span><b>Demo workspace.</b> Changes are simulated and do not update the live website.</span></div>
        <div className="toolbar"><label className="search-control"><Search size={17} /><input aria-label="Search events" placeholder="Search events..." value={eventSearch} onChange={e => setEventSearch(e.target.value)} data-testid="input-event-search" /></label>
          <div className="filter-tabs" role="group" aria-label="Filter events">{['All events', 'Upcoming', 'Past', 'Draft'].map(f => <button key={f} className={eventFilter === f ? 'selected' : ''} onClick={() => setEventFilter(f)} data-testid={`filter-events-${f.toLowerCase().replace(' ', '-')}`}>{f}</button>)}</div>
        </div>
        <div className="event-list">{visibleEvents.map(ev => <article className="event-row" key={ev.id} data-testid={`card-event-${ev.id}`}><div className="event-date"><b>{new Date(`${ev.date}T12:00:00`).toLocaleDateString('en', { day: '2-digit' })}</b><span>{new Date(`${ev.date}T12:00:00`).toLocaleDateString('en', { month: 'short' })}</span></div>{ev.cover && <img className="event-cover-thumb" src={ev.cover} alt={`Cover for ${ev.title}`} />}<div className="event-content"><div className="event-title-line"><h3>{ev.title}</h3><span className={`status-tag ${ev.status.toLowerCase()}`}>{ev.status}</span><span className="category-label">{ev.category}</span></div><p>{ev.description}</p><div className="event-meta"><span><CalendarDays size={14} />{formatDate(ev.date)}</span><span><Clock3 size={14} />{ev.time}</span></div></div><div className="event-actions"><button className="icon-btn" aria-label={`Edit ${ev.title}`} onClick={() => { setEditingEvent(ev); setModal('event'); }} data-testid={`button-edit-event-${ev.id}`}><Edit3 size={16} /></button><button className="icon-btn danger-icon" aria-label={`Delete ${ev.title}`} onClick={() => { setDeletingId(ev.id); setModal('deleteEvent'); }} data-testid={`button-delete-event-${ev.id}`}><Trash2 size={16} /></button></div></article>)}
        {visibleEvents.length === 0 && <EmptyState icon={CalendarDays} title="Nothing on the calendar" text="There are no matching events. Add a new event to get started." action={<button className="button button-primary" onClick={addEvent}><Plus size={16} /> Add Event</button>} />}</div>
      </section>}
      {screen === 'preview' && <WebsitePreview photos={photos} events={events} mode={previewMode} setMode={setPreviewMode} onBack={() => go('overview')} />}
      {(screen === 'teachers' || screen === 'announcements') && <UpgradePage screen={screen} onBack={() => go('overview')} />}
      {screen === 'settings' && <section className="page-wrap settings-page">
        <PageHeading eyebrow="Your workspace" title="Settings" subtitle="A few details about the people behind the little moments." />
        <div className="demo-notice"><ShieldCheck size={17} /><span>Everything in this demo is fictional and stays in your browser session. Passwords are never saved.</span></div>
        <div className="settings-grid"><div className="settings-card"><div className="settings-heading"><div className="settings-icon"><Users size={20} /></div><div><h2>School profile</h2><p>Manage the details shown in your workspace.</p></div></div>
          <form onSubmit={e => { e.preventDefault(); setProfileSaved(true); notify('Profile updated in this demo.'); }} className="form-stack">
            <label className="field-label">School name<input value={profileName} onChange={e => setProfileName(e.target.value)} data-testid="input-profile-name" /></label>
            <label className="field-label">Contact email<input type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} data-testid="input-profile-email" /></label>
            <label className="field-label">Website<input value="kidsnestcoimbatore.in" readOnly data-testid="input-profile-website" /></label>
            <div className="form-end">{profileSaved && <span className="saved-note"><Check size={15} /> Saved in demo</span>}<button className="button button-primary" type="submit" data-testid="button-save-profile">Save changes</button></div>
          </form></div>
          <div className="settings-card security-card"><div className="settings-heading"><div className="settings-icon lavender-icon"><ShieldCheck size={20} /></div><div><h2>Account & security</h2><p>These controls are visual-only in this prototype.</p></div></div>
            <div className="security-row"><div><b>Change password</b><p>No password is stored or changed in this demo.</p></div><button className="button button-outline" onClick={() => notify('Password changes are not connected in this demo.')} data-testid="button-change-password">Change password</button></div>
            <div className="security-row"><div><b>Demo session</b><p>Sign out returns you to the demo welcome screen.</p></div><button className="button button-outline" onClick={() => { setAuthed(false); setLoginPassword(''); }} data-testid="button-sign-out"><LogOut size={15} /> Sign out</button></div>
          </div>
          <div className="settings-footnote"><ShieldCheck size={17} /><span>Demo preview only. No real account, backend, or live-site connection is active.</span></div>
        </div>
      </section>}
    </main>
    {modal === 'photo' && <PhotoModal editing={editingPhoto} files={selectedFiles} setFiles={setSelectedFiles} onClose={() => setModal(null)} onSave={(photo, captions) => {
      if (editingPhoto) setPhotos(prev => prev.map(p => p.id === photo.id ? photo : p));
      else setPhotos(prev => [...prev, ...photoBatch(photo, selectedFiles, captions)]);
      setModal(null); setSelectedFiles([]); notify(`${editingPhoto ? 'Photo updated' : 'Photo added'} in demo — the live website has not changed.`);
    }} />}
    {modal === 'event' && <EventModal editing={editingEvent} onClose={() => setModal(null)} onSave={event => {
      setEvents(prev => editingEvent ? prev.map(e => e.id === event.id ? event : e) : [...prev, event]);
      setModal(null); notify(`Event ${event.status === 'Published' ? 'published' : 'saved as draft'} in demo — the live website has not changed.`);
    }} />}
    {(modal === 'deletePhoto' || modal === 'deleteEvent') && <ConfirmDialog title={modal === 'deletePhoto' ? selectedPhotoIds.length ? `Remove ${selectedPhotoIds.length} selected photos?` : 'Remove this photo?' : 'Remove this event?'} text="This only removes the item from this demo preview. The live website will not be changed." onCancel={() => setModal(null)} onConfirm={() => {
      if (modal === 'deletePhoto') { setPhotos(prev => prev.filter(p => selectedPhotoIds.length ? !selectedPhotoIds.includes(p.id) : p.id !== deletingId)); setSelectedPhotoIds([]); } else setEvents(prev => prev.filter(e => e.id !== deletingId));
      setModal(null); notify('Removed from this demo preview.');
    }} />}
    {toast && <div className="toast" role="status" data-testid="status-toast"><span className="toast-check"><Check size={16} /></span>{toast}<button onClick={() => setToast('')} aria-label="Dismiss notification"><X size={15} /></button></div>}
  </div>;
}

function photoBatch(photo: Photo, files: File[], captions: string[]) {
  if (!files.length) return [photo];
  return files.map((file, i) => ({ ...photo, id: `${Date.now()}-${i}`, title: captions[i]?.trim() || photo.title || file.name.replace(/\.[^.]+$/, ''), src: URL.createObjectURL(file) }));
}
function formatDate(date: string) { return new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }

function Login({ email, setEmail, password, setPassword, showPassword, setShowPassword, remember, setRemember, onEnter }: {
  email: string; setEmail: (s: string) => void; password: string; setPassword: (s: string) => void; showPassword: boolean; setShowPassword: (v: boolean) => void; remember: boolean; setRemember: (v: boolean) => void; onEnter: () => void;
}) {
  const [loginNotice, setLoginNotice] = useState('');
  return <div className="login-screen"><div className="login-orb orb-one" /><div className="login-orb orb-two" />
    <div className="login-illustration"><div className="login-logo"><div><strong>kids nest</strong><small>CMS · DEMO</small></div></div>
      <div className="login-art"><div className="illustration-window"><div className="window-sun" /><div className="window-hill" /><div className="stacked-block block-a" /><div className="stacked-block block-b" /></div><div className="floating-star" /><div className="floating-circle" /></div>
      <p className="login-quote">Where little minds<br /><em>grow, explore & shine.</em></p><span className="login-caption">A thoughtful home for your school stories.</span>
    </div>
    <div className="login-panel"><div className="login-form-wrap"><div className="demo-label"><span /> DEMO PREVIEW</div><p className="eyebrow">WELCOME BACK</p><h1>Welcome back</h1><p className="login-lede">Manage your school's website, gallery and events in one place.</p>
      <form onSubmit={e => { e.preventDefault(); onEnter(); }} className="form-stack">
        <label className="field-label">Email address<div className="input-with-icon"><input type="email" placeholder="you@school.com" value={email} onChange={e => setEmail(e.target.value)} data-testid="input-login-email" /><span>@</span></div></label>
        <label className="field-label">Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} data-testid="input-login-password" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} data-testid="button-toggle-password">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
        <div className="login-options"><label className="check-label"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} data-testid="checkbox-remember" /> Remember me</label><button type="button" className="link-button" onClick={() => setLoginNotice('Password recovery is not connected in this safe demo. Use Enter demo workspace instead.')} data-testid="button-forgot-password">Forgot password?</button></div>
        {loginNotice && <p className="login-notice" role="status">{loginNotice}</p>}
       <button className="button button-primary login-submit" type="submit" data-testid="button-sign-in">Sign In <ArrowUpRight size={17} /></button>
      </form>
      <div className="login-divider"><span />or explore the prototype<span /></div>
      <button className="button demo-entry" onClick={onEnter} data-testid="button-demo-entry"><Sparkles size={17} /> Enter demo workspace <ArrowUpRight size={16} /></button>
      <p className="login-safe"><ShieldCheck size={15} /> Demo only. No real credentials are needed or saved.</p>
    </div></div><footer className="login-footer">© 2025 Kids Nest · Demo preview <span>Designed for growing minds</span></footer>
  </div>;
}

function PageHeading({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: ReactNode }) {
  return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div>{action && <div className="heading-action">{action}</div>}</div>;
}

function Overview({ photos, events, onNavigate, onAddPhoto, onAddEvent }: { photos: Photo[]; events: EventItem[]; onNavigate: (s: Screen) => void; onAddPhoto: () => void; onAddEvent: () => void }) {
  const published = photos.filter(p => p.status === 'Published').length;
  const nextEvent = events.filter(e => e.status === 'Published' && new Date(`${e.date}T23:59:59`) >= new Date()).sort((a,b)=>a.date.localeCompare(b.date))[0];
  return <section className="page-wrap overview-page">
       <div className="welcome-banner"><div className="welcome-copy"><div className="welcome-chip"><span className="chip-dot" /> YOUR SCHOOL, IN BLOOM</div><h1>Good morning,<br /><em>Kids Nest team!</em></h1><p>Here's what's happening with your website.</p><button className="button button-warm" onClick={() => onNavigate('preview')} data-testid="button-preview-website">Preview your website <ArrowUpRight size={16} /></button></div>
      <div className="welcome-art"><div className="sun-disc" /><div className="cloud-shape cloud-one" /><div className="cloud-shape cloud-two" /><div className="hill-shape hill-back" /><div className="hill-shape hill-front" /><div className="little-house"><div className="house-roof" /><div className="house-body"><span className="house-window" /><span className="house-door" /></div></div><span className="flower flower-a" /><span className="flower flower-b" /><div className="banner-word">a bright new day</div></div>
      <div className="banner-note"><span className="note-spark"><Sparkles size={15} /></span> A safe demo workspace<br /><small>Your edits stay right here.</small></div>
    </div>
     <div className="stats-row"><StatCard label="Gallery photos" value={photos.length} detail={`${published} published on preview`} icon={Image} tint="mint" onClick={() => onNavigate('gallery')} />
       <StatCard label="Published events" value={events.filter(e => e.status === 'Published').length} detail="Visible in this demo preview" icon={Check} tint="coral" onClick={() => onNavigate('events')} />
      <StatCard label="Upcoming events" value={events.filter(e=>e.status==='Published' && new Date(`${e.date}T23:59:59`) >= new Date()).length} detail="Shared on website preview" icon={CalendarDays} tint="yellow" onClick={() => onNavigate('events')} />
       <StatCard label="Draft content" value={photos.filter(p=>p.status==='Draft').length + events.filter(e=>e.status==='Draft').length} detail="Ready when you are" icon={Edit3} tint="lavender" onClick={() => onNavigate('gallery')} /></div>
    <div className="overview-columns"><div className="content-card activity-card"><div className="card-heading"><div><span className="eyebrow">THE LATEST</span><h2>Recent activity</h2></div><button className="text-action" onClick={() => onNavigate('gallery')} data-testid="button-view-gallery">View gallery <ArrowUpRight size={14} /></button></div>
      <div className="activity-list"><Activity icon={Image} tint="mint" title="A new moment was added" text="Little makers at work · Art & Craft" time="Today, 9:42 am" />
        <Activity icon={CalendarDays} tint="yellow" title="Annual Day is on the calendar" text="Saturday, 28 June · 10:00 am" time="Yesterday" />
        <Activity icon={Sparkles} tint="coral" title="Your demo preview is ready" text="Take a look at your school’s stories." time="May 18" /></div>
      <div className="activity-foot"><span className="tiny-dot" /> Activity is sample content for this demo.</div>
    </div>
    <div className="content-card next-event-card"><div className="card-heading"><div><span className="eyebrow">COMING UP</span><h2>On the horizon</h2></div><div className="event-mini-icon"><CalendarDays size={18} /></div></div>
      {nextEvent ? <div className="next-event-detail"><div className="next-event-date"><span>{new Date(`${nextEvent.date}T12:00:00`).toLocaleDateString('en',{month:'short'}).toUpperCase()}</span><b>{new Date(`${nextEvent.date}T12:00:00`).getDate()}</b></div><div><h3>{nextEvent.title}</h3><p>{nextEvent.time} · {nextEvent.category}</p><span className="status-tag published">Published to preview</span></div></div> : <p className="muted">No upcoming events yet.</p>}
      <button className="button button-outline full-width" onClick={onAddEvent} data-testid="button-quick-add-event"><Plus size={16} /> Add an event</button>
    </div></div>
     <div className="quick-actions"><div className="quick-intro"><span className="eyebrow">MAKE IT A MOMENT</span><h2>What would you like to do?</h2><p>Small updates make your school feel close.</p></div>
      <button className="quick-action quick-photo" onClick={onAddPhoto} data-testid="button-quick-upload"><div className="quick-icon"><CloudUpload size={20} /></div><div><b>Upload photos</b><span>Add a little colour to the gallery</span></div><ChevronRight size={18} /></button>
      <button className="quick-action quick-event" onClick={onAddEvent} data-testid="button-quick-event"><div className="quick-icon"><CalendarDays size={20} /></div><div><b>Add an event</b><span>Let families know what’s next</span></div><ChevronRight size={18} /></button>
       <button className="quick-action quick-gallery" onClick={() => onNavigate('gallery')} data-testid="button-quick-gallery"><div className="quick-icon"><Image size={20} /></div><div><b>Manage gallery</b><span>Organize school moments</span></div><ChevronRight size={18} /></button>
      <button className="quick-action quick-preview" onClick={() => onNavigate('preview')} data-testid="button-quick-preview"><div className="quick-icon"><Eye size={20} /></div><div><b>Website preview</b><span>See your published content</span></div><ChevronRight size={18} /></button>
    </div>
    <div className="plan-strip"><div className="plan-strip-icon"><Sparkles size={20} /></div><div><span className="eyebrow">GROW AT YOUR OWN PACE</span><b>Already on Professional</b><p>Teachers and Announcements are part of the Complete plan.</p></div><button className="button button-outline" onClick={() => onNavigate('teachers')} data-testid="button-plan-details">See plan details <ArrowUpRight size={15} /></button><span className="plan-price">₹10,999 <small>/ year</small></span></div>
    <div className="overview-live"><span className="live-icon"><ExternalLink size={16} /></span><span><b>Your live website remains just as it is.</b> Preview content here before sharing it.</span><button onClick={() => window.open('https://kidsnestcoimbatore.in','_blank','noopener,noreferrer')} data-testid="button-live-shortcut">Visit live site <ArrowUpRight size={14} /></button></div>
  </section>;
}

function StatCard({ label, value, detail, icon: Icon, tint, onClick, isText }: { label: string; value: number | string; detail: string; icon: LucideIcon; tint: string; onClick: () => void; isText?: boolean }) {
  return <button className="stat-card" onClick={onClick} data-testid={`stat-${label.toLowerCase().replaceAll(' ','-')}`}><div className={`stat-icon ${tint}`}><Icon size={19} /></div><span className="stat-label">{label}</span><b className={isText ? 'stat-text-value' : 'stat-value'}>{value}</b><small>{detail}</small><ArrowUpRight className="stat-arrow" size={15} /></button>;
}
function Activity({ icon: Icon, tint, title, text, time }: { icon: LucideIcon; tint: string; title: string; text: string; time: string }) {
  return <div className="activity-item"><div className={`activity-icon ${tint}`}><Icon size={16} /></div><div className="activity-copy"><b>{title}</b><span>{text}</span></div><small>{time}</small></div>;
}
function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={24} /></div><h3>{title}</h3><p>{text}</p>{action}</div>;
}

function WebsitePreview({ photos, events, mode, setMode, onBack }: { photos: Photo[]; events: EventItem[]; mode: 'desktop' | 'mobile'; setMode: (m: 'desktop' | 'mobile') => void; onBack: () => void }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [includeDrafts, setIncludeDrafts] = useState(false);
  const visiblePhotos = photos.filter(photo => includeDrafts || photo.status === 'Published');
  const visibleEvents = events.filter(event =>
    (includeDrafts || event.status === 'Published') &&
    new Date(`${event.date}T23:59:59`) >= new Date()
  );
  const openLive = () => window.open('https://kidsnestcoimbatore.in', '_blank', 'noopener,noreferrer');
  return <section className="page-wrap preview-page"><PageHeading eyebrow="A window into your world" title="Website preview" subtitle="See the published moments families will find on your school website." action={<button className="button button-outline" onClick={onBack} data-testid="button-back-dashboard"><ArrowLeft size={16} /> Back to dashboard</button>} />
     <div className="demo-notice"><ShieldCheck size={17} /><span><b>Preview only.</b> {includeDrafts ? 'Unpublished drafts are included in this local demo preview.' : 'This is a local demo simulation; edits do not update the live website.'}</span></div>
     <div className="preview-toolbar"><div className="preview-state"><span className="live-dot" /> Demo preview <span className="preview-url">kidsnestcoimbatore.in</span></div><button className={`button button-outline button-small ${includeDrafts ? 'draft-preview-active' : ''}`} onClick={() => setIncludeDrafts(value => !value)} aria-pressed={includeDrafts} data-testid="button-preview-drafts">{includeDrafts ? 'Hide drafts' : 'Preview drafts'}</button><div className="preview-toggle"><button className={mode==='desktop'?'selected':''} onClick={() => setMode('desktop')} data-testid="button-preview-desktop">Desktop</button><button className={mode==='mobile'?'selected':''} onClick={() => setMode('mobile')} data-testid="button-preview-mobile">Mobile</button></div><button className="button button-outline button-small" onClick={() => window.open('https://kidsnestcoimbatore.in','_blank','noopener,noreferrer')} data-testid="button-open-live"><ExternalLink size={15} /> Visit live site</button></div>
    <div className={`site-frame ${mode==='mobile'?'site-mobile':''}`}><div className="site-browser"><span /><span /><span /><div>kidsnestcoimbatore.in</div><ExternalLink size={13} /></div><div className="site-page">
      <header className="site-header"><div className="site-brand"><b>kids nest</b></div><nav><span>Home</span><span>About</span><span>Gallery</span><span>Events</span><span>Contact</span></nav><button onClick={openLive} data-testid="button-preview-connect">Let’s connect</button><button className="site-menu" aria-label="Toggle preview navigation" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen(!mobileNavOpen)} data-testid="button-preview-menu"><Menu size={18} /></button>{mobileNavOpen && <div className="site-mobile-menu"><span>Home</span><span>About</span><span>Gallery</span><span>Events</span><span>Contact</span></div>}</header>
      <section className="site-hero"><div className="site-hero-text"><span className="site-eyebrow">A LITTLE PLACE TO BECOME</span><h2>Where little minds<br /><em>grow, explore & shine.</em></h2><p>A warm, wonderful start for the brightest beginnings.</p><button onClick={openLive} data-testid="button-preview-discover">Discover Kids Nest <ArrowUpRight size={14} /></button><span className="site-hero-note">A sample website preview</span></div><div className="site-hero-art"><div className="site-sun" /><div className="site-hill-a" /><div className="site-hill-b" /><div className="site-kite"><span /></div><div className="site-bloom bloom-a" /><div className="site-bloom bloom-b" /><div className="site-arch"><div /></div></div></section>
      <section className="site-values"><div><span>01</span><b>Room to wonder</b><small>Curiosity is always welcome.</small></div><div><span>02</span><b>Care in every detail</b><small>Little ones feel at home.</small></div><div><span>03</span><b>Joy in the journey</b><small>Every day brings discovery.</small></div></section>
      <section className="site-content"><div className="site-section-heading"><span>OUR LITTLE MOMENTS</span><h3>Life at Kids Nest</h3><p>A peek into the busy, brilliant days we share.</p></div>
         {visiblePhotos.length ? <div className="site-gallery">{visiblePhotos.slice(0,3).map(p=><div className="site-gallery-card" key={p.id}><ArtThumb photo={p} /><b>{p.title}{includeDrafts && p.status === 'Draft' && <span className="preview-draft-label">DRAFT</span>}</b><small>{p.category}</small></div>)}</div> : <div className="preview-empty">Published gallery moments will appear here.</div>}
      </section>
       <section className="site-events"><div><span>MARK YOUR CALENDAR</span><h3>Good things coming up</h3><p>We can’t wait to share these days with you.</p></div><div className="site-event-list">{visibleEvents.slice(0,3).map(e=><div key={e.id}><span>{new Date(`${e.date}T12:00:00`).toLocaleDateString('en',{month:'short',day:'numeric'})}</span><b>{e.title}{includeDrafts && e.status === 'Draft' && <span className="preview-draft-label">DRAFT</span>}</b><small>{e.time}</small></div>)}{!visibleEvents.length && <small>No published events just yet.</small>}</div></section>
      <footer className="site-footer"><div className="site-brand"><b>kids nest</b></div><span>Growing together, one little moment at a time.</span><small>Coimbatore, Tamil Nadu</small></footer>
    </div></div>
    <p className="preview-caption"><ShieldCheck size={15} /> Changes in this preview are simulated and never sent to the live website.</p>
  </section>;
}

function UpgradePage({ screen, onBack }: { screen: 'teachers' | 'announcements'; onBack: () => void }) {
  const teacher = screen === 'teachers';
  return <section className="page-wrap upgrade-page"><div className="upgrade-hero"><div className="upgrade-shape shape-one" /><div className="upgrade-shape shape-two" /><div className="upgrade-text"><span className="eyebrow">A LITTLE MORE ROOM TO GROW</span><h1>{teacher ? 'Bring your team\ncloser together.' : 'Keep every family\nin the know.'}</h1><p>{teacher ? 'One calm place for staff profiles, roles and the wonderful people behind each school day.' : 'Share gentle updates, timely reminders and the small news that makes a big difference.'}</p><span className="upgrade-badge"><Sparkles size={15} /> Included in Complete plan</span></div><div className="upgrade-art">{teacher ? <div className="team-art"><div className="team-card card-back" /><div className="team-card card-mid" /><div className="team-card card-front"><div className="avatar avatar-large">KN</div><i /><i /><i /></div><span className="team-star" /></div> : <div className="announce-art"><div className="announce-sheet"><span /><b /><i /><i /><i /></div><div className="announce-pin" /><span className="announce-star" /></div>}</div></div>
    <div className="plan-explainer"><div className="plan-explainer-copy"><span className="eyebrow">YOUR CURRENT PLAN</span><h2>Professional has the essentials covered.</h2><p>This demo workspace is set up on Professional. {teacher ? 'Teacher profiles' : 'Announcements'} is a Complete plan feature and isn’t available in the current plan.</p></div><div className="plan-price-stack"><span>Complete plan</span><b>₹14,999 <small>/ year</small></b><small>Everything in Professional, plus more ways to connect.</small></div></div>
    <div className="plan-comparison"><h3>Plans at a glance</h3><div className="plan-options"><div><span>Essential</span><b>₹6,999 <small>/ year</small></b><small>Beautiful school website</small></div><div className="recommended-plan"><em>RECOMMENDED</em><span>Professional</span><b>₹10,999 <small>/ year</small></b><small>Website, gallery & events</small></div><div><span>Complete</span><b>₹14,999 <small>/ year</small></b><small>Everything, plus team tools</small></div></div></div>
    <div className="upgrade-actions"><button className="button button-outline" onClick={onBack} data-testid="button-upgrade-back"><ArrowLeft size={16} /> Back to overview</button><button className="button button-primary" onClick={() => window.open('https://kidsnestcoimbatore.in','_blank','noopener,noreferrer')} data-testid="button-upgrade-enquire">Visit Kids Nest website <ExternalLink size={15} /></button></div>
    <p className="upgrade-disclaimer">This is a product demo. Plan details are illustrative; upgrades are not available here.</p>
  </section>;
}

function PhotoModal({ editing, files, setFiles, onClose, onSave }: { editing: Photo | null; files: File[]; setFiles: (f: File[]) => void; onClose: () => void; onSave: (p: Photo, captions: string[]) => void }) {
  const [title, setTitle] = useState(editing?.title || '');
  const [category, setCategory] = useState(editing?.category || categories[0]);
  const [status, setStatus] = useState<'Published' | 'Draft'>(editing?.status || 'Published');
  const [captions, setCaptions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const filePreviews = useMemo(() => files.map(file => URL.createObjectURL(file)), [files]);
  useEffect(() => () => filePreviews.forEach(url => URL.revokeObjectURL(url)), [filePreviews]);
  const submit = (e: FormEvent) => { e.preventDefault(); if (!title.trim() && !files.length) { setError('Add a caption or select at least one photo.'); return; }
    const base: Photo = editing ? { ...editing, title: title.trim(), category, status } : { id: `p-${Date.now()}`, title: title.trim() || files[0]?.name || 'New moment', category, status, date: new Date().toISOString().slice(0,10), palette: palettes[Math.floor(Math.random()*palettes.length)], kind: 'craft' };
    onSave(base, captions);
  };
  return <Modal title={editing ? 'Edit a moment' : 'Add to your gallery'} subtitle={editing ? 'A small edit to your school story.' : 'Choose a photo and give the moment a little context.'} onClose={onClose} testId="dialog-photo"><form onSubmit={submit} className="modal-form">
    {!editing && <div className="upload-drop" onClick={() => inputRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const next=Array.from(e.dataTransfer.files).filter(f=>f.type.startsWith('image/'));setFiles(next);setCaptions(next.map(()=>''));}} role="button" tabIndex={0} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inputRef.current?.click();}}} data-testid="drop-photo-files"><div className="upload-icon"><CloudUpload size={22} /></div><b>{files.length ? `${files.length} photo${files.length===1?'':'s'} ready` : 'Drop photos here, or browse'}</b><span>Image files stay on this device — nothing is uploaded.</span><input ref={inputRef} type="file" accept="image/*" multiple onChange={e=>{const next=Array.from(e.target.files || []);setFiles(next);setCaptions(next.map(()=>''));}} data-testid="input-photo-files" /></div>}
    {files.length>0 && <div className="selected-file-list">{files.map((f,i)=><div className="selected-file-row" key={`${f.name}-${i}`}><div><img className="selected-file-preview" src={filePreviews[i]} alt={`Preview of ${f.name}`} /><span title={f.name}>{f.name}</span><button type="button" aria-label={`Remove ${f.name}`} onClick={()=>{setFiles(files.filter((_,j)=>j!==i));setCaptions(captions.filter((_,j)=>j!==i));}}><X size={13}/></button></div><input value={captions[i] || ''} onChange={e=>setCaptions(captions.map((caption,j)=>j===i?e.target.value:caption))} aria-label={`Caption for ${f.name}`} placeholder="Add a caption" data-testid={`input-file-caption-${i}`} /></div>)}</div>}
    <label className="field-label">Caption {!files.length && !editing && <span className="field-optional">(optional for selected files)</span>}<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Little makers at work" data-testid="input-photo-caption" /></label>
    <div className="form-two-col"><label className="field-label">Category<select value={category} onChange={e=>setCategory(e.target.value)} data-testid="select-photo-category">{categories.map(c=><option key={c}>{c}</option>)}</select></label><label className="field-label">Visibility<select value={status} onChange={e=>setStatus(e.target.value as 'Published'|'Draft')} data-testid="select-photo-status"><option>Published</option><option>Draft</option></select></label></div>
    {error && <p className="field-error" role="alert">{error}</p>}
    <div className="modal-note"><ShieldCheck size={15} /> Published means visible in this demo website preview — never the live site.</div>
    <div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose} data-testid="button-cancel-photo">Cancel</button><button className="button button-primary" type="submit" data-testid="button-save-photo">{editing ? 'Save changes' : files.length > 1 ? `Add ${files.length} photos` : 'Add to gallery'}</button></div>
  </form></Modal>;
}

function EventModal({ editing, onClose, onSave }: { editing: EventItem | null; onClose: () => void; onSave: (e: EventItem) => void }) {
  const [title,setTitle]=useState(editing?.title||''); const [date,setDate]=useState(editing?.date||''); const [time,setTime]=useState(editing?.time||'10:00');
  const [description,setDescription]=useState(editing?.description||''); const [category,setCategory]=useState(editing?.category||'School Celebration'); const [status,setStatus]=useState<'Published'|'Draft'>(editing?.status||'Published'); const [error,setError]=useState(''); const [cover,setCover]=useState(editing?.cover||'');
  const today=new Date().toISOString().slice(0,10);
  const submit=(e:FormEvent)=>{e.preventDefault();if(!title.trim()||!date||!time||!description.trim()){setError('Please complete the event title, date, start time and description.');return;}if(date<today && (!editing || editing.date>=today)){setError('Choose today or a future date. Past events can remain in your event list.');return;}const submitter=(e.nativeEvent as SubmitEvent).submitter;const nextStatus=submitter instanceof HTMLButtonElement&&submitter.value?submitter.value as 'Published'|'Draft':status;onSave({id:editing?.id||`e-${Date.now()}`,title:title.trim(),date,time,description:description.trim(),category,status:nextStatus,cover});};
  return <Modal title={editing?'Edit event':'Add an event'} subtitle="Give families something lovely to look forward to." onClose={onClose} testId="dialog-event"><form onSubmit={submit} className="modal-form">
    <label className="field-label">Event title<input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Annual Day" data-testid="input-event-title" /></label>
    <div className="form-two-col"><label className="field-label">Date<input required type="date" min={editing && editing.date<today ? undefined : today} value={date} onChange={e=>setDate(e.target.value)} data-testid="input-event-date" /></label><label className="field-label">Start time<input required type="time" value={time} onChange={e=>setTime(e.target.value)} data-testid="input-event-time" /></label></div>
    <label className="field-label">Description<textarea required rows={3} value={description} onChange={e=>setDescription(e.target.value)} placeholder="A few warm words about the day..." data-testid="input-event-description" /></label>
    <div className="form-two-col"><label className="field-label">Category<select value={category} onChange={e=>setCategory(e.target.value)} data-testid="select-event-category"><option>School Celebration</option><option>Art & Craft</option><option>Outdoor Play</option><option>Learning Activities</option><option>School Notice</option></select></label><label className="field-label">Visibility<select value={status} onChange={e=>setStatus(e.target.value as 'Published'|'Draft')} data-testid="select-event-status"><option>Published</option><option>Draft</option></select></label></div>
    <label className="field-label">Cover image <span className="field-optional">(optional, local preview only)</span><input type="file" accept="image/*" onChange={e=>{const file=e.target.files?.[0];if(file)setCover(URL.createObjectURL(file));}} data-testid="input-event-cover" /></label>{cover && <img className="event-cover-preview" src={cover} alt="Selected event cover preview" />}
    <p className="event-date-hint">Events must be dated today or later. Past events are available as demo examples.</p>
    {error&&<p className="field-error" role="alert">{error}</p>}<div className="modal-note"><ShieldCheck size={15}/> Publish adds this event to your demo website preview only.</div>
    <div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose} data-testid="button-cancel-event">Cancel</button><button type="submit" value="Draft" className="button button-outline" data-testid="button-save-event-draft">Save draft</button><button type="submit" value="Published" className="button button-primary" data-testid="button-publish-event">Publish</button></div>
  </form></Modal>;
}

function Modal({ title, subtitle, children, onClose, testId }: { title:string;subtitle:string;children:ReactNode;onClose:()=>void;testId:string }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    const first = document.querySelector<HTMLElement>('[role="dialog"] button, [role="dialog"] input:not([type="file"]), [role="dialog"] select, [role="dialog"] textarea');
    first?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby={`${testId}-title`} data-testid={testId}><header className="modal-header"><div><h2 id={`${testId}-title`}>{title}</h2><p>{subtitle}</p></div><button className="icon-btn" onClick={onClose} aria-label="Close dialog" data-testid="button-close-dialog"><X size={18}/></button></header>{children}</section></div>;
}
function ConfirmDialog({title,text,onCancel,onConfirm}:{title:string;text:string;onCancel:()=>void;onConfirm:()=>void}) {
  return <Modal title={title} subtitle="This action can’t be undone in this demo." onClose={onCancel} testId="dialog-confirm"><div className="confirm-body"><div className="confirm-icon"><Trash2 size={20}/></div><p>{text}</p><div className="modal-actions"><button className="button button-outline" onClick={onCancel} data-testid="button-cancel-delete">Keep it</button><button className="button button-danger" onClick={onConfirm} data-testid="button-confirm-delete">Yes, remove</button></div></div></Modal>;
}

export default App;
