import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export interface SonarAnalysisResult {
  issues: SonarIssue[];
  metrics: SonarMetrics;
  duplications: SonarDuplication[];
  coverage: SonarCoverage;
  summary: SonarSummary;
}

export interface SonarIssue {
  key: string;
  rule: string;
  severity: 'BLOCKER' | 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';
  component: string;
  project: string;
  line?: number;
  hash: string;
  textRange?: {
    startLine: number;
    endLine: number;
    startOffset: number;
    endOffset: number;
  };
  flows: any[];
  status: string;
  message: string;
  effort: string;
  debt: string;
  assignee?: string;
  author: string;
  tags: string[];
  type: 'CODE_SMELL' | 'BUG' | 'VULNERABILITY' | 'SECURITY_HOTSPOT';
  scope: string;
  quickFixAvailable: boolean;
}

export interface SonarMetrics {
  linesOfCode: number;
  statements: number;
  functions: number;
  classes: number;
  files: number;
  directories: number;
  complexity: number;
  cognitiveComplexity: number;
  duplicatedLines: number;
  duplicatedBlocks: number;
  duplicatedFiles: number;
  duplicatedLinesPercentage: number;
  reliabilityRating: string;
  securityRating: string;
  maintainabilityRating: string;
  technicalDebt: string;
  testCoverage?: number;
  unitTests?: number;
  testSuccesses?: number;
  testErrors?: number;
  testFailures?: number;
}

export interface SonarDuplication {
  blocks: {
    from: number;
    size: number;
    _ref: string;
  }[];
}

export interface SonarCoverage {
  linesCovered: number;
  linesTotal: number;
  coveragePercentage: number;
  conditionsCovered: number;
  conditionsTotal: number;
  branchCoveragePercentage: number;
}

export interface SonarSummary {
  qualityGate: 'PASSED' | 'FAILED' | 'ERROR';
  bugs: number;
  vulnerabilities: number;
  codeSmells: number;
  securityHotspots: number;
  newBugs: number;
  newVulnerabilities: number;
  newCodeSmells: number;
  reliabilityRating: 'A' | 'B' | 'C' | 'D' | 'E';
  securityRating: 'A' | 'B' | 'C' | 'D' | 'E';
  maintainabilityRating: 'A' | 'B' | 'C' | 'D' | 'E';
}

export class SonarAnalyzer {
  private sonarScannerPath: string;
  private sonarServerUrl: string;

  constructor(sonarServerUrl = 'http://localhost:9000', sonarScannerPath = 'sonar-scanner') {
    this.sonarServerUrl = sonarServerUrl;
    this.sonarScannerPath = sonarScannerPath;
  }

  async analyzeProject(projectPath: string, projectKey: string): Promise<SonarAnalysisResult> {
    try {
      // Check if SonarQube is available
      await this.checkSonarQubeAvailability();
      
      // Run SonarQube analysis
      await this.runSonarScanner(projectPath, projectKey);
      
      // Fetch analysis results
      const results = await this.fetchAnalysisResults(projectKey);
      
      return results;
    } catch (error) {
      console.warn('SonarQube analysis not available, using static analysis fallback:', error);
      return this.performStaticAnalysis(projectPath);
    }
  }

  private async checkSonarQubeAvailability(): Promise<void> {
    try {
      const response = await fetch(`${this.sonarServerUrl}/api/system/status`);
      if (!response.ok) {
        throw new Error('SonarQube server not available');
      }
    } catch (error) {
      throw new Error('SonarQube server not accessible');
    }
  }

  private async runSonarScanner(projectPath: string, projectKey: string): Promise<void> {
    const command = `${this.sonarScannerPath} ` +
      `-Dsonar.projectKey=${projectKey} ` +
      `-Dsonar.sources=${projectPath} ` +
      `-Dsonar.host.url=${this.sonarServerUrl} ` +
      `-Dsonar.java.source=11 ` +
      `-Dsonar.java.binaries=${projectPath}`;

    await execAsync(command, { cwd: projectPath });
  }

  private async fetchAnalysisResults(projectKey: string): Promise<SonarAnalysisResult> {
    const [issues, metrics, duplications] = await Promise.all([
      this.fetchIssues(projectKey),
      this.fetchMetrics(projectKey),
      this.fetchDuplications(projectKey)
    ]);

    const summary = this.calculateSummary(issues, metrics);
    const coverage = this.extractCoverage(metrics);

    return {
      issues,
      metrics,
      duplications,
      coverage,
      summary
    };
  }

