'use client'

import { Edges, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { OrbitControls as ControlesDeOrbita } from 'three-stdlib'
import {
  CORES_CHAPA,
  ehParede,
  encaixar,
  interno,
  limitarParede,
  limitarPiso,
  PECAS_PAREDE,
  PECAS_PISO,
  type Item,
  type ItemParede,
  type ItemPiso,
  type Parede,
  type Projeto,
} from '@/lib/montador'
import { MEDIDAS_METROS } from '@/lib/medidas'
import { quadrosLentos } from '@/lib/desempenho'
import { lerNivelDoAparelho } from '@/components/site/nivelDoAparelho'
import { PecaParede3D, PecaPiso3D } from './Pecas3D'

export type Vista = { modo: 'perspectiva' | 'cima'; versao: number }

export interface PropsCena {
  projeto: Projeto
  selecionado: string | null
  emConflito: Set<string>
  porDentro: boolean
  vista: Vista
  onSelecionar: (id: string | null) => void
  onMover: (item: Item) => void
  onCapturador: (capturar: () => string) => void
}

const ESPESSURA = 0.06
const NORMAIS: Record<Parede, THREE.Vector3> = {
  n: new THREE.Vector3(0, 0, -1),
  s: new THREE.Vector3(0, 0, 1),
  o: new THREE.Vector3(-1, 0, 0),
  l: new THREE.Vector3(1, 0, 0),
}
const PISO = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)

function escurecer(hex: string, fator: number): string {
  return `#${new THREE.Color(hex).multiplyScalar(fator).getHexString()}`
}

// Textura da chapa ondulada: listras claras e escuras, repetidas a cada 30 cm.
function useChapa(cor: string) {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 4
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const g = ctx.createLinearGradient(0, 0, 64, 0)
      g.addColorStop(0, escurecer(cor, 0.78))
      g.addColorStop(0.2, cor)
      g.addColorStop(0.45, escurecer(cor, 1.12))
      g.addColorStop(0.55, cor)
      g.addColorStop(0.8, escurecer(cor, 0.85))
      g.addColorStop(1, escurecer(cor, 0.78))
      ctx.fillStyle = g
      ctx.fillRect(0, 0, 64, 4)
    }
    const textura = new THREE.CanvasTexture(canvas)
    textura.wrapS = THREE.RepeatWrapping
    textura.colorSpace = THREE.SRGBColorSpace
    return textura
  }, [cor])
}

function usePiso() {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#b08457'
      ctx.fillRect(0, 0, 128, 128)
      ctx.fillStyle = '#a07549'
      for (let y = 0; y < 128; y += 32) ctx.fillRect(0, y, 128, 2)
      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      for (let y = 8; y < 128; y += 32) ctx.fillRect(0, y, 128, 10)
    }
    const textura = new THREE.CanvasTexture(canvas)
    textura.wrapS = THREE.RepeatWrapping
    textura.wrapT = THREE.RepeatWrapping
    textura.colorSpace = THREE.SRGBColorSpace
    return textura
  }, [])
}

// Com a vista "por dentro", some a parede que fica entre a câmera e o interior.
function VigiaDasParedes({ porDentro, onMudar }: { porDentro: boolean; onMudar: (apagadas: string) => void }) {
  const direcao = useMemo(() => new THREE.Vector3(), [])
  const ultima = useRef('')
  useFrame(({ camera }) => {
    direcao.copy(camera.position).normalize()
    const apagadas = porDentro
      ? (Object.keys(NORMAIS) as Parede[]).filter((p) => direcao.dot(NORMAIS[p]) > 0.12).join('')
      : ''
    if (apagadas !== ultima.current) {
      ultima.current = apagadas
      onMudar(apagadas)
    }
  })
  return null
}

interface PropsParede {
  tamanho: [number, number, number]
  posicao: [number, number, number]
  apagada: boolean
  textura: THREE.Texture
  repeticao: number
  children?: React.ReactNode
}

