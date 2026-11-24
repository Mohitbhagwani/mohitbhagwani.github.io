import { test, expect } from "@playwright/test";
test("portfolio navigation, overlays, focus and content", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Beyond");
  await page.locator("#work .case-link").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "One integration. Many payment paths." }),
  ).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Close dialog" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "View résumé" }).click();
  await expect(
    page.getByText("Résumé download is not configured.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("link", { name: "GitHub", exact: true }),
  ).toHaveAttribute("href", "https://github.com/Mohitbhagwani");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: `test-results/${info.project.name}-portfolio.png`,
  });
});
test("payment, duplicates, provider failures and callbacks", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#view/demo%2Fpayments");
  await page.getByRole("button", { name: "Initiate payment" }).click();
  await expect(page.getByTestId("payment-count")).toHaveText("1");
  await page.getByRole("button", { name: "Initiate payment" }).click();
  await expect(page.getByRole("dialog").getByRole("status")).toContainText(
    "Duplicate request",
  );
  await expect(page.getByTestId("payment-count")).toHaveText("1");
  await page.getByRole("button", { name: "Next transition" }).click();
  await page.getByRole("button", { name: "Next transition" }).click();
  await page.getByRole("button", { name: "Deliver webhook" }).click();
  await expect(page.locator(".metric-strip")).toContainText("SUCCEEDED");
  await page.getByRole("button", { name: "Deliver webhook" }).click();
  await expect(page.locator(".event-log")).toContainText("DUPLICATE CALLBACK");
  await page.getByLabel("Idempotency key").fill("order-002");
  await page.getByRole("button", { name: "Initiate payment" }).click();
  await page.getByRole("button", { name: "Next transition" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Provider failure" })
    .click();
  await expect(page.locator(".metric-strip")).toContainText("FAILED");
});
test("all engineering demonstrations execute", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#view/playground");
  await page.getByRole("tab", { name: "Kafka & message queues" }).click();
  await page.getByRole("button", { name: "Produce event" }).click();
  await page.getByRole("button", { name: "Fail consumer B" }).click();
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: "Fail processing" }).click();
  await expect(page.getByRole("dialog").getByRole("status")).toContainText(
    "dead-letter",
  );
  await page.getByRole("tab", { name: "Redis cache-aside" }).click();
  await page.getByRole("button", { name: "Read product" }).click();
  await page.getByRole("button", { name: "Read product" }).click();
  await expect(page.locator(".plain-log")).toContainText("HIT");
  await page.getByRole("button", { name: "Advance clock +6s" }).click();
  await expect(page.locator(".plain-log")).toContainText("TTL expired");
  await page.getByRole("tab", { name: "Inventory reservations" }).click();
  await page
    .getByRole("button", { name: "Simulate 3 concurrent buyers" })
    .click();
  await expect(page.getByTestId("stock")).toHaveText("0");
  await expect(page.locator(".reservation")).toHaveCount(2);
  await page.getByRole("button", { name: "Advance clock +10s" }).click();
  await page.getByRole("button", { name: "Advance clock +10s" }).click();
  await expect(page.getByTestId("stock")).toHaveText("2");
  await page.getByRole("tab", { name: "KYC workflow" }).click();
  for (const name of [
    "IN PROGRESS",
    "AWAITING USER",
    "AWAITING PROVIDER",
    "MANUAL REVIEW",
    "COMPLETED",
  ])
    await page.getByRole("button", { name, exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("status")).toHaveText(
    "COMPLETED",
  );
  await page.getByRole("tab", { name: "JSON transformation" }).click();
  await page.getByRole("button", { name: "Apply transformation" }).click();
  await expect(page.locator("pre")).toContainText("4991");
  await page.getByLabel("Input JSON", { exact: true }).fill("{invalid");
  await page.getByRole("button", { name: "Apply transformation" }).click();
  await expect(page.locator("pre")).toHaveClass("error");
  await page.getByRole("tab", { name: "Global payment rails" }).click();
  await page.getByRole("button", { name: "UK & Europe", exact: true }).click();
  await expect(page.locator(".rail-detail h4")).toContainText("Open Banking");
});
test("reduced motion loads complete 2D mode without 3D bundle", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const worlds: string[] = [];
  page.on("request", (r) => {
    if (/\/world\/TraceScene|\/assets\/TraceScene-/.test(r.url()))
      worlds.push(r.url());
  });
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Try the trace" })).toBeVisible();
  await expect(page.getByTestId("world-stage")).toHaveCount(0);
  await expect(page.locator("#experience")).toContainText("PaySecure");
  expect(worlds).toEqual([]);
});
test("WebGL failure gracefully provides the full portfolio", async ({
  page,
}) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = (() =>
      null) as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Try the trace" })).toBeVisible();
  await expect(page.getByTestId("world-stage")).toHaveCount(0);
  await page.locator("#work .case-link").nth(4).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Production implementation has not been confirmed",
  );
});
test("transaction atlas follows approved, failed and duplicate routes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const state = page.getByTestId("trace-state");
  await expect(state).toHaveText("STANDBY");
  const next = page.getByRole("button", { name: "Advance one event" });
  for (const status of [
    "RECEIVED",
    "ACCEPTED",
    "ROUTED",
    "PENDING",
    "CALLBACK",
    "SUCCEEDED",
  ]) {
    await next.click();
    await expect(state).toHaveText(status);
  }
  await expect(next).toBeDisabled();
  await page
    .getByRole("button", { name: "Provider failure", exact: true })
    .click();
  for (const status of [
    "RECEIVED",
    "ACCEPTED",
    "ROUTED",
    "REJECTED",
    "FAILED",
  ]) {
    await next.click();
    await expect(state).toHaveText(status);
  }
  await page
    .getByRole("button", { name: "Duplicate request", exact: true })
    .click();
  await page.getByRole("button", { name: "Run trace" }).click();
  await expect(state).toHaveText("REUSED");
  await expect(next).toBeDisabled();
  await page.getByRole("button", { name: "Transaction record" }).click();
  await expect(
    page.getByRole("heading", { name: "Transaction record" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Explore related work" }).click();
  await expect(page.getByRole("dialog")).toContainText("Know what happened");
});
test("3D atlas renders and its modules open the system inspector", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (entry) => {
    if (entry.type() === "error") errors.push(entry.text());
  });
  await page.goto("/");
  if (info.project.name === "mobile")
    await page.getByRole("button", { name: "Enable 3D" }).click();
  const stage = page.getByTestId("world-stage");
  await expect(stage.locator("canvas")).toBeVisible({ timeout: 30000 });
  const router = stage.getByRole("button", { name: /ROUTER/ });
  await expect(router).toBeVisible();
  await router.click();
  await expect(
    page.getByRole("heading", { name: "Orchestration core" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Run trace" }).click();
  await expect(page.getByTestId("trace-state")).toHaveText("SUCCEEDED", {
    timeout: 18000,
  });
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: `test-results/${info.project.name}-atlas.png`,
  });
  expect(errors).toEqual([]);
  await page.getByRole("button", { name: "2D portfolio" }).click();
  await expect(stage).toHaveCount(0);
});