  private async fetchIssues(projectKey: string): Promise<SonarIssue[]> {
    const response = await fetch(
      `${this.sonarServerUrl}/api/issues/search?componentKeys=${projectKey}&ps=500`
    );
    const data = await response.json();
    return data.issues || [];
  }

  private async fetchMetrics(projectKey: string): Promise<SonarMetrics> {
    const metricKeys = [
      'ncloc', 'statements', 'functions', 'classes', 'files', 'directories',
      'complexity', 'cognitive_complexity', 'duplicated_lines', 'duplicated_blocks',
      'duplicated_files', 'duplicated_lines_density', 'reliability_rating',
      'security_rating', 'sqale_rating', 'sqale_index', 'coverage',
      'tests', 'test_success_density', 'test_errors', 'test_failures'
    ].join(',');

    const response = await fetch(
      `${this.sonarServerUrl}/api/measures/component?component=${projectKey}&metricKeys=${metricKeys}`
    );
    const data = await response.json();
    
    return this.parseMetrics(data.component?.measures || []);
  }

  private async fetchDuplications(projectKey: string): Promise<SonarDuplication[]> {
    const response = await fetch(
      `${this.sonarServerUrl}/api/duplications/show?key=${projectKey}`
    );
    const data = await response.json();
    return data.duplications || [];
  }

  private parseMetrics(measures: any[]): SonarMetrics {
    const getMetricValue = (key: string, defaultValue: any = 0) => {
      const measure = measures.find(m => m.metric === key);
      return measure?.value || defaultValue;
    };

    return {
      linesOfCode: parseInt(getMetricValue('ncloc')),
      statements: parseInt(getMetricValue('statements')),
      functions: parseInt(getMetricValue('functions')),
      classes: parseInt(getMetricValue('classes')),
      files: parseInt(getMetricValue('files')),
      directories: parseInt(getMetricValue('directories')),
      complexity: parseInt(getMetricValue('complexity')),
      cognitiveComplexity: parseInt(getMetricValue('cognitive_complexity')),
      duplicatedLines: parseInt(getMetricValue('duplicated_lines')),
      duplicatedBlocks: parseInt(getMetricValue('duplicated_blocks')),
      duplicatedFiles: parseInt(getMetricValue('duplicated_files')),
      duplicatedLinesPercentage: parseFloat(getMetricValue('duplicated_lines_density')),
      reliabilityRating: getMetricValue('reliability_rating', 'A'),
      securityRating: getMetricValue('security_rating', 'A'),
      maintainabilityRating: getMetricValue('sqale_rating', 'A'),
      technicalDebt: getMetricValue('sqale_index', '0min'),
      testCoverage: parseFloat(getMetricValue('coverage')) || undefined,
      unitTests: parseInt(getMetricValue('tests')) || undefined,
      testSuccesses: undefined,
      testErrors: parseInt(getMetricValue('test_errors')) || undefined,
      testFailures: parseInt(getMetricValue('test_failures')) || undefined,
    };
  }

  private calculateSummary(issues: SonarIssue[], metrics: SonarMetrics): SonarSummary {
    const bugs = issues.filter(i => i.type === 'BUG').length;
    const vulnerabilities = issues.filter(i => i.type === 'VULNERABILITY').length;
    const codeSmells = issues.filter(i => i.type === 'CODE_SMELL').length;
    const securityHotspots = issues.filter(i => i.type === 'SECURITY_HOTSPOT').length;

    return {
      qualityGate: (bugs === 0 && vulnerabilities === 0) ? 'PASSED' : 'FAILED',
      bugs,
      vulnerabilities,
      codeSmells,
      securityHotspots,
      newBugs: 0,
      newVulnerabilities: 0,
      newCodeSmells: 0,
      reliabilityRating: metrics.reliabilityRating as any,
      securityRating: metrics.securityRating as any,
      maintainabilityRating: metrics.maintainabilityRating as any,
    };
  }

  private extractCoverage(metrics: SonarMetrics): SonarCoverage {
    return {
      linesCovered: 0,
      linesTotal: metrics.linesOfCode,
      coveragePercentage: metrics.testCoverage || 0,
      conditionsCovered: 0,
      conditionsTotal: 0,
      branchCoveragePercentage: 0,
    };
  }

