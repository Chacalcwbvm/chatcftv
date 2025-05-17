import ExcelJS from "exceljs";

// Ler planilha
export async function lerArquivoExcel(file: File) {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  const dados: any[] = [];
  worksheet.eachRow((row) => {
    dados.push(row.values);
  });
  return dados;
}

// Exportar planilha
export async function exportarParaExcel(dados: any[][]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Planilha");
  worksheet.addRows(dados);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Baixar no navegador
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "meu-arquivo.xlsx";
  link.click();
}