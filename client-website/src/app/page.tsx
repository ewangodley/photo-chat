export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)',
      color: 'white',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        width: '100%',
        zIndex: 50,
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
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href="/auth/login" style={{
                padding: '0.5rem 1.5rem',
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}>
                Login
              </a>
              <a href="/auth/register" style={{
                padding: '0.5rem 1.5rem',
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                color: 'white',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                transition: 'all 0.3s'
              }}>
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ paddingTop: '4rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '5rem 1rem', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1.5rem',
            lineHeight: '1.1'
          }}>
            Share Photos,<br />
            <span style={{
              background: 'linear-gradient(135deg, #c084fc, #f472b6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Connect Everywhere
            </span>
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '3rem',
            maxWidth: '48rem',
            margin: '0 auto 3rem auto',
            lineHeight: '1.6'
          }}>
            A modern platform for location-based photo sharing and real-time chat. 
            Connect with people around you through shared experiences.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
            <a href="/auth/register" style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              color: 'white',
              fontSize: '1.125rem',
              fontWeight: '600',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              transition: 'all 0.3s',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              Start Sharing
            </a>
            <a href="/auth/login" style={{
              padding: '1rem 2rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              fontSize: '1.125rem',
              fontWeight: '600',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textDecoration: 'none',
              transition: 'all 0.3s'
            }}>
              Sign In
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '5rem 1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '1rem',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📸</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>Photo Sharing</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
                Share your moments with location data and discover amazing photos from people around you.
              </p>
            </div>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '1rem',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>💬</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>Real-time Chat</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
                Connect instantly with others through seamless messaging and group conversations.
              </p>
            </div>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '1rem',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📍</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>Location-based</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
                Discover content and connect with people based on your current location.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}