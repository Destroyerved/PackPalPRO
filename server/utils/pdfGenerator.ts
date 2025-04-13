import PDFDocument from 'pdfkit';
import { type Event, type Item, type Category } from '@shared/schema';

interface ChecklistData {
  event: Event;
  categories: Category[];
  items: Item[];
}

export async function generateChecklistPDF(data: ChecklistData): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];

  // Collect PDF chunks
  doc.on('data', (chunk) => chunks.push(chunk));

  // Header
  doc
    .fontSize(25)
    .text(data.event.name, { align: 'center' })
    .moveDown();

  // Event details
  doc
    .fontSize(14)
    .text(`Date: ${data.event.startDate ? new Date(data.event.startDate).toLocaleDateString() : 'Not specified'}`)
    .text(`Location: ${data.event.location || 'Not specified'}`)
    .moveDown();

  // Categories and Items
  data.categories.forEach((category) => {
    doc
      .fontSize(16)
      .text(category.name)
      .moveDown(0.5);

    const categoryItems = data.items.filter(item => item.categoryId === category.id);
    
    categoryItems.forEach(item => {
      doc
        .fontSize(12)
        .text(`☐ ${item.name}`, { continued: true })
        .fontSize(10)
        .text(` - ${item.description || ''}`)
        .moveDown(0.2);

      if (item.assignedTo) {
        doc
          .fontSize(10)
          .text(`   Assigned to: ${item.assignedTo}`)
          .moveDown(0.2);
      }
    });

    doc.moveDown();
  });

  // Footer
  doc
    .fontSize(10)
    .text(
      `Generated on ${new Date().toLocaleString()}`,
      { align: 'center' }
    );

  // Finalize the PDF
  doc.end();

  // Return promise that resolves with the complete PDF data
  return new Promise((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
} 