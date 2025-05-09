'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <div className="flex justify-center">
            <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8"
              >
                <path d="M19.006 3.705a.75.75 0 00-.512-1.41L6 6.838V3a.75.75 0 00-.75-.75h-1.5A.75.75 0 003 3v4.93l-1.006.365a.75.75 0 00.512 1.41l16.5-6z" />
                <path
                  fillRule="evenodd"
                  d="M3.019 11.115L18 5.667V9.09l4.006 1.456a.75.75 0 11-.512 1.41l-.494-.18v8.475h.75a.75.75 0 010 1.5H2.25a.75.75 0 010-1.5H3v-9.129l.019-.006zM18 20.25v-9.565l1.5.545v9.02H18zm-9-6a.75.75 0 00-.75.75v4.5c0 .414.336.75.75.75h3a.75.75 0 00.75-.75V15a.75.75 0 00-.75-.75H9z"
                  clipRule="evenodd"
                />
              </svg>
              RightHome AI
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545 12.151L12.545 12.151L12.545 12.151Q12.545 11.571 12.449 11.041H9.182V12.892H11.156L11.156 12.892L11.156 12.892Q11.107 13.218 10.957 13.528Q10.806 13.838 10.562 14.083Q10.317 14.327 9.991 14.478Q9.664 14.629 9.279 14.629L9.279 14.629L9.279 14.629Q8.596 14.629 8.062 14.321Q7.529 14.014 7.221 13.48L7.221 13.48L7.221 13.48Q6.913 12.946 6.913 12.263Q6.913 11.58 7.221 11.047Q7.529 10.513 8.062 10.205Q8.596 9.897 9.279 9.897L9.279 9.897L9.279 9.897Q9.952 9.897 10.457 10.161Q10.962 10.425 11.249 10.903L11.249 10.903L12.758 9.394L12.758 9.394Q12.254 8.646 11.467 8.225Q10.679 7.804 9.689 7.733L9.689 7.733L9.279 7.733L9.279 7.733Q8.106 7.733 7.134 8.225Q6.162 8.717 5.564 9.608Q4.967 10.498 4.967 11.673L4.967 11.673L4.967 12.854L4.967 12.854Q4.967 14.028 5.564 14.919Q6.162 15.809 7.134 16.301Q8.106 16.793 9.279 16.793L9.279 16.793L9.279 16.793Q10.453 16.793 11.426 16.301Q12.398 15.809 12.986 14.919Q13.574 14.028 13.574 12.854L13.574 12.854L13.574 12.151L12.545 12.151Z" />
                <path d="M16.766 9.437L16.766 9.437L18.24 9.437L18.24 9.437Q18.299 9.052 18.299 8.614L18.299 8.614L18.299 8.614Q18.299 7.123 17.753 5.909Q17.207 4.694 16.244 3.921L16.244 3.921L15.156 4.748L15.156 4.748Q15.946 5.331 16.356 6.297Q16.766 7.263 16.766 8.478L16.766 8.478L16.766 9.437ZM16.766 15.089L16.766 15.089L15.156 15.775L15.156 15.775Q15.946 16.359 16.356 17.325Q16.766 18.29 16.766 19.506L16.766 19.506L16.766 20.089L16.766 20.089Q16.826 20.474 18.24 20.089L18.24 20.089L18.24 20.089Q18.299 19.703 18.299 19.265L18.299 19.265L18.299 19.265Q18.299 18.229 18.033 17.388Q17.767 16.547 17.316 15.89Q16.864 15.233 16.766 15.089L16.766 15.089ZM20.898 9.437L20.898 9.437L19.304 9.437L19.304 9.437Q19.363 9.822 19.363 10.26L19.363 10.26L19.363 13.744L19.363 13.744Q19.363 14.182 19.304 14.567L19.304 14.567L20.898 14.567L20.898 14.567Q20.957 14.182 20.957 13.744L20.957 13.744L20.957 10.26L20.957 10.26Q20.957 9.822 20.898 9.437L20.898 9.437Z" />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 