/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';
import { ImageStudio } from './pages/ImageStudio';
import { VideoStudio } from './pages/VideoStudio';
import { AudioStudio } from './pages/AudioStudio';
import { LiveVoice } from './pages/LiveVoice';
import { Settings } from './pages/Settings';
import { Agents } from './pages/Agents';
import { DocumentGenerator } from './pages/DocumentGenerator';
import { DeepResearch } from './pages/DeepResearch';
import { PodcastGenerator } from './pages/PodcastGenerator';
import { VideoAnalysis } from './pages/VideoAnalysis';
import { Gallery } from './pages/Gallery';
import { EmailStudio } from './pages/EmailStudio';
import { ImageEditor } from './pages/ImageEditor';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-black" />;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-black" />;
  if (user) return <Navigate to="/app" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="chat" element={<Chat />} />
            <Route path="agents" element={<Agents />} />
            <Route path="documents" element={<DocumentGenerator />} />
            <Route path="research" element={<DeepResearch />} />
            <Route path="podcast" element={<PodcastGenerator />} />
            <Route path="video-analysis" element={<VideoAnalysis />} />
            <Route path="email" element={<EmailStudio />} />
            <Route path="image-editor" element={<ImageEditor />} />
            <Route path="image" element={<ImageStudio />} />
            <Route path="video" element={<VideoStudio />} />
            <Route path="audio" element={<AudioStudio />} />
            <Route path="live" element={<LiveVoice />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
