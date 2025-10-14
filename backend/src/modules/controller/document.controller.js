import Document from "../documents/model/document.model.js";
import User from "../auth/model/user.model.js";
import PDFDocument from "pdfkit";
import multer from "multer";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

//
export const uploadDocument = async (req, res) => {
  try {
    const { userId } = req.body;
    let originalText = req.body.originalText;

    if (req.file) {
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      // Convert Buffer to Uint8Array
      const uint8Array = new Uint8Array(req.file.buffer);
      const loadingTask = getDocument({ data: uint8Array });
      const pdf = await loadingTask.promise;
      let text = '';
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ');
      }
      originalText = text.trim();
    } else if (!originalText) {
      return res.status(400).json({ message: "originalText or pdfFile is required" });
    }

    const document = new Document({ userId, originalText });
    await document.save();
    res.status(201).json({ message: "Document uploaded", document });
  } catch (err) {
    res.status(500).json({ message: "Error uploading document", error: err.message });
  }
};

// 
export const simplifyDocument = async (req, res) => {
  try {
    const { documentId } = req.body;
    if (!documentId) {
      return res.status(400).json({ message: "documentId is required" });
    }
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    document.simplifiedText = "Simplified version of " + document.originalText; // Dummy text
    await document.save();
    res.json({ message: "Document simplified", document });
  } catch (err) {
    res.status(500).json({ message: "Error simplifying document", error: err.message });
  }
};

// Stats
export const getStats = async (req, res) => {
  try {
    const totalDocuments = await Document.countDocuments();
    const recentDocuments = await Document.find().sort({ createdAt: -1 }).limit(5);
    const totalUsers = await User.countDocuments();
    const documentsByUser = await Document.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 }}}
    ])
    res.json({
      message: "Admin stats retrieved",
      stats: { totalDocuments, recentDocuments, totalUsers, documentsByUser }
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats", error: err.message });
  }
};

// Glossary 
export const generateGlossary = async (req, res) => {
  try {
    const documents = await Document.find();
    const terms = new Set();
    const medicalTermRegex = /[A-Z][a-z]+(?:\s[A-Z][a-z]+)?/; // Matches single or two-word capitalized terms
    documents.forEach(doc => {
      const potentialTerms = doc.originalText.match(medicalTermRegex) || [];
      potentialTerms.forEach(term => terms.add(term.trim()));
    });
    const glossary = {};
    terms.forEach(term => {
      glossary[term] = `Simplified explanation of ${term.toLowerCase()}`; // Dummy simplification
    });
    res.json({
      message: "Glossary generated",
      glossary
    });
  } catch (err) {
    res.status(500).json({ message: "Error generating glossary", error: err.message });
  }
};

