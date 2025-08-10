/**
 * ZenVector Agent - Advanced AI Agent with Vector Database Integration
 * Provides code similarity analysis, semantic search, and demographic data insights
 * TypeScript implementation for immediate integration
 */

import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

interface CodeSimilarityMatch {
  rank: number;
  className: string;
  projectId: string;
  type: string;
  package: string;
  similarityScore: number;
  codePreview: string;
  methodsCount: number;
}

interface SemanticSearchResult {
  query: string;
  searchType: string;
  results: Array<{
    type: string;
    title: string;
    content: string;
    relevanceScore: number;
    metadata: any;
  }>;
  totalFound: number;
}

interface DemographicPattern {
  clusterId: number;
  size: number;
  percentage: number;
  characteristics: Record<string, any>;
}

interface ZenVectorStats {
  agentName: string;
  collections: {
    codeSimilarity: number;
    semanticSearch: number;
    demographicData: number;
  };
  totalVectors: number;
  capabilities: string[];
  embeddingModel: string;
  vectorDatabase: string;
}

class ZenVectorAgent {
  private openai: OpenAI | null = null;
  private codeDatabase: Map<string, any> = new Map();
  private semanticDatabase: Map<string, any> = new Map();
  private demographicDatabase: Map<string, any> = new Map();
  private dbPath: string;

  constructor(dbPath: string = './vector_db') {
    this.dbPath = dbPath;
    
    // Initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    console.log('ZenVector Agent initialized successfully');
  }

