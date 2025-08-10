#!/usr/bin/env python3
"""
Code Lens Agent: Advanced Code Analysis and Pattern Recognition

Features:
- Deep code analysis with AST parsing
- Pattern recognition and anti-pattern detection
- Code complexity metrics and quality assessment
- Security vulnerability scanning
- Performance bottleneck identification
- Architecture pattern detection
- Technical debt analysis
- Code similarity clustering
"""

import sys
import subprocess
import json
import ast
import os
import re
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try to import advanced analysis libraries
try:
    from transformers import pipeline, AutoTokenizer, AutoModel
    import torch
    HUGGINGFACE_AVAILABLE = True
except ImportError:
    print("Installing HuggingFace Transformers...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "transformers", "torch", "accelerate", "--user"])
        from transformers import pipeline, AutoTokenizer, AutoModel
        import torch
        HUGGINGFACE_AVAILABLE = True
    except:
        HUGGINGFACE_AVAILABLE = False

try:
    from langfuse import Langfuse
    from langfuse.decorators import observe, langfuse_context
    LANGFUSE_AVAILABLE = True
except ImportError:
    print("Installing Langfuse...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "langfuse", "--user"])
        from langfuse import Langfuse
        from langfuse.decorators import observe, langfuse_context
        LANGFUSE_AVAILABLE = True
    except:
        LANGFUSE_AVAILABLE = False

try:
    import radon
    from radon.complexity import cc_visit
    from radon.metrics import mi_visit, h_visit
    RADON_AVAILABLE = True
except ImportError:
    print("Installing Radon for code metrics...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "radon", "--user"])
        import radon
        from radon.complexity import cc_visit
        from radon.metrics import mi_visit, h_visit
        RADON_AVAILABLE = True
    except:
        RADON_AVAILABLE = False

@dataclass
class CodeMetrics:
    """Data class for code metrics"""
    lines_of_code: int
    cyclomatic_complexity: float
    maintainability_index: float
    halstead_difficulty: float
    code_patterns: List[str]
    security_issues: List[Dict[str, Any]]
    performance_issues: List[Dict[str, Any]]
    technical_debt_score: float

@dataclass
class SecurityIssue:
    """Data class for security issues"""
    severity: str
    type: str
    description: str
    line_number: int
    suggestion: str

class CodeLensAgent:
    """
    Code Lens Agent: Advanced Code Analysis and Pattern Recognition
    
    Features:
    - Deep code analysis with AST parsing
    - Pattern recognition and anti-pattern detection
    - Code complexity metrics and quality assessment
    - Security vulnerability scanning
    - Performance bottleneck identification
    - HuggingFace model integration for code insights
    - Langfuse observability for analysis tracking
    """
    
    def __init__(self):
        """Initialize Code Lens Agent with advanced analysis capabilities"""
        self.langfuse_client = None
        self.code_analysis_pipeline = None
        self.vulnerability_patterns = self._load_vulnerability_patterns()
        self.performance_patterns = self._load_performance_patterns()
        
        # Initialize Langfuse for observability
        try:
            if LANGFUSE_AVAILABLE:
                self.langfuse_client = Langfuse()
                print("Langfuse observability initialized for Code Lens")
        except Exception as e:
            print(f"Langfuse initialization failed: {e}")
        
        # Initialize HuggingFace models for code analysis
        try:
            if HUGGINGFACE_AVAILABLE:
                self.code_analysis_pipeline = pipeline(
                    "text-classification",
                    model="microsoft/codebert-base",
                    device=0 if torch.cuda.is_available() else -1
                )
                print("HuggingFace CodeBERT initialized for Code Lens")
        except Exception as e:
            print(f"HuggingFace initialization failed: {e}")
    
    def _load_vulnerability_patterns(self) -> List[Dict[str, Any]]:
        """Load common security vulnerability patterns"""
        return [
            {
                'name': 'SQL Injection',
                'pattern': r'(execute|query)\s*\(\s*["\'].*\+.*["\']',
                'severity': 'HIGH',
                'description': 'Potential SQL injection vulnerability'
            },
            {
                'name': 'XSS Vulnerability',
                'pattern': r'innerHTML\s*=\s*.*\+',
                'severity': 'MEDIUM',
                'description': 'Potential XSS vulnerability through innerHTML'
            },
            {
                'name': 'Hardcoded Credentials',
                'pattern': r'(password|api_key|secret)\s*=\s*["\'][^"\']+["\']',
                'severity': 'HIGH',
                'description': 'Hardcoded credentials found'
            },
            {
                'name': 'Insecure Random',
                'pattern': r'Math\.random\(\)',
                'severity': 'LOW',
                'description': 'Using insecure random number generation'
            }
        ]
    
    def _load_performance_patterns(self) -> List[Dict[str, Any]]:
        """Load common performance anti-patterns"""
        return [
            {
                'name': 'N+1 Query',
                'pattern': r'for\s+.*in.*:\s*\n\s*.*\.query\(',
                'severity': 'MEDIUM',
                'description': 'Potential N+1 query problem'
            },
            {
                'name': 'Nested Loops',
                'pattern': r'for\s+.*in.*:\s*\n\s*for\s+.*in.*:',
                'severity': 'LOW',
                'description': 'Nested loops may cause performance issues'
            },
            {
                'name': 'Synchronous IO',
                'pattern': r'(requests\.get|urllib\.urlopen)\(',
                'severity': 'MEDIUM',
                'description': 'Synchronous IO operation'
            }
        ]
    
    @observe()
    def analyze_code_file(self, file_path: str, content: str) -> Dict[str, Any]:
        """
        Comprehensive code analysis of a single file
        
        Args:
            file_path: Path to the file being analyzed
            content: File content to analyze
            
        Returns:
            Complete analysis results including metrics, patterns, and issues
        """
        try:
            analysis_result = {
                'file_path': file_path,
                'analyzed_at': datetime.now().isoformat(),
                'file_type': self._detect_file_type(file_path),
                'metrics': self._calculate_code_metrics(content),
                'patterns': self._detect_code_patterns(content),
                'security_issues': self._scan_security_vulnerabilities(content),
                'performance_issues': self._analyze_performance_patterns(content),
                'complexity_analysis': self._analyze_complexity(content),
                'technical_debt': self._calculate_technical_debt(content),
                'ai_insights': self._generate_ai_insights(content)
            }
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Code analysis failed for {file_path}: {e}")
            return {
                'error': str(e),
                'file_path': file_path,
                'analyzed_at': datetime.now().isoformat()
            }
    
    def _detect_file_type(self, file_path: str) -> str:
        """Detect programming language from file extension"""
        extension = os.path.splitext(file_path)[1].lower()
        
        type_mapping = {
            '.py': 'Python',
            '.java': 'Java',
            '.js': 'JavaScript',
            '.ts': 'TypeScript',
            '.jsx': 'React JSX',
            '.tsx': 'React TSX',
            '.cpp': 'C++',
            '.c': 'C',
            '.cs': 'C#',
            '.go': 'Go',
            '.rs': 'Rust',
            '.php': 'PHP',
            '.rb': 'Ruby',
            '.scala': 'Scala',
            '.kt': 'Kotlin'
        }
        
        return type_mapping.get(extension, 'Unknown')
    
    def _calculate_code_metrics(self, content: str) -> Dict[str, Any]:
        """Calculate basic code metrics"""
        lines = content.split('\n')
        
        metrics = {
            'total_lines': len(lines),
            'code_lines': len([line for line in lines if line.strip() and not line.strip().startswith('#')]),
            'comment_lines': len([line for line in lines if line.strip().startswith('#')]),
            'blank_lines': len([line for line in lines if not line.strip()]),
            'functions_count': len(re.findall(r'def\s+\w+\s*\(', content)),
            'classes_count': len(re.findall(r'class\s+\w+', content)),
            'imports_count': len(re.findall(r'(import\s+|from\s+.*\s+import)', content))
        }
        
        # Add Radon metrics if available
        if RADON_AVAILABLE:
            try:
                complexity_results = cc_visit(content)
                if complexity_results:
                    avg_complexity = sum(result.complexity for result in complexity_results) / len(complexity_results)
                    metrics['average_complexity'] = avg_complexity
                    metrics['max_complexity'] = max(result.complexity for result in complexity_results)
                
                mi_results = mi_visit(content, multi=True)
                if mi_results:
                    metrics['maintainability_index'] = mi_results
                
            except Exception as e:
                logger.warning(f"Radon analysis failed: {e}")
        
        return metrics
    
    def _detect_code_patterns(self, content: str) -> List[Dict[str, Any]]:
        """Detect common code patterns and anti-patterns"""
        patterns_found = []
        
        # Design patterns
        design_patterns = [
            {
                'name': 'Singleton Pattern',
                'pattern': r'class\s+\w+.*:\s*\n.*_instance\s*=\s*None',
                'type': 'design_pattern'
            },
            {
                'name': 'Factory Pattern',
                'pattern': r'def\s+create_\w+\s*\(',
                'type': 'design_pattern'
            },
            {
                'name': 'Observer Pattern',
                'pattern': r'(notify|observer|subscribe)',
                'type': 'design_pattern'
            },
            {
                'name': 'Strategy Pattern',
                'pattern': r'def\s+execute\s*\(',
                'type': 'design_pattern'
            }
        ]
        
        # Anti-patterns
        anti_patterns = [
            {
                'name': 'God Class',
                'pattern': r'class\s+\w+.*:\s*(?:\n(?:.*\n)*?){100,}',
                'type': 'anti_pattern'
            },
            {
                'name': 'Long Method',
                'pattern': r'def\s+\w+\s*\([^)]*\):\s*(?:\n(?:.*\n)*?){30,}',
                'type': 'anti_pattern'
            },
            {
                'name': 'Magic Numbers',
                'pattern': r'\b\d{2,}\b',
                'type': 'anti_pattern'
            }
        ]
        
        all_patterns = design_patterns + anti_patterns
        
        for pattern_def in all_patterns:
            matches = re.finditer(pattern_def['pattern'], content, re.MULTILINE | re.DOTALL)
            for match in matches:
                line_number = content[:match.start()].count('\n') + 1
                patterns_found.append({
                    'name': pattern_def['name'],
                    'type': pattern_def['type'],
                    'line_number': line_number,
                    'matched_text': match.group()[:100] + '...' if len(match.group()) > 100 else match.group()
                })
        
        return patterns_found
    
    def _scan_security_vulnerabilities(self, content: str) -> List[Dict[str, Any]]:
        """Scan for security vulnerabilities"""
        vulnerabilities = []
        
        for vuln_pattern in self.vulnerability_patterns:
            matches = re.finditer(vuln_pattern['pattern'], content, re.MULTILINE)
            for match in matches:
                line_number = content[:match.start()].count('\n') + 1
                vulnerabilities.append({
                    'name': vuln_pattern['name'],
                    'severity': vuln_pattern['severity'],
                    'description': vuln_pattern['description'],
                    'line_number': line_number,
                    'matched_code': match.group()
                })
        
        return vulnerabilities
    
    def _analyze_performance_patterns(self, content: str) -> List[Dict[str, Any]]:
        """Analyze performance-related patterns"""
        performance_issues = []
        
        for perf_pattern in self.performance_patterns:
            matches = re.finditer(perf_pattern['pattern'], content, re.MULTILINE)
            for match in matches:
                line_number = content[:match.start()].count('\n') + 1
                performance_issues.append({
                    'name': perf_pattern['name'],
                    'severity': perf_pattern['severity'],
                    'description': perf_pattern['description'],
                    'line_number': line_number,
                    'suggestion': self._get_performance_suggestion(perf_pattern['name'])
                })
        
        return performance_issues
    
    def _get_performance_suggestion(self, pattern_name: str) -> str:
        """Get performance improvement suggestions"""
        suggestions = {
            'N+1 Query': 'Consider using batch queries or eager loading',
            'Nested Loops': 'Consider using more efficient algorithms or data structures',
            'Synchronous IO': 'Consider using async/await or threading for IO operations'
        }
        return suggestions.get(pattern_name, 'Review for potential optimization')
    
    def _analyze_complexity(self, content: str) -> Dict[str, Any]:
        """Analyze code complexity"""
        complexity_analysis = {
            'total_functions': 0,
            'complex_functions': [],
            'average_complexity': 0,
            'max_complexity': 0
        }
        
        if RADON_AVAILABLE:
            try:
                results = cc_visit(content)
                if results:
                    complexity_analysis['total_functions'] = len(results)
                    complexities = [result.complexity for result in results]
                    complexity_analysis['average_complexity'] = sum(complexities) / len(complexities)
                    complexity_analysis['max_complexity'] = max(complexities)
                    
                    # Identify complex functions (complexity > 10)
                    complex_functions = [
                        {
                            'name': result.name,
                            'complexity': result.complexity,
                            'line_number': result.lineno
                        }
                        for result in results if result.complexity > 10
                    ]
                    complexity_analysis['complex_functions'] = complex_functions
            except Exception as e:
                logger.warning(f"Complexity analysis failed: {e}")
        
        return complexity_analysis
    
    def _calculate_technical_debt(self, content: str) -> Dict[str, Any]:
        """Calculate technical debt indicators"""
        debt_indicators = {
            'todo_comments': len(re.findall(r'#.*TODO|#.*FIXME|#.*HACK', content, re.IGNORECASE)),
            'code_duplication': self._detect_code_duplication(content),
            'long_functions': len(re.findall(r'def\s+\w+\s*\([^)]*\):\s*(?:\n(?:.*\n)*?){20,}', content, re.MULTILINE)),
            'magic_numbers': len(re.findall(r'\b\d{3,}\b', content)),
            'deep_nesting': self._count_deep_nesting(content)
        }
        
        # Calculate overall debt score (0-100, higher is worse)
        debt_score = min(100, (
            debt_indicators['todo_comments'] * 5 +
            debt_indicators['code_duplication'] * 10 +
            debt_indicators['long_functions'] * 8 +
            debt_indicators['magic_numbers'] * 2 +
            debt_indicators['deep_nesting'] * 15
        ))
        
        debt_indicators['overall_score'] = debt_score
        debt_indicators['assessment'] = self._assess_debt_level(debt_score)
        
        return debt_indicators
    
    def _detect_code_duplication(self, content: str) -> int:
        """Simple code duplication detection"""
        lines = [line.strip() for line in content.split('\n') if line.strip()]
        duplicates = 0
        
        # Find identical lines (simple approach)
        for i, line in enumerate(lines):
            if len(line) > 20:  # Only check substantial lines
                count = lines.count(line)
                if count > 1:
                    duplicates += 1
        
        return duplicates // 2  # Avoid double counting
    
    def _count_deep_nesting(self, content: str) -> int:
        """Count deeply nested code blocks"""
        lines = content.split('\n')
        deep_nesting_count = 0
        
        for line in lines:
            # Count indentation level
            indent_level = (len(line) - len(line.lstrip())) // 4
            if indent_level > 4:  # Consider 4+ levels as deep nesting
                deep_nesting_count += 1
        
        return deep_nesting_count
    
    def _assess_debt_level(self, debt_score: int) -> str:
        """Assess technical debt level"""
        if debt_score < 20:
            return 'LOW'
        elif debt_score < 50:
            return 'MEDIUM'
        elif debt_score < 80:
            return 'HIGH'
        else:
            return 'CRITICAL'
    
    def _generate_ai_insights(self, content: str) -> Dict[str, Any]:
        """Generate AI-powered insights about the code"""
        insights = {
            'status': 'not_available',
            'summary': '',
            'recommendations': [],
            'code_quality': 'unknown'
        }
        
        if self.code_analysis_pipeline:
            try:
                # Truncate content for analysis
                analysis_text = content[:1000] + "..." if len(content) > 1000 else content
                
                # Use HuggingFace for code analysis
                result = self.code_analysis_pipeline(analysis_text)
                
                insights['status'] = 'analyzed'
                insights['classification'] = result
                insights['summary'] = f"Code analysis completed using CodeBERT model"
                insights['recommendations'] = [
                    "Consider implementing proper error handling",
                    "Add comprehensive documentation",
                    "Implement unit tests for critical functions",
                    "Review code for security best practices"
                ]
                
                # Simple quality assessment based on various factors
                if len(content.split('\n')) > 500:
                    insights['code_quality'] = 'complex'
                elif len(re.findall(r'def\s+test_', content)) > 0:
                    insights['code_quality'] = 'good'
                else:
                    insights['code_quality'] = 'moderate'
                    
            except Exception as e:
                logger.warning(f"AI insights generation failed: {e}")
                insights['status'] = 'error'
                insights['error'] = str(e)
        
        return insights
    
    @observe()
    def analyze_project_structure(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze entire project structure and provide architectural insights
        
        Args:
            project_data: Project data with files and structure
            
        Returns:
            Comprehensive project analysis
        """
        try:
            analysis_result = {
                'project_overview': self._analyze_project_overview(project_data),
                'architecture_patterns': self._detect_architecture_patterns(project_data),
                'code_quality_summary': self._summarize_code_quality(project_data),
                'security_assessment': self._assess_project_security(project_data),
                'performance_analysis': self._analyze_project_performance(project_data),
                'maintainability_score': self._calculate_maintainability_score(project_data),
                'recommendations': self._generate_project_recommendations(project_data),
                'analyzed_at': datetime.now().isoformat()
            }
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Project structure analysis failed: {e}")
            return {'error': str(e), 'analyzed_at': datetime.now().isoformat()}
    
    def _analyze_project_overview(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze high-level project characteristics"""
        files = project_data.get('files', [])
        
        # Language distribution
        language_count = {}
        total_lines = 0
        
        for file_info in files:
            file_type = self._detect_file_type(file_info.get('name', ''))
            language_count[file_type] = language_count.get(file_type, 0) + 1
            
            content = file_info.get('content', '')
            total_lines += len(content.split('\n'))
        
        primary_language = max(language_count, key=language_count.get) if language_count else 'Unknown'
        
        return {
            'total_files': len(files),
            'total_lines_of_code': total_lines,
            'primary_language': primary_language,
            'language_distribution': language_count,
            'project_size': self._categorize_project_size(total_lines),
            'file_types': list(language_count.keys())
        }
    
    def _categorize_project_size(self, total_lines: int) -> str:
        """Categorize project size based on lines of code"""
        if total_lines < 1000:
            return 'Small'
        elif total_lines < 10000:
            return 'Medium'
        elif total_lines < 100000:
            return 'Large'
        else:
            return 'Very Large'
    
    def _detect_architecture_patterns(self, project_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect architectural patterns in the project"""
        patterns = []
        files = project_data.get('files', [])
        
        # Check for common architectural patterns
        file_names = [file_info.get('name', '') for file_info in files]
        
        # MVC Pattern
        if any('controller' in name.lower() for name in file_names) and \
           any('model' in name.lower() for name in file_names) and \
           any('view' in name.lower() for name in file_names):
            patterns.append({
                'name': 'Model-View-Controller (MVC)',
                'confidence': 0.8,
                'description': 'Traditional MVC architecture pattern detected'
            })
        
        # Microservices
        if any('service' in name.lower() for name in file_names) and \
           len([name for name in file_names if 'api' in name.lower()]) > 2:
            patterns.append({
                'name': 'Microservices Architecture',
                'confidence': 0.7,
                'description': 'Multiple service components suggest microservices pattern'
            })
        
        # Repository Pattern
        if any('repository' in name.lower() for name in file_names):
            patterns.append({
                'name': 'Repository Pattern',
                'confidence': 0.9,
                'description': 'Data access abstraction through repository pattern'
            })
        
        return patterns
    
    def _summarize_code_quality(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Summarize overall code quality across the project"""
        files = project_data.get('files', [])
        
        total_metrics = {
            'total_functions': 0,
            'total_classes': 0,
            'average_complexity': 0,
            'security_issues_count': 0,
            'performance_issues_count': 0,
            'technical_debt_score': 0
        }
        
        file_count = 0
        
        for file_info in files:
            content = file_info.get('content', '')
            if content:
                file_count += 1
                metrics = self._calculate_code_metrics(content)
                total_metrics['total_functions'] += metrics.get('functions_count', 0)
                total_metrics['total_classes'] += metrics.get('classes_count', 0)
                
                # Security and performance analysis
                security_issues = self._scan_security_vulnerabilities(content)
                performance_issues = self._analyze_performance_patterns(content)
                technical_debt = self._calculate_technical_debt(content)
                
                total_metrics['security_issues_count'] += len(security_issues)
                total_metrics['performance_issues_count'] += len(performance_issues)
                total_metrics['technical_debt_score'] += technical_debt.get('overall_score', 0)
        
        # Calculate averages
        if file_count > 0:
            total_metrics['average_technical_debt'] = total_metrics['technical_debt_score'] / file_count
        
        # Overall quality assessment
        quality_score = self._calculate_overall_quality_score(total_metrics)
        
        return {
            **total_metrics,
            'analyzed_files': file_count,
            'overall_quality_score': quality_score,
            'quality_rating': self._rate_quality(quality_score)
        }
    
    def _calculate_overall_quality_score(self, metrics: Dict[str, Any]) -> float:
        """Calculate overall quality score (0-100, higher is better)"""
        base_score = 100
        
        # Deduct points for issues
        security_penalty = min(30, metrics.get('security_issues_count', 0) * 5)
        performance_penalty = min(20, metrics.get('performance_issues_count', 0) * 3)
        debt_penalty = min(40, metrics.get('average_technical_debt', 0) * 0.4)
        
        final_score = max(0, base_score - security_penalty - performance_penalty - debt_penalty)
        return round(final_score, 1)
    
    def _rate_quality(self, score: float) -> str:
        """Rate quality based on score"""
        if score >= 80:
            return 'Excellent'
        elif score >= 60:
            return 'Good'
        elif score >= 40:
            return 'Fair'
        else:
            return 'Poor'
    
    def _assess_project_security(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Assess overall project security"""
        files = project_data.get('files', [])
        
        all_security_issues = []
        security_score = 100
        
        for file_info in files:
            content = file_info.get('content', '')
            if content:
                issues = self._scan_security_vulnerabilities(content)
                for issue in issues:
                    issue['file'] = file_info.get('name', 'unknown')
                    all_security_issues.append(issue)
        
        # Calculate security score
        high_severity = len([issue for issue in all_security_issues if issue['severity'] == 'HIGH'])
        medium_severity = len([issue for issue in all_security_issues if issue['severity'] == 'MEDIUM'])
        low_severity = len([issue for issue in all_security_issues if issue['severity'] == 'LOW'])
        
        security_score -= (high_severity * 20 + medium_severity * 10 + low_severity * 5)
        security_score = max(0, security_score)
        
        return {
            'total_issues': len(all_security_issues),
            'high_severity_issues': high_severity,
            'medium_severity_issues': medium_severity,
            'low_severity_issues': low_severity,
            'security_score': security_score,
            'security_rating': self._rate_security(security_score),
            'top_issues': all_security_issues[:5]  # Top 5 issues
        }
    
    def _rate_security(self, score: float) -> str:
        """Rate security based on score"""
        if score >= 90:
            return 'Excellent'
        elif score >= 70:
            return 'Good'
        elif score >= 50:
            return 'Fair'
        else:
            return 'Poor'
    
    def _analyze_project_performance(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze project performance characteristics"""
        files = project_data.get('files', [])
        
        all_performance_issues = []
        
        for file_info in files:
            content = file_info.get('content', '')
            if content:
                issues = self._analyze_performance_patterns(content)
                for issue in issues:
                    issue['file'] = file_info.get('name', 'unknown')
                    all_performance_issues.append(issue)
        
        return {
            'total_performance_issues': len(all_performance_issues),
            'critical_issues': len([issue for issue in all_performance_issues if issue['severity'] == 'HIGH']),
            'performance_score': max(0, 100 - len(all_performance_issues) * 10),
            'top_issues': all_performance_issues[:5]
        }
    
    def _calculate_maintainability_score(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate project maintainability score"""
        files = project_data.get('files', [])
        
        total_debt_score = 0
        file_count = 0
        
        for file_info in files:
            content = file_info.get('content', '')
            if content:
                file_count += 1
                debt = self._calculate_technical_debt(content)
                total_debt_score += debt.get('overall_score', 0)
        
        average_debt = total_debt_score / file_count if file_count > 0 else 0
        maintainability_score = max(0, 100 - average_debt)
        
        return {
            'maintainability_score': round(maintainability_score, 1),
            'maintainability_rating': self._rate_quality(maintainability_score),
            'average_technical_debt': round(average_debt, 1),
            'files_analyzed': file_count
        }
    
    def _generate_project_recommendations(self, project_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate actionable recommendations for the project"""
        recommendations = []
        
        # Analyze project characteristics
        overview = self._analyze_project_overview(project_data)
        security = self._assess_project_security(project_data)
        performance = self._analyze_project_performance(project_data)
        
        # Security recommendations
        if security['high_severity_issues'] > 0:
            recommendations.append({
                'category': 'Security',
                'priority': 'HIGH',
                'title': 'Address High-Severity Security Issues',
                'description': f"Found {security['high_severity_issues']} high-severity security issues that need immediate attention."
            })
        
        # Performance recommendations
        if performance['critical_issues'] > 0:
            recommendations.append({
                'category': 'Performance',
                'priority': 'MEDIUM',
                'title': 'Optimize Performance Bottlenecks',
                'description': f"Found {performance['critical_issues']} performance issues that could impact application speed."
            })
        
        # Code quality recommendations
        if overview['project_size'] == 'Large' or overview['project_size'] == 'Very Large':
            recommendations.append({
                'category': 'Architecture',
                'priority': 'MEDIUM',
                'title': 'Consider Code Modularization',
                'description': "Large codebase detected. Consider breaking down into smaller, more manageable modules."
            })
        
        # Testing recommendations
        recommendations.append({
            'category': 'Testing',
            'priority': 'MEDIUM',
            'title': 'Implement Comprehensive Testing',
            'description': "Add unit tests, integration tests, and automated testing to improve code reliability."
        })
        
        # Documentation recommendations
        recommendations.append({
            'category': 'Documentation',
            'priority': 'LOW',
            'title': 'Improve Code Documentation',
            'description': "Add comprehensive documentation, API docs, and inline comments for better maintainability."
        })
        
        return recommendations[:10]  # Limit to top 10 recommendations
    
    def get_agent_statistics(self) -> Dict[str, Any]:
        """Get Code Lens Agent statistics and capabilities"""
        return {
            'agent_name': 'Code Lens',
            'version': '1.0.0',
            'capabilities': [
                'Deep Code Analysis',
                'Pattern Recognition',
                'Security Vulnerability Scanning',
                'Performance Analysis',
                'Complexity Metrics',
                'Technical Debt Assessment',
                'Architecture Pattern Detection',
                'HuggingFace AI Insights',
                'Langfuse Observability'
            ],
            'supported_languages': [
                'Python', 'Java', 'JavaScript', 'TypeScript',
                'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby'
            ],
            'analysis_types': [
                'File-level Analysis',
                'Project-level Analysis',
                'Security Assessment',
                'Performance Evaluation',
                'Quality Metrics'
            ],
            'ai_models': {
                'code_analysis': 'microsoft/codebert-base' if HUGGINGFACE_AVAILABLE else 'not_available',
                'observability': 'langfuse' if LANGFUSE_AVAILABLE else 'not_available'
            },
            'status': 'active'
        }

# CLI interface for testing
if __name__ == "__main__":
    def main():
        agent = CodeLensAgent()
        
        if len(sys.argv) > 1:
            file_path = sys.argv[1]
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                result = agent.analyze_code_file(file_path, content)
                print(json.dumps(result, indent=2))
            else:
                print(f"File not found: {file_path}")
        else:
            # Demo analysis
            sample_code = '''
def vulnerable_function(user_input):
    # TODO: Fix this security issue
    query = "SELECT * FROM users WHERE name = '" + user_input + "'"
    for i in range(100):
        for j in range(100):
            result = execute_query(query)
    return result

class GodClass:
    def __init__(self):
        self.data = []
    
    def method1(self): pass
    def method2(self): pass
    # ... many more methods
    '''
            
            result = agent.analyze_code_file('demo.py', sample_code)
            print(json.dumps(result, indent=2))
    
    main()