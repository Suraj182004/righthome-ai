import Link from "next/link";
import Image from "next/image";
import Chat from "./components/Chat";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="w-full bg-white pb-4 pt-6">
        <div className="container mx-auto flex justify-center items-center px-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 font-bold text-2xl text-blue-600 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path d="M19.006 3.705a.75.75 0 00-.512-1.41L6 6.838V3a.75.75 0 00-.75-.75h-1.5A.75.75 0 003 3v4.93l-1.006.365a.75.75 0 00.512 1.41l16.5-6z" />
                <path fillRule="evenodd" d="M3.019 11.115L18 5.667V9.09l4.006 1.456a.75.75 0 11-.512 1.41l-.494-.18v8.475h.75a.75.75 0 010 1.5H2.25a.75.75 0 010-1.5H3v-9.129l.019-.006zM18 20.25v-9.565l1.5.545v9.02H18zm-9-6a.75.75 0 00-.75.75v4.5c0 .414.336.75.75.75h3a.75.75 0 00.75-.75V15a.75.75 0 00-.75-.75H9z" clipRule="evenodd" />
              </svg>
              RightHome AI
            </div>
            <p className="text-sm text-gray-500">Your personal property co-pilot</p>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="container mx-auto flex flex-col max-w-4xl px-4 py-4 flex-grow">
        {/* Use our Chat component */}
        <Chat />
      </div>
    </main>
  );
}
