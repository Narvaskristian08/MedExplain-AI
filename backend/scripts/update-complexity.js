// backend/scripts/update-complexity.js
import mongoose from 'mongoose';
import Document from '../src/modules/documents/model/document.model.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const documents = await Document.find();
    for (const doc of documents) {
      const words = doc.originalText.split(' ').filter(word => word.length > 0);
      doc.complexityScore = words.length > 0 ? words.reduce((sum, word) => sum + word.length, 0) / words.length : 0;
      await doc.save();
    }
    console.log('Updated complexity scores');
    mongoose.disconnect();
  })
  .catch(err => console.error(err));