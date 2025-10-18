import html2pdf from 'html2pdf.js';

export class HTMLExportService {
  async exportToPDF(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Export element not found');
    }

    const opt = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF export error:', error);
      throw new Error('Failed to export PDF');
    }
  }

  async exportToDOCX(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Export element not found');
    }

    try {
      // Create Word-compatible HTML with proper XML namespaces
      const htmlContent = element.innerHTML;
      
      const wordDocument = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>Document</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page {
              size: 8.5in 11in;
              margin: 1in;
            }
            body {
              font-family: Calibri, Arial, sans-serif;
              font-size: 11pt;
              line-height: 1.5;
              color: #000000;
            }
            h1 {
              font-size: 24pt;
              font-weight: bold;
              margin-top: 12pt;
              margin-bottom: 12pt;
              color: #1a1a1a;
            }
            h2 {
              font-size: 18pt;
              font-weight: bold;
              margin-top: 10pt;
              margin-bottom: 8pt;
              color: #1a1a1a;
            }
            h3 {
              font-size: 14pt;
              font-weight: bold;
              margin-top: 8pt;
              margin-bottom: 6pt;
              color: #1a1a1a;
            }
            p {
              margin-top: 6pt;
              margin-bottom: 6pt;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 10pt 0;
            }
            th, td {
              border: 1pt solid #cccccc;
              padding: 8pt;
              text-align: left;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            ul, ol {
              margin-left: 20pt;
            }
            li {
              margin-bottom: 4pt;
            }
            img {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `;

      // Create blob with proper MIME type for Word
      const blob = new Blob(['\ufeff', wordDocument], {
        type: 'application/vnd.ms-word'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('DOCX export error:', error);
      throw new Error('Failed to export DOCX');
    }
  }

  async exportToHTML(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Export element not found');
    }

    try {
      // Get the computed styles from the current document
      const clonedElement = element.cloneNode(true) as HTMLElement;
      const htmlContent = clonedElement.innerHTML;
      
      const htmlDocument = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Analysis Report</title>
  <style>
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 0.875rem;
      line-height: 1.7142857;
      color: #374151;
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      background-color: #ffffff;
    }
    
    h1 {
      font-size: 2.25rem;
      font-weight: 700;
      margin-top: 1rem;
      margin-bottom: 1rem;
      color: #111827;
      line-height: 1.1111111;
    }
    
    h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-top: 2rem;
      margin-bottom: 1rem;
      color: #111827;
      line-height: 1.3333333;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 0.5rem;
    }
    
    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-top: 1.6rem;
      margin-bottom: 0.6rem;
      color: #111827;
      line-height: 1.6;
    }
    
    h4 {
      font-size: 1rem;
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
      color: #374151;
      line-height: 1.5;
    }
    
    p {
      margin-top: 1rem;
      margin-bottom: 1rem;
      color: #374151;
    }
    
    strong {
      font-weight: 600;
      color: #111827;
    }
    
    em {
      font-style: italic;
    }
    
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 2rem 0;
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      font-size: 0.875rem;
    }
    
    thead {
      background-color: #f9fafb;
    }
    
    th {
      border: 1px solid #e5e7eb;
      padding: 0.75rem 1rem;
      text-align: left;
      font-weight: 600;
      color: #111827;
      background-color: #f9fafb;
    }
    
    td {
      border: 1px solid #e5e7eb;
      padding: 0.75rem 1rem;
      text-align: left;
      color: #374151;
    }
    
    tbody tr:nth-child(odd) {
      background-color: #ffffff;
    }
    
    tbody tr:nth-child(even) {
      background-color: #f9fafb;
    }
    
    ul, ol {
      margin-top: 1rem;
      margin-bottom: 1rem;
      padding-left: 1.625rem;
    }
    
    li {
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
      color: #374151;
    }
    
    ul > li {
      padding-left: 0.375rem;
    }
    
    ol > li {
      padding-left: 0.375rem;
    }
    
    img {
      max-width: 100%;
      height: auto;
      margin: 1.5rem 0;
      border-radius: 0.5rem;
    }
    
    code {
      background-color: #f3f4f6;
      color: #111827;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 0.875em;
    }
    
    pre {
      background-color: #1f2937;
      color: #f9fafb;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin: 1.5rem 0;
    }
    
    pre code {
      background-color: transparent;
      color: #f9fafb;
      padding: 0;
    }
    
    .text-muted-foreground {
      color: #6b7280;
    }
    
    .text-center {
      text-align: center;
    }
    
    .mb-4 {
      margin-bottom: 1rem;
    }
    
    .mb-8 {
      margin-bottom: 2rem;
    }
    
    .mb-12 {
      margin-bottom: 3rem;
    }
    
    .pb-12 {
      padding-bottom: 3rem;
    }
    
    .border-b {
      border-bottom-width: 1px;
      border-bottom-color: #e5e7eb;
    }
    
    section {
      margin-bottom: 2rem;
    }
    
    .text-xl {
      font-size: 1.25rem;
      line-height: 1.75rem;
    }
    
    .text-sm {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
    
    .text-4xl {
      font-size: 2.25rem;
      line-height: 2.5rem;
    }
    
    .font-bold {
      font-weight: 700;
    }
    
    .mt-4 {
      margin-top: 1rem;
    }
    
    .mt-2 {
      margin-top: 0.5rem;
    }
    
    /* Badge styles */
    .inline-flex {
      display: inline-flex;
    }
    
    .items-center {
      align-items: center;
    }
    
    .rounded-full {
      border-radius: 9999px;
    }
    
    .px-2 {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }
    
    .py-1 {
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
    }
    
    .bg-blue-100 {
      background-color: #dbeafe;
    }
    
    .bg-green-100 {
      background-color: #dcfce7;
    }
    
    .bg-yellow-100 {
      background-color: #fef3c7;
    }
    
    .bg-red-100 {
      background-color: #fee2e2;
    }
    
    .text-blue-800 {
      color: #1e40af;
    }
    
    .text-green-800 {
      color: #166534;
    }
    
    .text-yellow-800 {
      color: #854d0e;
    }
    
    .text-red-800 {
      color: #991b1b;
    }
    
    /* Card styles */
    .bg-gray-50 {
      background-color: #f9fafb;
    }
    
    .rounded-lg {
      border-radius: 0.5rem;
    }
    
    .p-4 {
      padding: 1rem;
    }
    
    .p-6 {
      padding: 1.5rem;
    }
    
    .shadow {
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
    }
    
    @media print {
      body {
        background-color: white;
      }
      
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>
      `;

      const blob = new Blob([htmlDocument], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('HTML export error:', error);
      throw new Error('Failed to export HTML');
    }
  }
}

export const htmlExportService = new HTMLExportService();
