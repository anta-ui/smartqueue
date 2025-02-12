import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const queueId = params.id;
    const qrCodeUrl = `https://smartqueue.app/q/${queueId}`;
    
    // Générer le QR code en SVG
    const qrCodeSvg = await QRCode.toString(qrCodeUrl, {
      type: "svg",
      color: {
        dark: "#000",
        light: "#fff",
      },
      width: 300,
      margin: 2,
    });

    // Retourner le SVG avec les bons headers
    return new NextResponse(qrCodeSvg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
