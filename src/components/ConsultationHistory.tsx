import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ConsultationItem {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
}

interface ConsultationHistoryProps {
  history?: ConsultationItem[];
  onSelectItem?: (item: ConsultationItem) => void;
  onClearHistory?: () => void;
}

const ConsultationHistory = ({
  history = [
    {
      id: "1",
      question: "How do I find peace in difficult times?",
      answer:
        "Trouble itself will trouble trouble if you trouble not yourself with trouble's troubling trouble.",
      timestamp: "2023-06-15T14:30:00Z",
    },
    {
      id: "2",
      question: "What is the key to happiness?",
      answer:
        "The happiness of a man who desires no desires will even make the gods envious.",
      timestamp: "2023-06-16T09:45:00Z",
    },
    {
      id: "3",
      question: "How should I deal with difficult people?",
      answer:
        "If you can maintain equanimity in both prosperity and adversity, you will attain what is difficult to attain.",
      timestamp: "2023-06-17T16:20:00Z",
    },
  ],
  onSelectItem = () => {},
  onClearHistory = () => {},
}: ConsultationHistoryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full bg-background border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Consultation History</h2>
        <div className="flex gap-2">
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearHistory}
              className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show
              </>
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2">
          {history.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                No consultation history yet.
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-64">
              <Accordion type="single" collapsible className="w-full">
                {history.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-medium truncate max-w-[500px]">
                          {item.question}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(item.timestamp)}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-2 rounded-md bg-muted/50">
                        <p className="italic mb-2">"{item.answer}"</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectItem(item)}
                          className="text-xs"
                        >
                          View in consultation
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
};

export default ConsultationHistory;
