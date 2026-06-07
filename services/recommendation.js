const fitShift = {
  justo: -1,
  normal: 0,
  folgado: 1
};

function midpoint(min, max) {
  if (typeof min !== "number" || typeof max !== "number") {
    return null;
  }
  return (min + max) / 2;
}

function rangeScore(value, min, max) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  if (typeof min !== "number" || typeof max !== "number") {
    return 0;
  }
  if (value >= min && value <= max) {
    return 4;
  }
  const center = midpoint(min, max);
  const distance = Math.abs(value - center);
  return Math.max(0, 3 - distance / 4);
}

function scoreSize(row, answers) {
  let score = 0;

  score += rangeScore(answers.torax, row.bustMin, row.bustMax);
  score += rangeScore(answers.cintura, row.waistMin, row.waistMax);
  score += rangeScore(answers.quadril, row.hipMin, row.hipMax);
  score += rangeScore(answers.altura, row.heightMin, row.heightMax);
  score += rangeScore(answers.peso, row.weightMin, row.weightMax);

  if (answers.tamanho_usual && normalizeSize(answers.tamanho_usual) === normalizeSize(row.size)) {
    score += 1.5;
  }

  return score;
}

function normalizeSize(size) {
  return String(size || "").trim().toUpperCase();
}

function chooseWithFit(measurements, bestIndex, fit) {
  const shift = fitShift[fit] || 0;
  const targetIndex = Math.min(Math.max(bestIndex + shift, 0), measurements.length - 1);
  return measurements[targetIndex];
}

function recommendSize(guide, answers = {}) {
  if (!guide || !Array.isArray(guide.measurements) || guide.measurements.length === 0) {
    throw new Error("Guia de tamanho invalido");
  }

  const normalizedAnswers = {
    ...answers,
    altura: Number(answers.altura) || undefined,
    peso: Number(answers.peso) || undefined,
    torax: Number(answers.torax) || undefined,
    cintura: Number(answers.cintura) || undefined,
    quadril: Number(answers.quadril) || undefined
  };

  const scored = guide.measurements.map((row, index) => ({
    row,
    index,
    score: scoreSize(row, normalizedAnswers)
  }));

  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  const best = scored[0];
  const adjusted = chooseWithFit(guide.measurements, best.index, normalizedAnswers.preferencia_caimento);
  const confidence = Math.min(98, Math.max(55, Math.round(58 + best.score * 7)));

  const alternative = guide.measurements[Math.min(adjusted === best.row ? best.index + 1 : best.index, guide.measurements.length - 1)];

  return {
    size: adjusted.size,
    confidence,
    alternativeSize: alternative && alternative.size !== adjusted.size ? alternative.size : null,
    message: buildMessage(adjusted.size, alternative && alternative.size !== adjusted.size ? alternative.size : null, normalizedAnswers.preferencia_caimento),
    guideId: guide.id
  };
}

function buildMessage(size, alternativeSize, fit) {
  if (fit === "justo") {
    return `Recomendamos o tamanho ${size}. Como voce prefere caimento mais justo, esta opcao deve vestir mais rente ao corpo.`;
  }
  if (fit === "folgado") {
    return `Recomendamos o tamanho ${size}. Como voce prefere mais conforto, evitamos uma opcao muito justa.`;
  }
  if (alternativeSize) {
    return `Recomendamos o tamanho ${size}. Se estiver entre dois tamanhos, considere ${alternativeSize} para mais conforto.`;
  }
  return `Recomendamos o tamanho ${size} para este produto.`;
}

module.exports = {
  recommendSize
};
