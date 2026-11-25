import { test, expect } from "@playwright/test";
test("portfolio navigation, overlays, focus and content", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Mohit Bhagwani",
  );
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
  const resumeUrl =
    "https://drive.google.com/file/d/1wuUAMAJDo88wfrBVkT41LrkUODmZQPE2/view?usp=sharing";
  const heroResume = page
    .locator(".kite-hero")
    .getByRole("link", { name: "View résumé" });
  await expect(heroResume).toBeVisible();
  await expect(heroResume).toHaveAttribute("href", resumeUrl);
  await expect(heroResume).toHaveAttribute("target", "_blank");
  await page
    .locator("#contact")
    .getByRole("button", { name: "Résumé", exact: true })
    .click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("link", { name: "View résumé on Google Drive" }),
  ).toHaveAttribute("href", resumeUrl);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.locator("#experience")).toContainText("Synoriq");
  await expect(page.locator("#experience")).not.toContainText(/Bluetris/i);
  await expect(page.locator("#work .case-link")).toHaveCount(10);
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
    if (
      /\/world\/(TraceScene|KiteScene|WorkshopScene)|\/assets\/(TraceScene|KiteScene|WorkshopScene)-/.test(
        r.url(),
      )
    )
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
test("transaction atlas follows approval, rejection, duplicate and refund routes", async ({
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
  await page.getByRole("button", { name: "Refund", exact: true }).click();
  for (const status of [
    "REFUND REQUESTED",
    "ACCEPTED",
    "ELIGIBLE",
    "REFUND PENDING",
    "CONFIRMED",
    "REFUNDED",
  ]) {
    await next.click();
    await expect(state).toHaveText(status);
  }
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

test("immersive journey launches from the 3D packet and exits cleanly", async ({
  page,
}, info) => {
  await page.goto("/");
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Enable 3D" }).click();
  }
  await page.getByRole("button", { name: "Enter the 3D journey" }).click();
  const journey = page.getByRole("dialog", {
    name: "Immersive transaction journey",
  });
  await expect(journey).toBeVisible();
  await expect(journey.locator("canvas")).toBeVisible();
  await journey.getByRole("button", { name: "Refund", exact: true }).click();
  await journey.getByRole("button", { name: "Launch packet" }).click();
  await expect(journey.getByText("REFUNDED", { exact: true })).toBeVisible();
  await journey.getByRole("button", { name: "Free camera" }).click();
  await expect(
    journey.getByRole("button", { name: "Follow packet" }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/${info.project.name}-refund-journey.png`,
  });
  await page.keyboard.press("Escape");
  await expect(journey).toHaveCount(0);
  await expect(page.getByTestId("trace-state")).toHaveText("REFUNDED");
});

test("skills workshop supports its accessible tool list", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#skills");
  const workshop = page.locator("#skills");
  await expect(workshop.locator("canvas")).toHaveCount(0);
  await workshop
    .getByRole("button", { name: "MCP & LanceDB", exact: true })
    .click();
  await expect(
    workshop.getByRole("heading", { name: "MCP & LanceDB" }),
  ).toBeVisible();
  await workshop.getByRole("button", { name: "Read related work" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Find the code behind a payment failure",
  );
});

test("3D workshop responds to exhibits and movement", async ({
  page,
}, info) => {
  await page.goto("/#skills");
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Enable 3D" }).click();
  }
  const workshop = page.locator("#skills");
  const stage = workshop.getByLabel("Skills workshop scene");
  await stage.scrollIntoViewIfNeeded();
  await expect(stage.locator("canvas")).toBeVisible();
  await expect(
    stage.getByText("Ceramic coffee cup", { exact: true }),
  ).toBeVisible();
  if (info.project.name === "desktop") {
    await workshop.locator(".workshop-surface").screenshot({
      path: "test-results/desktop-skills-java.png",
    });
  }
  await workshop.getByRole("button", { name: "Go", exact: true }).click();
  await expect(stage.getByText("Go gopher", { exact: true })).toBeVisible();
  await expect(workshop.getByRole("article")).toContainText("GORM");
  await expect(workshop.getByRole("article")).toContainText("Renée French");
  if (info.project.name === "desktop") {
    await workshop.locator(".workshop-surface").screenshot({
      path: "test-results/desktop-skills-studio.png",
    });
  }
  await workshop
    .getByRole("button", { name: "Kafka & RabbitMQ", exact: true })
    .click();
  await expect(
    workshop.getByRole("heading", { name: "Kafka & RabbitMQ" }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/${info.project.name}-workshop.png`,
  });
  await stage.getByRole("button", { name: "Walk the workshop" }).click();
  await expect(stage.getByRole("button", { name: "Overview" })).toBeVisible();
  if (info.project.name === "mobile") {
    const button = stage.getByRole("button", { name: "Walk up", exact: true });
    await expect(button).toBeVisible();
    await button.scrollIntoViewIfNeeded();
    const box = await button.boundingBox();
    if (!box) throw new Error("Touch movement control could not be located");
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }],
    });
    await expect(
      stage.getByRole("button", { name: "Inspect Java", exact: true }),
    ).toBeVisible();
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await stage
      .getByRole("button", { name: "Inspect Java", exact: true })
      .click();
  } else {
    await page.keyboard.down("w");
    await expect(
      stage.getByRole("button", { name: "Inspect Java", exact: true }),
    ).toBeVisible();
    await page.keyboard.up("w");
    await page.keyboard.press("e");
  }
  await expect(
    workshop.getByRole("heading", { name: "Java", exact: true }),
  ).toBeVisible();
  await expect(
    stage.getByRole("complementary", { name: "Exhibit detail" }),
  ).toContainText("Java 8 through 21");
  await page.screenshot({
    path: `test-results/${info.project.name}-workshop-walk.png`,
  });
  await stage.getByRole("button", { name: "Overview" }).click();
  await expect(
    stage.getByRole("button", { name: "Walk the workshop" }),
  ).toBeVisible();
});

