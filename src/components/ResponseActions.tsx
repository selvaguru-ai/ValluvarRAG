import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, Share2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ResponseActionsProps {
  response: string;
}

const ResponseActions = ({ response = "" }: ResponseActionsProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!response) return;

    navigator.clipboard
      .writeText(response)
      .then(() => {
        setIsCopied(true);
        toast({
          title: "Copied to clipboard",
          description: "Valluvar's wisdom is now in your clipboard.",
          duration: 2000,
        });

        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast({
          title: "Failed to copy",
          description: "Please try again.",
          variant: "destructive",
        });
      });
  };

  const handleShare = async () => {
    if (!response) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Wisdom from Thiruvalluvar",
          text: response,
        });
        toast({
          title: "Shared successfully",
          description: "Valluvar's wisdom has been shared.",
        });
      } catch (err) {
        console.error("Failed to share: ", err);
        toast({
          title: "Failed to share",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    } else {
      handleCopy();
      toast({
        title: "Share not supported",
        description: "The content has been copied to your clipboard instead.",
      });
    }
  };

  return (
    <div className="flex items-center justify-end space-x-2 mt-2 bg-background">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!response}
              className="flex items-center gap-1"
            >
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy wisdom to clipboard</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              disabled={!response}
              className="flex items-center gap-1"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share this wisdom</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ResponseActions;
