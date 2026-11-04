// Adds one example from the Examples tab and opens it in the editor, through the notice that follows adding.
// The examples are no longer in the Add panel, so the checks share this one way to get an example open.
export const addExample = async (page, name) => {
  await page.getByRole('tab', { name: /^Examples/ }).click();
  await page.locator('.example', { hasText: name }).getByRole('button', { name: 'Add', exact: true }).click();
  await page.locator('.notice').getByRole('button', { name: 'Open', exact: true }).click();
};
