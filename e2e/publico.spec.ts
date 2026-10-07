import { expect, test } from '@playwright/test'

// Sem contagem exata: o catálogo vem do banco e muda com a frota.
test('a home mostra a abertura, o catálogo e o caminho para o sob medida', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('article').first()).toBeVisible()
  await expect(page.getByRole('link', { name: /começar meu projeto/i })).toHaveAttribute('href', '/sob-medida')
})

test('do catálogo à ficha, com o pedido de orçamento já escrito', async ({ page }) => {
  await page.goto('/containers')
  const primeiro = page.locator('article h3 a').first()
  const nome = (await primeiro.textContent())?.trim() ?? ''
  await primeiro.click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText(nome)
  const pedido = page.getByRole('link', { name: /pedir orçamento deste modelo/i })
  await expect(pedido).toHaveAttribute('href', new RegExp(`^https://wa\\.me/\\d+\\?text=.*${encodeURIComponent(nome)}`))
})

test('o comparador troca o tamanho e a planta acompanha', async ({ page }) => {
  await page.goto('/#tamanhos')
  const grupo = page.getByRole('group', { name: 'Tamanho' })
  await grupo.getByRole('radio', { name: /40/ }).check()
  await expect(page.getByRole('img', { name: /Planta de exemplo do .* 40 pés/ })).toBeVisible()
  await expect(page.locator('dd').filter({ hasText: '12,19 m' }).first()).toBeVisible()
})

test('modelo que não existe responde 404', async ({ page }) => {
  const resposta = await page.goto('/containers/nao-existe')
  expect(resposta?.status()).toBe(404)
})

test('o formulário recusa envio vazio e aponta o primeiro campo', async ({ page }) => {
  await page.goto('/contato')
  await page.getByRole('button', { name: /enviar pelo whatsapp/i }).click()
  await expect(page.getByText('Diga o seu nome.')).toBeVisible()
  await expect(page.getByLabel(/seu nome/i)).toBeFocused()
})

test('o formulário abre o WhatsApp com o pedido montado', async ({ page, context }) => {
  await page.goto('/contato?modelo=Sanit%C3%A1rio%2020%20p%C3%A9s')
  await page.getByLabel(/seu nome/i).fill('Teste Automático')
  await page.getByLabel(/celular/i).fill('98999990000')
  // O WhatsApp de verdade nunca é chamado: a rota responde vazio e guarda o endereço pedido.
  let pedido = ''
  await context.route('https://wa.me/**', (rota) => {
    pedido = rota.request().url()
    return rota.fulfill({ status: 200, body: '' })
  })
  await Promise.all([context.waitForEvent('page'), page.getByRole('button', { name: /enviar pelo whatsapp/i }).click()])
  await expect.poll(() => pedido).not.toBe('')
  const url = decodeURIComponent(pedido)
  expect(url).toContain('*Container:* Sanitário 20 pés')
  expect(url).toContain('*Celular:* (98) 99999-0000')
})
