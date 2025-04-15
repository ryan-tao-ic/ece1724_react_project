// app/not-authorized/page.tsx
export default function NotAuthorizedPage() {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-lg text-gray-600 mb-6">
          You do not have permission to access this page.
        </p>
        <a
          href="/"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Back to Home
        </a>
      </div>
    );
  }
  