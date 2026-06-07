(function () {
  if (window.TamanhoCertoWidgetLoaded) return;
  window.TamanhoCertoWidgetLoaded = true;

  const script = document.currentScript;
  const baseUrl = new URL(script.src).origin;

  function productContext() {
    return {
      product_name:
        document.querySelector("[data-product-name]")?.textContent ||
        document.querySelector("h1")?.textContent ||
        document.title,
      category: document.querySelector("[data-product-category]")?.textContent || "",
      tags: document.body?.dataset?.productTags || ""
    };
  }

  async function openWidget() {
    const context = productContext();
    const params = new URLSearchParams({
      product_name: context.product_name,
      category: context.category,
      tags: context.tags
    });
    const config = await fetch(`${baseUrl}/api/widget/config?${params.toString()}`).then((res) => res.json());
    alert(`Tamanho Certo\\nGuia selecionado: ${config.guide.name}\\nPerguntas: ${config.guide.questions.length}`);
  }

  function mount() {
    const target = document.querySelector("[data-tamanho-certo]") || document.querySelector("form[action*='cart']") || document.body;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Descobrir meu tamanho";
    button.style.cssText = "margin:12px 0;padding:12px 16px;border:0;border-radius:6px;background:#0f766e;color:#fff;font-weight:700;cursor:pointer;";
    button.addEventListener("click", openWidget);
    target.prepend(button);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
