import {
  PrismaClient,
  UserRole,
  Gender,
  ScreeningStatus,
  DRSeverity,
  DMERisk,
  ImageQualityStatus,
  UncertaintyLevel,
  ReferralPriority,
  LesionType,
  ReviewDecision,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Helper to create a minimal valid PNG dummy file for testing uploads/scans
const createDummyRetinalImage = (filename: string): string => {
  const uploadDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, filename);
  if (!fs.existsSync(filePath)) {
    // 1x1 transparent PNG buffer
    const minimalPngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(filePath, minimalPngBuffer);
  }
  return `uploads/${filename}`;
};

async function main() {
  console.info('🌱 Seeding RetinaScope database with synthetic test data...');

  // 1. Clean existing records in reverse dependency order
  await prisma.specialistReview.deleteMany();
  await prisma.lesion.deleteMany();
  await prisma.aIResult.deleteMany();
  await prisma.screening.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  console.info('Cleaned old records.');

  // 2. Create Users
  const defaultPassword = 'Password123!';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  const _admin = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@retinascope.health',
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const _operator = await prisma.user.create({
    data: {
      name: 'Anita Sen',
      email: 'operator@retinascope.health',
      passwordHash,
      role: UserRole.SCREENING_OPERATOR,
    },
  });

  const specialist = await prisma.user.create({
    data: {
      name: 'Dr. Priya Sharma, MD',
      email: 'specialist@retinascope.health',
      passwordHash,
      role: UserRole.SPECIALIST,
    },
  });

  console.info('Created users: Admin, Operator, Specialist.');

  // 3. Create Synthetic Patients
  const patientsData = [
    {
      patientCode: 'P-1001',
      name: 'Anita Verma',
      age: 52,
      gender: Gender.FEMALE,
      phone: '+91 98765 43210',
    },
    {
      patientCode: 'P-1002',
      name: 'Ramesh Patel',
      age: 61,
      gender: Gender.MALE,
      phone: '+91 98123 45678',
    },
    {
      patientCode: 'P-1003',
      name: 'Sunita Rao',
      age: 48,
      gender: Gender.FEMALE,
      phone: '+91 97234 56789',
    },
    {
      patientCode: 'P-1004',
      name: 'Rajesh Kumar',
      age: 58,
      gender: Gender.MALE,
      phone: '+91 96345 67890',
    },
    {
      patientCode: 'P-1005',
      name: 'Meera Nair',
      age: 67,
      gender: Gender.FEMALE,
      phone: '+91 95456 78901',
    },
    {
      patientCode: 'P-1006',
      name: 'Aarav Gupta',
      age: 45,
      gender: Gender.MALE,
      phone: '+91 94567 89012',
    },
    {
      patientCode: 'P-1007',
      name: 'Vikram Joshi',
      age: 72,
      gender: Gender.MALE,
      phone: '+91 93678 90123',
    },
  ];

  const patients = [];
  for (const p of patientsData) {
    const patient = await prisma.patient.create({ data: p });
    patients.push(patient);
  }
  console.info(`Created ${patients.length} synthetic patients.`);

  // 4. Create Screenings, AI Results, Lesions & Reviews

  // Case 1: Moderate DR, Review Pending (Anita Verma)
  const img1 = createDummyRetinalImage('seed-scan-moderate-1001.png');
  const _screening1 = await prisma.screening.create({
    data: {
      patientId: patients[0].id,
      imagePath: img1,
      status: ScreeningStatus.REVIEW_PENDING,
      aiResult: {
        create: {
          drGrade: 2,
          severity: DRSeverity.MODERATE,
          drConfidence: 0.91,
          dmeRisk: DMERisk.HIGH,
          dmeConfidence: 0.87,
          imageQualityStatus: ImageQualityStatus.ACCEPTED,
          imageQualityScore: 0.94,
          uncertaintyLevel: UncertaintyLevel.LOW,
          abstain: false,
          referralPriority: ReferralPriority.HIGH,
          referralRecommendation:
            'Specialist ophthalmology referral within 2-4 weeks. Multiple microaneurysms and hard exudates detected.',
        },
      },
      lesions: {
        create: [
          { type: LesionType.MICROANEURYSM, count: 12 },
          { type: LesionType.HEMORRHAGE, count: 4 },
          { type: LesionType.EXUDATE, count: 7 },
          { type: LesionType.OTHER, count: 2 },
        ],
      },
    },
  });

  // Case 2: Severe DR, Reviewed by Dr. Sharma (Ramesh Patel)
  const img2 = createDummyRetinalImage('seed-scan-severe-1002.png');
  const _screening2 = await prisma.screening.create({
    data: {
      patientId: patients[1].id,
      imagePath: img2,
      status: ScreeningStatus.REVIEWED,
      aiResult: {
        create: {
          drGrade: 3,
          severity: DRSeverity.SEVERE,
          drConfidence: 0.95,
          dmeRisk: DMERisk.HIGH,
          dmeConfidence: 0.93,
          imageQualityStatus: ImageQualityStatus.ACCEPTED,
          imageQualityScore: 0.96,
          uncertaintyLevel: UncertaintyLevel.MEDIUM,
          abstain: false,
          referralPriority: ReferralPriority.CRITICAL,
          referralRecommendation:
            'Urgent vitreoretinal consultation within 1-2 weeks. Severe non-proliferative DR changes present in multiple quadrants.',
        },
      },
      lesions: {
        create: [
          { type: LesionType.MICROANEURYSM, count: 26 },
          { type: LesionType.HEMORRHAGE, count: 18 },
          { type: LesionType.EXUDATE, count: 14 },
          { type: LesionType.OTHER, count: 6 },
        ],
      },
      specialistReview: {
        create: {
          reviewerId: specialist.id,
          decision: ReviewDecision.AGREE,
          notes:
            'Clinical examination confirms severe NPDR with clinically significant macular edema. Patient scheduled for urgent OCT and anti-VEGF consultation.',
        },
      },
    },
  });

  // Case 3: No DR, Routine follow-up (Sunita Rao)
  const img3 = createDummyRetinalImage('seed-scan-nodr-1003.png');
  await prisma.screening.create({
    data: {
      patientId: patients[2].id,
      imagePath: img3,
      status: ScreeningStatus.REVIEW_PENDING,
      aiResult: {
        create: {
          drGrade: 0,
          severity: DRSeverity.NO_DR,
          drConfidence: 0.98,
          dmeRisk: DMERisk.LOW,
          dmeConfidence: 0.97,
          imageQualityStatus: ImageQualityStatus.ACCEPTED,
          imageQualityScore: 0.98,
          uncertaintyLevel: UncertaintyLevel.LOW,
          abstain: false,
          referralPriority: ReferralPriority.LOW,
          referralRecommendation:
            'Annual routine diabetic retinopathy screening recommended. Clear fundus image with no discernible diabetic microvascular pathology.',
        },
      },
      lesions: {
        create: [
          { type: LesionType.MICROANEURYSM, count: 0 },
          { type: LesionType.HEMORRHAGE, count: 0 },
          { type: LesionType.EXUDATE, count: 0 },
        ],
      },
    },
  });

  // Case 4: Mild DR, Review Pending (Rajesh Kumar)
  const img4 = createDummyRetinalImage('seed-scan-mild-1004.png');
  await prisma.screening.create({
    data: {
      patientId: patients[3].id,
      imagePath: img4,
      status: ScreeningStatus.REVIEW_PENDING,
      aiResult: {
        create: {
          drGrade: 1,
          severity: DRSeverity.MILD,
          drConfidence: 0.88,
          dmeRisk: DMERisk.LOW,
          dmeConfidence: 0.9,
          imageQualityStatus: ImageQualityStatus.ACCEPTED,
          imageQualityScore: 0.92,
          uncertaintyLevel: UncertaintyLevel.LOW,
          abstain: false,
          referralPriority: ReferralPriority.MEDIUM,
          referralRecommendation:
            'Follow-up screening in 6-12 months. Isolated microaneurysms detected without macular edema risk.',
        },
      },
      lesions: {
        create: [
          { type: LesionType.MICROANEURYSM, count: 4 },
          { type: LesionType.HEMORRHAGE, count: 1 },
          { type: LesionType.EXUDATE, count: 0 },
        ],
      },
    },
  });

  // Case 5: Proliferative DR, High Critical Priority (Meera Nair)
  const img5 = createDummyRetinalImage('seed-scan-pdr-1005.png');
  await prisma.screening.create({
    data: {
      patientId: patients[4].id,
      imagePath: img5,
      status: ScreeningStatus.REVIEW_PENDING,
      aiResult: {
        create: {
          drGrade: 4,
          severity: DRSeverity.PROLIFERATIVE,
          drConfidence: 0.97,
          dmeRisk: DMERisk.HIGH,
          dmeConfidence: 0.96,
          imageQualityStatus: ImageQualityStatus.ACCEPTED,
          imageQualityScore: 0.95,
          uncertaintyLevel: UncertaintyLevel.LOW,
          abstain: false,
          referralPriority: ReferralPriority.CRITICAL,
          referralRecommendation:
            'Immediate tertiary ophthalmology referral. High risk proliferative diabetic retinopathy features detected.',
        },
      },
      lesions: {
        create: [
          { type: LesionType.MICROANEURYSM, count: 38 },
          { type: LesionType.HEMORRHAGE, count: 31 },
          { type: LesionType.EXUDATE, count: 22 },
          { type: LesionType.OTHER, count: 11 },
        ],
      },
    },
  });

  // Case 6: Newly Uploaded (Aarav Gupta - not analyzed yet)
  const img6 = createDummyRetinalImage('seed-scan-uploaded-1006.png');
  await prisma.screening.create({
    data: {
      patientId: patients[5].id,
      imagePath: img6,
      status: ScreeningStatus.UPLOADED,
    },
  });

  console.info('Created sample screenings with AI results, lesion maps, and specialist reviews.');
  console.info('✅ Seed finished successfully.');
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
