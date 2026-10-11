import {expect} from '@playwright/test';
import assert from 'node:assert/strict';

export async function verifyAccordion(accordion) {
  const items = accordion.locator(':scope > details');
  const triggers = accordion.locator(':scope > details > summary');
  const single = await accordion.getAttribute('data-mode') === 'single';
  const initial = await items.evaluateAll(elements => elements.map(item => item.open));
  assert(initial.length >= 2, 'Accordion verification needs at least two items');
  const boxes = await accordion.evaluate(root => {
    const style = getComputedStyle(root);
    return {border: style.borderTopWidth, gap: style.rowGap, items: [...root.children].map(item => {
      const style = getComputedStyle(item);
      return {border: style.borderTopWidth, radius: style.borderTopLeftRadius, padding: style.paddingTop};
    })};
  });
  assert.equal(boxes.border, single ? '0px' : '1px');
  assert.equal(boxes.gap, single ? '8px' : '16px');
  for (const box of boxes.items) {
    assert.equal(box.border, single ? '1px' : '0px');
    assert.equal(box.padding, single ? '11px' : '0px');
    if (single) assert(parseFloat(box.radius) > 0, 'Every single-mode item has rounded corners');
  }
  if (single) assert(initial.filter(Boolean).length <= 1);
  for (let index = 0; index < initial.length; index++) {
    await expect(triggers.nth(index)).toHaveAttribute('aria-expanded', String(initial[index]));
    const controlled = await triggers.nth(index).getAttribute('aria-controls');
    assert.equal(await accordion.locator(`[id="${controlled}"]`).count(), 1);
  }
  const settled = () => expect(accordion.locator('[data-animating]')).toHaveCount(0);
  const setOpen = async (index, open) => {
    if (await triggers.nth(index).getAttribute('aria-expanded') !== String(open)) await triggers.nth(index).click();
    const animatedHeight = await items.nth(index).evaluate(item => {
      const frames = item.getAnimations()[0]?.effect.getKeyframes();
      return frames ? parseFloat(frames.at(-1).height) : null;
    });
    await settled();
    assert.equal(await items.nth(index).evaluate(item => item.open), open);
    if (animatedHeight !== null) {
      const finalHeight = await items.nth(index).evaluate(item => item.getBoundingClientRect().height);
      assert(Math.abs(animatedHeight - finalHeight) < 1, 'Animation settles without a padding/border height jump');
    }
  };
  await setOpen(0, true);
  await setOpen(1, true);
  assert.equal(await items.nth(0).evaluate(item => item.open), !single);
  await triggers.nth(1).press('Enter');
  await settled();
  await expect(triggers.nth(1)).toHaveAttribute('aria-expanded', 'false');
  assert.equal(await items.nth(1).evaluate(item => item.open), false);
  await triggers.nth(1).press('Space');
  await settled();
  await expect(triggers.nth(1)).toHaveAttribute('aria-expanded', 'true');
  assert.equal(await items.nth(1).evaluate(item => item.open), true);
  // Multiple clicks during the same animation must settle at the last requested state.
  await triggers.nth(1).evaluate(trigger => { trigger.click(); trigger.click(); trigger.click(); });
  await settled();
  assert.equal(await items.nth(1).evaluate(item => item.open), false);
  await expect(triggers.nth(1)).toHaveAttribute('aria-expanded', 'false');
  assert.equal(await items.nth(1).locator('.astryx-accordion-content').evaluate(content => content.inert), true);
  assert.equal(await items.nth(1).evaluate(item => item.getAnimations().length), 0);
  for (let index = 0; index < initial.length; index++) await setOpen(index, false);
  for (let index = 0; index < initial.length; index++) if (initial[index]) await setOpen(index, true);
}
