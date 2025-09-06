function calcularResultadosContrato() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const coleccionesSheet = ss.getSheetByName("Colecciones");
    const tradeUpsSheet = ss.getSheetByName("TradeUps");
  
    // === Leer base Colecciones ===
    const nRowsCols = coleccionesSheet.getLastRow() - 1;
    const data = coleccionesSheet.getRange(2, 2, nRowsCols, 5).getValues(); 
    // Columnas: B=Arma, C=Coleccion, D=Grado, E=Float min, F=Float max
  
    const base = data.map(r => ({
      arma: r[0],
      coleccion: r[1],
      grado: r[2].toString().trim().toLowerCase()
    }));
  
    // === Leer inputs (A=Arma) ===
    const inputs = tradeUpsSheet.getRange("A2:A11").getValues().map(r => r[0]).filter(x => x);
  
    if (inputs.length === 0) {
      tradeUpsSheet.getRange("D1").setValue("No hay armas en el contrato");
      return;
    }
  
    // Colecciones y grados usados
    const coleccionesUsadas = [];
    const gradosUsados = [];
    inputs.forEach(arma => {
      let match = base.find(x => x.arma === arma);
      if (match) {
        coleccionesUsadas.push(match.coleccion);
        gradosUsados.push(match.grado);
      }
    });
  
    // Probabilidades por colección
    const counts = {};
    coleccionesUsadas.forEach(c => counts[c] = (counts[c] || 0) + 1);
    const total = coleccionesUsadas.length;
  
    // Grado resultante
    const grados = ["mil-spec", "restricted", "classified", "covert"];
    let gradoMax = "";
    gradosUsados.forEach(g => {
      if (gradoMax === "" || grados.indexOf(g) > grados.indexOf(gradoMax)) {
        gradoMax = g;
      }
    });
    const gradoResultado = grados[grados.indexOf(gradoMax) + 1];
  
    // Resultados posibles
    const resultados = [];
    for (let col in counts) {
      const probColeccion = (counts[col] / total) * 100;
      const posibles = base.filter(x => x.coleccion === col && x.grado === gradoResultado);
  
      posibles.forEach(arma => {
        resultados.push({
          arma: arma.arma,
          coleccion: arma.coleccion,
          grado: arma.grado,
          prob: probColeccion / posibles.length
        });
      });
    }
  
    // Escribir resultados en TradeUps!D1
    const startRow = 1, startCol = 4;
    tradeUpsSheet.getRange(startRow, startCol, 500, 4).clearContent();
  
    if (resultados.length === 0) {
      tradeUpsSheet.getRange("D1").setValue("No hay resultados posibles con la base actual");
      return;
    }
  
    const output = [["Arma", "Colección", "Grado", "Probabilidad"]];
    resultados.forEach(r => {
      output.push([
        r.arma,
        r.coleccion,
        r.grado,
        r.prob.toFixed(2) + "%"
      ]);
    });
  
    tradeUpsSheet.getRange(startRow, startCol, output.length, output[0].length).setValues(output);
  }
  
  