test("Jaipur kite launches, catches a gust, and reveals the first rooftop", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  if (info.project.name === "mobile")
    await page.getByRole("button", { name: "Enable 3D" }).click();
  const hero = page.getByRole("region", {
    name: "Kites over Jaipur",
  });
  const launch = hero.getByRole("button", { name: "Launch kite" });
  await expect(launch).toBeEnabled({ timeout: 30000 });
  await page.screenshot({
    path: `test-results/${info.project.name}-kite-launch.png`,
  });
  await launch.click();
  await expect(hero.getByTestId("kite-distance")).not.toHaveText("0 m");
  if (info.project.name === "mobile") {
    await hero.getByRole("button", { name: "Kite gust" }).tap();
    await expect(hero.getByText("Gust caught!")).toBeVisible();
  } else {
    await page.keyboard.down(" ");
    await expect(hero.getByText("Gust caught!")).toBeVisible();
    await page.keyboard.up(" ");
  }
  const found = hero.getByRole("complementary", { name: "Discovered rooftop" });
  await expect(
    found.getByRole("heading", { name: "The Workshop" }),
  ).toBeVisible({ timeout: 21000 });
  await page.screenshot({
    path: `test-results/${info.project.name}-kite-flight.png`,
  });
  await found.getByRole("link", { name: "Explore rooftop" }).click();
  await expect(page).toHaveURL(/#skills$/);
  expect(errors).toEqual([]);
});

test("Jaipur flight shows landmarks and rebounds when the kite dives into a roof", async ({
  page,
}, info) => {
  test.skip(
    info.project.name === "mobile",
    "Desktop keyboard collision; shared sweep has unit coverage",
  );
  await page.goto("/");
  const hero = page.getByRole("region", { name: /Kites over Jaipur/ });
  const launch = hero.getByRole("button", { name: "Launch kite" });
  await expect(launch).toBeEnabled({ timeout: 40000 });
  await hero.getByRole("button", { name: "City map" }).click();
  const guide = hero.getByRole("complementary", { name: "Jaipur landmarks" });
  for (const name of [
    "Hawa Mahal",
    "City Palace",
    "Jal Mahal",
    "Albert Hall",
    "Jantar Mantar",
    "Amber Fort",
  ])
    await expect(guide.getByText(name, { exact: true })).toBeVisible();
  await guide.getByRole("button", { name: "Close city map" }).click();
  await page.screenshot({ path: "test-results/desktop-jaipur-landmarks.png" });
  await launch.click();
  await page.keyboard.down("ArrowDown");
  await expect(hero.getByRole("status")).toContainText("Clipped", {
    timeout: 21000,
  });
  await page.keyboard.up("ArrowDown");
  await expect(hero.getByText("Regaining altitude")).toBeVisible();
  await page.screenshot({ path: "test-results/desktop-jaipur-collision.png" });
});
