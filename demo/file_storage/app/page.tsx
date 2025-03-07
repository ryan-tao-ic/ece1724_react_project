// app/page.tsx
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Next.js File Upload Demo through Google Cloud Storage
        </h1>
        <FileUpload />
        <FileList />
      </div>
    </main>
  );
}