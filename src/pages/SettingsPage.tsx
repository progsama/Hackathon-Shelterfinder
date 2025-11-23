import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { 
  FiUser, 
  FiLock, 
  FiBell,
  FiMapPin,
  FiEye,
  FiMessageSquare,
  FiTag,
  FiMessageCircle
} from 'react-icons/fi';
import { 
  HiHome,
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

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string>('edit-profile');
  const [bio, setBio] = useState('Set your heart ablaze\nUBC');
  const [showThreadsBadge, setShowThreadsBadge] = useState(false);
  const [showAccountSuggestions, setShowAccountSuggestions] = useState(false);
  const [gender, setGender] = useState('Male');

  const dummyName = 'john_doe';
  const dummyFullName = 'John Doe';

  const handleShelterfinderClick = () => {
    navigate('/kelowna-map');
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
        gap: '24px',
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        zIndex: 10
      }}>
        {/* Instagram Logo */}
        <div style={{ padding: '12px', cursor: 'pointer' }} onClick={() => navigate('/home')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </div>
        
        <HiHome size={24} style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} 
          onClick={() => navigate('/home')}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        />
        <HiOutlineSearch size={24} style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        />
        <HiOutlineFilm size={24} style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        />
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/dm')}>
          <HiOutlinePaperAirplane size={24} style={{ transform: 'rotate(45deg)' }} />
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
        <MdOutlineAddBox size={24} style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        />
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#262626',
          cursor: 'pointer',
          backgroundImage: 'url(https://picsum.photos/seed/profile/24/24)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1px solid #262626',
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
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

      {/* Middle Section - Settings Menu */}
      <div style={{
        width: '360px',
        borderRight: '1px solid #262626',
        backgroundColor: '#000',
        padding: '24px 0',
        overflowY: 'auto',
        marginLeft: '72px'
      }}>
        <div style={{ padding: '0 24px 24px', borderBottom: '1px solid #262626' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Settings</h1>
        </div>

        {/* Meta Accounts Center */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #262626' }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#0095f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                M
              </div>
              <span style={{ fontSize: '16px', fontWeight: '600' }}>Accounts Center</span>
            </div>
            <p style={{ 
              margin: '0 0 12px 0', 
              fontSize: '14px', 
              color: '#8e8e8e',
              lineHeight: '1.4'
            }}>
              Manage your connected experiences and account settings across Meta technologies.
            </p>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '14px', color: '#8e8e8e', marginBottom: '4px' }}>Personal details</div>
              <div style={{ fontSize: '14px', color: '#8e8e8e', marginBottom: '4px' }}>Password and security</div>
              <div style={{ fontSize: '14px', color: '#8e8e8e' }}>Ad preferences</div>
            </div>
            <a href="#" style={{ color: '#0095f6', fontSize: '14px', textDecoration: 'none' }}>
              See more in Accounts Center
            </a>
          </div>
        </div>

        {/* How you use Instagram */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #262626' }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#8e8e8e',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            How you use Instagram
          </div>
          <div 
            onClick={() => setSelectedOption('edit-profile')}
            style={{
              padding: '12px 0',
              cursor: 'pointer',
              color: selectedOption === 'edit-profile' ? '#fff' : '#8e8e8e',
              fontWeight: selectedOption === 'edit-profile' ? '600' : '400',
              borderBottom: selectedOption === 'edit-profile' ? '1px solid #fff' : 'none',
              display: 'inline-block'
            }}
          >
            Edit profile
          </div>
          <div style={{ padding: '12px 0', cursor: 'pointer', color: '#8e8e8e' }}>
            Notifications
          </div>
        </div>

        {/* Relife Section */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #262626' }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#8e8e8e',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Relife
          </div>
          <div 
            onClick={handleShelterfinderClick}
            style={{
              padding: '12px 0',
              cursor: 'pointer',
              color: '#8e8e8e',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FiMapPin size={16} />
            <span>Shelterfinder</span>
          </div>
        </div>

        {/* Who can see your content */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #262626' }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#8e8e8e',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Who can see your content
          </div>
          <div style={{ padding: '12px 0', cursor: 'pointer', color: '#8e8e8e' }}>
            Account privacy
          </div>
          <div style={{ padding: '12px 0', cursor: 'pointer', color: '#8e8e8e' }}>
            Close Friends
          </div>
          <div style={{ padding: '12px 0', cursor: 'pointer', color: '#8e8e8e' }}>
            Blocked
          </div>
          <div style={{ padding: '12px 0', cursor: 'pointer', color: '#8e8e8e' }}>
            Story and location
          </div>
        </div>

        {/* How others can interact with you */}
        <div style={{ padding: '16px 24px' }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#8e8e8e',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            How others can interact with you
          </div>
          <div style={{ padding: '12px 0', cursor: 'pointer', color: '#8e8e8e' }}>
            Messages and story replies
          </div>
          <div style={{ padding: '12px 0', cursor: 'pointer', color: '#8e8e8e' }}>
            Tags and mentions
          </div>
          <div style={{ padding: '12px 0', cursor: 'pointer', color: '#8e8e8e' }}>
            Comments
          </div>
        </div>
      </div>

      {/* Right Section - Edit Profile */}
      {selectedOption === 'edit-profile' && (
        <div style={{
          flex: 1,
          backgroundColor: '#000',
          padding: '24px',
          overflowY: 'auto',
          marginLeft: '0'
        }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '600' }}>Edit profile</h2>

          {/* Profile Information */}
          <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#262626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
              {dummyFullName.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                {dummyName}
              </div>
              <div style={{ fontSize: '14px', color: '#8e8e8e' }}>
                {dummyFullName}
              </div>
            </div>
            <button style={{
              backgroundColor: 'transparent',
              border: '1px solid #262626',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#0095f6',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Change photo
            </button>
          </div>

          {/* Website */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              marginBottom: '8px' 
            }}>
              Website
            </label>
            <input
              type="text"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1a1a1a',
                border: '1px solid #262626',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <p style={{ 
              margin: '8px 0 0 0', 
              fontSize: '12px', 
              color: '#8e8e8e' 
            }}>
              Editing your links is only available on mobile. Visit the Instagram app and edit your profile to change the websites in your bio.
            </p>
          </div>

          {/* Bio */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              marginBottom: '8px' 
            }}>
              Bio
            </label>
            <div style={{ position: 'relative' }}>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #262626',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                fontSize: '12px',
                color: '#8e8e8e'
              }}>
                {bio.length} / 150
              </div>
            </div>
          </div>

          {/* Show Threads badge */}
          <div style={{ 
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                Show Threads badge
              </div>
            </div>
            <button
              onClick={() => setShowThreadsBadge(!showThreadsBadge)}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                backgroundColor: showThreadsBadge ? '#0095f6' : '#262626',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background-color 0.2s'
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                position: 'absolute',
                top: '2px',
                left: showThreadsBadge ? '22px' : '2px',
                transition: 'left 0.2s'
              }} />
            </button>
          </div>

          {/* Gender */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              marginBottom: '8px' 
            }}>
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1a1a1a',
                border: '1px solid #262626',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="Male" style={{ backgroundColor: '#1a1a1a' }}>Male</option>
              <option value="Female" style={{ backgroundColor: '#1a1a1a' }}>Female</option>
              <option value="Prefer not to say" style={{ backgroundColor: '#1a1a1a' }}>Prefer not to say</option>
            </select>
            <p style={{ 
              margin: '8px 0 0 0', 
              fontSize: '12px', 
              color: '#8e8e8e' 
            }}>
              This won't be part of your public profile.
            </p>
          </div>

          {/* Show account suggestions */}
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                Show account suggestions on profiles
              </div>
              <p style={{ 
                margin: '4px 0 0 0', 
                fontSize: '12px', 
                color: '#8e8e8e',
                lineHeight: '1.4'
              }}>
                Choose whether people can see similar account suggestions on your profile, and whether your account can be suggested on other profiles.
              </p>
            </div>
            <button
              onClick={() => setShowAccountSuggestions(!showAccountSuggestions)}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                backgroundColor: showAccountSuggestions ? '#0095f6' : '#262626',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background-color 0.2s',
                flexShrink: 0
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                position: 'absolute',
                top: '2px',
                left: showAccountSuggestions ? '22px' : '2px',
                transition: 'left 0.2s'
              }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
