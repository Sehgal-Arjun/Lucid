import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import icon from '@/lib/images/icon.png';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (user) {
      navigate('/calendar');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Fetch user from Supabase
      const { data, error } = await supabase
        .rpc('login_user', { email_input: email });
      if (error || !data || data.length === 0) throw new Error('Invalid email or password');
      const user = data[0];
      // Compare password
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) throw new Error('Invalid email or password');
      // Store user in sessionStorage and redirect
      sessionStorage.setItem('user', JSON.stringify({ email: user.email, name: user.name, uid: user.uid }));
      navigate('/calendar');
    } catch (err: any) {
      alert('Login failed: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      <Card className="max-w-md w-full shadow-xl border-0 bg-white/80 backdrop-blur-xl mx-4">
        <CardHeader className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-2">
            <img
              src={icon}
              alt="Lucid Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <CardTitle className="text-2xl text-slate-800">Welcome Back</CardTitle>
          <CardDescription className="text-center text-slate-600">Sign in to your Lucid account to continue your journey.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full h-11 text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700" disabled={loading}>
              {loading ? 'Logging In...' : 'Log In'}
            </Button>
            <div className="text-sm text-slate-500 text-center w-full">
              Don&apos;t have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login; 