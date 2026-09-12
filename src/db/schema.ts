import { pgTable, text, serial, timestamp, integer, boolean, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (Role-Based Access Control)
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: text('name').notNull(),
  username: varchar('username', { length: 100 }).unique(),
  password: varchar('password', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull(), // 'student', 'doctor', 'pharmacist', 'admin'
  email: text('email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Students medical records
export const studentsMedicalRecords = pgTable('student_medical_records', {
  universityId: varchar('university_id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id),
  bloodType: varchar('blood_type', { length: 10 }),
  allergies: text('allergies'),
  chronicDiseases: text('chronic_diseases'),
  rfidTag: varchar('rfid_tag', { length: 100 }).unique(),
  lastModifiedBy: varchar('last_modified_by', { length: 255 }),
  lastModifiedAt: timestamp('last_modified_at'),
});

// Medications (Inventory)
export const medications = pgTable('medications', {
  id: serial('id').primaryKey(),
  barcode: varchar('barcode', { length: 100 }).unique().notNull(),
  name: text('name').notNull(),
  category: varchar('category', { length: 100 }),
  quantity: integer('quantity').notNull().default(0),
  reorderLevel: integer('reorder_level').notNull().default(10),
  expiryDate: timestamp('expiry_date'),
});

// Prescriptions (E-Prescriptions)
export const prescriptions = pgTable('prescriptions', {
  id: serial('id').primaryKey(),
  studentId: varchar('student_id', { length: 50 }).notNull().references(() => studentsMedicalRecords.universityId),
  doctorId: varchar('doctor_id', { length: 255 }).notNull().references(() => users.id),
  diagnosis: text('diagnosis'),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending', 'dispensed'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  dispensedAt: timestamp('dispensed_at'),
});

// Prescription Items
export const prescriptionItems = pgTable('prescription_items', {
  id: serial('id').primaryKey(),
  prescriptionId: integer('prescription_id').notNull().references(() => prescriptions.id),
  medicationId: integer('medication_id').notNull().references(() => medications.id),
  dose: varchar('dose', { length: 100 }).notNull(),
  duration: varchar('duration', { length: 100 }).notNull(),
});

export const clinicQueue = pgTable('clinic_queue', {
  id: serial('id').primaryKey(),
  studentId: varchar('student_id', { length: 50 }).notNull().references(() => studentsMedicalRecords.universityId),
  status: varchar('status', { length: 50 }).notNull().default('waiting'), // 'waiting', 'in_progress', 'completed'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Appointments (جدولة المواعيد)
export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  studentId: varchar('student_id', { length: 50 }).notNull().references(() => studentsMedicalRecords.universityId),
  appointmentDate: timestamp('appointment_date').notNull(),
  reason: text('reason'),
  status: varchar('status', { length: 50 }).notNull().default('scheduled'), // 'scheduled', 'completed', 'cancelled'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  medicalRecord: one(studentsMedicalRecords, {
    fields: [users.id],
    references: [studentsMedicalRecords.userId],
  }),
  prescriptionsIssued: many(prescriptions),
}));

export const studentsMedicalRecordsRelations = relations(studentsMedicalRecords, ({ one, many }) => ({
  user: one(users, {
    fields: [studentsMedicalRecords.userId],
    references: [users.id],
  }),
  prescriptions: many(prescriptions),
  queueEntries: many(clinicQueue),
  appointments: many(appointments),
}));

export const clinicQueueRelations = relations(clinicQueue, ({ one }) => ({
  student: one(studentsMedicalRecords, {
    fields: [clinicQueue.studentId],
    references: [studentsMedicalRecords.universityId],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  student: one(studentsMedicalRecords, {
    fields: [appointments.studentId],
    references: [studentsMedicalRecords.universityId],
  }),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one, many }) => ({
  student: one(studentsMedicalRecords, {
    fields: [prescriptions.studentId],
    references: [studentsMedicalRecords.universityId],
  }),
  doctor: one(users, {
    fields: [prescriptions.doctorId],
    references: [users.id],
  }),
  items: many(prescriptionItems),
}));

export const prescriptionItemsRelations = relations(prescriptionItems, ({ one }) => ({
  prescription: one(prescriptions, {
    fields: [prescriptionItems.prescriptionId],
    references: [prescriptions.id],
  }),
  medication: one(medications, {
    fields: [prescriptionItems.medicationId],
    references: [medications.id],
  }),
}));

// Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }),
  userName: varchar('user_name', { length: 255 }),
  action: varchar('action', { length: 255 }).notNull(),
  entity: varchar('entity', { length: 100 }).notNull(),
  entityId: varchar('entity_id', { length: 100 }),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
