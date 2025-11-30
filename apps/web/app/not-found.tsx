import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="en">
      <head>
        <title>404 - Page Not Found | BrowserLeaks.io</title>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="text-center px-6">
            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
              404
            </h1>
            <h2 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
              Page Not Found
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              The page you are looking for does not exist or has been moved.
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
