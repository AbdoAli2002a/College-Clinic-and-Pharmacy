import express from 'express';
import path from 'path';
import { db } from './src/db/index';
import { users, studentsMedicalRecords, medications, prescriptions, prescriptionItems, appointments, clinicQueue, auditLogs } from './src/db/schema';
import { eq, desc } from 'drizzle-orm';
import 'dotenv/config';

async function logAudit(userId: string, userName: string, action: string, entity: string, entityId: string | null = null, details: string | null = null) {
  try {
    await db.insert(auditLogs).values({
      userId,
      userName,
      action,
      entity,
      entityId,
      details
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoints
  
  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    console.log("LOGIN ATTEMPT:", username, password);
    try {
      const userList = await db.select().from(users).where(eq(users.username, username));
      console.log("FOUND USERS:", userList);
      const user = userList[0];

      if (user && user.password === password) {
        // Don't send password back
        const { password: _, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword });
      } else {
        res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
  });

  // User Management
  app.get('/api/users', async (req, res) => {
    try {
      const allUsers = await db.select().from(users).where(eq(users.role, 'doctor')).execute()
      const pharmacists = await db.select().from(users).where(eq(users.role, 'pharmacist')).execute()
      const admins = await db.select().from(users).where(eq(users.role, 'admin')).execute()
      res.json([...allUsers, ...pharmacists, ...admins]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const { name, username, password, role } = req.body;
      const id = 'user_' + Date.now();
      await db.insert(users).values({
        id,
        name,
        username,
        password,
        role
      });
      res.status(201).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  app.put('/api/users/:id', async (req, res) => {
    try {
      const { name, username, password, role } = req.body;
      const updateData: any = { name, username, role };
      if (password) updateData.password = password; // only update password if provided
      
      await db.update(users).set(updateData).where(eq(users.id, req.params.id));
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  app.delete('/api/users/:id', async (req, res) => {
    try {
      await db.delete(users).where(eq(users.id, req.params.id));
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // 0. Get all students
  app.get('/api/students', async (req, res) => {
    try {
      const allStudents = await db.query.studentsMedicalRecords.findMany({
        with: { 
          user: true,
          prescriptions: {
            with: {
              items: {
                with: { medication: true }
              }
            }
          }
        }
      });
      res.json(allStudents);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  });

  // 0.5 Add a new student
  app.post('/api/students', async (req, res) => {
    try {
      const { name, universityId, email, bloodType, allergies, chronicDiseases, userId: adminId, userName: adminName } = req.body;
      const userId = 'user_std_' + Date.now();
      
      await db.insert(users).values({
        id: userId,
        name,
        email: email || `${universityId}@univ.edu`,
        role: 'student'
      });
      
      await db.insert(studentsMedicalRecords).values({
        universityId,
        userId,
        bloodType: bloodType || 'غير معروف',
        allergies: allergies || 'لا يوجد',
        chronicDiseases: chronicDiseases || 'لا يوجد'
      });
      
      if (adminId) {
        await logAudit(adminId, adminName, 'إضافة مريض', 'Student', universityId, `تم إضافة ملف طبي جديد للمريض ${name} (${universityId})`);
      }

      res.status(201).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add student' });
    }
  });

  app.put('/api/students/:id', async (req, res) => {
    try {
      const { name, bloodType, allergies, chronicDiseases, userId: adminId, userName: adminName, internalUserId } = req.body;
      
      if (internalUserId) {
        await db.update(users).set({ name }).where(eq(users.id, internalUserId));
      }

      await db.update(studentsMedicalRecords).set({
        bloodType,
        allergies,
        chronicDiseases
      }).where(eq(studentsMedicalRecords.universityId, req.params.id));
      
      if (adminId) {
        await logAudit(adminId, adminName, 'تعديل بيانات مريض', 'Student', req.params.id, `تم تعديل بيانات المريض ${name || ''} (${req.params.id})`);
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update student' });
    }
  });

  app.delete('/api/students/:id', async (req, res) => {
    try {
      const { userId: adminId, userName: adminName } = req.body;
      
      // We should theoretically delete from users table too if we have internalUserId, but cascade might be better, or we just delete the medical record.
      // Fetch the student first to get internal userId
      const student = await db.query.studentsMedicalRecords.findFirst({
        where: eq(studentsMedicalRecords.universityId, req.params.id)
      });

      if (student) {
        await db.delete(studentsMedicalRecords).where(eq(studentsMedicalRecords.universityId, req.params.id));
        await db.delete(users).where(eq(users.id, student.userId));
        
        if (adminId) {
          await logAudit(adminId, adminName, 'حذف مريض', 'Student', req.params.id, `تم حذف ملف المريض (${req.params.id})`);
        }
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete student' });
    }
  });

  // 1. Get student medical record
  app.get('/api/students/:id', async (req, res) => {
    try {
      const student = await db.query.studentsMedicalRecords.findFirst({
        where: eq(studentsMedicalRecords.universityId, req.params.id),
        with: {
          user: true,
          prescriptions: {
            with: {
              items: {
                with: {
                  medication: true
                }
              },
              doctor: true
            },
            orderBy: (prescriptions, { desc }) => [desc(prescriptions.createdAt)]
          }
        }
      });
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.json(student);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch student record' });
    }
  });

  // 2. Create prescription
  app.post('/api/prescriptions', async (req, res) => {
    try {
      const { studentId, doctorId, doctorName, diagnosis, items, vitals, notes } = req.body;
      
      let finalDiagnosis = diagnosis;
      if (vitals && (vitals.bloodPressure || vitals.temperature || vitals.heartRate)) {
        finalDiagnosis = `[العلامات الحيوية]\nالضغط: ${vitals.bloodPressure || '-'}\nالحرارة: ${vitals.temperature || '-'}\nالنبض: ${vitals.heartRate || '-'}\n\n[التشخيص]\n${diagnosis}`;
      }
      
      if (notes) {
        finalDiagnosis += `\n\n[خطة علاجية / ملاحظات إضافية]\n${notes}`;
      }

      const newPrescription = await db.transaction(async (tx) => {
        const [prescription] = await tx.insert(prescriptions).values({
          studentId,
          doctorId,
          diagnosis: finalDiagnosis,
          status: 'pending'
        }).returning();

        for (const item of items) {
          await tx.insert(prescriptionItems).values({
            prescriptionId: prescription.id,
            medicationId: item.medicationId,
            dose: item.dose,
            duration: item.duration
          });
        }
        
        return prescription;
      });
      
      if (doctorId) {
        await logAudit(doctorId, doctorName, 'إصدار وصفة طبية', 'Prescription', newPrescription.id.toString(), `إصدار وصفة طبية جديدة للمريض برقم ${studentId}`);
      }

      res.status(201).json(newPrescription);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create prescription' });
    }
  });

  // 3. Get all prescriptions (for Pharmacy Feed + History)
  app.get('/api/prescriptions', async (req, res) => {
    try {
      const allPrescriptions = await db.query.prescriptions.findMany({
        with: {
          student: {
            with: { user: true }
          },
          doctor: true,
          items: {
            with: { medication: true }
          }
        },
        orderBy: (prescriptions, { desc }) => [desc(prescriptions.createdAt)]
      });
      res.json(allPrescriptions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch prescriptions' });
    }
  });

  // 3.5 Get pending prescriptions (for Pharmacy)
  app.get('/api/prescriptions/pending', async (req, res) => {
    try {
      const pending = await db.query.prescriptions.findMany({
        where: eq(prescriptions.status, 'pending'),
        with: {
          student: {
            with: { user: true }
          },
          doctor: true,
          items: {
            with: { medication: true }
          }
        },
        orderBy: (prescriptions, { desc }) => [desc(prescriptions.createdAt)]
      });
      res.json(pending);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch pending prescriptions' });
    }
  });

  // 4. Dispense prescription
  app.post('/api/prescriptions/:id/dispense', async (req, res) => {
    try {
      const prescriptionId = parseInt(req.params.id);
      const { userId, userName } = req.body || {};
      
      await db.transaction(async (tx) => {
        // Update prescription status
        await tx.update(prescriptions)
          .set({ status: 'dispensed', dispensedAt: new Date() })
          .where(eq(prescriptions.id, prescriptionId));
          
        // Deduct inventory
        const pItems = await tx.query.prescriptionItems.findMany({
          where: eq(prescriptionItems.prescriptionId, prescriptionId)
        });
        
        for (const item of pItems) {
          const med = await tx.query.medications.findFirst({
            where: eq(medications.id, item.medicationId)
          });
          if (med) {
            await tx.update(medications)
              .set({ quantity: Math.max(0, med.quantity - 1) }) // Assuming 1 unit per item for simplicity, can be adjusted
              .where(eq(medications.id, med.id));
          }
        }
      });
      
      if (userId) {
        await logAudit(userId, userName, 'صرف وصفة طبية', 'Prescription', prescriptionId.toString(), `تم صرف الوصفة رقم ${prescriptionId} وخصم الأدوية من المخزون`);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to dispense prescription' });
    }
  });

  // Check Medication Interactions using Gemini API
  app.post('/api/check-interactions', async (req, res) => {
    try {
      const { newMeds, historyMeds } = req.body;
      if (!newMeds || newMeds.length === 0) {
        return res.json([]);
      }

      if (!process.env.GEMINI_API_KEY) {
         // Gracefully handle missing key by returning empty interactions
         return res.json([]);
      }

      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are a medical AI assistant.
Analyze the following newly prescribed medications against the patient's existing medication history (and against each other) for potential drug-drug interactions.
New Medications: ${newMeds.join(', ')}
Patient History: ${historyMeds && historyMeds.length > 0 ? historyMeds.join(', ') : 'None'}

Return a JSON array of interaction warnings. Only return clinically significant interactions. If there are no significant interactions, return an empty array.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                severity: {
                  type: Type.STRING,
                  description: "Severity of the interaction: high, moderate, or low."
                },
                drugs: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Names of the interacting drugs."
                },
                description: {
                  type: Type.STRING,
                  description: "Brief explanation of the interaction and potential risks."
                }
              },
              required: ["severity", "drugs", "description"]
            }
          }
        }
      });

      const interactions = JSON.parse(response.text?.trim() || '[]');
      res.json(interactions);
    } catch (error) {
      console.error('Interaction check error:', error);
      res.status(500).json({ error: 'Failed to check interactions' });
    }
  });

  // AI-assisted diagnosis auto-completion
  app.post('/api/autocomplete-diagnosis', async (req, res) => {
    try {
      const { text, vitals, patientHistory } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: 'AI features are not configured (Missing API Key).' });
      }

      // Fetch recent diagnoses to find common patterns
      const recentPrescriptions = await db.query.prescriptions.findMany({
        orderBy: (prescriptions, { desc }) => [desc(prescriptions.createdAt)],
        limit: 15
      });
      
      const commonPatterns = recentPrescriptions
        .map(p => p.diagnosis)
        .filter(d => d && d.length > 10)
        .slice(0, 5)
        .join('\n- ');

      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });

      const prompt = `You are a medical AI assistant helping a doctor write a patient's diagnosis.
Your task is to auto-complete or expand upon the doctor's current notes.
Use common patterns from the database if they match the current context:
- ${commonPatterns || 'No recent patterns'}

Current text: "${text || 'Patient presents with '}"
Vitals: ${JSON.stringify(vitals || {})}
Patient History: ${patientHistory || 'Unknown'}

Return a JSON array of up to 3 suggested completions (strings) for the current text. Each suggestion should complete the sentence or add the next logical symptom/diagnosis.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      const suggestions = JSON.parse(response.text?.trim() || '[]');
      res.json(suggestions);
    } catch (error) {
      console.error('Autocomplete error:', error);
      res.status(500).json({ error: 'Failed to generate suggestions' });
    }
  });

  // 5. Get medications inventory
  app.get('/api/medications', async (req, res) => {
    try {
      const meds = await db.query.medications.findMany({
        orderBy: (medications, { asc }) => [asc(medications.name)]
      });
      res.json(meds);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch medications' });
    }
  });

  // 6. Add a medication
  app.post('/api/medications', async (req, res) => {
    try {
      const { barcode, name, quantity, reorderLevel, userId, userName } = req.body;
      const [newMed] = await db.insert(medications).values({
        barcode,
        name,
        quantity: parseInt(quantity) || 0,
        reorderLevel: parseInt(reorderLevel) || 10
      }).returning();
      
      if (userId) {
        await logAudit(userId, userName, 'إضافة دواء', 'Medication', newMed.id.toString(), `تم إضافة الدواء ${name}`);
      }
      
      res.status(201).json(newMed);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add medication' });
    }
  });

  // 7. Update a medication
  app.put('/api/medications/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { barcode, name, quantity, reorderLevel, userId, userName } = req.body;
      const [updated] = await db.update(medications)
        .set({ 
          barcode, 
          name, 
          quantity: parseInt(quantity), 
          reorderLevel: parseInt(reorderLevel) 
        })
        .where(eq(medications.id, id))
        .returning();
      
      if (userId && updated) {
        await logAudit(userId, userName, 'تعديل دواء', 'Medication', updated.id.toString(), `تم تعديل بيانات أو كمية الدواء ${name}`);
      }

      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update medication' });
    }
  });

  // 8. Delete a medication
  app.delete('/api/medications/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { userId, userName } = req.body;
      
      const medToDelete = await db.query.medications.findFirst({ where: eq(medications.id, id) });
      
      // Delete prescription items first to avoid foreign key violations
      await db.delete(prescriptionItems).where(eq(prescriptionItems.medicationId, id));
      await db.delete(medications).where(eq(medications.id, id));
      
      if (userId && medToDelete) {
        await logAudit(userId, userName, 'حذف دواء', 'Medication', id.toString(), `تم حذف الدواء ${medToDelete.name}`);
      }

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete medication' });
    }
  });

  // Get audit logs
  app.get('/api/audit-logs', async (req, res) => {
    try {
      const logs = await db.query.auditLogs.findMany({
        orderBy: (auditLogs, { desc }) => [desc(auditLogs.createdAt)],
        limit: 100
      });
      res.json(logs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  });

  // Seed initial data for testing if DB is empty
  app.post('/api/seed', async (req, res) => {
    try {
      const doctorId = 'doc_123';
      const studentId = '2023001';
      
      // Check if seeded
      const existingUser = await db.query.users.findFirst({ where: eq(users.id, doctorId) });
      if (!existingUser) {
        await db.insert(users).values([
          { id: doctorId, name: 'Dr. Ahmed', role: 'doctor', email: 'ahmed@clinic.com' },
          { id: 'user_std_1', name: 'محمد عبدالله الشمري', role: 'student', email: 'mohammad@univ.edu' },
          { id: 'user_std_2', name: 'فهد العتيبي', role: 'student', email: 'fahad@univ.edu' },
          { id: 'user_std_3', name: 'نورا الخالد', role: 'student', email: 'noura@univ.edu' }
        ]);
        
        await db.insert(studentsMedicalRecords).values([
          {
            universityId: '2023001',
            userId: 'user_std_1',
            bloodType: 'O+',
            allergies: 'Penicillin',
            chronicDiseases: 'Asthma'
          },
          {
            universityId: '2023002',
            userId: 'user_std_2',
            bloodType: 'A+',
            allergies: 'None',
            chronicDiseases: 'None'
          },
          {
            universityId: '2023003',
            userId: 'user_std_3',
            bloodType: 'B-',
            allergies: 'Peanuts',
            chronicDiseases: 'Diabetes Type 1'
          }
        ]);
        
        await db.insert(medications).values([
          { barcode: '111', name: 'Amoxicillin 500mg', quantity: 50, reorderLevel: 10 },
          { barcode: '222', name: 'Paracetamol 1g', quantity: 100, reorderLevel: 20 },
          { barcode: '333', name: 'Ibuprofen 400mg', quantity: 5, reorderLevel: 15 }, // Low stock
          { barcode: '444', name: 'Cetirizine 10mg', quantity: 30, reorderLevel: 10 }
        ]);
      }
      res.json({ success: true, message: 'Database seeded' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to seed database' });
    }
  });


  // --- Queue Management ---
  
  app.get('/api/queue', async (req, res) => {
    try {
      const dbQueue = await db.query.clinicQueue.findMany({
        with: {
          student: {
            with: { user: true }
          }
        },
        orderBy: (clinicQueue, { asc }) => [asc(clinicQueue.createdAt)]
      });
      
      // Map to the format expected by the frontend
      const formattedQueue = dbQueue.map(q => ({
        id: q.id,
        studentId: q.studentId,
        name: q.student?.user?.name || 'طالب غير معروف',
        status: q.status,
        createdAt: q.createdAt
      }));
      
      res.json(formattedQueue);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch queue' });
    }
  });

  app.post('/api/queue', async (req, res) => {
    const { studentId } = req.body;
    try {
      const [newEntry] = await db.insert(clinicQueue).values({
        studentId,
        status: 'waiting'
      }).returning();
      
      res.status(201).json(newEntry);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to add to queue' });
    }
  });

  app.put('/api/queue/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const [updated] = await db.update(clinicQueue)
        .set({ status: req.body.status })
        .where(eq(clinicQueue.id, id))
        .returning();
        
      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ error: 'Not found' });
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update queue' });
    }
  });

  // Vite middleware for development
  // Get appointments
  app.get('/api/appointments', async (req, res) => {
    try {
      const allAppointments = await db.query.appointments.findMany({
        with: {
          student: {
            with: { user: true }
          }
        },
        orderBy: (appointments, { asc }) => [asc(appointments.appointmentDate)]
      });
      res.json(allAppointments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  });

  // Create appointment
  app.post('/api/appointments', async (req, res) => {
    try {
      const { studentId, appointmentDate, reason } = req.body;
      const [newAppointment] = await db.insert(appointments).values({
        studentId,
        appointmentDate: new Date(appointmentDate),
        reason,
        status: 'scheduled'
      }).returning();
      res.status(201).json(newAppointment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create appointment' });
    }
  });

  // Update appointment status (and optionally add to queue)
  app.put('/api/appointments/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, addToQueue } = req.body;
      
      const [updated] = await db.update(appointments)
        .set({ status })
        .where(eq(appointments.id, parseInt(id)))
        .returning();
        
      if (addToQueue && updated) {
        await db.insert(clinicQueue).values({
          studentId: updated.studentId,
          status: 'waiting'
        });
      }
      
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update appointment' });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn("Vite not found, skipping middleware in non-production.");
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
  
  return app;
}

const appPromise = startServer();
export default async function handler(req: any, res: any) {
  const app = await appPromise;
  app(req, res);
}
