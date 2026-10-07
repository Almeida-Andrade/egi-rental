import { expect, test } from '@playwright/test'

// Sem contagem exata: o catálogo vem do banco e muda com a frota.
test('a home mostra a abertura, o catálogo e o caminho para o sob medida', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('#frota article').first()).toBeVisible()
  await expect(page.getByRole('link', { name: /começar meu projeto/i })).toHaveAttribute('href', '/sob-medida')
})

test('rolando a abertura, o container abre e os capítulos passam um a um', async ({ page }) => {
  await page.goto('/')
  const trilho = page.locator('section[data-viva]')
  await expect(trilho).toBeAttached({ timeout: 10_000 })
  const rolar = (f: number) =>
    page.evaluate((f) => {
      const s = document.querySelector<HTMLElement>('section[data-viva]')!
      window.scrollTo(0, s.offsetTop + (s.offsetHeight - innerHeight) * f)
    }, f)
  await rolar(0.62)
  await expect(page.getByRole('heading', { level: 2, name: /Pronto para trabalhar|10 ou 20 pés/ })).toBeVisible()
  await rolar(0.98)
  await expect(page.getByRole('heading', { level: 2, name: 'A gente leva, posiciona e busca' })).toBeVisible()
  await page.getByRole('button', { name: /01/ }).click()
  await expect(page.getByRole('heading', { level: 2, name: 'Pronto para trabalhar' })).toBeVisible()
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

test('o comparador troca o tamanho, junta lado a lado e a planta acompanha', async ({ page }) => {
  await page.goto('/#tamanhos')
  await page.getByRole('group', { name: 'Tamanho' }).getByRole('radio', { name: /10/ }).check()
  await expect(page.getByRole('img', { name: /Planta de exemplo do .* 10 pés/ })).toBeVisible()
  await expect(page.locator('dd').filter({ hasText: '2,99 m' }).first()).toBeVisible()
  await page.getByRole('group', { name: 'Tamanho' }).getByRole('radio', { name: /20/ }).check()
  await page.getByRole('group', { name: 'Lado a lado' }).getByRole('radio', { name: /2 containers/ }).check()
  await expect(page.getByRole('img', { name: /Planta de exemplo do .* 2 lado a lado/ })).toBeVisible()
  await expect(page.locator('dd').filter({ hasText: '4,88 m' }).first()).toBeVisible()
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

test('o montador 3D guarda o projeto no link e reabre igual', async ({ page }) => {
  await page.goto('/sob-medida/montar?partida=vazio')
  await expect(page.locator('canvas')).toBeVisible({ timeout: 20_000 })
  await expect(page).toHaveURL(/[?&]p=/)
  const antes = page.url()
  await page.locator('summary', { hasText: 'Descanso' }).click()
  await page.getByRole('button', { name: /^Beliche/ }).click()
  await expect(page.getByRole('toolbar', { name: /Beliche/ })).toBeVisible()
  await expect.poll(() => page.url()).not.toBe(antes)
  const link = page.url()
  await page.goto(link)
  await expect(page.getByText(/1 × beliche/)).toBeVisible({ timeout: 20_000 })
})

test('o montador junta containers lado a lado e o link guarda', async ({ page }) => {
  await page.goto('/sob-medida/montar?partida=vazio')
  await expect(page.locator('canvas')).toBeVisible({ timeout: 20_000 })
  await expect(page).toHaveURL(/[?&]p=/)
  const antes = page.url()
  await page.getByRole('radiogroup', { name: /lado a lado/ }).getByRole('radio', { name: /2 juntos/ }).click()
  await expect(page.getByText(/5,90 × 4,79 m/)).toBeVisible()
  await expect.poll(() => page.url()).not.toBe(antes)
  await page.goto(page.url())
  await expect(page.getByRole('heading', { name: /2 × 20' lado a lado/ })).toBeVisible({ timeout: 20_000 })
})
