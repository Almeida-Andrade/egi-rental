'use client'

import { createContext, useContext } from 'react'
import * as THREE from 'three'
import { PECAS_PAREDE, PECAS_PISO, type TipoParede, type TipoPiso } from '@/lib/montador'

const COR = {
  madeira: '#b98b5e',
  madeiraEscura: '#8a6440',
  branco: '#f1f2f3',
  metal: '#9aa3ad',
  escuro: '#2c3440',
  tecido: '#55657d',
  louca: '#f7f7f4',
  inox: '#c7cdd3',
  vidro: '#a9d3ea',
  papelao: '#c79b63',
  colchao: '#e9e4d8',
  marca: '#2b4ea2',
}

// Peça em conflito brilha em vermelho: o aviso aparece no próprio móvel, não só na lista.
const Alerta = createContext(false)
// Peça de parede some junto com a parede que a câmera atravessa.
const Apagada = createContext(false)

type Vetor = [number, number, number]

// Geometria e material são compartilhados: cada peça só muda a escala, e o material sai de um
// cache pela combinação de cor, transparência e alerta. Um material por caixa eram centenas.
const GEO_CAIXA = new THREE.BoxGeometry(1, 1, 1)
const GEO_CILINDRO = new THREE.CylinderGeometry(1, 1, 1, 16)
const MATERIAIS = new Map<string, THREE.MeshStandardMaterial>()

function material(cor: string, opacidade: number, alerta: boolean, rugosidade = 0.75): THREE.MeshStandardMaterial {
  const chave = `${cor}|${opacidade}|${alerta}|${rugosidade}`
  let m = MATERIAIS.get(chave)
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color: cor,
      roughness: rugosidade,
      metalness: cor === COR.inox || cor === COR.metal ? 0.35 : 0,
      transparent: opacidade < 1,
      opacity: opacidade,
      depthWrite: opacidade === 1,
      emissive: alerta ? '#c62828' : '#000000',
      emissiveIntensity: alerta ? 0.55 : 0,
    })
    MATERIAIS.set(chave, m)
  }
  return m
}

function Caixa({ tam, pos, cor, transparente }: { tam: Vetor; pos: Vetor; cor: string; transparente?: boolean }) {
  const alerta = useContext(Alerta)
  const apagada = useContext(Apagada)
  const opacidade = apagada ? 0.15 : transparente ? 0.35 : 1
  return (
    <mesh
      geometry={GEO_CAIXA}
      material={material(cor, opacidade, alerta)}
      position={pos}
      scale={tam}
      castShadow={!apagada}
      receiveShadow
    />
  )
}

function Cilindro({ raio, alt, pos, cor }: { raio: number; alt: number; pos: Vetor; cor: string }) {
  const alerta = useContext(Alerta)
  return <mesh geometry={GEO_CILINDRO} material={material(cor, 1, alerta, 0.4)} position={pos} scale={[raio, alt, raio]} castShadow />
}

function Pes({ w, d, h, cor, recuo = 0.04 }: { w: number; d: number; h: number; cor: string; recuo?: number }) {
  const x = w / 2 - recuo
  const z = d / 2 - recuo
  return (
    <>
      {[
        [-x, -z],
        [x, -z],
        [-x, z],
        [x, z],
      ].map(([px, pz]) => (
        <Caixa key={`${px}${pz}`} tam={[0.04, h, 0.04]} pos={[px, h / 2, pz]} cor={cor} />
      ))}
    </>
  )
}

function Mesa({ w, d, h, tampo = COR.madeira }: { w: number; d: number; h: number; tampo?: string }) {
  return (
    <>
      <Caixa tam={[w, 0.04, d]} pos={[0, h - 0.02, 0]} cor={tampo} />
      <Pes w={w} d={d} h={h - 0.04} cor={COR.escuro} />
    </>
  )
}

