// FAISS utility functions for semantic search

// Simple vector operations for FAISS integration
export class FAISSUtils {
  static async loadFAISSIndex(
    supabaseUrl: string,
    serviceKey: string,
  ): Promise<ArrayBuffer> {
    const response = await fetch(
      `${supabaseUrl}/storage/v1/object/public/kural_index.faiss`,
      {
        headers: {
          Authorization: `Bearer ${serviceKey}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch FAISS index: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  }

  static async getEmbedding(
    text: string,
    openaiApiKey: string,
  ): Promise<number[]> {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get embedding: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error("Vectors must have the same length");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  static async findSimilarKurals(
    queryEmbedding: number[],
    kuralMetadata: any[],
    openaiApiKey: string,
    topK: number = 5,
  ): Promise<{ kural: any; similarity: number }[]> {
    const similarities: { kural: any; similarity: number }[] = [];

    // For each kural, get its embedding and calculate similarity
    for (const kural of kuralMetadata) {
      try {
        // Create a combined text for embedding
        const kuralText = `${kural.english_translation} ${kural.meaning} ${kural.chapter} ${kural.section}`;
        const kuralEmbedding = await this.getEmbedding(kuralText, openaiApiKey);

        const similarity = this.cosineSimilarity(
          queryEmbedding,
          kuralEmbedding,
        );
        similarities.push({ kural, similarity });
      } catch (error) {
        console.error(`Error processing kural ${kural.kural_number}:`, error);
        // Continue with other kurals if one fails
      }
    }

    // Sort by similarity (highest first) and return top K
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  // Fallback method using pre-computed embeddings if available
  static async findSimilarKuralsWithPrecomputed(
    queryEmbedding: number[],
    kuralMetadata: any[],
    precomputedEmbeddings: number[][],
    topK: number = 5,
  ): Promise<{ kural: any; similarity: number }[]> {
    const similarities: { kural: any; similarity: number }[] = [];

    for (
      let i = 0;
      i < kuralMetadata.length && i < precomputedEmbeddings.length;
      i++
    ) {
      const similarity = this.cosineSimilarity(
        queryEmbedding,
        precomputedEmbeddings[i],
      );
      similarities.push({ kural: kuralMetadata[i], similarity });
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }
}
