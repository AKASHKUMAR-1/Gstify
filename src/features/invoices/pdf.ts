import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface GeneratedPdf {
  blob: Blob;
  fileName: string;
}

// html2canvas can't parse oklch()/var() colors, so we flatten the most
// common color properties to explicit values on a detached clone.
function fixStyles(el: Element) {
  const style = window.getComputedStyle(el);
  const element = el as HTMLElement;

  const propertiesToFix: Array<{ css: string; inline: 'color' | 'backgroundColor' | 'borderColor' }> = [
    { css: 'color', inline: 'color' },
    { css: 'background-color', inline: 'backgroundColor' },
    { css: 'border-color', inline: 'borderColor' },
  ];

  propertiesToFix.forEach(({ css, inline }) => {
    const value = style.getPropertyValue(css);
    if (value && (value.includes('oklch') || value.includes('var('))) {
      if (inline === 'color') element.style.color = value.includes('oklch') ? '#000000' : value;
      else if (inline === 'backgroundColor') element.style.backgroundColor = value.includes('oklch') ? '#ffffff' : value;
      else if (inline === 'borderColor') element.style.borderColor = value.includes('oklch') ? '#dddddd' : value;
    }
  });

  for (let i = 0; i < el.children.length; i++) {
    fixStyles(el.children[i]);
  }
}

/** Renders an invoice DOM element to an A4 PDF blob. */
export async function generatePdfBlob(element: HTMLElement, invoiceNumber: string): Promise<GeneratedPdf> {
  const clonedElement = element.cloneNode(true) as HTMLElement;

  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    * {
      color-space: srgb !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body { background: white !important; color: #000 !important; }
    img { max-width: 100% !important; height: auto !important; display: block !important; }
  `;
  clonedElement.appendChild(styleSheet);

  clonedElement.style.position = 'fixed';
  clonedElement.style.left = '-9999px';
  clonedElement.style.top = '0';
  clonedElement.style.width = '210mm';
  clonedElement.style.visibility = 'visible';
  document.body.appendChild(clonedElement);

  fixStyles(clonedElement);

  try {
    const canvas = await html2canvas(clonedElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: clonedElement.offsetWidth,
      height: clonedElement.offsetHeight,
      windowWidth: clonedElement.offsetWidth,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    return { blob: pdf.output('blob'), fileName: `${invoiceNumber || 'Invoice'}.pdf` };
  } finally {
    if (clonedElement.parentNode) document.body.removeChild(clonedElement);
  }
}