// New: Glossary Export
export const exportGlossary = async (req, res) => {
  try {
    const { format = 'pdf' } = req.query; // Default to PDF if no format specified
    if (!['pdf', 'json'].includes(format)) {
      return res.status(400).json({ message: "Invalid format. Use 'pdf' or 'json'" });
    }

    const documents = await Document.find();
    const terms = new Set();
    const medicalTermRegex = /[A-Z][a-z]+(?:\s[A-Z][a-z]+)?/;
    documents.forEach(doc => {
      const potentialTerms = doc.originalText.match(medicalTermRegex) || [];
      potentialTerms.forEach(term => terms.add(term.trim()));
    });
    const glossary = {};
    terms.forEach(term => {
      glossary[term] = `Simplified explanation of ${term.toLowerCase()}`; // Dummy simplification
    });

    if (format === 'json') {
      const filename = `glossary_${new Date().toISOString().split('T')[0]}.json`;
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.setHeader("Content-Type", "application/json");
      return res.json({ message: "Glossary exported", glossary });
    }

    // PDF Export
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      const filename = `glossary_${new Date().toISOString().split('T')[0]}.pdf`;
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.setHeader("Content-Type", "application/pdf");
      res.send(pdfBuffer);
    });

    // STYLING: Title with color and larger font
    doc.fontSize(24)
       .fillColor('#2c3e50')
       .text("MedExplain AI - Medical Glossary", { align: "center" });
    doc.moveDown(1);

    // TABLE-LIKE LAYOUT with aligned headers and rows
    const startY = doc.y;
    const col1X = 50;
    const col2X = 260;
    const rowHeight = 20;

    // Headers
    doc.fontSize(12)
       .fillColor('#2c3e50')
       .font('Helvetica-Bold')
       .text("Term", col1X, startY, { width: 200, align: "left" })
       .text("Definition", col2X, startY, { width: 250, align: "left" });

    // Data rows
    let currentY = startY + rowHeight;
    Object.entries(glossary).forEach(([term, definition]) => {
      doc.fontSize(10)
         .fillColor('#34495e')
         .text(term, col1X, currentY, { width: 200, align: "left" })
         .text(definition, col2X, currentY, { width: 250, align: "left" });
      currentY += rowHeight;
    });

    // Footer
    doc.moveTo(col1X, currentY + 20)
       .fontSize(10)
       .fillColor('#7f8c8d')
       .text(`Generated: ${new Date().toLocaleString()} | Total Terms: ${Object.keys(glossary).length}`, { align: "center", width: 350 });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: "Error exporting glossary", error: err.message });
  }
};

// Report Exporting
export const exportReports = async (req, res) => {
  try {
    // Parse query parameters for filtering
    const { userId, dateFrom, dateTo } = req.query;
    
    // Build filter object
    let filter = {};
    if (userId) filter.userId = userId;
    if (dateFrom) filter.createdAt = { $gte: new Date(dateFrom) };
    if (dateTo) filter.createdAt = { ...filter.createdAt, $lte: new Date(dateTo) };

    const documents = await Document.find(filter).sort({ createdAt: -1 });
    
    if (documents.length === 0) {
      return res.status(404).json({ message: "No documents found for the specified filters" });
    }

    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      const filename = `medical_reports_${new Date().toISOString().split('T')[0]}.pdf`;
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.setHeader("Content-Type", "application/pdf");
      res.send(pdfBuffer);
    });

    // STYLING: Title with color and larger font
    doc.fontSize(24)
       .fillColor('#2c3e50')
       .text("MedExplain AI - Medical Reports", { align: "center" });
    doc.moveDown();

    // Filter info
    if (userId || dateFrom || dateTo) {
      doc.fontSize(12)
         .fillColor('#7f8c8d')
         .text(`Filter: ${userId ? `User ${userId.substring(0,8)}...` : ''}${dateFrom ? ` From ${dateFrom}` : ''}${dateTo ? ` To ${dateTo}` : ''}`, { align: "center" });
      doc.moveDown();
    }

    // TABLE-LIKE LAYOUT for each document
    documents.forEach((docData, index) => {
      doc.moveDown(0.5);
      
      // Document header - bold and colored
      doc.fontSize(16)
         .fillColor('#3498db')
         .font('Helvetica-Bold')
         .text(`Document ${index + 1}`, { underline: true });
      doc.moveDown();

      // Details in table-like format
      const details = [
        [`ID:`, docData._id.toString()],
        [`User ID:`, docData.userId.toString()],
        [`Original:`, docData.originalText],
        [`Simplified:`, docData.simplifiedText || "Not simplified"],
        [`Uploaded:`, docData.createdAt.toLocaleString()]
      ];

      details.forEach(([label, value]) => {
        doc.fontSize(10)
           .fillColor('#2c3e50')
           .text(label, { continued: true })
           .fillColor('#34495e')
           .text(value);
        doc.moveDown(0.2);
      });

      doc.moveDown(0.5);
    });

    // Footer
    doc.moveDown(2);
    doc.fontSize(10)
       .fillColor('#7f8c8d')
       .text(`Generated: ${new Date().toLocaleString()} | Total: ${documents.length} documents`, { align: "center" });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: "Error generating report", error: err.message });
  }
};