  /**
   * Add code to vector database for similarity analysis
   */
  async addCodeToVectorDb(projectId: string, codeData: any): Promise<any> {
    try {
      const processedItems: any[] = [];

      for (const classInfo of codeData.classes || []) {
        const classText = this.extractClassFeatures(classInfo);
        const classId = `${projectId}_${classInfo.name}`;
        
        // Generate simple text embedding representation
        const embedding = await this.generateTextEmbedding(classText);
        
        // Store in in-memory database
        this.codeDatabase.set(classId, {
          id: classId,
          projectId,
          className: classInfo.name,
          type: classInfo.type || 'unknown',
          package: classInfo.package || '',
          methodsCount: classInfo.methods?.length || 0,
          content: classText,
          embedding,
          timestamp: new Date().toISOString()
        });

        processedItems.push({
          id: classId,
          className: classInfo.name,
          embeddingSize: embedding.length
        });
      }

      return {
        status: 'success',
        processedItems: processedItems.length,
        items: processedItems
      };

    } catch (error) {
      console.error('Error adding code to vector DB:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Find similar code patterns using text similarity
   */
  async findSimilarCode(queryCode: string, projectId?: string, topK: number = 5): Promise<CodeSimilarityMatch[]> {
    try {
      const queryEmbedding = await this.generateTextEmbedding(queryCode);
      const similarities: Array<{ item: any; score: number }> = [];

      // Calculate similarities with stored code
      for (const [id, item] of this.codeDatabase.entries()) {
        if (projectId && item.projectId !== projectId) continue;

        const similarity = this.calculateSimilarity(queryEmbedding, item.embedding);
        similarities.push({ item, score: similarity });
      }

      // Sort by similarity score and take top K
      similarities.sort((a, b) => b.score - a.score);
      const topResults = similarities.slice(0, topK);

      return topResults.map((result, index) => ({
        rank: index + 1,
        className: result.item.className,
        projectId: result.item.projectId,
        type: result.item.type,
        package: result.item.package,
        similarityScore: Math.round(result.score * 1000) / 1000,
        codePreview: result.item.content.substring(0, 200) + "...",
        methodsCount: result.item.methodsCount
      }));

    } catch (error) {
      console.error('Error finding similar code:', error);
      return [];
    }
  }

  /**
   * Perform semantic search across code and documentation
   */
  async semanticSearch(query: string, searchType: string = "all", topK: number = 10): Promise<SemanticSearchResult> {
    try {
      const queryEmbedding = await this.generateTextEmbedding(query);
      const searchResults: SemanticSearchResult = {
        query,
        searchType,
        results: [],
        totalFound: 0
      };

      if (searchType === "code" || searchType === "all") {
        const similarities: Array<{ item: any; score: number }> = [];

        for (const [id, item] of this.codeDatabase.entries()) {
          const similarity = this.calculateSimilarity(queryEmbedding, item.embedding);
          similarities.push({ item, score: similarity });
        }

        similarities.sort((a, b) => b.score - a.score);
        const topResults = similarities.slice(0, topK);

        for (const result of topResults) {
          searchResults.results.push({
            type: 'code',
            title: `${result.item.className} (${result.item.type})`,
            content: result.item.content.substring(0, 300) + "...",
            relevanceScore: Math.round(result.score * 1000) / 1000,
            metadata: {
              projectId: result.item.projectId,
              className: result.item.className,
              type: result.item.type,
              package: result.item.package
            }
          });
        }
      }

      searchResults.totalFound = searchResults.results.length;
      searchResults.results.sort((a, b) => b.relevanceScore - a.relevanceScore);

      return searchResults;

    } catch (error) {
      console.error('Error in semantic search:', error);
      return { query, searchType, results: [], totalFound: 0 };
    }
  }

  /**
   * Analyze demographic data patterns
   */
  async analyzeDemographicPatterns(demographicData: any[]): Promise<any> {
    try {
      if (!demographicData || demographicData.length === 0) {
        return { error: 'No demographic data provided' };
      }

      // Store demographic data
      const recordIds: string[] = [];
      for (const record of demographicData) {
        const recordId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const text = this.createDemographicText(record);
        const embedding = await this.generateTextEmbedding(text);

        this.demographicDatabase.set(recordId, {
          id: recordId,
          content: text,
          embedding,
          metadata: {
            recordType: 'demographic',
            timestamp: new Date().toISOString(),
            ...record
          }
        });

        recordIds.push(recordId);
      }

      // Perform simple clustering analysis
      const patterns = this.analyzeDemographicClusters(demographicData);

      return {
        status: 'success',
        recordsProcessed: demographicData.length,
        analysis: patterns,
        patternsFound: patterns.clusters?.length || 0
      };

    } catch (error) {
      console.error('Error analyzing demographic patterns:', error);
      return { error: error.message };
    }
  }

  /**
   * Search demographic data using natural language queries
   */
  async searchDemographicData(query: string, topK: number = 10): Promise<any[]> {
    try {
      const queryEmbedding = await this.generateTextEmbedding(query);
      const similarities: Array<{ item: any; score: number }> = [];

      for (const [id, item] of this.demographicDatabase.entries()) {
        const similarity = this.calculateSimilarity(queryEmbedding, item.embedding);
        similarities.push({ item, score: similarity });
      }

      similarities.sort((a, b) => b.score - a.score);
      const topResults = similarities.slice(0, topK);

      return topResults.map(result => ({
        content: result.item.content,
        relevanceScore: Math.round(result.score * 1000) / 1000,
        metadata: result.item.metadata,
        matchType: 'demographic_data'
      }));

    } catch (error) {
      console.error('Error searching demographic data:', error);
      return [];
    }
  }

  /**
   * Get ZenVector agent usage statistics
   */
  getAgentStatistics(): ZenVectorStats {
    return {
      agentName: 'ZenVector',
      collections: {
        codeSimilarity: this.codeDatabase.size,
        semanticSearch: this.semanticDatabase.size,
        demographicData: this.demographicDatabase.size
      },
      totalVectors: this.codeDatabase.size + this.semanticDatabase.size + this.demographicDatabase.size,
      capabilities: [
        'Code Similarity Detection',
        'Semantic Code Search',
        'Demographic Data Analysis',
        'Pattern Recognition',
        'Multi-modal Search'
      ],
      embeddingModel: 'OpenAI text-embedding-ada-002',
      vectorDatabase: 'In-Memory Vector Store'
    };
  }

  private extractClassFeatures(classInfo: any): string {
    const features: string[] = [];

    // Class name and type
    features.push(`Class: ${classInfo.name}`);
    features.push(`Type: ${classInfo.type || 'unknown'}`);

    // Package information
    if (classInfo.package) {
      features.push(`Package: ${classInfo.package}`);
    }

    // Annotations
    if (classInfo.annotations?.length > 0) {
      features.push(`Annotations: ${classInfo.annotations.join(', ')}`);
    }

    // Methods
    const methods = classInfo.methods || [];
    if (methods.length > 0) {
      const methodNames = methods.slice(0, 5).map((method: any) => method.name || '');
      features.push(`Methods: ${methodNames.join(', ')}`);
    }

    // Fields
    const fields = classInfo.fields || [];
    if (fields.length > 0) {
      const fieldNames = fields.slice(0, 5).map((field: any) => field.name || '');
      features.push(`Fields: ${fieldNames.join(', ')}`);
    }

    return features.join(' | ');
  }

  private createDemographicText(record: any): string {
    const textParts: string[] = [];

    for (const [key, value] of Object.entries(record)) {
      if (value != null && String(value).trim()) {
        textParts.push(`${key}: ${value}`);
      }
    }

    return textParts.join(' | ');
  }

  private async generateTextEmbedding(text: string): Promise<number[]> {
    try {
      if (this.openai) {
        // Use OpenAI embeddings for better accuracy
        const response = await this.openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: text,
        });
        return response.data[0].embedding;
      } else {
        // Simple fallback: character frequency vector
        return this.generateSimpleEmbedding(text);
      }
    } catch (error) {
      console.warn('OpenAI embedding failed, using simple embedding:', error.message);
      return this.generateSimpleEmbedding(text);
    }
  }

  private generateSimpleEmbedding(text: string): number[] {
    // Simple character frequency-based embedding
    const charCounts = new Array(256).fill(0);
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      if (charCode < 256) {
        charCounts[charCode]++;
      }
    }

    // Normalize
    const total = charCounts.reduce((sum, count) => sum + count, 0);
    return charCounts.map(count => total > 0 ? count / total : 0);
  }

