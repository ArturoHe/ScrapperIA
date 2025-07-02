import { test, expect } from "@playwright/test";

const stockSymbol: string[] = ["SPX", "DJI", "IXIC", "RUT"];

//console.log("Seleccione el simbolo para el cual desea realizar la prueba:");

test("Scrapper", async ({ page }) => {
  await page.goto(
    `https://finance.yahoo.com/quote/%5E${stockSymbol[0]}/history`,
    { waitUntil: "domcontentloaded" }
  );

  //Validar que hay tabla
  console.log("Tabla encontrada:", await page.getByRole("table").count());
  await expect(page.getByRole("table")).toBeVisible();

  // Validar # de filas y columnas en la tabla
  const table = page.getByRole("table");

  // Validar encabezados (DOHLCAV)
  const headers = table.locator("thead th");
  console.log("Encabezados de la tabla:");
  for (let i = 0; i < (await headers.count()); i++) {
    const headerText = await headers.nth(i).textContent();
    console.log(`Encabezado ${i + 1}: ${headerText}`);
  }

  const rows = table.locator("tbody tr");
  const rowCount = await rows.count();
  console.log("Número de filas en la tabla:", rowCount);

  const columns = table.locator("thead th");
  const columnCount = await columns.count();
  console.log("Número de columnas en la tabla:", columnCount);

  // Scroll the footer into view, forcing an "infinite list" to load more content
  await page
    .getByText("Copyright © 2025 Yahoo. All rights reserved.")
    .scrollIntoViewIfNeeded();

  // obtener datos de cada fila
  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);
    const cells = row.locator("td");
    const cellCount = await cells.count();
    console.log(`Fila ${i + 1} tiene ${cellCount} celdas`);

    for (let j = 0; j < cellCount; j++) {
      const cell = cells.nth(j);
      const cellText = await cell.textContent();
      console.log(`Celda [${i + 1}, ${j + 1}]: ${cellText}`);
    }
  }
});
