'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface Sell {
  id: string;
  title: string;
  description: string;
  price: string;
  createdAt: any;
}

interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: any;
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sells, setSells] = useState<Sell[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newSellTitle, setNewSellTitle] = useState('');
  const [newSellDescription, setNewSellDescription] = useState('');
  const [newSellPrice, setNewSellPrice] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const router = useRouter();

  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    const sellsQuery = query(collection(db, 'sells'), orderBy('createdAt', 'desc'));
    const unsubscribeSells = onSnapshot(sellsQuery, (snapshot) => {
      setSells(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sell)));
    });

    const chatQuery = query(collection(db, 'chat'), orderBy('createdAt', 'asc'));
    const unsubscribeChat = onSnapshot(chatQuery, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSells();
      unsubscribeChat();
    };
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleAddSell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.email !== ADMIN_EMAIL) return;

    try {
      await addDoc(collection(db, 'sells'), {
        title: newSellTitle,
        description: newSellDescription,
        price: newSellPrice,
        createdAt: serverTimestamp(),
      });
      setNewSellTitle('');
      setNewSellDescription('');
      setNewSellPrice('');
    } catch (err) {
      console.error('Error adding sell:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'chat'), {
        text: newMessage.trim(),
        userId: user.uid,
        userName: user.email || 'Anonymous',
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Sells Platform</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-300">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-72px)]">
        <div className="flex-1 p-6 overflow-y-auto">
          {user?.email === ADMIN_EMAIL && (
            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Post a New Sell</h2>
              <form onSubmit={handleAddSell} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={newSellTitle}
                    onChange={(e) => setNewSellTitle(e.target.value)}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Description</label>
                  <textarea
                    value={newSellDescription}
                    onChange={(e) => setNewSellDescription(e.target.value)}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Price</label>
                  <input
                    type="text"
                    value={newSellPrice}
                    onChange={(e) => setNewSellPrice(e.target.value)}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                >
                  Post Sell
                </button>
              </form>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">All Sells</h2>
            {sells.map((sell) => (
              <div key={sell.id} className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-white">{sell.title}</h3>
                <p className="text-gray-300 mt-2">{sell.description}</p>
                <p className="text-green-400 font-semibold mt-2">{sell.price}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-96 bg-gray-800 flex flex-col border-l border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-bold text-white">Global Chat</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`p-3 rounded-lg ${msg.userId === user?.uid ? 'bg-blue-600 ml-auto max-w-[80%]' : 'bg-gray-700 mr-auto max-w-[80%]'}`}>
                <p className="text-xs text-gray-400 mb-1">{msg.userName}</p>
                <p className="text-white">{msg.text}</p>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-700">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}