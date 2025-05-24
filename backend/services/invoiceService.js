
const PDFDocument = require("pdfkit");

const generateInvoice = (booking, user, res) => {
  const doc = new PDFDocument();

  // ✅ Fix: Correctly access booking ID
  const bookingId = booking.id || "N/A";
  const amadeusId = booking.amadeusId || "N/A"; // Ensure Amadeus ID is available

  const fileName = `invoice_${amadeusId}.pdf`;

  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Type", "application/pdf");

  doc.pipe(res);

  // ✅ Invoice Header
  doc.fontSize(20).text("Flight Booking Invoice", { align: "center" });
  doc.moveDown();

  // ✅ Booking & User Details
  doc.fontSize(12).text(`Booking ID: ${bookingId}`);
  doc.text(`Amadeus ID: ${amadeusId}`);
  doc.text(`User: ${user.name} (${user.email})`);
  doc.moveDown();

  // ✅ Fix: Ensure `flightOffers` exists before accessing
  if (booking.flightOffers && booking.flightOffers.length > 0) {
    const flightOffer = booking.flightOffers[0];

    if (flightOffer.itineraries && flightOffer.itineraries.length > 0) {
      const itinerary = flightOffer.itineraries[0];

      if (itinerary.segments && itinerary.segments.length > 0) {
        const segment = itinerary.segments[0];

        doc.text(`Flight: ${segment.carrierCode} ${segment.number}`);
        doc.text(`Origin: ${segment.departure.iataCode}`);
        doc.text(`Destination: ${segment.arrival.iataCode}`);
        doc.text(`Departure: ${segment.departure.at}`);
        doc.text(`Arrival: ${segment.arrival.at}`);
      } else {
        doc.text("No flight segments found.");
      }
    } else {
      doc.text("No itinerary found.");
    }

    doc.text(`Price: ${flightOffer.price.total} ${flightOffer.price.currency}`);
  } else {
    doc.text("No flight offers available.");
  }

  doc.end();
};

module.exports = { generateInvoice };
