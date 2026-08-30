import { generateInvitationPDF } from "./pdf-generator";
import * as fs from "fs";
import * as path from "path";

async function runTest() {
  try {
    const pdfBuffer = await generateInvitationPDF({
      id: 999,
      fullName: "عبدالرحمن بن إبراهيم العتيبي",
      idNumber: "1098765432",
      ticketType: "vip",
      qrCode: "AQ-TEST-VIP-9999",
      seatNumber: "A-12",
      logoUrl: undefined,
    });

    const outPath = path.join("/home/ubuntu", "test_invitation.pdf");
    fs.writeFileSync(outPath, pdfBuffer);
    console.log("PDF generated successfully at:", outPath);
  } catch (err) {
    console.error("Failed to generate PDF:", err);
  }
}

runTest();
