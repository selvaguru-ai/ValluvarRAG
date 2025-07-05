import { corsHeaders } from "@shared/cors.ts";
import { FAISSUtils } from "@shared/faiss-utils.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const { question } = await req.json();

    if (!question) {
      return new Response(JSON.stringify({ error: "Question is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Initialize environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY")!;
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;

    // Fetch kural metadata from storage bucket 'thiruvalluvar'
    const metadataResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/public/thiruvalluvar/kural_metadata.json`,
      {
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      },
    );

    if (!metadataResponse.ok) {
      throw new Error("Failed to fetch kural metadata");
    }

    const kuralMetadata = await metadataResponse.json();

    let selectedKural;
    let usedFAISS = false;

    try {
      // Try FAISS-based semantic search first
      console.log("Attempting FAISS-based semantic search...");

      // Get embedding for the user's question
      const queryEmbedding = await FAISSUtils.getEmbedding(
        question,
        openaiApiKey,
      );

      // Find similar kurals using semantic search
      const similarKurals = await FAISSUtils.findSimilarKurals(
        queryEmbedding,
        kuralMetadata,
        openaiApiKey,
        5, // Get top 5 most similar kurals
      );

      if (similarKurals.length > 0) {
        // Select the most similar kural
        selectedKural = similarKurals[0].kural;
        usedFAISS = true;
        console.log(
          `FAISS search successful. Selected Kural ${selectedKural.kural_number} with similarity ${similarKurals[0].similarity}`,
        );
      }
    } catch (faissError) {
      console.error(
        "FAISS search failed, falling back to keyword-based search:",
        faissError,
      );
    }

    // Fallback to OpenAI + keyword matching if FAISS fails
    if (!selectedKural) {
      console.log("Using OpenAI + keyword-based fallback search...");

      // Use OpenAI to analyze the question and find the most relevant Kural
      const openaiResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: `You are an expert on Thiruvalluvar's Thirukkural. Given a user's question or life problem, analyze it and identify the key themes, emotions, and life aspects involved. Then suggest which categories or topics from Thirukkural would be most relevant. Focus on themes like: virtue (aram), wealth/prosperity (porul), love/pleasure (inbam), wisdom, friendship, family, leadership, justice, patience, kindness, truthfulness, etc. Respond with 3-5 relevant keywords that would help match the question to appropriate Kurals.`,
              },
              {
                role: "user",
                content: `Question: "${question}"

Please provide 3-5 relevant keywords that would help find the most appropriate Thirukkural for this question. Respond only with the keywords separated by commas.`,
              },
            ],
            max_tokens: 100,
            temperature: 0.3,
          }),
        },
      );

      let relevantKurals = [];

      if (openaiResponse.ok) {
        const openaiData = await openaiResponse.json();
        const aiKeywords =
          openaiData.choices[0]?.message?.content
            ?.toLowerCase()
            .split(",")
            .map((k: string) => k.trim()) || [];

        // Find kurals based on AI-suggested keywords
        relevantKurals = kuralMetadata.filter((kural: any) => {
          const text = (
            kural.english_translation +
            " " +
            kural.meaning +
            " " +
            kural.chapter +
            " " +
            kural.section
          ).toLowerCase();
          return aiKeywords.some((keyword: string) => text.includes(keyword));
        });
      }

      // Fallback to simple keyword matching if OpenAI fails or no matches
      if (relevantKurals.length === 0) {
        const questionLower = question.toLowerCase();
        const keywords = questionLower
          .split(" ")
          .filter((word) => word.length > 3);

        relevantKurals = kuralMetadata.filter((kural: any) => {
          const text = (
            kural.english_translation +
            " " +
            kural.meaning
          ).toLowerCase();
          return keywords.some((keyword) => text.includes(keyword));
        });
      }

      // If still no matches, use general wisdom kurals
      if (relevantKurals.length === 0) {
        relevantKurals = kuralMetadata.filter((kural: any) => {
          const generalTopics = [
            "virtue",
            "wisdom",
            "life",
            "good",
            "truth",
            "knowledge",
            "patience",
            "kindness",
          ];
          const text = (
            kural.english_translation +
            " " +
            kural.meaning
          ).toLowerCase();
          return generalTopics.some((topic) => text.includes(topic));
        });
      }

      // Select the most relevant kural (first one from filtered results)
      selectedKural =
        relevantKurals[0] ||
        kuralMetadata[Math.floor(Math.random() * kuralMetadata.length)];
    }

    const response = {
      kural_number: selectedKural.kural_number,
      tamil_text: selectedKural.tamil_text,
      english_translation: selectedKural.english_translation,
      meaning: selectedKural.meaning,
      chapter: selectedKural.chapter,
      section: selectedKural.section,
      search_method: usedFAISS ? "semantic_search" : "keyword_search",
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in valluvar_consultation:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