function Cama({ w, d, y = 0 }: { w: number; d: number; y?: number }) {
  return (
    <>
      <Caixa tam={[w, 0.25, d]} pos={[0, y + 0.125, 0]} cor={COR.madeiraEscura} />
      <Caixa tam={[w - 0.06, 0.18, d - 0.06]} pos={[0, y + 0.34, 0]} cor={COR.colchao} />
      <Caixa tam={[w - 0.3, 0.1, 0.3]} pos={[0, y + 0.48, -d / 2 + 0.22]} cor={COR.branco} />
    </>
  )
}

export function PecaPiso3D({ tipo, alerta }: { tipo: TipoPiso; alerta: boolean }) {
  const { w, d, h } = PECAS_PISO[tipo]
  let corpo: React.ReactNode

  switch (tipo) {
    case 'mesa':
    case 'reuniao':
      corpo = <Mesa w={w} d={d} h={h} />
      break
    case 'refeicao':
      corpo = <Mesa w={w} d={d} h={h} tampo={COR.branco} />
      break
    case 'cadeira':
      corpo = (
        <>
          <Caixa tam={[w * 0.9, 0.06, d * 0.9]} pos={[0, 0.46, 0]} cor={COR.tecido} />
          <Caixa tam={[w * 0.9, 0.42, 0.05]} pos={[0, 0.7, d * 0.42]} cor={COR.tecido} />
          <Pes w={w * 0.85} d={d * 0.85} h={0.43} cor={COR.escuro} />
        </>
      )
      break
    case 'armario':
      corpo = (
        <>
          <Caixa tam={[w, h, d]} pos={[0, h / 2, 0]} cor={COR.branco} />
          <Caixa tam={[0.01, h - 0.1, 0.01]} pos={[0, h / 2, d / 2 + 0.005]} cor={COR.metal} />
          <Caixa tam={[0.02, 0.18, 0.03]} pos={[-0.05, h / 2, d / 2 + 0.015]} cor={COR.escuro} />
          <Caixa tam={[0.02, 0.18, 0.03]} pos={[0.05, h / 2, d / 2 + 0.015]} cor={COR.escuro} />
        </>
      )
      break
    case 'gaveteiro':
      corpo = (
        <>
          <Caixa tam={[w, h, d]} pos={[0, h / 2, 0]} cor={COR.metal} />
          {[0.2, 0.42, 0.62].map((y) => (
            <Caixa key={y} tam={[w - 0.06, 0.01, 0.01]} pos={[0, y, d / 2 + 0.005]} cor={COR.escuro} />
          ))}
        </>
      )
      break
    case 'prateleira':
      corpo = (
        <>
          {[
            [-w / 2 + 0.02, -d / 2 + 0.02],
            [w / 2 - 0.02, -d / 2 + 0.02],
            [-w / 2 + 0.02, d / 2 - 0.02],
            [w / 2 - 0.02, d / 2 - 0.02],
          ].map(([x, z]) => (
            <Caixa key={`${x}${z}`} tam={[0.035, h, 0.035]} pos={[x, h / 2, z]} cor={COR.escuro} />
          ))}
          {[0.08, 0.55, 1.02, 1.49, 1.96].map((y) => (
            <Caixa key={y} tam={[w, 0.025, d]} pos={[0, y, 0]} cor={COR.metal} />
          ))}
          <Caixa tam={[0.35, 0.28, 0.32]} pos={[-0.25, 0.71, 0]} cor={COR.papelao} />
          <Caixa tam={[0.3, 0.22, 0.3]} pos={[0.2, 1.15, 0]} cor={COR.papelao} />
        </>
      )
      break
    case 'palete':
      corpo = (
        <>
          {[-0.45, 0, 0.45].map((z) => (
            <Caixa key={z} tam={[w, 0.08, 0.1]} pos={[0, 0.04, z]} cor={COR.madeiraEscura} />
          ))}
          {[-0.5, -0.25, 0, 0.25, 0.5].map((x) => (
            <Caixa key={x} tam={[0.12, 0.025, d]} pos={[x, 0.135, 0]} cor={COR.madeira} />
          ))}
        </>
      )
      break
    case 'vaso':
      corpo = (
        <>
          <Cilindro raio={0.14} alt={0.38} pos={[0, 0.19, 0.06]} cor={COR.louca} />
          <Cilindro raio={0.19} alt={0.04} pos={[0, 0.4, 0.08]} cor={COR.louca} />
          <Caixa tam={[0.38, 0.4, 0.16]} pos={[0, 0.6, -d / 2 + 0.08]} cor={COR.louca} />
        </>
      )
      break
    case 'pia':
      corpo = (
        <>
          <Cilindro raio={0.07} alt={0.7} pos={[0, 0.35, -0.05]} cor={COR.louca} />
          <Caixa tam={[w, 0.14, d]} pos={[0, 0.78, 0]} cor={COR.louca} />
          <Caixa tam={[0.03, 0.12, 0.03]} pos={[0, 0.9, -d / 2 + 0.06]} cor={COR.inox} />
        </>
      )
      break
    case 'chuveiro':
      corpo = (
        <>
          <Caixa tam={[w, 0.06, d]} pos={[0, 0.03, 0]} cor={COR.louca} />
          <Caixa tam={[0.02, h, d]} pos={[w / 2 - 0.01, h / 2, 0]} cor={COR.vidro} transparente />
          <Caixa tam={[w, h, 0.02]} pos={[0, h / 2, d / 2 - 0.01]} cor={COR.vidro} transparente />
          <Caixa tam={[0.03, 0.03, 0.3]} pos={[0, 1.95, -d / 2 + 0.15]} cor={COR.inox} />
        </>
      )
      break
    case 'bancada':
      corpo = (
        <>
          <Caixa tam={[w, h - 0.04, d]} pos={[0, (h - 0.04) / 2, 0]} cor={COR.branco} />
          <Caixa tam={[w + 0.02, 0.04, d + 0.02]} pos={[0, h - 0.02, 0]} cor={COR.escuro} />
          <Caixa tam={[0.5, 0.01, 0.36]} pos={[-0.3, h + 0.005, 0]} cor={COR.inox} />
          {[-0.5, 0, 0.5].map((x) => (
            <Caixa key={x} tam={[0.005, h - 0.12, 0.005]} pos={[x + 0.25, (h - 0.04) / 2, d / 2 + 0.003]} cor={COR.metal} />
          ))}
        </>
      )
      break
    case 'geladeira':
      corpo = (
        <>
          <Caixa tam={[w, h, d]} pos={[0, h / 2, 0]} cor={COR.inox} />
          <Caixa tam={[w - 0.04, 0.01, 0.01]} pos={[0, 1.15, d / 2 + 0.005]} cor={COR.escuro} />
          <Caixa tam={[0.02, 0.3, 0.03]} pos={[w / 2 - 0.08, 1.4, d / 2 + 0.015]} cor={COR.escuro} />
        </>
      )
      break
    case 'fogao':
      corpo = (
        <>
          <Caixa tam={[w, h, d]} pos={[0, h / 2, 0]} cor={COR.branco} />
          <Caixa tam={[w, 0.01, d]} pos={[0, h + 0.005, 0]} cor={COR.escuro} />
          {[
            [-0.14, -0.14],
            [0.14, -0.14],
            [-0.14, 0.14],
            [0.14, 0.14],
          ].map(([x, z]) => (
            <Cilindro key={`${x}${z}`} raio={0.07} alt={0.02} pos={[x, h + 0.02, z]} cor={COR.escuro} />
          ))}
        </>
      )
      break
    case 'cama':
      corpo = <Cama w={w} d={d} />
      break
    case 'beliche':
      corpo = (
        <>
          <Cama w={w} d={d} />
          <Cama w={w} d={d} y={1.0} />
          {[
            [-w / 2 + 0.03, -d / 2 + 0.03],
            [w / 2 - 0.03, -d / 2 + 0.03],
            [-w / 2 + 0.03, d / 2 - 0.03],
            [w / 2 - 0.03, d / 2 - 0.03],
          ].map(([x, z]) => (
            <Caixa key={`${x}${z}`} tam={[0.05, h, 0.05]} pos={[x, h / 2, z]} cor={COR.madeiraEscura} />
          ))}
        </>
      )
      break
    case 'sofa':
      corpo = (
        <>
          <Caixa tam={[w, 0.42, d]} pos={[0, 0.21, 0]} cor={COR.tecido} />
          <Caixa tam={[w, 0.45, 0.18]} pos={[0, 0.6, -d / 2 + 0.09]} cor={COR.tecido} />
          <Caixa tam={[0.16, 0.25, d]} pos={[-w / 2 + 0.08, 0.55, 0]} cor={COR.tecido} />
          <Caixa tam={[0.16, 0.25, d]} pos={[w / 2 - 0.08, 0.55, 0]} cor={COR.tecido} />
        </>
      )
      break
    case 'balcao':
      corpo = (
        <>
          <Caixa tam={[w, h - 0.04, d - 0.08]} pos={[0, (h - 0.04) / 2, 0.04]} cor={COR.marca} />
          <Caixa tam={[w + 0.06, 0.04, d]} pos={[0, h - 0.02, 0]} cor={COR.madeira} />
        </>
      )
      break
    case 'vitrine':
      corpo = (
        <>
          <Caixa tam={[w, 0.12, d]} pos={[0, 0.06, 0]} cor={COR.escuro} />
          <Caixa tam={[w, h - 0.12, d]} pos={[0, h / 2 + 0.06, 0]} cor={COR.vidro} transparente />
          {[0.6, 1.1, 1.5].map((y) => (
            <Caixa key={y} tam={[w - 0.04, 0.02, d - 0.04]} pos={[0, y, 0]} cor={COR.branco} />
          ))}
        </>
      )
      break
    case 'divisoria':
      corpo = <Caixa tam={[w, h, d]} pos={[0, h / 2, 0]} cor="#dfe4e9" />
      break
  }

  return <Alerta.Provider value={alerta}>{corpo}</Alerta.Provider>
}

