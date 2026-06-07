const sampleGuides = [
  {
    id: "camiseta-adulto",
    name: "Camiseta adulto",
    category: "camisetas",
    productTypes: ["camiseta", "camisa", "blusa", "regata"],
    fitOptions: ["justo", "normal", "folgado"],
    questions: [
      "altura",
      "peso",
      "torax",
      "cintura",
      "tamanho_usual",
      "preferencia_caimento"
    ],
    measurements: [
      { size: "PP", bustMin: 78, bustMax: 84, waistMin: 60, waistMax: 66 },
      { size: "P", bustMin: 85, bustMax: 92, waistMin: 67, waistMax: 74 },
      { size: "M", bustMin: 93, bustMax: 100, waistMin: 75, waistMax: 82 },
      { size: "G", bustMin: 101, bustMax: 108, waistMin: 83, waistMax: 90 },
      { size: "GG", bustMin: 109, bustMax: 118, waistMin: 91, waistMax: 100 }
    ]
  },
  {
    id: "calca-adulto",
    name: "Calca adulto",
    category: "calcas",
    productTypes: ["calca", "jeans", "bermuda", "short"],
    fitOptions: ["justo", "normal", "folgado"],
    questions: [
      "altura",
      "peso",
      "cintura",
      "quadril",
      "tamanho_usual",
      "preferencia_caimento"
    ],
    measurements: [
      { size: "36", waistMin: 66, waistMax: 70, hipMin: 88, hipMax: 92 },
      { size: "38", waistMin: 71, waistMax: 76, hipMin: 93, hipMax: 98 },
      { size: "40", waistMin: 77, waistMax: 82, hipMin: 99, hipMax: 104 },
      { size: "42", waistMin: 83, waistMax: 88, hipMin: 105, hipMax: 110 },
      { size: "44", waistMin: 89, waistMax: 96, hipMin: 111, hipMax: 118 },
      { size: "46", waistMin: 97, waistMax: 104, hipMin: 119, hipMax: 126 }
    ]
  },
  {
    id: "vestido-adulto",
    name: "Vestido adulto",
    category: "vestidos",
    productTypes: ["vestido", "macacao", "conjunto feminino"],
    fitOptions: ["justo", "normal", "folgado"],
    questions: [
      "altura",
      "peso",
      "torax",
      "cintura",
      "quadril",
      "tamanho_usual",
      "preferencia_caimento"
    ],
    measurements: [
      { size: "P", bustMin: 84, bustMax: 90, waistMin: 64, waistMax: 70, hipMin: 90, hipMax: 96 },
      { size: "M", bustMin: 91, bustMax: 98, waistMin: 71, waistMax: 78, hipMin: 97, hipMax: 104 },
      { size: "G", bustMin: 99, bustMax: 106, waistMin: 79, waistMax: 86, hipMin: 105, hipMax: 112 },
      { size: "GG", bustMin: 107, bustMax: 116, waistMin: 87, waistMax: 96, hipMin: 113, hipMax: 122 }
    ]
  },
  {
    id: "infantil",
    name: "Roupa infantil",
    category: "infantil",
    productTypes: ["infantil", "menino", "menina", "bebe"],
    fitOptions: ["normal", "folgado"],
    questions: [
      "idade",
      "altura",
      "peso",
      "tamanho_usual",
      "preferencia_caimento"
    ],
    measurements: [
      { size: "2", heightMin: 86, heightMax: 94, weightMin: 11, weightMax: 14 },
      { size: "4", heightMin: 95, heightMax: 106, weightMin: 15, weightMax: 18 },
      { size: "6", heightMin: 107, heightMax: 118, weightMin: 19, weightMax: 23 },
      { size: "8", heightMin: 119, heightMax: 130, weightMin: 24, weightMax: 29 },
      { size: "10", heightMin: 131, heightMax: 142, weightMin: 30, weightMax: 36 },
      { size: "12", heightMin: 143, heightMax: 154, weightMin: 37, weightMax: 45 }
    ]
  }
];

module.exports = { sampleGuides };
