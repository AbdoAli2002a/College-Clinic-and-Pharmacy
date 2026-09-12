import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

const regexPost = /app\.post\('\/api\/medications', async \(req, res\) => {[\s\S]*?res\.status\(500\)\.json\({ error: 'Failed to add medication' }\);\s*}\s*}\);/;
const replacementPost = `app.post('/api/medications', async (req, res) => {
    try {
      const { barcode, name, category, quantity, reorderLevel, expiryDate, userId, userName } = req.body;
      const [newMed] = await db.insert(medications).values({
        barcode,
        name,
        category,
        quantity: parseInt(quantity) || 0,
        reorderLevel: parseInt(reorderLevel) || 10,
        expiryDate: expiryDate ? new Date(expiryDate) : null
      }).returning();
      
      if (userId) {
        await logAudit(userId, userName, 'إضافة دواء', 'Medication', newMed.id.toString(), \`تم إضافة الدواء \${name}\`);
      }
      
      res.status(201).json(newMed);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add medication' });
    }
  });`;

content = content.replace(regexPost, replacementPost);

const regexPut = /app\.put\('\/api\/medications\/:id', async \(req, res\) => {[\s\S]*?res\.status\(500\)\.json\({ error: 'Failed to update medication' }\);\s*}\s*}\);/;
const replacementPut = `app.put('/api/medications/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { barcode, name, category, quantity, reorderLevel, expiryDate, userId, userName } = req.body;
      const [updated] = await db.update(medications)
        .set({ 
          barcode, 
          name, 
          category,
          quantity: parseInt(quantity), 
          reorderLevel: parseInt(reorderLevel),
          expiryDate: expiryDate ? new Date(expiryDate) : null
         })
        .where(eq(medications.id, id))
        .returning();
      
      if (userId && updated) {
        await logAudit(userId, userName, 'تعديل دواء', 'Medication', updated.id.toString(), \`تم تعديل بيانات أو كمية الدواء \${name}\`);
      }
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update medication' });
    }
  });`;

content = content.replace(regexPut, replacementPut);
fs.writeFileSync('server.ts', content);
