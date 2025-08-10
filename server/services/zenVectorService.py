#!/usr/bin/env python3
"""
ZenVector Agent - Advanced AI Agent with Vector Database Integration
Provides code similarity analysis, semantic search, and demographic data insights
"""

import json
import os
import uuid
import sys
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import logging

# Simple implementation without external dependencies for now
# TODO: Add chromadb, sentence-transformers when environment supports them

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ZenVectorAgent:
    """
    ZenVector: Advanced AI Agent for Code Intelligence and Demographic Analysis
    
    Features:
    - Code similarity detection using vector embeddings
    - Semantic search across codebases
    - Demographic data pattern analysis
    - Multi-modal search capabilities
    """
    
    def __init__(self, db_path: str = "./vector_db"):
        """Initialize ZenVector Agent with Chroma vector database"""
        try:
            # Initialize Chroma client
            self.client = chromadb.PersistentClient(path=db_path)
            
            # Initialize sentence transformer for embeddings
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Create collections for different data types
            self.code_collection = self._get_or_create_collection("code_similarity")
            self.semantic_collection = self._get_or_create_collection("semantic_search")
            self.demographic_collection = self._get_or_create_collection("demographic_data")
            
            logger.info("ZenVector Agent initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize ZenVector Agent: {e}")
            raise
    
    def _get_or_create_collection(self, name: str):
        """Get or create a Chroma collection"""
        try:
            return self.client.get_collection(name=name)
        except ValueError:
            return self.client.create_collection(name=name)
    
    def add_code_to_vector_db(self, project_id: str, code_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add code snippets to vector database for similarity analysis
        
        Args:
            project_id: Unique project identifier
            code_data: Dictionary containing classes, methods, and code content
            
        Returns:
            Dictionary with processing results
        """
        try:
            processed_items = []
            
            for class_info in code_data.get('classes', []):
                # Process each class
                class_text = self._extract_class_features(class_info)
                class_id = f"{project_id}_{class_info['name']}"
                
                # Generate embedding
                embedding = self.embedding_model.encode(class_text).tolist()
                
                # Store in vector database
                self.code_collection.add(
                    embeddings=[embedding],
                    documents=[class_text],
                    metadatas=[{
                        'project_id': project_id,
                        'class_name': class_info['name'],
                        'type': class_info.get('type', 'unknown'),
                        'package': class_info.get('package', ''),
                        'methods_count': len(class_info.get('methods', [])),
                        'timestamp': datetime.now().isoformat()
                    }],
                    ids=[class_id]
                )
                
                processed_items.append({
                    'id': class_id,
                    'class_name': class_info['name'],
                    'embedding_size': len(embedding)
                })
            
            return {
                'status': 'success',
                'processed_items': len(processed_items),
                'items': processed_items
            }
            
        except Exception as e:
            logger.error(f"Error adding code to vector DB: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def find_similar_code(self, query_code: str, project_id: Optional[str] = None, 
                         top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Find similar code patterns using vector similarity search
        
        Args:
            query_code: Code snippet or description to search for
            project_id: Optional project filter
            top_k: Number of results to return
            
        Returns:
            List of similar code matches with similarity scores
        """
        try:
            # Generate embedding for query
            query_embedding = self.embedding_model.encode(query_code).tolist()
            
            # Build filter if project_id provided
            where_filter = {"project_id": {"$eq": project_id}} if project_id else None
            
            # Search for similar code
            results = self.code_collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where=where_filter
            )
            
            # Format results
            similar_code = []
            for i, (doc, metadata, distance) in enumerate(zip(
                results['documents'][0],
                results['metadatas'][0], 
                results['distances'][0]
            )):
                similarity_score = 1 - distance  # Convert distance to similarity
                similar_code.append({
                    'rank': i + 1,
                    'class_name': metadata['class_name'],
                    'project_id': metadata['project_id'],
                    'type': metadata['type'],
                    'package': metadata['package'],
                    'similarity_score': round(similarity_score, 3),
                    'code_preview': doc[:200] + "..." if len(doc) > 200 else doc,
                    'methods_count': metadata.get('methods_count', 0)
                })
            
            return similar_code
            
        except Exception as e:
            logger.error(f"Error finding similar code: {e}")
            return []
    
    def semantic_search(self, query: str, search_type: str = "all", 
                       top_k: int = 10) -> Dict[str, Any]:
        """
        Perform semantic search across code and documentation
        
        Args:
            query: Natural language search query
            search_type: "code", "documentation", or "all"
            top_k: Number of results to return
            
        Returns:
            Dictionary with search results and metadata
        """
        try:
            query_embedding = self.embedding_model.encode(query).tolist()
            
            search_results = {
                'query': query,
                'search_type': search_type,
                'results': [],
                'total_found': 0
            }
            
            if search_type in ["code", "all"]:
                code_results = self.code_collection.query(
                    query_embeddings=[query_embedding],
                    n_results=top_k
                )
                
                for doc, metadata, distance in zip(
                    code_results['documents'][0],
                    code_results['metadatas'][0],
                    code_results['distances'][0]
                ):
                    search_results['results'].append({
                        'type': 'code',
                        'title': f"{metadata['class_name']} ({metadata['type']})",
                        'content': doc[:300] + "..." if len(doc) > 300 else doc,
                        'relevance_score': round(1 - distance, 3),
                        'metadata': metadata
                    })
            
            search_results['total_found'] = len(search_results['results'])
            
            # Sort by relevance score
            search_results['results'].sort(
                key=lambda x: x['relevance_score'], 
                reverse=True
            )
            
            return search_results
            
        except Exception as e:
            logger.error(f"Error in semantic search: {e}")
            return {'error': str(e), 'results': []}
    
    def analyze_demographic_patterns(self, demographic_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze demographic data patterns using vector analysis
        
        Args:
            demographic_data: List of demographic records
            
        Returns:
            Analysis results with patterns and insights
        """
        try:
            if not demographic_data:
                return {'error': 'No demographic data provided'}
            
            # Convert to DataFrame for analysis
            df = pd.DataFrame(demographic_data)
            
            # Generate text representations for each record
            demographic_texts = []
            for record in demographic_data:
                text = self._create_demographic_text(record)
                demographic_texts.append(text)
            
            # Generate embeddings
            embeddings = self.embedding_model.encode(demographic_texts)
            
            # Store in demographic collection
            record_ids = [str(uuid.uuid4()) for _ in demographic_data]
            
            self.demographic_collection.add(
                embeddings=embeddings.tolist(),
                documents=demographic_texts,
                metadatas=[{
                    'record_type': 'demographic',
                    'timestamp': datetime.now().isoformat(),
                    **{k: str(v) for k, v in record.items()}
                } for record in demographic_data],
                ids=record_ids
            )
            
            # Perform clustering analysis
            analysis_results = self._analyze_demographic_clusters(embeddings, df)
            
            return {
                'status': 'success',
                'records_processed': len(demographic_data),
                'analysis': analysis_results,
                'patterns_found': len(analysis_results.get('clusters', []))
            }
            
        except Exception as e:
            logger.error(f"Error analyzing demographic patterns: {e}")
            return {'error': str(e)}
    
    def search_demographic_data(self, query: str, top_k: int = 10) -> List[Dict[str, Any]]:
        """
        Search demographic data using natural language queries
        
        Args:
            query: Natural language search query
            top_k: Number of results to return
            
        Returns:
            List of matching demographic records
        """
        try:
            query_embedding = self.embedding_model.encode(query).tolist()
            
            results = self.demographic_collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k
            )
            
            demographic_matches = []
            for doc, metadata, distance in zip(
                results['documents'][0],
                results['metadatas'][0],
                results['distances'][0]
            ):
                demographic_matches.append({
                    'content': doc,
                    'relevance_score': round(1 - distance, 3),
                    'metadata': {k: v for k, v in metadata.items() 
                              if not k.startswith('_')},
                    'match_type': 'demographic_data'
                })
            
            return demographic_matches
            
        except Exception as e:
            logger.error(f"Error searching demographic data: {e}")
            return []
    
    def get_agent_statistics(self) -> Dict[str, Any]:
        """Get ZenVector agent usage statistics"""
        try:
            stats = {
                'agent_name': 'ZenVector',
                'collections': {
                    'code_similarity': self.code_collection.count(),
                    'semantic_search': self.semantic_collection.count(),
                    'demographic_data': self.demographic_collection.count()
                },
                'total_vectors': 0,
                'capabilities': [
                    'Code Similarity Detection',
                    'Semantic Code Search',
                    'Demographic Data Analysis',
                    'Pattern Recognition',
                    'Multi-modal Search'
                ],
                'embedding_model': 'all-MiniLM-L6-v2',
                'vector_database': 'ChromaDB'
            }
            
            stats['total_vectors'] = sum(stats['collections'].values())
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting agent statistics: {e}")
            return {'error': str(e)}
    
    def _extract_class_features(self, class_info: Dict[str, Any]) -> str:
        """Extract textual features from class information"""
        features = []
        
        # Class name and type
        features.append(f"Class: {class_info['name']}")
        features.append(f"Type: {class_info.get('type', 'unknown')}")
        
        # Package information
        if class_info.get('package'):
            features.append(f"Package: {class_info['package']}")
        
        # Annotations
        if class_info.get('annotations'):
            features.append(f"Annotations: {', '.join(class_info['annotations'])}")
        
        # Methods
        methods = class_info.get('methods', [])
        if methods:
            method_names = [method.get('name', '') for method in methods[:5]]  # First 5 methods
            features.append(f"Methods: {', '.join(method_names)}")
        
        # Fields
        fields = class_info.get('fields', [])
        if fields:
            field_names = [field.get('name', '') for field in fields[:5]]  # First 5 fields
            features.append(f"Fields: {', '.join(field_names)}")
        
        return ' | '.join(features)
    
    def _create_demographic_text(self, record: Dict[str, Any]) -> str:
        """Create text representation of demographic record"""
        text_parts = []
        
        for key, value in record.items():
            if value is not None and str(value).strip():
                text_parts.append(f"{key}: {value}")
        
        return ' | '.join(text_parts)
    
    def _analyze_demographic_clusters(self, embeddings: np.ndarray, 
                                    df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze demographic data clusters"""
        try:
            from sklearn.cluster import KMeans
            from sklearn.metrics import silhouette_score
            
            # Determine optimal number of clusters
            n_samples = len(embeddings)
            max_clusters = min(8, n_samples - 1) if n_samples > 1 else 1
            
            if max_clusters < 2:
                return {'clusters': [], 'analysis': 'Insufficient data for clustering'}
            
            # Perform K-means clustering
            kmeans = KMeans(n_clusters=max_clusters, random_state=42)
            cluster_labels = kmeans.fit_predict(embeddings)
            
            # Calculate silhouette score
            silhouette_avg = silhouette_score(embeddings, cluster_labels)
            
            # Analyze clusters
            clusters = []
            for i in range(max_clusters):
                cluster_indices = np.where(cluster_labels == i)[0]
                cluster_data = df.iloc[cluster_indices]
                
                clusters.append({
                    'cluster_id': i,
                    'size': len(cluster_indices),
                    'percentage': round(len(cluster_indices) / n_samples * 100, 1),
                    'characteristics': self._describe_cluster(cluster_data)
                })
            
            return {
                'clusters': clusters,
                'silhouette_score': round(silhouette_avg, 3),
                'total_clusters': max_clusters,
                'analysis': 'Demographic clustering completed successfully'
            }
            
        except Exception as e:
            logger.error(f"Error in demographic clustering: {e}")
            return {'clusters': [], 'analysis': f'Clustering failed: {str(e)}'}
    
    def _describe_cluster(self, cluster_data: pd.DataFrame) -> Dict[str, Any]:
        """Describe characteristics of a demographic cluster"""
        description = {}
        
        for column in cluster_data.columns:
            if cluster_data[column].dtype == 'object':
                # Categorical data
                mode_value = cluster_data[column].mode()
                if not mode_value.empty:
                    description[f"most_common_{column}"] = mode_value.iloc[0]
            else:
                # Numerical data
                description[f"avg_{column}"] = round(cluster_data[column].mean(), 2)
        
        return description

# Initialize global ZenVector agent instance
zen_vector_agent = None

def get_zen_vector_agent():
    """Get global ZenVector agent instance"""
    global zen_vector_agent
    if zen_vector_agent is None:
        zen_vector_agent = ZenVectorAgent()
    return zen_vector_agent

if __name__ == "__main__":
    # Test the ZenVector agent
    agent = ZenVectorAgent()
    stats = agent.get_agent_statistics()
    print("ZenVector Agent initialized successfully!")
    print(f"Agent Stats: {json.dumps(stats, indent=2)}")