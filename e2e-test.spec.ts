import { test, expect } from '@playwright/test';

test.use({
  viewport: { width: 402, height: 874 },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
});

test('Fit Femme Expo E2E Flow', async ({ page }) => {
  // 1. App loads
  await page.goto('http://localhost:8081');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Wait for React Native to boot
  
  await page.screenshot({ path: 'step1_initial_load.png' });

  // 2. If Onboarding
  const startButton = page.getByText('Start Your Journey');
  if (await startButton.isVisible()) {
    console.log('Onboarding visible, proceeding...');
    // The onboarding slides are in a horizontal scrollview. 
    // We can just click the button multiple times or scroll.
    // Looking at the code, handleStart navigates to GoalSetup.
    // It doesn't seem to require sliding through all slides to enable the button.
    await startButton.click();
    await page.waitForTimeout(1000);
    
    // Choose "Booty Builder"
    await page.screenshot({ path: 'step2_goal_setup.png' });
    const goalButton = page.getByText('Booty Builder');
    if (await goalButton.isVisible()) {
        await goalButton.click();
    } else {
        await page.locator('text=Lose Weight').first().click();
    }
    
    const continueButton = page.getByText('CONTINUE');
    await continueButton.click();
    await page.waitForTimeout(2000);
  }

  // 3. Home screen tabs
  await page.screenshot({ path: 'step3_home_screen.png' });
  
  // Home screen sections check
  await expect(page.getByText("Today's Goal Status")).toBeVisible();
  await expect(page.getByText("This Week")).toBeVisible();
  const mealIdeasLink = page.getByText('View meal ideas for your goal');
  await expect(mealIdeasLink).toBeVisible();
  await expect(page.getByText('Recommended for Your Goal')).toBeVisible();

  // 5. Tap "View meal ideas for your goal"
  await mealIdeasLink.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'step4_meal_ideas.png' });
  
  await expect(page.getByText('Premium recipes')).toBeVisible();
  // Check for 4 meal cards
  const proBadges = page.locator('text=PRO');
  // At least some PRO badges should be there
  await expect(proBadges.first()).toBeVisible();

  // 6. Tap any meal card -> Paywall
  await page.locator('text=PRO').first().click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'step5_paywall.png' });
  await expect(page.getByText('Begin your journey')).toBeVisible();
  await expect(page.getByText('Continue')).toBeVisible();

  // 7. Close the paywall (X button)
  // The Paywall component has a Feather "x" icon. 
  // In web, this renders as a button or an element with an SVG.
  // We'll try to find the button with the X.
  const closeBtn = page.locator('path[d*="M18 6L6 18M6 6l12 12"]').first().locator('..').locator('..'); 
  // Or more simply, since it's likely the only X
  await page.locator('svg').filter({ has: page.locator('path[d*="M18 6"]') }).first().click({ force: true });
  await page.waitForTimeout(500);

  // 8. Close Meal Ideas (X button)
  await page.locator('svg').filter({ has: page.locator('path[d*="M18 6"]') }).first().click({ force: true });
  await page.waitForTimeout(500);

  // 9. Tap Workouts tab
  // The tab bar uses Feather "grid" for Workouts.
  // Tab labels are translated. In English: "Workouts"
  await page.getByText('Workouts', { exact: true }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'step6_workouts.png' });
  
  // Verify workouts list shows
  await expect(page.getByText('All Workouts')).toBeVisible();
  
  // Workouts 2-6 should have lock icon
  // Tapping a locked one opens Paywall
  // We'll look for an element that has a lock icon.
  const lockIcon = page.locator('path[d*="M7 11V7a5 5 0 0110 0v4"]').first();
  await lockIcon.click({ force: true });
  await page.waitForTimeout(500);
  await expect(page.getByText('Begin your journey')).toBeVisible();
  // Close paywall again
  await page.locator('svg').filter({ has: page.locator('path[d*="M18 6"]') }).first().click({ force: true });

  // 10. Tap Stats tab
  await page.getByText('Stats', { exact: true }).click();
  await page.waitForTimeout(1000);
  await expect(page.getByText('Unlock Pro')).toBeVisible();

  // 11. Tap Profile tab
  await page.getByText('Profile', { exact: true }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'step7_profile.png' });
  await expect(page.getByText('Your Goal')).toBeVisible();
  await expect(page.getByText('Subscription')).toBeVisible();
  await expect(page.getByText('Upgrade to Pro')).toBeVisible();
  
  // Language option
  await expect(page.getByText('Language')).toBeVisible();

  // 12. Tap "+" tab
  // The center button has Feather "plus"
  await page.locator('path[d*="M12 5v14M5 12h14"]').first().click({ force: true });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'step8_plus_menu.png' });
  await expect(page.getByText('What would you like to do?')).toBeVisible();
  await expect(page.getByText('Start Workout')).toBeVisible();
  await expect(page.getByText('Scan Food')).toBeVisible();
});
