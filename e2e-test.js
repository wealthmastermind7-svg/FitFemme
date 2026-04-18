const { chromium } = require('playwright');

(async () => {
  let browser;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 402, height: 874 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
    });
    const page = await context.newPage();

    console.log('1. Loading app...');
    await page.goto('http://localhost:8081');
    await page.waitForTimeout(5000); // Give it plenty of time
    await page.screenshot({ path: 'home_load.png' });
    console.log('Initial load screenshot taken');

    const startBtn = page.locator('text=Start Your Journey');
    if (await startBtn.isVisible()) {
      console.log('2. Onboarding detected, proceeding...');
      await startBtn.click();
      await page.waitForTimeout(2000);
      
      const goalBtn = page.locator('text=Booty Builder');
      if (await goalBtn.isVisible()) {
        await goalBtn.click();
      } else {
        await page.locator('text=Lose Weight').first().click();
      }
      await page.waitForTimeout(1000);
      
      const continueBtn = page.locator('text=CONTINUE');
      await continueBtn.click();
      await page.waitForTimeout(3000);
      console.log('Reached Home screen');
    }

    console.log('3. Home screen verification...');
    await page.screenshot({ path: 'home_screen.png' });
    
    const tabs = ['Home', 'Workouts', 'Stats', 'Profile'];
    for (const tab of tabs) {
      const visible = await page.locator(`text=${tab}`).first().isVisible();
      console.log(`Tab ${tab} visible: ${visible}`);
    }

    const mealIdeasLink = page.locator('text=View meal ideas for your goal');
    console.log('Meal Ideas link visible:', await mealIdeasLink.isVisible());

    console.log('5. Tapping Meal Ideas...');
    await mealIdeasLink.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'meal_ideas.png' });
    
    const proBadge = page.locator('text=PRO').first();
    console.log('PRO badge visible:', await proBadge.isVisible());

    console.log('6. Tapping PRO meal card...');
    await proBadge.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'paywall_meal.png' });
    console.log('Paywall visible:', await page.locator('text=Begin your journey').isVisible());

    console.log('7. Closing paywall...');
    await page.locator('svg').first().click({ force: true }); // Close is usually the first SVG (X)
    await page.waitForTimeout(1000);

    console.log('8. Closing Meal Ideas...');
    await page.locator('svg').first().click({ force: true });
    await page.waitForTimeout(1000);

    console.log('9. Workouts tab...');
    await page.locator('text=Workouts').first().click();
    await page.waitForTimeout(2000);
    console.log('Workouts header visible:', await page.locator('text=All Workouts').isVisible());

    console.log('10. Stats tab...');
    await page.locator('text=Stats').first().click();
    await page.waitForTimeout(2000);
    console.log('Unlock Pro visible:', await page.locator('text=Unlock Pro').isVisible());

    console.log('11. Profile tab...');
    await page.locator('text=Profile').first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'profile_screen.png' });
    console.log('Profile goal visible:', await page.locator('text=Your Goal').isVisible());

    console.log('12. Plus tab...');
    // The plus button is usually an SVG
    await page.locator('path[d*="M12 5v14M5 12h14"]').first().click({ force: true });
    await page.waitForTimeout(2000);
    console.log('Start Workout visible:', await page.locator('text=Start Workout').isVisible());

    console.log('E2E sequence finished');
  } catch (err) {
    console.error('Error during E2E:', err);
  } finally {
    if (browser) await browser.close();
  }
})();
