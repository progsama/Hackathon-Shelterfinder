import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiSearch, 
  FiEdit3, 
  FiMoreVertical,
  FiChevronRight,
  FiMapPin
} from 'react-icons/fi';
import { 
  HiOutlineHome, 
  HiOutlineSearch,
  HiOutlineFilm,
  HiOutlineHeart,
  HiOutlinePaperAirplane
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
  location?: [number, number];
  locationText?: string;
  sosSentAt?: number;
  isForumInvite?: boolean;
  forumPreview?: ForumMessage[];
}

interface ForumMessage {
  id: number;
  author: string;
  message: string;
  time: string;
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
  const [showForumPreview, setShowForumPreview] = useState<Message | null>(null);
  const [hasSOSBeenSent, setHasSOSBeenSent] = useState<boolean>(false);

  const notes: Note[] = [
    { id: 1, text: 'Your note' },
    { id: 2, text: 'Map', isMap: true },
  ];

  const forumPreviewMessages: ForumMessage[] = [
    { id: 1, author: 'Sarah M.', message: '🔥 Current fire status: The wildfire has spread to the Rutland and University South areas. Extreme danger zones are marked in red on the map.', time: '2h' },
    { id: 2, author: 'Mike T.', message: '🏥 Aid available: Born to Shake on Vaughan Ave is providing ice, water, and coffee. Pretty Not Bad on Clement Ave has free lunch for evacuees.', time: '1h' },
    { id: 3, author: 'Emma L.', message: '🏠 Shelter update: John Howard Society on Leon Ave has 80 beds available. Kelowna Gospel Mission on Ellis St has 72 beds. Check the map for all shelter locations!', time: '45m' },
    { id: 4, author: 'David K.', message: '⚠️ Fire progression: The orange zone indicates moderate fire activity. Red zones show high danger. The overlap area (dark red) is extreme - avoid at all costs!', time: '30m' },
    { id: 5, author: 'Lisa P.', message: '🚨 Emergency services: Kelowna General Hospital and Urgent Care Centre are operational. Fire stations are on high alert. Stay safe everyone!', time: '15m' },
  ];

  const forumInviteMessage: Message = {
    id: 999,
    name: 'Kelowna Wildfire Community Forum',
    lastMessage: 'Join the community discussion about the current wildfire situation',
    time: '1h',
    unread: true,
    isForumInvite: true,
    forumPreview: forumPreviewMessages
  };

  const defaultMessages: Message[] = [
    forumInviteMessage,
    { id: 1, name: 'God Usopp', lastMessage: 'I\'m not lying!', time: '18m', unread: true },
    { id: 2, name: 'Itachi Uchiha', lastMessage: 'brb got some biz with the clan', time: '59m', unread: true },
    { id: 3, name: 'Levi Ackerman', lastMessage: 'Thanks for your help!', time: '2h', unread: true },
    { id: 4, name: 'Eren Yeager', lastMessage: 'See you later', time: '3h', unread: false, isActive: true },
    { id: 5, name: 'Light Yagami', lastMessage: 'That sounds great', time: '5h', unread: false },
    { id: 6, name: 'Ichigo Kurosaki', lastMessage: 'You: Sure, no problem', time: '17h', unread: false },
    { id: 7, name: 'Tanjiro Kamado', lastMessage: 'Active 1m ago', time: '', unread: false, isActive: true, activeTime: '1m ago' },
    { id: 8, name: 'Kakashi Hatake', lastMessage: 'You: Let me know when you\'re ready', time: '1d', unread: false },
    { id: 9, name: 'Vegeta', lastMessage: 'Active now', time: '', unread: false, isActive: true, activeTime: 'now' },
  ];