  private calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    // Cosine similarity
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    const minLength = Math.min(embedding1.length, embedding2.length);

    for (let i = 0; i < minLength; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  private analyzeDemographicClusters(data: any[]): any {
    // Simple clustering analysis
    const clusters: DemographicPattern[] = [];
    
    // Group by common attributes (simplified)
    const groupedData = new Map<string, any[]>();
    
    for (const record of data) {
      // Create a simple grouping key based on some attributes
      const keys = Object.keys(record).slice(0, 3); // First 3 attributes
      const groupKey = keys.map(key => `${key}:${record[key]}`).join('|');
      
      if (!groupedData.has(groupKey)) {
        groupedData.set(groupKey, []);
      }
      groupedData.get(groupKey)!.push(record);
    }

    let clusterId = 0;
    for (const [key, group] of groupedData.entries()) {
      clusters.push({
        clusterId: clusterId++,
        size: group.length,
        percentage: Math.round((group.length / data.length) * 100 * 10) / 10,
        characteristics: this.describeCluster(group)
      });
    }

    return {
      clusters,
      totalClusters: clusters.length,
      analysis: 'Demographic clustering completed successfully'
    };
  }

  private describeCluster(clusterData: any[]): Record<string, any> {
    const description: Record<string, any> = {};
    
    if (clusterData.length === 0) return description;

    // Get all unique keys
    const allKeys = new Set<string>();
    clusterData.forEach(record => {
      Object.keys(record).forEach(key => allKeys.add(key));
    });

    // Analyze each attribute
    for (const key of allKeys) {
      const values = clusterData.map(record => record[key]).filter(val => val != null);
      
      if (values.length > 0) {
        if (typeof values[0] === 'string') {
          // Most common string value
          const valueCounts = new Map<string, number>();
          values.forEach(val => {
            valueCounts.set(val, (valueCounts.get(val) || 0) + 1);
          });
          
          let mostCommon = '';
          let maxCount = 0;
          for (const [val, count] of valueCounts.entries()) {
            if (count > maxCount) {
              maxCount = count;
              mostCommon = val;
            }
          }
          description[`most_common_${key}`] = mostCommon;
        } else if (typeof values[0] === 'number') {
          // Average for numeric values
          const sum = values.reduce((acc, val) => acc + Number(val), 0);
          description[`avg_${key}`] = Math.round(sum / values.length * 100) / 100;
        }
      }
    }

    return description;
  }
}

// Global instance
let zenVectorAgent: ZenVectorAgent | null = null;

export function getZenVectorAgent(): ZenVectorAgent {
  if (!zenVectorAgent) {
    zenVectorAgent = new ZenVectorAgent();
  }
  return zenVectorAgent;
}

export default ZenVectorAgent;
export type { CodeSimilarityMatch, SemanticSearchResult, DemographicPattern, ZenVectorStats };