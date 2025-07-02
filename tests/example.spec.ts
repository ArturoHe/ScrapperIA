import { test, expect } from "@playwright/test";
import * as readline from "readline";

import * as XLSX from "xlsx"; // Importar la librería xlsx
import path from "path"; // Para manejar rutas de archivos

//const stockSymbol: string[] = ["SPX", "DJI", "IXIC", "RUT"];
let selectedSymbol: string = "DJI";

const tableHeaders: string[] = [];
const tableData: string[][] = [];

test("Scrapper", async ({ page }) => {
  await page.goto(
    `https://finance.yahoo.com/quote/%5E${selectedSymbol}/history`,
    { waitUntil: "domcontentloaded" }
  );

  //Validar nombre del simbolo
  console.log(`Navegando a la página de historial de ${selectedSymbol}`);
  const pageTitle = await page.locator(".yf-4vbjci").first().textContent();
  console.log(`Historial de ${pageTitle}`);

  //Validar que hay tabla
  console.log("Tabla encontrada:", await page.getByRole("table").count());
  await expect(page.getByRole("table")).toBeVisible();

  // Validar # de filas y columnas en la tabla
  const table = page.getByRole("table");

  const rows = table.locator("tbody tr");
  const rowCount = await rows.count();
  console.log("Número de filas en la tabla:", rowCount);

  const columns = table.locator("thead th");
  const columnCount = await columns.count();
  console.log("Número de columnas en la tabla:", columnCount);

  // Retraso inicio para obtención de datos
  console.log(
    "Esperando 5 segundos para que la tabla se cargue completamente..."
  );

  // Esperar a que la tabla se cargue completamente
  /////////////////////////////////////////await page.waitForTimeout(10000);

  // Validar encabezados (DOHLCAV)
  const headers = table.locator("thead th");
  console.log("Encabezados de la tabla:");
  for (let i = 0; i < (await headers.count()); i++) {
    const headerText = await headers.nth(i).textContent();
    tableHeaders.push(headerText?.trim() || "");
    //console.log(`Encabezado ${i + 1}: ${headerText}`);
  }

  // obtener datos de cada fila
  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);
    const cells = row.locator("td");
    const cellCount = await cells.count();
    const rowData: string[] = [];
    //console.log(`Fila ${i + 1} tiene ${cellCount} celdas`);

    for (let j = 0; j < cellCount; j++) {
      const cell = cells.nth(j);
      const cellText = await cell.textContent();
      rowData.push(cellText?.trim() || "");
      //console.log(`Celda [${i + 1}, ${j + 1}]: ${cellText}`);
    }
    tableData.push(rowData);
  }

  //console.log("Encabezados:", tableHeaders);
  //console.log("Datos de la tabla:", tableData);

  // Guardar datos en un archivo Excel
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([tableHeaders, ...tableData]);
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Historial de " + selectedSymbol
  );

  const filePath = path.join(__dirname, `historial_${selectedSymbol}.xlsx`);
  XLSX.writeFile(workbook, filePath);
  console.log(`Datos guardados en ${filePath}`);
});