// A parede entre a câmera e o interior fica translúcida; as outras continuam sólidas.
function ParedeDoCasco({ tamanho, posicao, apagada, textura, repeticao, children }: PropsParede) {
  const grupo = useRef<THREE.Group>(null)
  const map = useMemo(() => {
    const t = textura.clone()
    t.repeat.set(repeticao, 1)
    t.needsUpdate = true
    return t
  }, [textura, repeticao])

  // Assentada no alvo, a parede não percorre mais os materiais a cada quadro
  const assentada = useRef<boolean | null>(null)
  useFrame(({ invalidate }, delta) => {
    if (!grupo.current || assentada.current === apagada) return
    const alvo = apagada ? 0.1 : 1
    const passo = 1 - Math.exp(-delta * 10)
    let mudou = false
    grupo.current.traverse((o) => {
      const malha = o as THREE.Mesh
      const material = malha.material as THREE.MeshStandardMaterial | undefined
      if (!material || !('opacity' in material)) return
      const novo = material.opacity + (alvo - material.opacity) * passo
      if (Math.abs(novo - material.opacity) > 0.002) {
        material.opacity = novo
        material.depthWrite = novo > 0.95
        mudou = true
      }
      malha.castShadow = !apagada
    })
    if (mudou) invalidate()
    else assentada.current = apagada
  })

  return (
    <group ref={grupo}>
      <mesh position={posicao} castShadow receiveShadow>
        <boxGeometry args={tamanho} />
        <meshStandardMaterial map={map} roughness={0.6} metalness={0.25} transparent />
      </mesh>
      {children}
    </group>
  )
}

