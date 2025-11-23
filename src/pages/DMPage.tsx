import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiSearch, 
  FiEdit3, 
  FiMoreVertical,
  FiChevronRight,
  FiMapPin,
  FiAlertCircle,
  FiUserCheck
} from 'react-icons/fi';
import { 
  HiOutlineHome, 
  HiOutlineSearch,
  HiOutlineFilm,
  HiOutlineHeart
} from 'react-icons/hi';
import { 
  MdOutlineAddBox,
  MdOutlineMenu
} from 'react-icons/md';
import { 
  BsGrid3X3
} from 'react-icons/bs';

interface Message {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  hasAttachment?: boolean;
  isActive?: boolean;
  activeTime?: string;
  isSOS?: boolean;
  location?: { lat: number; lng: number };
}

interface Note {
  id: number;
  text: string;
  isMap?: boolean;
}

const DMPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'messages' | 'requests'>('messages');
  const [messages, setMessages] = useState<Message[]>([]);

  const notes: Note[] = [
    { id: 1, text: 'Your note' },
    { id: 2, text: 'Map', isMap: true },
  ];

  // Load messages from localStorage and merge with default messages
  useEffect(() => {
    const defaultMessages: Message[] = [
      { id: 1, name: 'Steve', lastMessage: 'Hey, how are you doing?', time: '18m', unread: true },
      { id: 2, name: 'John', lastMessage: 'Can we meet tomorrow?', time: '59m', unread: true },
      { id: 3, name: 'Sarah', lastMessage: 'Thanks for your help!', time: '2h', unread: true },
      { id: 4, name: 'Mike', lastMessage: 'See you later', time: '3h', unread: false, isActive: true },
      { id: 5, name: 'Emily', lastMessage: 'That sounds great', time: '5h', unread: false },
      { id: 6, name: 'David', lastMessage: 'You: Sure, no problem', time: '17h', unread: false },
      { id: 7, name: 'Lisa', lastMessage: 'Active 1m ago', time: '', unread: false, isActive: true, activeTime: '1m ago' },
      { id: 8, name: 'Tom', lastMessage: 'You: Let me know when you\'re ready', time: '1d', unread: false },
      { id: 9, name: 'Anna', lastMessage: 'Active now', time: '', unread: false, isActive: true, activeTime: 'now' },
    ];

    // Get messages from localStorage
    const storedMessages = JSON.parse(localStorage.getItem('dmMessages') || '[]');
    
    // Merge stored messages with default messages
    const mergedMessages: Message[] = [...defaultMessages];
    
    storedMessages.forEach((storedConv: any) => {
      const existingIndex = mergedMessages.findIndex(msg => msg.name === storedConv.name);
      if (existingIndex >= 0) {
        // Update existing message
        mergedMessages[existingIndex] = {
          ...mergedMessages[existingIndex],
          lastMessage: storedConv.lastMessage,
          time: storedConv.time,
          unread: storedConv.unread || false,
          isSOS: storedConv.messages?.some((m: any) => m.type === 'sos') || false,
          location: storedConv.messages?.find((m: any) => m.type === 'sos')?.location
        };
      } else {
        // Add new conversation
        mergedMessages.push({
          id: mergedMessages.length + 1,
          name: storedConv.name,
          lastMessage: storedConv.lastMessage,
          time: storedConv.time,
          unread: storedConv.unread || false,
          isSOS: storedConv.messages?.some((m: any) => m.type === 'sos') || false,
          location: storedConv.messages?.find((m: any) => m.type === 'sos')?.location
        });
      }
    });

    // Sort by time (most recent first)
    mergedMessages.sort((a, b) => {
      if (a.isSOS && !b.isSOS) return -1;
      if (!a.isSOS && b.isSOS) return 1;
      return 0;
    });

    setMessages(mergedMessages);
  }, []);

  // Listen for storage changes to update messages in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      const storedMessages = JSON.parse(localStorage.getItem('dmMessages') || '[]');
      const defaultMessages: Message[] = [
        { id: 1, name: 'Steve', lastMessage: 'Hey, how are you doing?', time: '18m', unread: true },
        { id: 2, name: 'John', lastMessage: 'Can we meet tomorrow?', time: '59m', unread: true },
        { id: 3, name: 'Sarah', lastMessage: 'Thanks for your help!', time: '2h', unread: true },
        { id: 4, name: 'Mike', lastMessage: 'See you later', time: '3h', unread: false, isActive: true },
        { id: 5, name: 'Emily', lastMessage: 'That sounds great', time: '5h', unread: false },
        { id: 6, name: 'David', lastMessage: 'You: Sure, no problem', time: '17h', unread: false },
        { id: 7, name: 'Lisa', lastMessage: 'Active 1m ago', time: '', unread: false, isActive: true, activeTime: '1m ago' },
        { id: 8, name: 'Tom', lastMessage: 'You: Let me know when you\'re ready', time: '1d', unread: false },
        { id: 9, name: 'Anna', lastMessage: 'Active now', time: '', unread: false, isActive: true, activeTime: 'now' },
      ];

      const mergedMessages: Message[] = [...defaultMessages];
      
      storedMessages.forEach((storedConv: any) => {
        const existingIndex = mergedMessages.findIndex(msg => msg.name === storedConv.name);
        if (existingIndex >= 0) {
          mergedMessages[existingIndex] = {
            ...mergedMessages[existingIndex],
            lastMessage: storedConv.lastMessage,
            time: storedConv.time,
            unread: storedConv.unread || false,
            isSOS: storedConv.messages?.some((m: any) => m.type === 'sos') || false,
            location: storedConv.messages?.find((m: any) => m.type === 'sos')?.location
          };
        } else {
          mergedMessages.push({
            id: mergedMessages.length + 1,
            name: storedConv.name,
            lastMessage: storedConv.lastMessage,
            time: storedConv.time,
            unread: storedConv.unread || false,
            isSOS: storedConv.messages?.some((m: any) => m.type === 'sos') || false,
            location: storedConv.messages?.find((m: any) => m.type === 'sos')?.location
          });
        }
      });

      mergedMessages.sort((a, b) => {
        if (a.isSOS && !b.isSOS) return -1;
        if (!a.isSOS && b.isSOS) return 1;
        return 0;
      });

      setMessages(mergedMessages);
    };

    window.addEventListener('storage', handleStorageChange);
    // Also check periodically for changes (since storage event doesn't fire in same tab)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleNoteClick = (note: Note) => {
    if (note.isMap) {
      navigate('/kelowna-map');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#000', color: '#fff' }}>
      {/* Left Navigation Sidebar */}
      <div style={{
        width: '72px',
        borderRight: '1px solid #262626',
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '8px',
        gap: '24px'
      }}>
        {/* Instagram Logo */}
        <div style={{ padding: '12px', cursor: 'pointer' }} onClick={() => navigate('/home')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </div>
        
        <HiOutlineHome size={24} style={{ cursor: 'pointer' }} onClick={() => navigate('/home')} />
        <HiOutlineSearch size={24} style={{ cursor: 'pointer' }} />
        <HiOutlineFilm size={24} style={{ cursor: 'pointer' }} />
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <HiOutlineHeart size={24} />
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            backgroundColor: '#ed4956',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: '600'
          }}>
            3
          </div>
        </div>
        <MdOutlineAddBox size={24} style={{ cursor: 'pointer' }} />
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#262626',
          cursor: 'pointer'
        }} />
        <MdOutlineMenu size={24} style={{ cursor: 'pointer' }} />
        <BsGrid3X3 size={20} style={{ cursor: 'pointer' }} />
      </div>

      {/* Central Panel - Messages */}
      <div style={{
        width: '350px',
        borderRight: '1px solid #262626',
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #262626',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: '600' }}>imtiaz._.n</span>
            <FiChevronRight size={16} style={{ color: '#8e8e8e' }} />
          </div>
          <FiEdit3 size={20} style={{ cursor: 'pointer' }} />
        </div>

        {/* Search Bar */}
        <div style={{ padding: '8px 16px' }}>
          <div style={{
            backgroundColor: '#262626',
            borderRadius: '8px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FiSearch size={16} style={{ color: '#8e8e8e' }} />
            <input
              type="text"
              placeholder="Search"
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {/* Notes Section */}
        <div style={{ padding: '16px 0', borderBottom: '1px solid #262626' }}>
          <div style={{ padding: '0 16px 12px', fontSize: '14px', fontWeight: '600' }}>
            Notes
          </div>
          <div style={{
            display: 'flex',
            gap: '16px',
            padding: '0 16px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }} className="notes-scroll">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => handleNoteClick(note)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  minWidth: '64px'
                }}
              >
                {note.isMap ? (
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #fff'
                  }}>
                    <FiMapPin size={24} color="#fff" />
                  </div>
                ) : (
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: note.id === 1 ? '4px solid #ed4956' : '2px solid #fff'
                  }}>
                    <span style={{ fontSize: '20px' }}>📝</span>
                  </div>
                )}
                <span style={{
                  fontSize: '12px',
                  textAlign: 'center',
                  maxWidth: '64px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: '#fff'
                }}>
                  {note.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Messages/Requests Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #262626'
        }}>
          <button
            onClick={() => setSelectedTab('messages')}
            style={{
              flex: 1,
              padding: '16px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: selectedTab === 'messages' ? '2px solid #fff' : '2px solid transparent',
              color: selectedTab === 'messages' ? '#fff' : '#8e8e8e',
              fontSize: '14px',
              fontWeight: selectedTab === 'messages' ? '600' : '400',
              cursor: 'pointer'
            }}
          >
            Messages
          </button>
          <button
            onClick={() => setSelectedTab('requests')}
            style={{
              flex: 1,
              padding: '16px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: selectedTab === 'requests' ? '2px solid #fff' : '2px solid transparent',
              color: selectedTab === 'requests' ? '#fff' : '#8e8e8e',
              fontSize: '14px',
              fontWeight: selectedTab === 'requests' ? '600' : '400',
              cursor: 'pointer'
            }}
          >
            Requests
          </button>
        </div>

        {/* Messages List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* Sent SOS Preview */}
          {selectedTab === 'messages' && (() => {
            const sentSOS = JSON.parse(localStorage.getItem('sentSOS') || '[]');
            const latestSOS = sentSOS[sentSOS.length - 1];
            return latestSOS ? (
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #262626',
                backgroundColor: 'rgba(237, 73, 86, 0.1)',
                borderLeft: '3px solid #ed4956'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <FiAlertCircle size={16} color="#ed4956" />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#ed4956' }}>
                    You sent an SOS
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#8e8e8e', marginLeft: '24px' }}>
                  Sent to {latestSOS.recipients?.length || 0} close friends • {new Date(latestSOS.sentAt || latestSOS.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ) : null;
          })()}

          {/* Messages Sent to Close Friends */}
          {selectedTab === 'messages' && (() => {
            const storedMessages = JSON.parse(localStorage.getItem('dmMessages') || '[]');
            const closeFriends = ['Steve', 'John', 'Sarah', 'Mike', 'Emily', 'David', 'Lisa', 'Tom', 'Anna'];
            const messagesToCF = storedMessages.filter((conv: any) => 
              closeFriends.includes(conv.name) && conv.messages && conv.messages.length > 0
            );

            if (messagesToCF.length === 0) return null;

            return (
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #262626',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderLeft: '3px solid #22c55e'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <FiUserCheck size={16} color="#22c55e" />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#22c55e' }}>
                    Messages sent to Close Friends
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#8e8e8e', marginLeft: '24px', marginBottom: '8px' }}>
                  {messagesToCF.length} conversation{messagesToCF.length !== 1 ? 's' : ''} with close friends
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '6px',
                  marginLeft: '24px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {messagesToCF.map((conv: any, idx: number) => {
                    const lastMessage = conv.messages[conv.messages.length - 1];
                    const isSOS = lastMessage?.type === 'sos';
                    return (
                      <div 
                        key={idx}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          borderRadius: '8px',
                          border: isSOS ? '1px solid rgba(237, 73, 86, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}>
                            {conv.name}
                          </span>
                          {isSOS && <FiAlertCircle size={12} color="#ed4956" />}
                          <span style={{ fontSize: '10px', color: '#8e8e8e', marginLeft: 'auto' }}>
                            {conv.time || 'now'}
                          </span>
                        </div>
                        <div style={{ 
                          fontSize: '11px', 
                          color: isSOS ? '#ed4956' : '#8e8e8e',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {isSOS 
                            ? '🚨 SOS Alert: I need help! My location: [Location Link]'
                            : lastMessage?.message || conv.lastMessage || 'No message'
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
          {selectedTab === 'messages' && messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #262626',
                cursor: 'pointer',
                backgroundColor: msg.isSOS ? 'rgba(237, 73, 86, 0.1)' : (msg.unread ? '#1a1a1a' : 'transparent'),
                borderLeft: msg.isSOS ? '3px solid #ed4956' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#262626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
                }}>
                  {msg.name.charAt(0)}
                </div>
                {msg.isActive && (
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: '#00ff00',
                    border: '2px solid #000'
                  }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px'
                }}>
                  <span style={{
                    color: '#fff',
                    fontWeight: msg.unread ? '600' : '400',
                    fontSize: '14px'
                  }}>
                    {msg.name}
                  </span>
                  {msg.time && (
                    <span style={{ color: '#8e8e8e', fontSize: '12px' }}>{msg.time}</span>
                  )}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {msg.isSOS && (
                    <FiAlertCircle size={16} color="#ed4956" style={{ flexShrink: 0 }} />
                  )}
                  <p style={{
                    color: msg.isSOS ? '#ed4956' : '#8e8e8e',
                    margin: 0,
                    fontSize: '14px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    fontWeight: msg.isSOS ? '600' : '400'
                  }}>
                    {msg.isSOS ? '🚨 SOS Alert: I need help! My location: [Location Link]' : msg.lastMessage}
                  </p>
                  {msg.unread && !msg.isSOS && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#0095f6',
                      flexShrink: 0
                    }} />
                  )}
                  {msg.isSOS && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#ed4956',
                      flexShrink: 0,
                      animation: 'pulse 2s ease-in-out infinite'
                    }} />
                  )}
                </div>
              </div>
            </div>
          ))}
          {selectedTab === 'requests' && (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#8e8e8e'
            }}>
              <p>No message requests</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Empty Message State */}
      <div style={{
        flex: 1,
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '96px',
          height: '96px',
          borderRadius: '50%',
          border: '2px solid #fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '20px', fontWeight: '400' }}>
            Your messages
          </h3>
          <p style={{ color: '#8e8e8e', margin: '0 0 24px 0', fontSize: '14px' }}>
            Send a message to start a chat.
          </p>
          <button
            style={{
              backgroundColor: '#0095f6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Send message
          </button>
        </div>
      </div>
    </div>
  );
};

export default DMPage;
