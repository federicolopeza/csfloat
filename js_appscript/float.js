function calcularFloatsConMinMax() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName("TradeUps");
  
    // --- 1. Calcular promedio de B2:B11 ---
    const inputs = sh.getRange("B2:B11").getValues()
      .map(r => parseFloat(r[0].toString().replace(",", ".")))
      .filter(x => !isNaN(x));
    if (inputs.length === 0) {
      sh.getRange("K1").setValue("No hay floats válidos en col B");
      return;
    }
    const avgFloat = inputs.reduce((a, b) => a + b, 0) / inputs.length;
  
    // --- 2. Leer resultados posibles (I=Float min, J=Float max) ---
    const lastRow = sh.getLastRow();
    const minMax = sh.getRange(2, 9, lastRow - 1, 2).getValues(); // col I y J
  
    // --- 3. Calcular floats finales ---
    const output = [["Float estimado"]];
    minMax.forEach(r => {
      const minF = parseFloat(r[0].toString().replace(",", "."));
      const maxF = parseFloat(r[1].toString().replace(",", "."));
      if (isNaN(minF) || isNaN(maxF)) {
        output.push([""]);
      } else {
        const floatFinal = avgFloat * (maxF - minF) + minF;
        output.push([Number(floatFinal.toFixed(6))]);
      }
    });
  
    // --- 4. Escribir en col K ---
    sh.getRange(1, 11, output.length, 1).setValues(output);
    sh.getRange(2, 11, output.length - 1, 1).setNumberFormat("0.000000");
  }
  