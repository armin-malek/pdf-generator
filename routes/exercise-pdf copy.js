const express = require("express");
const { requestBodySchema } = require("../schema");

const router = express.Router();

// router.use("/auth", require("./auth"));

router.post("/generate-pdf", async (req, res) => {
  try {
    const time = Date.now();

    const JSONValidationTimeStart = Date.now();

    const validationResult = requestBodySchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "اطلاعات نامعتبر است",
        details: validationResult.error.errors,
      });
    }
    res.setHeader("JsonValidation-TIME", Date.now() - JSONValidationTimeStart);

    const browser = await browserPromise;

    const page = await browser.newPage();
    const filePath = path.join(__dirname, "out.html");

    if (process.env.NODE_ENV != "PRODUCTION") {
      template = (await fs.promises.readFile("./index.ejs")).toString();
    }

    const renderTimeStart = Date.now();
    await fs.promises.writeFile(
      filePath,
      ejs.render(template, { body: req.body, numberToOrdinal: numberToOrdinal })
    );
    res.setHeader("RENDER-TIME", Date.now() - renderTimeStart);

    const naigationTimeStart = Date.now();

    // await page.goto(`file://${filePath}`, { waitUntil: "networkidle2" });
    await page.goto(`file://${filePath}`, { waitUntil: "load" });
    // await page.setContent(
    //   ejs.render(template, { ...req.body, numberToOrdinal: numberToOrdinal })
    // );
    res.setHeader("NAVIGATION-TIME", Date.now() - naigationTimeStart);

    const PdfPrintTimeStart = Date.now();
    await page.emulateMediaType("print");
    const pdfPath = path.join(__dirname, "/tmp/", `${uuidV4()}.pdf`);
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      path: pdfPath,
    });

    res.setHeader("PdfPrint-TIME", Date.now() - PdfPrintTimeStart);

    if ((process.env.NODE_ENV = "PRODUCTION")) {
      await page.close();
    }

    // res.setHeader("Content-Disposition", 'attachment; filename="download.pdf"');
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", pdfBuffer.length);
    res.setHeader("CPU-TIME", Date.now() - time);
    res.status(200).sendFile(pdfPath, (err) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      fs.unlink(pdfPath, (err) => {
        // log any error
        if (err) {
          console.log(err);
        }
      });
    });

    // fs.writeFileSync("./out.pdf", pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Internal Server Error", error);
  }
});
module.exports = router;
