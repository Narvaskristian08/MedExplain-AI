import Document from "../documents/model/document.model.js";
import User from "../auth/model/user.model.js";
import PDFDocument from "pdfkit";

export const uploadDocument = async (req, res) => {
  try {
    const { userId, originalText } = req.body;
    if (!userId || !originalText) {
      return res.status(400).json({ message: "userId and originalText are required" });
    }
    const document = new Document({ userId, originalText });
    await document.save();
    res.status(201).json({ message: "Document uploaded", document });
  } catch (err) {
    res.status(500).json({ message: "Error uploading document", error: err.message });
  }
};

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
    // Placeholder for LLM integration (to be added)
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

//
export const exportReports = async (req, res) => {
  try {
    const documents = await Document.find();
    const doc = new PDFDocument();
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      res.setHeader("Content-Disposition", "attachment; filename=medical_reports.pdf");
      res.setHeader("Content-Type", "application/pdf");
      res.send(pdfBuffer);
    });

    doc.fontSize(20).text("Medical Reports Summary", { align: "center" });
    doc.moveDown();
    documents.forEach((docData, index) => {
      doc.fontSize(14).text(`Document ${index + 1}`, { underline: true });
      doc.text(`ID: ${docData._id}`);
      doc.text(`User ID: ${docData.userId}`);
      doc.text(`Original Text: ${docData.originalText}`);
      doc.text(`Simplified Text: ${docData.simplifiedText || "Not simplified"}`);
      doc.text(`Uploaded: ${docData.createdAt}`);
      doc.moveDown();
    });
    doc.end();
  } catch (err) {
    res.status(500).json({ message: "Error generating report", error: err.message });
  }
};