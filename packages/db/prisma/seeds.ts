// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function main() {
//   console.log("🌱 Seeding database...");

//   // Create a demo business
//   const business = await prisma.business.upsert({
//     where: { id: "demo-business-id" },
//     update: {},
//     create: {
//       id: "demo-business-id",
//       name: "ABC Software Services",
//       phone: "+1239060440901",
//       twilioNumber: "+16606564723", // Your Twilio number
//       settings: JSON.stringify({
//         businessHours: { start: 8, end: 18 },
//         timezone: "America/New_York",
//       }),
//     },
//   });

//   console.log("✅ Business created:", business.name);

//   // Create message templates
//   const templates = [
//     {
//       businessId: business.id,
//       name: "Standard Response",
//       scenario: "standard",
//       messageBody:
//         "Hi [Name]! Sorry we missed your call. We'll get back to you ASAP. Reply with your plumbing issue and we'll prioritize you. - [Business]",
//       isActive: true,
//     },
//     {
//       businessId: business.id,
//       name: "After Hours",
//       scenario: "afterHours",
//       messageBody:
//         "Hi [Name], thanks for calling [Business]! We're closed right now but we'll call you back first thing in the morning. For emergencies, reply URGENT.",
//       isActive: true,
//     },
//     {
//       businessId: business.id,
//       name: "Emergency Response",
//       scenario: "emergency",
//       messageBody:
//         "Hi [Name], we see you need URGENT help! Our emergency team will call you within 15 minutes. Stay safe! - [Business]",
//       isActive: true,
//     },
//   ];

//   for (const template of templates) {
//     await prisma.messageTemplate.upsert({
//       where: {
//         businessId_name: {
//           businessId: template.businessId,
//           name: template.name,
//         },
//       },
//       update: {},
//       create: template as any,
//     });
//     console.log(`✅ Template created: ${template.name}`);
//   }

//   console.log("🎉 Seeding complete!");
// }

// main()
//   .catch((e) => {
//     console.error("❌ Seed failed:", e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });