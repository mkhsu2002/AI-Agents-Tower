import{test,expect}from'@playwright/test';import{mkdir,readFile,writeFile}from'node:fs/promises';import{createHash}from'node:crypto';
test.beforeEach(async({request})=>{await request.post('/__reset',{data:'success'});});
test('Pages-bound network: denied consent then two peer roles, editable review, actual receipt and real file round trip',async({browser,request})=>{
 const outside:string[]=[];const ctx=await browser.newContext({acceptDownloads:true});await ctx.route('**/*',r=>{if(!['http://127.0.0.1:4551','http://127.0.0.1:4552'].includes(new URL(r.request().url()).origin)){outside.push(r.request().url());return r.abort();}return r.continue();});await mkdir('artifacts/network-release',{recursive:true});
 try{const page=await ctx.newPage();await page.goto('/connect/');await expect(page.locator('#run')).toBeEnabled();await page.locator('#run').click();await expect(page.locator('#out')).toContainText('CONSENT_DENIED');let e=await(await request.get('/__evidence')).json();expect(e.upstream.calls).toBe(0);expect(e.peerReads).toBe(0);await page.locator('#restart').click();await page.locator('#approve').check();await page.locator('#run').click();await expect(page.locator('#out')).toHaveText('Review proposal');await expect(page.locator('#draft')).toHaveText('Original draft preserved');
 const proposed=JSON.parse(await page.locator('#bundle-edit').inputValue());proposed.displayName='Atlas, reviewed by you';await page.locator('#bundle-edit').fill(JSON.stringify(proposed));await expect(page.locator('#apply')).toBeDisabled();await page.locator('#validate').click();await expect(page.locator('#receipt-card')).toBeVisible();const receipt=JSON.parse((await page.locator('#out').textContent())!);expect(receipt.calls).toBe(3);expect(receipt.actionExecutions).toBe(1);expect(receipt.roleCalls.map((r:{agent:string})=>r.agent)).toEqual(['reception','home_builder']);expect(receipt.overrides).toEqual({router:'',model:''});await page.locator('#apply').click();await expect(page.locator('#home-preview h2')).toHaveText('Atlas, reviewed by you');
 const d=page.waitForEvent('download');await page.locator('#save-home').click();const file='artifacts/network-release/atlas.homebundle.json';await(await d).saveAs(file);const bytes=await readFile(file);const fresh=await browser.newContext({acceptDownloads:true});try{const p=await fresh.newPage();await p.goto('/connect/');const chooser=p.waitForEvent('filechooser');await p.locator('#home-file').click();await(await chooser).setFiles(file);await p.locator('#apply-file').click();await expect(p.locator('#home-preview h2')).toHaveText('Atlas, reviewed by you');const again=p.waitForEvent('download');await p.locator('#save-home').click();const againFile='artifacts/network-release/reimported.homebundle.json';await(await again).saveAs(againFile);expect((await readFile(againFile)).equals(bytes)).toBe(true);}finally{await fresh.close();}
 e=await(await request.get('/__evidence')).json();expect(e.upstream.calls).toBe(3);expect(e.peerReads).toBe(2);expect(e.peerAuth).toBe(false);expect(outside).toEqual([]);await page.screenshot({path:'artifacts/network-release/desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'artifacts/network-release/mobile.png',fullPage:true});await writeFile('artifacts/network-release/observed.json',JSON.stringify({mode:'Local Pages handler plus SQLite and synthetic upstream',receipt,evidence:e,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,fileRoundTrip:true,outside,actualProvider:0},null,2));
 }finally{await ctx.close();}
});
test('provider quota failure stays stopped, no fallback; restart preserves draft and clears consent',async({page,request})=>{
 await request.post('/__reset',{data:'quota'});await page.goto('/connect/');await expect(page.locator('#run')).toBeEnabled();await page.locator('#approve').check();await page.locator('#run').click();await expect(page.locator('#out')).toContainText('Stopped:');await expect(page.locator('#apply')).toBeDisabled();await expect(page.locator('#draft')).toHaveText('Original draft preserved');await page.locator('#restart').click();await expect(page.locator('#approve')).not.toBeChecked();expect((await(await request.get('/__evidence')).json()).upstream.calls).toBe(1);
});
test('cancel during dispatch cannot apply late output or change draft',async({page,request})=>{
 await request.post('/__reset',{data:'cancel'});await page.goto('/connect/');await expect(page.locator('#run')).toBeEnabled();await page.locator('#approve').check();await page.locator('#run').click();await expect.poll(async()=>(await(await request.get('/__evidence')).json()).upstream.calls).toBe(1);await page.locator('#cancel').click();await expect(page.locator('#out')).toContainText('CANCELLED');await page.waitForTimeout(1700);await expect(page.locator('#apply')).toBeDisabled();await expect(page.locator('#draft')).toHaveText('Original draft preserved');expect((await(await request.get('/__evidence')).json()).upstream.calls).toBe(1);
});
test('a draft imported during generation review cannot be overwritten by an older proposal',async({page})=>{
 await page.goto('/connect/');await expect(page.locator('#run')).toBeEnabled();await page.locator('#approve').check();await page.locator('#run').click();await expect(page.locator('#out')).toHaveText('Review proposal');const imported=JSON.parse(await page.locator('#bundle-edit').inputValue());imported.displayName='Imported draft stays mine';await page.locator('#home-file').setInputFiles({name:'fresh.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(imported))});await page.locator('#apply-file').click();await page.locator('#validate').click();await expect(page.locator('#receipt-card')).toBeVisible();await page.locator('#apply').click();await expect(page.locator('#out')).toContainText('DRAFT_CHANGED');await expect(page.locator('#home-preview h2')).toHaveText('Imported draft stays mine');
});

test('a fresh client discovers the mission from the homepage and returns a verified file without demo controls', async ({ page, request }) => {
  const posts: string[] = [];
  page.on('request', req => { if (req.method() === 'POST') posts.push(req.url()); });
  await page.goto('/');
  const catalogUrl = await page.locator('link[rel=alternate][title="Agent tasks"]').getAttribute('href');
  expect(catalogUrl).toBeTruthy();
  const result = await page.evaluate(async (url) => {
    const response = await fetch(url!, { credentials: 'omit', redirect: 'error' });
    const catalog = await response.json();
    const { execution } = catalog.tasks['homebundle.collaborate.fixed'];
    const mission = await import(execution.module);
    const preview = await mission[execution.previewExport]();
    try { await mission[execution.runExport]({ authorize: () => false }); throw Error('EXPECTED_DENIAL'); }
    catch (error) { if ((error as Error).message !== 'CONSENT_DENIED') throw error; }
    return { execution, preview };
  }, catalogUrl);
  expect(posts).toEqual([]);
  const denied = await (await request.get('/__evidence')).json();
  expect(denied.peerReads).toBe(0);
  expect(denied.upstream.calls).toBe(0);
  const outcome = await page.evaluate(async ({ execution, preview }) => {
    const mission = await import(execution.module);
    // Represents a host-mediated approval of exactly the reviewed scope in this fixture.
    return mission[execution.runExport]({ authorize: (scope: unknown) => JSON.stringify(scope) === JSON.stringify(preview) });
  }, result);
  expect(outcome.receipt).toMatchObject({ status: 'schema_valid', actionStatus: 'succeeded', modelCalls: 3 });
  expect(outcome.receipt.executionMode).toContain('synthetic fixture');
  expect(outcome.receipt.roles.map((role: {agent: string}) => role.agent)).toEqual(['reception', 'home_builder']);
  expect(outcome.receipt.canonicalSHA256).toBe(createHash('sha256').update(outcome.bundleJson).digest('hex'));
  expect(outcome.receipt.canonicalUtf8Bytes).toBe(Buffer.byteLength(outcome.bundleJson));
  expect(JSON.parse(outcome.bundleJson).schemaVersion).toBe('0.1');
  const completed = await (await request.get('/__evidence')).json();
  expect(completed.peerReads).toBe(2);
  expect(completed.peerAuth).toBe(false);
  expect(completed.upstream.calls).toBe(3);
});
