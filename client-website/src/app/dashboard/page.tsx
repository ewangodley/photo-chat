"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ color: 'white', fontSize: '1.25rem' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.125rem' }}>P</span>
              </div>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.25rem' }}>Phone App</span>
            </div>
            <button 
              onClick={() => router.push('/auth/login')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: 'rgb(252, 165, 165)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1rem' }}>
        {/* Welcome Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1rem'
          }}>
            Welcome to your Dashboard!
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            Your personal space to manage photos, chat, and connect
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>Photos Shared</p>
                <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white' }}>0</p>
              </div>
              <div style={{ fontSize: '2.5rem' }}>📸</div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>Messages</p>
                <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white' }}>0</p>
              </div>
              <div style={{ fontSize: '2.5rem' }}>💬</div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>Chat Rooms</p>
                <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white' }}>0</p>
              </div>
              <div style={{ fontSize: '2.5rem' }}>🏠</div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>Notifications</p>
                <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white' }}>0</p>
              </div>
              <div style={{ fontSize: '2.5rem' }}>🔔</div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.2))',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📸</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>Photos</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Share and discover amazing photos from your location
            </p>
            <button style={{
              width: '100%',
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              color: 'white',
              fontWeight: '600',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}>
              View Photos
            </button>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>💬</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>Chat</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Connect with others through real-time conversations
            </p>
            <button style={{
              width: '100%',
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #22c55e, #10b981)',
              color: 'white',
              fontWeight: '600',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}>
              Open Chat
            </button>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>👤</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>Profile</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Manage your profile and account settings
            </p>
            <button style={{
              width: '100%',
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              color: 'white',
              fontWeight: '600',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}>
              Edit Profile
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}