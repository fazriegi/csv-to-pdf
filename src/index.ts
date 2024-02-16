import Papa from "papaparse";
import fs from "fs";
import PDFDocumentWithTables from "pdfkit-table";

// Table template from pdfkit-table lib
interface Table {
  title?: string;
  subtitle?: string;
  headers?: any[];
  datas?: any[];
  rows?: string[][];
}

const outputPath = "output.pdf";
const csvFilePath = "###.csv"; // Replace with the path to your CSV file
const title = "Title";
const subtitle = "Subtitle";

try {
  const csvData = fs.readFileSync(csvFilePath, "utf8");
  const results = Papa.parse(csvData, {
    header: true,
    dynamicTyping: true,
  });

  const headers = results.meta.fields?.map((item) => {
    return {
      label: item,
      property: item,
      renderer: null,
    };
  });

  // converting data in the form of objects obtained from CSV parsing results into
  // objects that have string values.
  const stringifiedData = results.data.map((obj) => {
    const stringifiedObj: { [key: string]: string } = {}; // Add index signature
    for (const key in obj as Record<string, unknown>) {
      if (Object.hasOwnProperty.call(obj, key)) {
        stringifiedObj[key] =
          (obj as Record<string, unknown>)[key] === null
            ? " "
            : String((obj as Record<string, unknown>)[key]);
      }
    }
    return stringifiedObj;
  });

  const pdf = new PDFDocumentWithTables();
  pdf.pipe(fs.createWriteStream(outputPath));

  const table: Table = {
    title,
    subtitle,
    headers: headers,
    datas: stringifiedData,
  };

  pdf.table(table);

  pdf.end();
} catch (error) {
  console.error("Error reading CSV file:", error);
}