  useEffect(() => {
    const appStartTime = sessionStorage.getItem('appStartTime');
    const currentTime = Date.now().toString();
    
    if (!appStartTime) {
      sessionStorage.setItem('appStartTime', currentTime);
      localStorage.setItem('sosSentAfterLoad', 'false');
      localStorage.removeItem('lastSOSTimestamp');
      const storedMessages = JSON.parse(localStorage.getItem('dmMessages') || '[]');
      const nonSOSMessages = storedMessages.filter((m: Message) => !m.isSOS);
      localStorage.setItem('dmMessages', JSON.stringify(nonSOSMessages));
    }

    const loadMessages = () => {
      const storedMessages = JSON.parse(localStorage.getItem('dmMessages') || '[]');
      const sosSentAfterLoad = localStorage.getItem('sosSentAfterLoad') === 'true';
      const lastSOSTimestamp = parseInt(localStorage.getItem('lastSOSTimestamp') || '0');
      
      // Check if SOS has been sent
      const sosSent = sosSentAfterLoad && lastSOSTimestamp > 0;
      setHasSOSBeenSent(sosSent);
      
      let sosMessages: Message[] = [];
      if (sosSent) {
        sosMessages = storedMessages.filter((m: Message) => 
          m.isSOS && 
          m.sosSentAt && 
          m.sosSentAt === lastSOSTimestamp
        );
      }
      
      const nonSOSMessages = storedMessages.filter((m: Message) => !m.isSOS);
      
      const defaultMessagesFiltered = defaultMessages.filter(dm => 
        !nonSOSMessages.some((sm: Message) => sm.name === dm.name) &&
        !sosMessages.some((sm: Message) => sm.name === dm.name)
      );
      
      // Always include forum invite at the top if it exists
      const forumInvite = defaultMessages.find(dm => dm.isForumInvite);
      const otherDefaultMessages = defaultMessagesFiltered.filter(dm => !dm.isForumInvite);
      
      const combinedMessages = [
        ...(forumInvite ? [forumInvite] : []),
        ...sosMessages,
        ...nonSOSMessages,
        ...otherDefaultMessages
      ];
      
      setMessages(combinedMessages);
    };

    loadMessages();

    const handleSOSSent = () => {
      loadMessages();
    };

    window.addEventListener('sosSent', handleSOSSent);
    
    const interval = setInterval(() => {
      loadMessages();
    }, 200);

    return () => {
      window.removeEventListener('sosSent', handleSOSSent);
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
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/dm')}>
          <HiOutlinePaperAirplane size={24} style={{ transform: 'rotate(45deg)', opacity: 1 }} />
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
            4
          </div>
        </div>
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
            4
          </div>
        </div>
        <MdOutlineAddBox size={24} style={{ cursor: 'pointer' }} />
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#262626',
          cursor: 'pointer',
          backgroundImage: 'url(https://i.pinimg.com/564x/3a/3f/8a/3a3f8a5e5e5e5e5e5e5e5e5e5e5e5e5e5.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1px solid #262626',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.8';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        />
        <MdOutlineMenu size={24} style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} 
          onClick={() => navigate('/settings')}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        />
        <BsGrid3X3 size={20} style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        />
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
            <span style={{ fontSize: '16px', fontWeight: '600' }}>jordan_smith</span>
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
                    border: (note.id === 1 && hasSOSBeenSent) ? '4px solid #ed4956' : '2px solid #fff'
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
          {selectedTab === 'messages' && messages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => {
                if (msg.isForumInvite) {
                  setShowForumPreview(msg);
                }
              }}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #262626',
                cursor: 'pointer',
                backgroundColor: msg.unread || msg.isForumInvite ? '#1a1a1a' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderLeft: msg.isForumInvite ? '3px solid #ff9500' : 'none',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!msg.unread && !msg.isForumInvite) {
                  e.currentTarget.style.backgroundColor = '#0f0f0f';
                }
              }}
              onMouseLeave={(e) => {
                if (!msg.unread && !msg.isForumInvite) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
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
                  background: msg.isSOS 
                    ? 'linear-gradient(135deg, #ff3040 0%, #ff6b6b 100%)'
                    : msg.isForumInvite
                    ? 'linear-gradient(135deg, #ff9500 0%, #ff6b6b 100%)'
                    : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                  border: msg.isSOS ? '2px solid #ff3040' : msg.isForumInvite ? '2px solid #ff9500' : 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  boxShadow: msg.isSOS || msg.isForumInvite ? '0 2px 8px rgba(255, 149, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = msg.isSOS || msg.isForumInvite 
                    ? '0 4px 12px rgba(255, 149, 0, 0.5)' 
                    : '0 4px 8px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = msg.isSOS || msg.isForumInvite 
                    ? '0 2px 8px rgba(255, 149, 0, 0.3)' 
                    : '0 2px 4px rgba(0, 0, 0, 0.2)';
                }}
                >
                  {msg.isSOS ? '🚨' : msg.isForumInvite ? '🔥' : msg.name.charAt(0)}
                </div>
                {msg.isActive && !msg.isSOS && (
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
                {msg.isSOS && (
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: '#ff3040',
                    border: '2px solid #000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    !
                  </div>
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
                    color: msg.isSOS ? '#ff3040' : msg.isForumInvite ? '#ff9500' : '#fff',
                    fontWeight: msg.unread || msg.isSOS || msg.isForumInvite ? '600' : '400',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {msg.isSOS && <span>🚨</span>}
                    {msg.isForumInvite && <span>🔥</span>}
                    {msg.name}
                  </span>
                  {msg.time && (
                    <span style={{ color: msg.isSOS ? '#ff3040' : msg.isForumInvite ? '#ff9500' : '#8e8e8e', fontSize: '12px', fontWeight: msg.isSOS || msg.isForumInvite ? '600' : '400' }}>
                      {msg.time}
                    </span>
                  )}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: msg.isSOS ? 'rgba(255, 48, 64, 0.1)' : msg.isForumInvite ? 'rgba(255, 149, 0, 0.1)' : 'transparent',
                  padding: msg.isSOS || msg.isForumInvite ? '4px 8px' : '0',
                  borderRadius: msg.isSOS || msg.isForumInvite ? '6px' : '0',
                  border: msg.isSOS ? '1px solid rgba(255, 48, 64, 0.3)' : msg.isForumInvite ? '1px solid rgba(255, 149, 0, 0.3)' : 'none'
                }}>
                  <p style={{
                    color: msg.isSOS ? '#ff3040' : msg.isForumInvite ? '#ff9500' : (msg.unread ? '#fff' : '#8e8e8e'),
                    margin: 0,
                    fontSize: '14px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    fontWeight: msg.isSOS || msg.isForumInvite ? '600' : '400'
                  }}>
                    {msg.lastMessage}
                  </p>
                  {msg.isSOS && msg.locationText && (
                    <div style={{
                      color: '#ffb3b8',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginLeft: '4px'
                    }}>
                      <FiMapPin size={12} />
                      {msg.locationText}
                    </div>
                  )}
                  {msg.unread && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#0095f6',
                      flexShrink: 0
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

      {/* Forum Preview Modal */}
      {showForumPreview && (
        <div
          onClick={() => setShowForumPreview(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              border: '2px solid #ff9500',
              cursor: 'default',
              boxShadow: '0 8px 32px rgba(255, 149, 0, 0.3)'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid #333'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff9500 0%, #ff6b6b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                border: '2px solid #ff9500'
              }}>
                🔥
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#ff9500' }}>
                  {showForumPreview.name}
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#8e8e8e' }}>
                  Community forum invitation
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#e0e0e0', lineHeight: '1.6' }}>
                Join the community discussion about the current wildfire situation. Share information, find aid, and stay updated with shelter availability.
              </p>
              
              <div style={{
                backgroundColor: '#0f0f0f',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                border: '1px solid #333'
              }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#8e8e8e', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Preview Messages
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                  {showForumPreview.forumPreview?.map((forumMsg) => (
                    <div key={forumMsg.id} style={{
                      padding: '12px',
                      backgroundColor: '#1a1a1a',
                      borderRadius: '8px',
                      border: '1px solid #262626'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>
                          {forumMsg.author}
                        </span>
                        <span style={{ fontSize: '11px', color: '#8e8e8e' }}>
                          {forumMsg.time}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#e0e0e0', lineHeight: '1.5' }}>
                        {forumMsg.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowForumPreview(null);
                  // Handle accept - you can add logic here to join the forum
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#ff9500',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e68900';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff9500';
                }}
              >
                Accept & Join
              </button>
              <button
                onClick={() => setShowForumPreview(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'transparent',
                  color: '#8e8e8e',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#262626';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#8e8e8e';
                }}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

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