// A peça de parede é desenhada com o centro na face interna da parede, olhando para dentro (+z local).
export function PecaParede3D({ tipo, alerta, apagada }: { tipo: TipoParede; alerta: boolean; apagada: boolean }) {
  const { w, h, base } = PECAS_PAREDE[tipo]
  let corpo: React.ReactNode

  switch (tipo) {
    case 'porta':
      corpo = (
        <>
          <Caixa tam={[w + 0.1, h + 0.05, 0.14]} pos={[0, (h + 0.05) / 2, 0]} cor={COR.escuro} />
          <Caixa tam={[w - 0.04, h - 0.02, 0.16]} pos={[0, h / 2, 0]} cor={COR.madeira} />
          <Caixa tam={[0.1, 0.03, 0.05]} pos={[w / 2 - 0.12, 1.0, 0.1]} cor={COR.inox} />
        </>
      )
      break
    case 'janela':
      corpo = (
        <>
          <Caixa tam={[w + 0.08, h + 0.08, 0.14]} pos={[0, base + h / 2, 0]} cor={COR.branco} />
          <Caixa tam={[w - 0.04, h - 0.04, 0.16]} pos={[0, base + h / 2, 0]} cor={COR.vidro} />
          <Caixa tam={[0.02, h - 0.04, 0.17]} pos={[0, base + h / 2, 0]} cor={COR.branco} />
        </>
      )
      break
    case 'ar':
      corpo = (
        <>
          <Caixa tam={[w, h, 0.22]} pos={[0, base + h / 2, 0.11]} cor={COR.branco} />
          <Caixa tam={[w - 0.1, 0.03, 0.01]} pos={[0, base + 0.06, 0.225]} cor={COR.metal} />
        </>
      )
      break
  }

  return (
    <Apagada.Provider value={apagada}>
      <Alerta.Provider value={alerta}>{corpo}</Alerta.Provider>
    </Apagada.Provider>
  )
}
