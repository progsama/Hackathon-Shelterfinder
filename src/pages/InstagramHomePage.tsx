import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiHome, 
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
  BsGrid3X3,
  BsThreeDots
} from 'react-icons/bs';
import { 
  FaRegComment,
  FaRegBookmark,
  FaBookmark
} from 'react-icons/fa';
import { 
  FiSend,
  FiMoreHorizontal
} from 'react-icons/fi';

interface Story {
  id: number;
  username: string;
  image: string;
}

interface Post {
  id: number;
  username: string;
  userImage: string;
  verified?: boolean;
  image: string;
  likes: number;
  caption: string;
  timeAgo: string;
  comments: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

interface SuggestedUser {
  id: number;
  username: string;
  fullName: string;
  image: string;
  verified?: boolean;
  mutualFollowers?: string;
}

const InstagramHomePage: React.FC = () => {
  const navigate = useNavigate();

  const stories: Story[] = [
    { id: 1, username: 'luffy_strawhat', image: 'https://static.beebom.com/wp-content/uploads/2024/05/gear-5-featured-new.jpg?w=1024' },
    { id: 2, username: 'goku_saiyan', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqwlsYgyc8FVLURPVae1wnOT0Z1wWMMGqyYw&s' },
    { id: 3, username: 'naruto_hokage', image: 'https://static0.cbrimages.com/wordpress/wp-content/uploads/2023/11/naruto-byron.jpg' },
    { id: 4, username: 'zoro_swordsman', image: 'https://static0.srcdn.com/wordpress/wp-content/uploads/2024/06/one-piece-zoro-king-of-hell.jpg?w=1600&h=900&fit=crop' },
    { id: 5, username: 'gojo_sensei', image: 'https://upload.wikimedia.org/wikipedia/it/7/77/Satoru_Gojo.jpg' },
    { id: 6, username: 'usopp_sniper', image: 'https://preview.redd.it/pub7t1q255z41.jpg?auto=webp&s=f712b2ae7be1dd771c177ba0737b8d8a7c38e58e' },
    { id: 7, username: 'itachi_akatsuki', image: 'https://static0.gamerantimages.com/wordpress/wp-content/uploads/2023/04/naruto-1-2.jpg?q=50&fit=crop&w=825&dpr=1.5' },
    { id: 8, username: 'levi_clean', image: 'https://practicaltyping.com/wp-content/uploads/2022/04/leviacker.jpg' },
  ];

  const posts: Post[] = [
    {
      id: 1,
      username: 'God Valley Propaganda',
      userImage: 'https://static.beebom.com/wp-content/uploads/2025/07/Rocks-D.-Xebec-face-reveal-in-One-Piece.jpg?w=1024',
      verified: true,
      image: 'https://i.redd.it/4cixgj095rxf1.jpeg',
      likes: 12543,
      caption: 'King ShiZ',
      timeAgo: '58m',
      comments: 234,
      isLiked: false,
      isSaved: false
    },
    {
      id: 2,
      username: 'Touch Grass',
      userImage: 'https://picsum.photos/seed/user2/40/40',
      image: 'https://picsum.photos/seed/post2/600/600',
      likes: 8921,
      caption: 'Beautiful sunset from yesterday 🌅',
      timeAgo: '2h',
      comments: 156,
      isLiked: true,
      isSaved: false
    },
    {
      id: 3,
      username: 'traveler',
      userImage: 'https://picsum.photos/seed/user3/40/40',
      verified: true,
      image: 'https://picsum.photos/seed/post3/600/600',
      likes: 15432,
      caption: 'Exploring new places ✈️ #travel #adventure',
      timeAgo: '4h',
      comments: 432,
      isLiked: false,
      isSaved: true
    },
    {
      id: 4,
      username: 'foodie',
      userImage: 'https://picsum.photos/seed/user4/40/40',
      image: 'https://picsum.photos/seed/post4/600/600',
      likes: 5678,
      caption: 'Delicious meal for dinner 🍽️',
      timeAgo: '6h',
      comments: 89,
      isLiked: true,
      isSaved: false
    },
    {
      id: 5,
      username: 'fitness',
      userImage: 'https://picsum.photos/seed/user5/40/40',
      image: 'https://picsum.photos/seed/post5/600/600',
      likes: 9876,
      caption: 'Morning workout complete! 💪',
      timeAgo: '8h',
      comments: 201,
      isLiked: false,
      isSaved: false
    },
  ];

  const suggestedUsers: SuggestedUser[] = [
    {
      id: 1,
      username: 'eren_yeager',
      fullName: 'Eren Yeager',
      image: 'https://picsum.photos/seed/eren/40/40',
      verified: true,
      mutualFollowers: 'luffy_strawhat + 74 m'
    },
    {
      id: 2,
      username: 'tanjiro_demon',
      fullName: 'Tanjiro Kamado',
      image: 'https://picsum.photos/seed/tanjiro/40/40',
      mutualFollowers: 'goku_saiyan'
    },
    {
      id: 3,
      username: 'kakashi_copy',
      fullName: 'Kakashi Hatake',
      image: 'https://picsum.photos/seed/kakashi/40/40',
      mutualFollowers: 'naruto_hokage + 27 m'
    },
    {
      id: 4,
      username: 'vegeta_prince',
      fullName: 'Vegeta',
      image: 'https://picsum.photos/seed/vegeta/40/40',
      mutualFollowers: 'gojo_sensei +'
    },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#000', color: '#fff', overflow: 'hidden' }}>
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

      {/* Main Content Area */}
      <div style={{
        marginLeft: '72px',
        marginRight: '320px',
        flex: 1,
        maxWidth: '614px',
        width: '100%',
        margin: '0 auto',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        overflowY: 'auto'
      }}>
        {/* Stories Section */}
        <div style={{
          padding: '24px 20px 16px 20px',
          borderBottom: '1px solid #262626',
          marginBottom: '0'
        }}>
          <div style={{
            display: 'flex',
            gap: '20px',
            overflowX: 'auto',
            padding: '0',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }} className="notes-scroll">
            {stories.map((story) => (
              <div
                key={story.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  minWidth: '80px'
                }}
              >
                <div style={{
                  width: '66px',
                  height: '66px',
                  borderRadius: '50%',
                  padding: '2px',
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundColor: '#000',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img
                      src={story.image}
                      alt={story.username}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                </div>
                <span style={{
                  fontSize: '12px',
                  textAlign: 'center',
                  maxWidth: '80px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: '#fff',
                  fontWeight: '400'
                }}>
                  {story.username}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Posts Feed */}
        <div style={{ flex: 1, overflowY: 'auto', paddingTop: '24px', paddingBottom: '80px', paddingLeft: '20px', paddingRight: '20px' }}>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                border: '1px solid #262626',
                borderRadius: '0',
                backgroundColor: '#000',
                marginBottom: '24px',
                overflow: 'hidden'
              }}
            >
              {/* Post Header */}
              <div style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={post.userImage}
                    alt={post.username}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid #262626'
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>{post.username}</span>
                    {post.verified && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#0095f6">
                        <path d="M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
                      </svg>
                    )}
                  </div>
                </div>
                <BsThreeDots size={16} style={{ cursor: 'pointer' }} />
              </div>

              {/* Post Image */}
              <div style={{ width: '100%', aspectRatio: '1', backgroundColor: '#262626' }}>
                <img
                  src={post.image}
                  alt={post.caption}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>

              {/* Post Actions */}
              <div style={{ padding: '10px 16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {post.isLiked ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#ed4956" style={{ cursor: 'pointer' }}>
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    ) : (
                      <HiOutlineHeart size={24} style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} />
                    )}
                    <FaRegComment size={22} style={{ cursor: 'pointer', transform: 'scaleX(-1)', transition: 'opacity 0.2s' }} />
                    <FiSend size={24} style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} />
                  </div>
                  {post.isSaved ? (
                    <FaBookmark size={24} style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} />
                  ) : (
                    <FaRegBookmark size={24} style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} />
                  )}
                </div>

                {/* Likes */}
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>
                    {post.likes.toLocaleString()} likes
                  </span>
                </div>

                {/* Caption */}
                <div style={{ marginBottom: '8px', lineHeight: '1.5' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', marginRight: '8px', cursor: 'pointer' }}>
                    {post.username}
                  </span>
                  <span style={{ fontSize: '14px' }}>{post.caption}</span>
                </div>

                {/* View Comments */}
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#8e8e8e', cursor: 'pointer' }}>
                    View all {post.comments} comments
                  </span>
                </div>

                {/* Time */}
                <div>
                  <span style={{ fontSize: '12px', color: '#8e8e8e' }}>
                    {post.timeAgo}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div style={{
        width: '320px',
        padding: '24px 16px 0 16px',
        position: 'fixed',
        right: 0,
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        zIndex: 10
      }}>
        {/* Current User */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="https://picsum.photos/seed/currentuser/56/56"
              alt="arynnrosh"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1px solid #262626'
              }}
            />
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>jordan_smith</div>
              <div style={{ fontSize: '14px', color: '#8e8e8e' }}>Jordan Smith</div>
            </div>
          </div>
          <button
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#0095f6',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Switch
          </button>
        </div>

        {/* Suggested for you */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#8e8e8e' }}>
              Suggested for you
            </span>
            <button
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              See All
            </button>
          </div>
          {suggestedUsers.map((user) => (
            <div
              key={user.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={user.image}
                  alt={user.username}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{user.username}</span>
                    {user.verified && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#0095f6">
                        <path d="M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
                      </svg>
                    )}
                  </div>
                  {user.mutualFollowers && (
                    <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
                      Followed by {user.mutualFollowers}
                    </div>
                  )}
                </div>
              </div>
              <button
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#0095f6',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Follow
              </button>
            </div>
          ))}
        </div>

        {/* Footer Links */}
        <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px 16px',
            fontSize: '12px',
            color: '#8e8e8e',
            marginBottom: '16px'
          }}>
            <span style={{ cursor: 'pointer' }}>About</span>
            <span style={{ cursor: 'pointer' }}>Help</span>
            <span style={{ cursor: 'pointer' }}>Press</span>
            <span style={{ cursor: 'pointer' }}>API</span>
            <span style={{ cursor: 'pointer' }}>Jobs</span>
            <span style={{ cursor: 'pointer' }}>Privacy</span>
            <span style={{ cursor: 'pointer' }}>Terms</span>
            <span style={{ cursor: 'pointer' }}>Locations</span>
            <span style={{ cursor: 'pointer' }}>Language</span>
            <span style={{ cursor: 'pointer' }}>Meta Verified</span>
          </div>
          <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
            © 2025 INSTAGRAM FROM META
          </div>
        </div>
      </div>

    </div>
  );
};

export default InstagramHomePage;

