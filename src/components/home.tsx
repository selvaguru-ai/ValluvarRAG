import React, { useState } from "react";
import ConsultationInterface from "./ConsultationInterface";
import ConsultationHistory from "./ConsultationHistory";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Consultation {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
}

const Home = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleNewConsultation = (question: string, answer: string) => {
    const newConsultation = {
      id: Date.now().toString(),
      question,
      answer,
      timestamp: new Date(),
    };

    setConsultations((prev) => [newConsultation, ...prev]);
  };

  const handleSelectConsultation = (id: string) => {
    // This would typically scroll to or highlight the selected consultation
    console.log(`Selected consultation: ${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex flex-col items-center p-6">
      <header className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl font-bold text-amber-900 mb-2">
          பிறப்பொக்கும் எல்லா உயிர்க்கும்...!
        </h1>
      </header>

      <main className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 mb-6">
        <ConsultationInterface onNewConsultation={handleNewConsultation} />
      </main>

      <div className="w-full max-w-4xl">
        <Button
          variant="ghost"
          className="flex items-center justify-center w-full text-amber-900 hover:text-amber-700 hover:bg-amber-50"
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? (
            <>
              <span>Hide History</span>
              <ChevronUp className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              <span>Show History</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        {showHistory && (
          <>
            <Separator className="my-4" />
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-amber-900 mb-4">
                Your Consultation History
              </h2>
              <ConsultationHistory
                consultations={consultations}
                onSelectConsultation={handleSelectConsultation}
              />
            </div>
          </>
        )}
      </div>

      <footer className="mt-12 text-center text-amber-700 text-sm">
        <p className="mt-1">
          © {new Date().getFullYear()} Developed by Selvaguru Kuthalanathan
        </p>
      </footer>
    </div>
  );
};

export default Home;
