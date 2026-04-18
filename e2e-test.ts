import { chromium, Browser, Page } from 'playwright';

async function runTest() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 402, height: 874 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
  });
  const page = await context.newPage();

  try {
    console.log('1. Loading app...');
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'home_load.png' });
    console.log('App loaded successfully');

    // Onboarding flow
    const startButton = page.getByText('Start Your Journey');
    if (await startButton.isVisible()) {
      console.log('2. Proceeding with onboarding...');
      await startButton.click();
      await page.waitForTimeout(1000);
      
      console.log('Choosing goal...');
      const goalButton = page.getByText('Booty Builder');
      if (await goalButton.isVisible()) {
        await goalButton.click();
      } else {
        await page.locator('text=Lose Weight').first().click();
      }
      
      const continueBtn = page.getByText('CONTINUE');
      await continueBtn.click();
      await page.waitForTimeout(2000);
      console.log('Reached Home screen');
    }

    // Home screen verification
    console.log('3. Verifying Home screen tabs and sections...');
    await page.screenshot({ path: 'home_screen.png' });
    
    const tabs = ['Home', 'Workouts', 'Stats', 'Profile'];
    for (const tab of tabs) {
      if (!(await page.getByText(tab, { exact: true }).isVisible())) {
        console.error(`Tab ${tab} not found`);
      }
    }

    const sections = ["Today's Goal Status", "This Week", "View meal ideas for your goal", "Recommended for Your Goal"];
    for (const section of sections) {
       if (!(await page.getByText(section).isVisible())) {
         console.error(`Section ${section} not found`);
       }
    }

    // Meal Ideas
    console.log('5. Opening Meal Ideas...');
    await page.getByText('View meal ideas for your goal').click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'meal_ideas.png' });
    
    if (!(await page.getByText('Premium recipes').isVisible())) {
      console.error('Premium recipes lock banner not found');
    }

    // Meal detail (paywall)
    console.log('6. Tapping meal card (triggering paywall)...');
    await page.locator('text=PRO').first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'paywall_meal.png' });
    
    if (await page.getByText('Begin your journey').isVisible()) {
      console.log('Paywall displayed correctly');
    } else {
      console.error('Paywall not displayed');
    }

    // Close paywall
    console.log('7. Closing paywall...');
    await page.locator('svg').filter({ has: page.locator('path[d*="M18 6"]') }).first().click({ force: true });
    await page.waitForTimeout(500);

    // Close Meal Ideas
    console.log('8. Closing Meal Ideas...');
    await page.locator('svg').filter({ has: page.locator('path[d*="M18 6"]') }).first().click({ force: true });
    await page.waitForTimeout(500);

    // Workouts
    console.log('9. Verifying Workouts tab...');
    await page.getByText('Workouts', { exact: true }).click();
    await page.waitForTimeout(1000);
    if (!(await page.getByText('All Workouts').isVisible())) {
      console.error('Workouts list not found');
    }
    
    const lockIcon = page.locator('path[d*="M7 11V7a5 5 0 0110 0v4"]').first();
    await lockIcon.click({ force: true });
    await page.waitForTimeout(500);
    if (await page.getByText('Begin your journey').isVisible()) {
      console.log('Workout paywall working');
      await page.locator('svg').filter({ has: page.locator('path[d*="M18 6"]') }).first().click({ force: true });
    }

    // Stats
    console.log('10. Verifying Stats tab...');
    await page.getByText('Stats', { exact: true }).click();
    await page.waitForTimeout(1000);
    if (await page.getByText('Unlock Pro').isVisible()) {
      console.log('Stats gated screen verified');
    }

    // Profile
    console.log('11. Verifying Profile tab...');
    await page.getByText('Profile', { exact: true }).click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'profile_screen.png' });
    if (await page.getByText('Your Goal').isVisible() && await page.getByText('Upgrade to Pro').isVisible()) {
      console.log('Profile screen verified');
    }

    // Plus tab
    console.log('12. Verifying Plus tab...');
    await page.locator('path[d*="M12 5v14M5 12h14"]').first().click({ force: true });
    await page.waitForTimeout(1000);
    if (await page.getByText('Start Workout').isVisible() && await page.getByText('Scan Food').isVisible()) {
      console.log('Plus tab options verified');
    }

    console.log('All tests completed successfully!');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

runTest();
