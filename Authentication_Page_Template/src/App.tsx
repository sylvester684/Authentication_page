import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { supabase } from './lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      if (isLogin) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (signInError) throw signInError;

        // Update last sign in time
        const { error: updateError } = await supabase
          .from('user_details')
          .update({ last_sign_in: new Date().toISOString() })
          .eq('user_id', signInData.user.id);

        if (updateError) {
          console.error('Error updating last sign in:', updateError);
        }

        toast.success('Successfully logged in!');
      } else {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        
        if (signUpError) throw signUpError;

        if (signUpData.user) {
          // Insert user details into our custom table
          const { error: insertError } = await supabase
            .from('user_details')
            .insert([
              {
                user_id: signUpData.user.id,
                email: formData.email,
              }
            ]);

          if (insertError) {
            console.error('Error inserting user details:', insertError);
            toast.error('Account created but failed to save additional details');
            return;
          }
        }

        toast.success('Registration successful! You can now sign in.');
        setIsLogin(true); // Switch to login view after successful registration
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1C1C] flex items-center justify-center p-4">
      {!isLogin && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm">
          Secure authentication powered by Supabase
        </div>
      )}
      <div className="w-full max-w-md space-y-8 bg-[#2C2C2C] p-8 rounded-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isLogin 
              ? 'Enter your credentials to access your account' 
              : 'Enter your information to create an account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                className="block w-full px-3 py-2.5 bg-[#1C1C1C] border border-[#3C3C3C] rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white focus:border-white"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-500" />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="block w-full px-3 py-2.5 bg-[#1C1C1C] border border-[#3C3C3C] rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white focus:border-white"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="block w-full px-3 py-2.5 bg-[#1C1C1C] border border-[#3C3C3C] rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white focus:border-white"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/40 transition-colors"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#2C2C2C',
            color: '#fff',
          },
        }} 
      />
    </div>
  );
}

export default App;