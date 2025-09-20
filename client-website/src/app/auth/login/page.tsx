"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/services/auth";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log('Attempting login with:', formData);
      const response = await authApi.login(formData);
      console.log('Login response:', response);
      
      if (response.success) {
        router.push("/dashboard");
      } else {
        setError(response.error?.message || "Login failed");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("Network error - backend timeout");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <a href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '2rem',
            textDecoration: 'none'
          }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.25rem' }}>P</span>
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>Phone App</span>
          </a>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>Welcome back</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {error && (
              <div style={{
                padding: '1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.75rem',
                color: 'rgb(252, 165, 165)',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '0.5rem'
              }}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label htmlFor="password" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '0.5rem'
              }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                color: 'white',
                fontWeight: '600',
                borderRadius: '0.75rem',
                border: 'none',
                fontSize: '1rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
                transition: 'all 0.3s'
              }}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Don't have an account?{" "}
              <a href="/auth/register" style={{
                color: '#c084fc',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}>
                Sign up
              </a>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div style={{
          marginTop: '1.5rem',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '0.75rem',
          padding: '1rem'
        }}>
          <p style={{ color: 'rgb(147, 197, 253)', fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Demo Credentials:</p>
          <p style={{ color: 'rgb(191, 219, 254)', fontSize: '0.75rem' }}>
            Email: demo@example.com<br />
            Password: demo123
          </p>
        </div>
      </div>
    </div>
  );
}