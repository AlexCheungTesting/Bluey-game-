const { test, expect } = require('@playwright/test');

test('Check start screen', async ({ page }) => {
  await page.goto('http://localhost:8081');

  // Verify Start Screen is displayed
  const startButton = page.locator('text=Start Memory game');
  await expect(startButton).toBeVisible({ timeout: 10000 });

  // Take screenshot
  await page.screenshot({ path: 'start_screen.png' });

  // Click start game
  await startButton.click();

  // Wait a moment for UI to update
  await page.waitForTimeout(1000);

  // Take screenshot of game board
  await page.screenshot({ path: 'game_board.png' });
});
