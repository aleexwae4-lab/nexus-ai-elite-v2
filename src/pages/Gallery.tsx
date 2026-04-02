import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { FileText, Mic, Image as ImageIcon, Video, Loader2, Mail, Trash2, ExternalLink, ShieldCheck, Search, Filter, LayoutGrid, List, ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export const Gallery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'gallery'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(fetchedItems);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching gallery:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (window.confirm('¿Estás seguro de que deseas eliminar este elemento?')) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'gallery', id));
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-5 h-5 text-orange-500" />;
      case 'podcast':
      case 'audio': return <Mic className="w-5 h-5 text-orange-500" />;
      case 'image': return <ImageIcon className="w-5 h-5 text-orange-500" />;
      case 'video': return <Video className="w-5 h-5 text-orange-500" />;
      case 'email': return <Mail className="w-5 h-5 text-orange-500" />;
      default: return <FileText className="w-5 h-5 text-orange-500" />;
    }
  };

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col bg-[#030303] overflow-hidden">
      <header className="p-6 border-b border-orange-500/10 bg-[#050505] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/app')}
            className="p-2 hover:bg-orange-500/10 rounded-lg transition-colors text-zinc-500 hover:text-orange-500"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <ImageIcon className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tight text-white">Nexus Gallery</h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Archivo Central de Activos</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <ShieldCheck className="w-3 h-3 text-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Nexus Verified</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 relative custom-scrollbar">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-12 items-center justify-between">
            <div className="flex items-center gap-2 bg-black border border-zinc-800 rounded-sm px-4 py-2 w-full md:w-96">
              <Search className="w-4 h-4 text-zinc-600" />
              <input 
                type="text" 
                placeholder="BUSCAR EN EL ARCHIVO..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-white w-full placeholder:text-zinc-800"
              />
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <div className="flex items-center gap-1 bg-black border border-zinc-800 rounded-sm p-1">
                {['all', 'document', 'image', 'video', 'audio', 'podcast', 'email'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={cn(
                      "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all",
                      filter === t ? "bg-orange-500 text-white" : "text-zinc-600 hover:text-zinc-400"
                    )}
                  >
                    {t === 'all' ? 'TODOS' : t === 'document' ? 'DOCS' : t === 'image' ? 'IMG' : t === 'video' ? 'VID' : t === 'audio' ? 'AUD' : t === 'podcast' ? 'POD' : 'EMAIL'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-black border border-zinc-800 rounded-sm p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn("p-1.5 rounded-sm transition-all", viewMode === 'grid' ? "bg-zinc-800 text-white" : "text-zinc-600")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn("p-1.5 rounded-sm transition-all", viewMode === 'list' ? "bg-zinc-800 text-white" : "text-zinc-600")}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Accediendo al Archivo Nexus...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-32 border border-dashed border-orange-500/10 rounded-sm bg-orange-500/5">
              <ImageIcon className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">Archivo Vacío</h3>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest max-w-md mx-auto">
                No se encontraron registros que coincidan con los criterios de búsqueda.
              </p>
            </div>
          ) : (
            <div className={cn(
              "grid gap-6",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
            )}>
              {filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  className={cn(
                    "bg-[#050505] border border-orange-500/10 rounded-sm p-6 hover:border-orange-500/30 transition-all group relative overflow-hidden",
                    viewMode === 'list' && "flex items-center gap-6 py-4"
                  )}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-sm bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                      {getIcon(item.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[11px] font-black uppercase tracking-tight text-white truncate">{item.title || 'SIN TÍTULO'}</h3>
                      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">{item.type}</p>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "bg-black rounded-sm p-4 border border-zinc-800/50 relative overflow-hidden",
                    viewMode === 'grid' ? "h-32" : "flex-1 h-16"
                  )}>
                    {item.type === 'document' && (
                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest line-clamp-4 leading-relaxed italic">
                        {item.content}
                      </p>
                    )}
                    {item.type === 'image' && (
                      <img src={item.content} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-50 hover:opacity-100 transition-opacity" />
                    )}
                    {(item.type === 'podcast' || item.type === 'audio') && (
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <Mic className="w-8 h-8 text-orange-500/20" />
                        <audio 
                          src={item.base64 ? `data:audio/mp3;base64,${item.base64}` : item.content} 
                          controls 
                          className="w-full h-8 scale-75 opacity-50 hover:opacity-100 transition-opacity" 
                        />
                      </div>
                    )}
                    {item.type === 'video' && (
                      <div className="flex items-center justify-center h-full">
                        <video 
                          src={item.content} 
                          className="absolute inset-0 w-full h-full object-cover opacity-50 hover:opacity-100 transition-opacity" 
                          poster={item.thumbnail}
                        />
                        <Video className="w-8 h-8 text-orange-500/20 relative z-10" />
                      </div>
                    )}
                    {item.type === 'email' && (
                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest line-clamp-4 leading-relaxed italic">
                        {item.content}
                      </p>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black to-transparent" />
                  </div>

                  <div className={cn(
                    "mt-6 pt-4 border-t border-zinc-800/50 flex items-center justify-between",
                    viewMode === 'list' && "mt-0 pt-0 border-t-0"
                  )}>
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-700">
                      {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'RECIENTE'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-zinc-700 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 text-zinc-700 hover:text-white transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
