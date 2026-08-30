import { generateInvitationPDF } from "./pdf-generator";
import * as fs from "fs";
import * as path from "path";

async function runTest() {
  try {
    const pdfBuffer = await generateInvitationPDF({
      id: 888,
      fullName: "مشعل بن خالد السبيعي",
      idNumber: "1076543210",
      ticketType: "student",
      qrCode: "AQ-TEST-STUDENT-8888",
      seatNumber: "B-04",
      logoUrl: undefined,
    });

    const outPath = path.join("/home/ubuntu", "test_invitation_node.pdf");
    fs.writeFileSync(outPath, pdfBuffer);
    console.log("Node PDF generated successfully at:", outPath);
  } catch (err) {
    console.error("Failed to generate Node PDF:", err);
  }
}

runTest();
