/**
 * Pré-requisitos: `npm run dev`, `.env.local` e Supabase ok,
 * e **pelo menos 3 produtos com estoque ≥ 1** no cardápio.
 *
 * Janela interativa: terminal → `npm run cypress:open` → **E2E Testing** →
 * `jornada-cliente.cy.ts` → **Run**.
 */
describe("Jornada do cliente — demonstração", () => {
  const senha = "123123";
  /** E-mail único por execução (padrão pedido: aleatorio + @gmail.com). */
  const email = () =>
    `e2e${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}@gmail.com`;

  it("cadastro → logout → login → cardápio → favoritar → pedido (3 produtos) → confirmar → acompanhar", () => {
    const mail = email();

    cy.visit("/auth");
    /** Com `forceMount` no painel de cadastro o formulário fica no DOM; o clique torna o campo visível para digitar. */
    cy.get('[data-testid="auth-tab-cadastro"]', { timeout: 30_000 }).should("be.visible").click();
    cy.get('[data-testid="auth-input-nome"]', { timeout: 30_000 })
      .should("exist")
      .should("be.visible")
      .scrollIntoView()
      .type("Usuário Teste E2E");
    cy.get("#emailCadastro").type(mail);
    cy.get("#senhaCadastro").type(senha);
    cy.get("#confirmarSenhaCadastro").type(senha);
    cy.get('[data-testid="auth-form-cadastro"]').within(() => {
      cy.contains("button", "Criar conta").click();
    });

    cy.location("pathname", { timeout: 45_000 }).should("eq", "/");
    cy.get("aside nav", { timeout: 30_000 }).should("be.visible");

    cy.contains("button", "Sair do sistema").click();
    cy.contains("button", "Sim, sair").click();
    cy.location("pathname", { timeout: 20_000 }).should("include", "auth");

    cy.get("#email").type(mail);
    cy.get("#senha").type(senha);
    cy.contains("button", "Entrar").click();
    cy.location("pathname", { timeout: 45_000 }).should("eq", "/");

    cy.get("aside nav").contains("button", "Cardápio").click();
    cy.get('[data-testid="e2e-cardapio-produto-card"]', { timeout: 90_000 }).should(
      "have.length.at.least",
      3
    );

    cy.get('[data-testid="e2e-cardapio-produto-card"]')
      .first()
      .find('button[aria-label="Adicionar aos favoritos"]')
      .should("not.be.disabled")
      .click();

    cy.get("aside nav").contains("button", "Fazer pedidos").click();

    cy.get("#telefone", { timeout: 15_000 }).should("be.visible").clear().type("(11) 98888-7777");
    cy.get("#endereco").type("Rua Teste E2E, 100 - Centro — Cypress");

    cy.contains("button", "Escolher no cardápio").click();
    cy.get('[data-slot="dialog-content"]', { timeout: 20_000 }).should("be.visible");

    cy.get('[data-slot="dialog-content"]').within(() => {
      for (let i = 0; i < 3; i++) {
        cy.get('button[aria-label^="Adicionar"]').filter(':visible').first().click();
      }
    });

    cy.intercept("POST", "**/api/pedidos").as("criarPedido");

    cy.get('[data-slot="dialog-content"]')
      .find('button[data-slot="dialog-close"]')
      .first()
      .click();

    cy.contains("button", "Finalizar pedido agora").should("be.visible").click();
    cy.contains("Confirmar envio do pedido?", { timeout: 15_000 }).should("be.visible");
    cy.contains("button", "Confirmar pedido").click();

    cy.wait("@criarPedido", { timeout: 45_000 })
      .its("response.statusCode")
      .should("be.oneOf", [200, 201]);

    cy.get("aside nav").contains("button", "Acompanhar pedidos").click();

    cy.get('[data-testid="e2e-meus-pedido-card"]', { timeout: 60_000 })
      .should("have.length.at.least", 1)
      .first()
      .should("contain", "Rua Teste E2E");

    cy.get('[data-testid="e2e-meus-pedido-card"]').first().should("contain", "Pendente");
  });
});
