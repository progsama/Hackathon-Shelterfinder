import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';

interface Shelter {
  id: number;
  operator: string;
  address: string;
  position: [number, number];
  type: string;
  beds: number;
  phone: string;
  website?: string;
}

const ReservationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const shelter = location.state?.shelter as Shelter | undefined;
  
  const [numBeds, setNumBeds] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!shelter) {
      // If no shelter data, redirect back to map
      navigate('/kelowna-map');
    }
  }, [shelter, navigate]);

  if (!shelter) {
    return null;
  }

  const maxBeds = Math.min(6, shelter.beds);
  const availableBeds = Array.from({ length: maxBeds }, (_, i) => i + 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // In a real app, you would send this to a backend API
    setTimeout(() => {
      navigate('/kelowna-map');
    }, 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        paddingTop: '20px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <button
            onClick={() => navigate('/kelowna-map')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = '#262626';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <FiArrowLeft size={24} />
          </button>
          <h1 style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: '600'
          }}>
            Reservation
          </h1>
        </div>

        {isSubmitted ? (
          <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            border: '1px solid #262626'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <FiCheck size={32} color="#fff" />
            </div>
            <h2 style={{
              margin: '0 0 12px 0',
              fontSize: '24px',
              fontWeight: '600',
              color: '#fff'
            }}>
              Reservation Submitted!
            </h2>
            <p style={{
              margin: 0,
              color: '#8e8e8e',
              fontSize: '16px'
            }}>
              Your reservation for {numBeds} {numBeds === 1 ? 'bed' : 'beds'} at {shelter.operator} has been submitted successfully.
            </p>
          </div>
        ) : (
          <>
            {/* Shelter Info Card */}
            <div style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              border: '1px solid #262626'
            }}>
              <h2 style={{
                margin: '0 0 16px 0',
                fontSize: '20px',
                fontWeight: '600',
                color: '#fff'
              }}>
                {shelter.operator}
              </h2>
              <div style={{
                color: '#8e8e8e',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ color: '#22c55e' }}>ADDRESS:</strong> {shelter.address}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ color: '#22c55e' }}>TYPE:</strong> {shelter.type}
                </div>
                <div>
                  <strong style={{ color: '#22c55e' }}>TOTAL BEDS AVAILABLE:</strong> {shelter.beds}
                </div>
              </div>
            </div>

            {/* Reservation Form */}
            <form onSubmit={handleSubmit} style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #262626'
            }}>
              <h3 style={{
                margin: '0 0 20px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#fff'
              }}>
                Select Number of Beds
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '24px'
              }}>
                {availableBeds.map((bedCount) => (
                  <button
                    key={bedCount}
                    type="button"
                    onClick={() => setNumBeds(bedCount)}
                    style={{
                      padding: '16px',
                      backgroundColor: numBeds === bedCount ? '#22c55e' : '#262626',
                      color: '#fff',
                      border: numBeds === bedCount ? '2px solid #22c55e' : '2px solid transparent',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                      if (numBeds !== bedCount) {
                        e.currentTarget.style.backgroundColor = '#2a2a2a';
                      }
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                      if (numBeds !== bedCount) {
                        e.currentTarget.style.backgroundColor = '#262626';
                      }
                    }}
                  >
                    {bedCount} {bedCount === 1 ? 'Bed' : 'Beds'}
                  </button>
                ))}
              </div>

              <div style={{
                backgroundColor: '#262626',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: '#8e8e8e', fontSize: '14px' }}>Selected:</span>
                  <span style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>
                    {numBeds} {numBeds === 1 ? 'bed' : 'beds'}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#8e8e8e', fontSize: '14px' }}>Remaining:</span>
                  <span style={{ color: '#22c55e', fontSize: '16px', fontWeight: '600' }}>
                    {shelter.beds - numBeds} {shelter.beds - numBeds === 1 ? 'bed' : 'beds'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.backgroundColor = '#16a34a';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.backgroundColor = '#22c55e';
                }}
              >
                Confirm Reservation
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ReservationPage;

