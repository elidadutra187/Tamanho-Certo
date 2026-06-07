const assert = require("node:assert");
const { getGuide } = require("../services/guideService");
const { recommendSize } = require("../services/recommendation");

(async () => {
  const camiseta = await getGuide("camiseta-adulto");
  const camisetaResult = recommendSize(camiseta, {
    torax: 98,
    cintura: 80,
    tamanho_usual: "M",
    preferencia_caimento: "normal"
  });

  assert.equal(camisetaResult.size, "M");
  assert.ok(camisetaResult.confidence >= 70);

  const calca = await getGuide("calca-adulto");
  const calcaResult = recommendSize(calca, {
    cintura: 84,
    quadril: 108,
    preferencia_caimento: "folgado"
  });

  assert.equal(calcaResult.size, "44");

  const infantil = await getGuide("infantil");
  const infantilResult = recommendSize(infantil, {
    altura: 124,
    peso: 27,
    preferencia_caimento: "normal"
  });

  assert.equal(infantilResult.size, "8");

  console.log("Recommendation tests passed");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
