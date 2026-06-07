const { sampleGuides } = require("../data/sampleGuides");
const { getPool, hasDatabase, initializeDatabase } = require("./database");

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    productTypes: row.product_types,
    fitOptions: row.fit_options,
    questions: row.questions,
    measurements: row.measurements,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function listGuides(storeId = null) {
  if (hasDatabase()) {
    await initializeDatabase();
    const result = await getPool().query(
      `
        select *
        from size_guides
        where active = true
          and (store_id is null or store_id = $1)
        order by store_id nulls first, category, name
      `,
      [storeId]
    );
    return result.rows.map(mapRow);
  }

  return sampleGuides;
}

async function findGuideByProduct(product = {}, storeId = null) {
  const productText = normalizeText(
    [product.name, product.category, product.productType, product.tags].filter(Boolean).join(" ")
  );
  const guides = await listGuides(storeId);

  return (
    guides.find((guide) =>
      guide.productTypes.some((type) => productText.includes(normalizeText(type)))
    ) || guides[0] || sampleGuides[0]
  );
}

async function getGuide(id, storeId = null) {
  if (hasDatabase()) {
    await initializeDatabase();
    const result = await getPool().query(
      `
        select *
        from size_guides
        where id = $1
          and active = true
          and (store_id is null or store_id = $2)
        order by store_id nulls last
        limit 1
      `,
      [id, storeId]
    );
    if (result.rows[0]) return mapRow(result.rows[0]);
  }

  return sampleGuides.find((guide) => guide.id === id);
}

async function saveGuide(guide, storeId = null) {
  if (!hasDatabase()) {
    throw new Error("Cadastro persistente exige DATABASE_URL.");
  }

  await initializeDatabase();
  await getPool().query(
    `
      insert into size_guides
        (id, store_id, name, category, product_types, fit_options, questions, measurements, active, updated_at)
      values ($1, $2, $3, $4, $5, $6, $7, $8, true, now())
      on conflict (id)
      do update set
        name = excluded.name,
        category = excluded.category,
        product_types = excluded.product_types,
        fit_options = excluded.fit_options,
        questions = excluded.questions,
        measurements = excluded.measurements,
        active = true,
        updated_at = now()
    `,
    [
      guide.id,
      storeId,
      guide.name,
      guide.category,
      JSON.stringify(guide.productTypes || []),
      JSON.stringify(guide.fitOptions || ["normal"]),
      JSON.stringify(guide.questions || []),
      JSON.stringify(guide.measurements || [])
    ]
  );

  return getGuide(guide.id, storeId);
}

async function logRecommendation({ storeId, guideId, productId, productName, recommendedSize, confidence, answers }) {
  if (!hasDatabase()) return;
  await initializeDatabase();
  await getPool().query(
    `
      insert into recommendation_events
        (store_id, guide_id, product_id, product_name, recommended_size, confidence, answers)
      values ($1, $2, $3, $4, $5, $6, $7)
    `,
    [storeId, guideId, productId || null, productName || null, recommendedSize, confidence, JSON.stringify(answers || {})]
  );
}

async function getStats(storeId = null) {
  if (!hasDatabase()) {
    return {
      recommendations: 0,
      topSizes: [],
      recent: []
    };
  }

  await initializeDatabase();
  const [count, topSizes, recent] = await Promise.all([
    getPool().query("select count(*)::int as total from recommendation_events where ($1::text is null or store_id = $1)", [storeId]),
    getPool().query(
      `
        select recommended_size as size, count(*)::int as total
        from recommendation_events
        where ($1::text is null or store_id = $1)
        group by recommended_size
        order by total desc
        limit 5
      `,
      [storeId]
    ),
    getPool().query(
      `
        select product_name, recommended_size, confidence, created_at
        from recommendation_events
        where ($1::text is null or store_id = $1)
        order by created_at desc
        limit 8
      `,
      [storeId]
    )
  ]);

  return {
    recommendations: count.rows[0]?.total || 0,
    topSizes: topSizes.rows,
    recent: recent.rows
  };
}

module.exports = {
  findGuideByProduct,
  getStats,
  getGuide,
  listGuides,
  logRecommendation,
  saveGuide
};