  // Fallback static analysis when SonarQube is not available
  private async performStaticAnalysis(projectPath: string): Promise<SonarAnalysisResult> {
    const javaFiles = await this.findJavaFiles(projectPath);
    const issues: SonarIssue[] = [];
    let totalLines = 0;
    let totalClasses = 0;
    let totalMethods = 0;
    let complexity = 0;

    for (const filePath of javaFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      totalLines += lines.length;

      // Basic static analysis
      const fileIssues = this.analyzeJavaFile(content, filePath);
      issues.push(...fileIssues);

      // Count classes and methods
      totalClasses += (content.match(/class\s+\w+/g) || []).length;
      totalMethods += (content.match(/(public|private|protected)\s+\w+\s+\w+\s*\(/g) || []).length;
      
      // Basic complexity calculation
      complexity += this.calculateComplexity(content);
    }

    const metrics: SonarMetrics = {
      linesOfCode: totalLines,
      statements: Math.floor(totalLines * 0.6), // Estimate
      functions: totalMethods,
      classes: totalClasses,
      files: javaFiles.length,
      directories: new Set(javaFiles.map(f => path.dirname(f))).size,
      complexity,
      cognitiveComplexity: Math.floor(complexity * 1.2),
      duplicatedLines: 0,
      duplicatedBlocks: 0,
      duplicatedFiles: 0,
      duplicatedLinesPercentage: 0,
      reliabilityRating: 'A',
      securityRating: 'A',
      maintainabilityRating: issues.length > 10 ? 'B' : 'A',
      technicalDebt: `${issues.length * 5}min`,
    };

    const summary = this.calculateSummary(issues, metrics);
    const coverage = this.extractCoverage(metrics);

    return {
      issues,
      metrics,
      duplications: [],
      coverage,
      summary
    };
  }

  private async findJavaFiles(projectPath: string): Promise<string[]> {
    const files: string[] = [];
    
    const scan = (dir: string) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          scan(fullPath);
        } else if (item.endsWith('.java')) {
          files.push(fullPath);
        }
      }
    };

    scan(projectPath);
    return files;
  }

  private analyzeJavaFile(content: string, filePath: string): SonarIssue[] {
    const issues: SonarIssue[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Check for common code smells
      if (line.includes('System.out.println')) {
        issues.push(this.createIssue(
          'java:S106',
          'MINOR',
          'CODE_SMELL',
          'Replace this use of System.out by a logger.',
          filePath,
          lineNumber
        ));
      }

      if (line.match(/catch\s*\(\s*Exception\s+\w+\s*\)\s*\{/)) {
        issues.push(this.createIssue(
          'java:S1181',
          'MAJOR',
          'CODE_SMELL',
          'Catch a more specific exception instead of Exception.',
          filePath,
          lineNumber
        ));
      }

      if (line.includes('TODO') || line.includes('FIXME')) {
        issues.push(this.createIssue(
          'java:S1135',
          'INFO',
          'CODE_SMELL',
          'Complete the task associated to this "TODO" comment.',
          filePath,
          lineNumber
        ));
      }

      // Check for long lines
      if (line.length > 120) {
        issues.push(this.createIssue(
          'java:S103',
          'MINOR',
          'CODE_SMELL',
          'Split this line to respect the maximum line length.',
          filePath,
          lineNumber
        ));
      }
    });

    return issues;
  }

  private createIssue(
    rule: string,
    severity: SonarIssue['severity'],
    type: SonarIssue['type'],
    message: string,
    component: string,
    line: number
  ): SonarIssue {
    return {
      key: `${rule}-${component}-${line}`,
      rule,
      severity,
      component,
      project: 'analyzed-project',
      line,
      hash: `${rule}-${line}`,
      flows: [],
      status: 'OPEN',
      message,
      effort: '5min',
      debt: '5min',
      author: 'static-analyzer',
      tags: [],
      type,
      scope: 'MAIN',
      quickFixAvailable: false,
    };
  }

  private calculateComplexity(content: string): number {
    let complexity = 1; // Base complexity

    // Count decision points
    complexity += (content.match(/\bif\b/g) || []).length;
    complexity += (content.match(/\belse\b/g) || []).length;
    complexity += (content.match(/\bfor\b/g) || []).length;
    complexity += (content.match(/\bwhile\b/g) || []).length;
    complexity += (content.match(/\bcase\b/g) || []).length;
    complexity += (content.match(/\bcatch\b/g) || []).length;
    complexity += (content.match(/\&\&|\|\|/g) || []).length;

    return complexity;
  }
}

export const sonarAnalyzer = new SonarAnalyzer();