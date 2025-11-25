import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  // Await the searchParams Promise
  const params = await searchParams;
  const accessToken = Array.isArray(params.access_token) 
    ? params.access_token[0] 
    : params.access_token;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordClient serverAccessToken={accessToken || null} />
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading</h1>
        <p className="text-gray-600">Preparing your password reset...</p>
      </div>
    </div>
  );
}