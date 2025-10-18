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
      const htmlContent = element.innerHTML;
      
      const htmlDocument = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Analysis Report</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9fafb;
    }
    h1 {
      font-size: 2.5em;
      font-weight: bold;
      margin-top: 20px;
      margin-bottom: 20px;
      color: #1a1a1a;
    }
    h2 {
      font-size: 2em;
      font-weight: bold;
      margin-top: 30px;
      margin-bottom: 15px;
      color: #1a1a1a;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
    }
    h3 {
      font-size: 1.5em;
      font-weight: bold;
      margin-top: 20px;
      margin-bottom: 10px;
      color: #1a1a1a;
    }
    h4 {
      font-size: 1.2em;
      font-weight: bold;
      margin-top: 15px;
      margin-bottom: 8px;
      color: #374151;
    }
    p {
      margin-top: 10px;
      margin-bottom: 10px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 15px 0;
      background-color: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #f3f4f6;
      font-weight: bold;
      color: #1f2937;
    }
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    ul, ol {
      margin-left: 30px;
      margin-bottom: 15px;
    }
    li {
      margin-bottom: 8px;
    }
    img {
      max-width: 100%;
      height: auto;
      margin: 15px 0;
    }
    .prose {
      background-color: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    code {
      background-color: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    pre {
      background-color: #1f2937;
      color: #f9fafb;
      padding: 15px;
      border-radius: 6px;
      overflow-x: auto;
    }
    pre code {
      background-color: transparent;
      color: #f9fafb;
    }
    .text-muted-foreground {
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="prose">
    ${htmlContent}
  </div>
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
