import React from "react";
import ConsultationInterface from "./ConsultationInterface";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex flex-col items-center p-6">
      <header className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl font-bold text-amber-900 mb-2">
          பிறப்பொக்கும் எல்லா உயிர்க்கும்...!
        </h1>
      </header>

      <main className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 mb-6">
        <ConsultationInterface />
      </main>

      <footer className="mt-12 text-center text-amber-700 text-sm">
        <p className="mt-1">
          © {new Date().getFullYear()} Developed by Selvaguru Kuthalanathan
        </p>
      </footer>
    </div>
  );
};

export default Home;