function Casco({ projeto, porDentro, apagadas }: { projeto: Projeto; porDentro: boolean; apagadas: string }) {
  const { c, l, a } = interno(projeto)
  const cor = CORES_CHAPA[projeto.cor].hex
  const modulo = MEDIDAS_METROS[projeto.tamanho].externa
  // Centro de cada container na largura e as emendas entre eles, no eixo z da cena.
  const centros = Array.from({ length: projeto.modulos }, (_, k) => (k + 0.5 - projeto.modulos / 2) * modulo.largura)
  const emendas = centros.slice(1).map((z) => z - modulo.largura / 2)
  const folha = MEDIDAS_METROS[projeto.tamanho].interna.largura
  const textura = useChapa(cor)
  const piso = usePiso()
  const pisoMap = useMemo(() => {
    const t = piso.clone()
    t.repeat.set(c / 1.2, l / 1.2)
    t.needsUpdate = true
    return t
  }, [piso, c, l])
  const e = ESPESSURA
  const estrutura = escurecer(cor, 0.55)
  const altoExterno = modulo.altura

  return (
    <group>
      <mesh position={[0, -0.03, 0]} receiveShadow>
        <boxGeometry args={[c, 0.06, l]} />
        <meshStandardMaterial map={pisoMap} roughness={0.85} />
      </mesh>

      <ParedeDoCasco
        tamanho={[c + 2 * e, a, e]}
        posicao={[0, a / 2, -l / 2 - e / 2]}
        apagada={apagadas.includes('n')}
        textura={textura}
        repeticao={c / 0.3}
      />
      <ParedeDoCasco
        tamanho={[c + 2 * e, a, e]}
        posicao={[0, a / 2, l / 2 + e / 2]}
        apagada={apagadas.includes('s')}
        textura={textura}
        repeticao={c / 0.3}
      />
      <ParedeDoCasco
        tamanho={[e, a, l]}
        posicao={[-c / 2 - e / 2, a / 2, 0]}
        apagada={apagadas.includes('o')}
        textura={textura}
        repeticao={l / 0.3}
      />
      <ParedeDoCasco
        tamanho={[e, a, l]}
        posicao={[c / 2 + e / 2, a / 2, 0]}
        apagada={apagadas.includes('l')}
        textura={textura}
        repeticao={l / 0.3}
      >
        {/* Portas do fundo de cada container, com as barras de trava, como num marítimo */}
        {centros.flatMap((zc) =>
          [-folha / 4, folha / 4].map((dz) => (
            <mesh key={`${zc}${dz}`} position={[c / 2 + e + 0.01, a / 2, zc + dz]}>
              <boxGeometry args={[0.02, a - 0.1, folha / 2 - 0.06]} />
              <meshStandardMaterial color={escurecer(cor, 0.9)} transparent />
            </mesh>
          )),
        )}
        {centros.flatMap((zc) =>
          [-0.75, -0.3, 0.3, 0.75].map((f) => (
            <mesh key={`${zc}${f}`} position={[c / 2 + e + 0.04, a / 2, zc + (f * folha) / 2]}>
              <cylinderGeometry args={[0.02, 0.02, a - 0.2, 8]} />
              <meshStandardMaterial color="#c3ccd8" metalness={0.6} transparent />
            </mesh>
          )),
        )}
      </ParedeDoCasco>

      {!porDentro && (
        <mesh position={[0, a + e / 2, 0]} castShadow>
          <boxGeometry args={[c + 2 * e, e, l + 2 * e]} />
          <meshStandardMaterial color={escurecer(cor, 0.85)} roughness={0.7} />
        </mesh>
      )}

      {/* Colunas de canto e longarinas, também nas emendas entre os containers */}
      {[-1, 1].flatMap((sx) =>
        [-(l / 2 + e), ...emendas, l / 2 + e].map((z) => (
          <mesh key={`${sx}${z}`} position={[(sx * (c + e * 2)) / 2, altoExterno / 2 - 0.1, z]} castShadow>
            <boxGeometry args={[0.12, altoExterno, 0.12]} />
            <meshStandardMaterial color={estrutura} roughness={0.5} />
          </mesh>
        )),
      )}
      {[-(l / 2 + e), ...emendas, l / 2 + e].map((z) => (
        <mesh key={z} position={[0, -0.1, z]} castShadow>
          <boxGeometry args={[c + 0.24, 0.16, 0.12]} />
          <meshStandardMaterial color={estrutura} />
        </mesh>
      ))}
      {/* Onde a parede do meio saiu: viga no alto e a junta no piso */}
      {emendas.map((z) => (
        <group key={z}>
          <mesh position={[0, a - 0.07, z]} castShadow>
            <boxGeometry args={[c, 0.14, 0.12]} />
            <meshStandardMaterial color={estrutura} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.002, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[c, 0.05]} />
            <meshStandardMaterial color="#7d5a39" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function transformarParede(item: ItemParede, c: number, l: number): { pos: [number, number, number]; giro: number } {
  switch (item.parede) {
    case 'n':
      return { pos: [item.t - c / 2, 0, -l / 2], giro: 0 }
    case 's':
      return { pos: [item.t - c / 2, 0, l / 2], giro: Math.PI }
    case 'o':
      return { pos: [-c / 2, 0, item.t - l / 2], giro: Math.PI / 2 }
    case 'l':
      return { pos: [c / 2, 0, item.t - l / 2], giro: -Math.PI / 2 }
  }
}

function paredeMaisPerto(x: number, z: number, c: number, l: number): { parede: Parede; t: number } {
  const distancias: [Parede, number][] = [
    ['n', z],
    ['s', l - z],
    ['o', x],
    ['l', c - x],
  ]
  const [parede] = distancias.sort((a, b) => a[1] - b[1])[0]
  return { parede, t: parede === 'n' || parede === 's' ? x : z }
}

interface PropsPeca {
  item: Item
  c: number
  l: number
  selecionada: boolean
  alerta: boolean
  apagada: boolean
  onAgarrar: (item: Item, e: ThreeEvent<PointerEvent>) => void
}

// Só redesenha a peça cujas props mudaram: arrastar uma não re-renderiza as outras
const PecaNaCena = memo(function PecaNaCena({ item, c, l, selecionada, alerta, apagada, onAgarrar }: PropsPeca) {
  const eventos = {
    onPointerDown: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      onAgarrar(item, e)
    },
    onClick: (e: ThreeEvent<MouseEvent>) => e.stopPropagation(),
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      document.body.style.cursor = 'grab'
    },
    onPointerOut: () => {
      document.body.style.cursor = ''
    },
  }

  if (ehParede(item)) {
    const { pos, giro } = transformarParede(item, c, l)
    const p = PECAS_PAREDE[item.tipo]
    return (
      <group position={pos} rotation={[0, giro, 0]} {...eventos}>
        <PecaParede3D tipo={item.tipo} alerta={alerta} apagada={apagada} />
        {selecionada && (
          <>
            <mesh position={[0, p.base + p.h / 2, 0.05]}>
              <boxGeometry args={[p.w + 0.12, p.h + 0.12, 0.3]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              <Edges color="#2b4ea2" lineWidth={2} />
            </mesh>
          </>
        )}
      </group>
    )
  }

  const p = PECAS_PISO[item.tipo]
  return (
    <group position={[item.x - c / 2, 0, item.z - l / 2]} rotation={[0, (-item.giro * Math.PI) / 180, 0]} {...eventos}>
      <PecaPiso3D tipo={item.tipo} alerta={alerta} />
      {(selecionada || alerta) && (
        <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[p.w + 0.06, p.d + 0.06]} />
          <meshBasicMaterial color={alerta ? '#d32f2f' : '#2b4ea2'} transparent opacity={0.28} depthWrite={false} />
        </mesh>
      )}
      {selecionada && (
        <>
          <mesh position={[0, p.h / 2, 0]}>
            <boxGeometry args={[p.w + 0.04, p.h + 0.04, p.d + 0.04]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            <Edges color="#2b4ea2" lineWidth={2} />
          </mesh>
        </>
      )}
    </group>
  )
})

// A sombra é calculada só quando algo que a projeta muda (peça, forma, parede apagada),
// não a cada quadro em que a câmera gira.
function SombraSobDemanda({ chave }: { chave: string }) {
  const get = useThree((s) => s.get)
  useEffect(() => {
    const { gl, invalidate } = get()
    gl.shadowMap.autoUpdate = false
    gl.shadowMap.needsUpdate = true
    invalidate()
  }, [get, chave])
  return null
}

// Mede os quadros enquanto a cena está em movimento; se o aparelho não acompanha, pede o modo leve.
function VigiaDeQuadros({ ativo, onLento }: { ativo: boolean; onLento: () => void }) {
  const intervalos = useRef<number[]>([])
  const anterior = useRef(0)
  useFrame(() => {
    if (!ativo) return
    const agora = performance.now()
    if (anterior.current && agora - anterior.current < 250) intervalos.current.push(agora - anterior.current)
    anterior.current = agora
    if (intervalos.current.length > 90) intervalos.current.shift()
    if (quadrosLentos(intervalos.current)) {
      intervalos.current = []
      onLento()
    }
  })
  return null
}

// O que muda a sombra: forma e posição/giro das peças (a cor da chapa não)
function codigoDaCena(projeto: Projeto): string {
  const itens = projeto.itens.map((i) => (ehParede(i) ? `${i.id}${i.parede}${i.t}` : `${i.id}:${i.x},${i.z},${i.giro}`))
  return `${projeto.tamanho}${projeto.modulos}|${itens.join(';')}`
}

function Camera({ c, l, vista }: { c: number; l: number; vista: Vista }) {
  const { camera, invalidate, size } = useThree()
  // O drei registra o OrbitControls como controle padrão (makeDefault); o tipo do estado é genérico.
  const controles = useThree((s) => s.controls) as ControlesDeOrbita | null
  const alvo = useRef<{ pos: THREE.Vector3; olhar: THREE.Vector3 } | null>(null)

  useEffect(() => {
    // Tela em pé (celular) pede a câmera mais longe para o container caber de ponta a ponta.
    const aspecto = size.width / Math.max(1, size.height)
    const dist = (Math.max(c, l, 4.5) * 0.95 + 2.2) * Math.max(1, 1.5 / aspecto)
    alvo.current =
      vista.modo === 'cima'
        ? { pos: new THREE.Vector3(0, dist * 1.25, 0.01), olhar: new THREE.Vector3(0, 0, 0) }
        : { pos: new THREE.Vector3(-c * 0.18, dist * 0.72, dist * 0.92), olhar: new THREE.Vector3(0, 0.7, 0) }
    invalidate()
  }, [c, l, vista.modo, vista.versao, invalidate, size.width, size.height])

  useFrame((_, delta) => {
    const a = alvo.current
    if (!a || !controles) return
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const passo = 1 - Math.exp(-delta * (reduzido ? 14 : 5))
    camera.position.lerp(a.pos, passo)
    controles.target.lerp(a.olhar, passo)
    controles.update()
    if (camera.position.distanceTo(a.pos) < 0.01) alvo.current = null
    else invalidate()
  })

  return null
}

function Capturador({ onCapturador }: { onCapturador: PropsCena['onCapturador'] }) {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    onCapturador(() => {
      gl.render(scene, camera)
      return gl.domElement.toDataURL('image/png')
    })
  }, [gl, scene, camera, onCapturador])
  return null
}

interface Arrasto {
  id: string
  dx: number
  dz: number
}

function Conteudo(props: PropsCena & { leveInicial: boolean }) {
  const { projeto, selecionado, emConflito, porDentro, vista, onSelecionar, onMover, leveInicial } = props
  const { c, l } = interno(projeto)
  const [arrasto, setArrasto] = useState<Arrasto | null>(null)
  const [apagadas, setApagadas] = useState('')
  const [leve, setLeve] = useState(leveInicial)
  const setDpr = useThree((s) => s.setDpr)
  const setEvents = useThree((s) => s.setEvents)
  const ponto = useMemo(() => new THREE.Vector3(), [])
  // A sombra cobre só o container, não um quadrado fixo de 18 m
  const alcance = Math.max(c, l) / 2 + 1.5

  const ficarLeve = useCallback(() => {
    setLeve(true)
    setDpr(1)
  }, [setDpr])

  useEffect(() => {
    if (!arrasto) return
    const soltar = () => {
      setArrasto(null)
      document.body.style.cursor = ''
    }
    window.addEventListener('pointerup', soltar)
    return () => window.removeEventListener('pointerup', soltar)
  }, [arrasto])

  const noPiso = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!e.ray.intersectPlane(PISO, ponto)) return null
      return { x: ponto.x + c / 2, z: ponto.z + l / 2 }
    },
    [ponto, c, l],
  )

  const agarrar = useCallback(
    (item: Item, e: ThreeEvent<PointerEvent>) => {
      onSelecionar(item.id)
      const p = noPiso(e)
      if (!p) return
      const centro = ehParede(item) ? { x: p.x, z: p.z } : { x: item.x, z: item.z }
      setArrasto({ id: item.id, dx: centro.x - p.x, dz: centro.z - p.z })
      document.body.style.cursor = 'grabbing'
    },
    [onSelecionar, noPiso],
  )

  const mover = (e: ThreeEvent<PointerEvent>) => {
    if (!arrasto) return
    const item = projeto.itens.find((i) => i.id === arrasto.id)
    const p = noPiso(e)
    if (!item || !p) return
    if (ehParede(item)) {
      const { parede, t } = paredeMaisPerto(p.x, p.z, c, l)
      const novo = limitarParede({ ...item, parede, t }, projeto)
      if (novo.parede !== item.parede || novo.t !== item.t) onMover(novo)
    } else {
      const novo: ItemPiso = limitarPiso({ ...item, x: encaixar(p.x + arrasto.dx), z: encaixar(p.z + arrasto.dz) }, projeto)
      if (novo.x !== item.x || novo.z !== item.z) onMover(novo)
    }
  }

  return (
    <>
      <color attach="background" args={['#eef2f6']} />
      <hemisphereLight args={['#ffffff', '#b9c3cf', 1.4]} />
      <directionalLight
        position={[c * 0.4, 9, 6]}
        intensity={1.8}
        castShadow={!leve}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-alcance}
        shadow-camera-right={alcance}
        shadow-camera-top={alcance}
        shadow-camera-bottom={-alcance}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
      />
      <SombraSobDemanda chave={`${codigoDaCena(projeto)}|${apagadas}|${leve}|${alcance}`} />
      <VigiaDeQuadros ativo={!leve} onLento={ficarLeve} />

      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[30, 48]} />
        <meshStandardMaterial color="#dde3ea" roughness={1} />
      </mesh>

      <VigiaDasParedes porDentro={porDentro} onMudar={setApagadas} />
      <Casco projeto={projeto} porDentro={porDentro} apagadas={apagadas} />

      {projeto.itens.map((item) => (
        <PecaNaCena
          key={item.id}
          item={item}
          c={c}
          l={l}
          selecionada={item.id === selecionado}
          alerta={emConflito.has(item.id)}
          apagada={ehParede(item) && apagadas.includes(item.parede)}
          onAgarrar={agarrar}
        />
      ))}

      {/* Plano invisível no nível do piso: recebe o arrasto e o clique que desmarca */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.001, 0]}
        onPointerMove={mover}
        onClick={(e) => {
          if (e.delta < 4 && !arrasto) onSelecionar(null)
        }}
      >
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Enquanto a câmera gira, o 3D não procura peça embaixo do ponteiro a cada movimento */}
      <OrbitControls
        makeDefault
        onStart={() => setEvents({ enabled: false })}
        onEnd={() => setEvents({ enabled: true })}
        enabled={!arrasto}
        enableDamping={false}
        minDistance={2}
        maxDistance={34}
        maxPolarAngle={Math.PI / 2 - 0.06}
      />
      <Camera c={c} l={l} vista={vista} />
      <Capturador onCapturador={props.onCapturador} />
    </>
  )
}

export default function Cena(props: PropsCena) {
  // Antialias e o tipo de sombra só se escolhem ao criar o WebGL: o nível é lido uma vez.
  // Sem preserveDrawingBuffer: a imagem é capturada logo depois de um render, na mesma tarefa.
  const [leve] = useState(() => lerNivelDoAparelho() === 'leve')
  return (
    <Canvas
      shadows={leve ? false : 'percentage'}
      dpr={leve ? 1 : [1, 1.5]}
      frameloop="demand"
      camera={{ fov: 40, near: 0.1, far: 200, position: [-1, 6, 8] }}
      gl={{ antialias: !leve, powerPreference: 'high-performance' }}
      style={{ touchAction: 'none' }}
      role="img"
      aria-label="Container em 3D: arraste as peças para mudar de lugar"
    >
      <Conteudo {...props} leveInicial={leve} />
    </Canvas>
  )
}
