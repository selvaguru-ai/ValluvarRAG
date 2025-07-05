import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Send } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// ✅ Supabase client initialized only once
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

interface ConsultationInterfaceProps {
  onSubmit?: (question: string) => void;
  onSaveToHistory?: (question: string, response: string) => void;
}

const ConsultationInterface = ({
  onSubmit = () => {},
  onSaveToHistory = () => {},
}: ConsultationInterfaceProps) => {
  const [question, setQuestion] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Fallback responses in case of API failure
  const fallbackResponses = [
    "Learning is wealth none could destroy; nothing else gives genuine joy. - Kural 400",
    "Virtue yields Heaven's honor and Earth's wealth. What is there then that is more fruitful for men? - Kural 31",
    "Kindness, a loving heart, noble conduct and truthfulness are the pillars on which the beauty of character rests. - Kural 982",
    "Poverty is painful even to the wise; but more painful is the poverty of knowledge. - Kural 841",
    "The wound caused by fire heals in time; but the wound caused by the tongue never heals. - Kural 129",
  ];

  const handleSubmit = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setError("");
    onSubmit(question);

    try {
      // Call the Supabase edge function
      const { data, error: functionError } = await supabase.functions.invoke(
        "supabase-functions-valluvar_consultation",
        {
          body: { question },
        },
      );

      if (functionError) {
        throw new Error(functionError.message);
      }

      // Format the response from the Kural data
      const formattedResponse =
        data.advice || "No advice returned from Thiruvalluvar.";

      setResponse(formattedResponse);
      onSaveToHistory(question, formattedResponse);
    } catch (err) {
      console.error("Error calling Valluvar consultation:", err);
      setError("Unable to connect to Valluvar. Using fallback wisdom.");

      // Use fallback response
      const fallbackResponse =
        fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      setResponse(fallbackResponse);
      onSaveToHistory(question, fallbackResponse);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900">
      <Card className="border-2 border-amber-100 dark:border-amber-900 shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif text-amber-800 dark:text-amber-300">
            Talk to Valluvar
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Seek ancient wisdom for your modern questions
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label
              htmlFor="question"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              What guidance do you seek today?
            </label>
            <Textarea
              id="question"
              placeholder="Share your question or concern..."
              className="min-h-[120px] border-amber-200 dark:border-amber-800 focus:border-amber-500 focus:ring-amber-500"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !question.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
            >
              {isLoading ? "Consulting..." : "Consult Valluvar"}
              {!isLoading && <Send size={16} />}
            </Button>
          </div>

          {error && (
            <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {error}
              </p>
            </div>
          )}

          {response && (
            <div className="mt-6 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
              <h3 className="text-lg font-medium text-amber-800 dark:text-amber-300 mb-2">
                Valluvar's Wisdom:
              </h3>
              <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 font-serif leading-relaxed">
                {response
                  .replace("Chennai slang Tamil translation of the advice:", "")
                  .trim()}
              </pre>
              <div className="mt-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(response)}
                    className="text-amber-700 border-amber-300 hover:bg-amber-100"
                  >
                    Copy to Clipboard
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-amber-100 dark:border-amber-900">
          Inspired by the timeless wisdom of Thiruvalluvar's Thirukkural
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConsultationInterface;
