// Glossy twisted-ring hero scene (plain three.js, no fiber).
// The ring is a torus whose cross-section is sheared, scaled and twisted
// around the tube to get the asymmetric "open lip" of the reference frames.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

// Per-section palettes: [outer shell, inner glow a, inner glow b]
const SECTION_PALETTES = [
  ['#1b3170', '#ff5f8f', '#ff9c4a'], // 01 hero — navy / pink-orange
  ['#22346e', '#c9865a', '#ffb27a'], // 02 about — navy / warm bronze
  ['#273572', '#8f9fe8', '#c9d4ff'], // 03 work — periwinkle
  ['#1d3d54', '#2fb8a6', '#ffb27a'], // 04 case — teal / peach
  ['#203a4e', '#2fb8a6', '#7afcd0'], // 05 experience — teal
  ['#3a3450', '#8f9fe8', '#e8a35c'], // 06 credentials — violet / amber
  ['#4a3a2a', '#e8a35c', '#ffd07a'], // 07 contact — amber
]

function buildRingGeometry(radial = 200, tubular = 64) {
  const R = 1.18
  const geo = new THREE.TorusGeometry(R, 0.46, tubular, radial)
  const pos = geo.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const theta = Math.atan2(v.y, v.x) // angle around the ring
    // radial center of this cross-section
    const cx = Math.cos(theta) * R
    const cy = Math.sin(theta) * R
    // local offset from tube center
    let ox = v.x - cx
    let oy = v.y - cy
    let oz = v.z
    // breathe the tube thickness around the ring (thick lip → thin back)
    const s = 0.36 + 0.88 * (0.5 + 0.5 * Math.cos(theta - 0.7))
    ox *= s; oy *= s; oz *= s
    // twist cross-section progressively around the ring
    const tw = 1.15 * Math.sin(theta + 0.9)
    const c = Math.cos(tw), sn = Math.sin(tw)
    const rx = ox * c - oz * sn
    const rz = ox * sn + oz * c
    pos.setXYZ(i, cx + rx, cy + oy, rz)
  }
  geo.computeVertexNormals()
  return geo
}

export default class RingScene {
  constructor(canvas) {
    this.failed = false
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
    } catch (err) {
      this.failed = true
      return
    }
    const gl = this.renderer.getContext()
    if (!gl) { this.failed = true; return }

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.15

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 40)
    this.camera.position.set(0, 0, 7.6)

    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()

    this.group = new THREE.Group()
    this.scene.add(this.group)

    const isMobile = window.innerWidth < 768

    // outer glossy shell
    this.shellMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(SECTION_PALETTES[0][0]),
      metalness: 0.18,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.7,
      iridescence: 0.35,
      iridescenceIOR: 1.6,
    })
    this.shell = new THREE.Mesh(
      isMobile ? buildRingGeometry(110, 40) : buildRingGeometry(),
      this.shellMat,
    )
    this.group.add(this.shell)

    // inner warm core — smaller torus glowing through the opening
    this.coreMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(SECTION_PALETTES[0][1]),
      emissive: new THREE.Color(SECTION_PALETTES[0][2]),
      emissiveIntensity: 0.55,
      metalness: 0,
      roughness: 0.32,
      clearcoat: 0.6,
      envMapIntensity: 0.8,
    })
    this.core = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.3, 48, 140), this.coreMat)
    this.core.scale.set(0.92, 0.92, 0.55)
    this.core.rotation.x = 0.18
    this.group.add(this.core)

    // glass lip between shell and core (desktop only — transmission is pricey)
    this.glass = null
    this.glassMat = null
    if (!isMobile) {
      this.glassMat = new THREE.MeshPhysicalMaterial({
        color: '#dfe8ff',
        metalness: 0,
        roughness: 0.05,
        transmission: 0.92,
        thickness: 0.6,
        ior: 1.45,
        transparent: true,
        envMapIntensity: 1.2,
      })
      this.glass = new THREE.Mesh(new THREE.TorusGeometry(1.04, 0.335, 48, 150), this.glassMat)
      this.glass.scale.set(0.98, 0.98, 0.66)
      this.glass.rotation.x = 0.12
      this.group.add(this.glass)
    }

    // key + rim lights (env does most of the work)
    const key = new THREE.DirectionalLight('#cdd8ff', 1.4)
    key.position.set(3, 4, 5)
    this.scene.add(key)
    const rim = new THREE.DirectionalLight('#ff9c6a', 0.9)
    rim.position.set(-4, -2, -3)
    this.scene.add(rim)
    this.scene.add(new THREE.AmbientLight('#101a3a', 1.2))

    // pose
    this.group.rotation.set(0.72, -0.35, -0.3)
    this.basePos = new THREE.Vector3(0, 0.62, 0)
    this.group.position.copy(this.basePos)

    // animation state
    this.intro = 1
    this.section = 0
    this.targetColors = SECTION_PALETTES[0].map((c) => new THREE.Color(c))
    this.scroll = 0
    this.pointer = { x: 0, y: 0 }
    this.opacityTarget = 1
    this.visible = true
    this.clock = new THREE.Clock()

    this._onResize = () => this.resize()
    window.addEventListener('resize', this._onResize)
  }

  setScroll(p) { this.scroll = p }
  setIntro(v) { this.intro = v }
  setPointer(x, y) { this.pointer.x = x; this.pointer.y = y }
  setVisible(v) { this.visible = v }

  setSection(i) {
    if (i === this.section || !SECTION_PALETTES[i]) return
    this.section = i
    this.targetColors = SECTION_PALETTES[i].map((c) => new THREE.Color(c))
  }

  render() {
    if (this.failed || !this.visible) return
    const t = this.clock.getElapsedTime()
    const p = this.scroll

    // idle drift + scroll-scrubbed rotation
    this.group.rotation.y = -0.35 + p * Math.PI * 2.2 + Math.sin(t * 0.18) * 0.04
    this.group.rotation.x = 0.72 + Math.sin(t * 0.14) * 0.05 + this.pointer.y * 0.12
    this.group.rotation.z = -0.3 + this.pointer.x * 0.1

    // journey across the page: center → drift right + shrink → sink → return small at end
    const drift = Math.sin(p * Math.PI) // 0→1→0
    const intro = this.intro ?? 1
    this.group.position.x = this.basePos.x + p * 1.9 - drift * 0.4
    this.group.position.y =
      this.basePos.y - p * 0.7 + Math.sin(t * 0.5) * 0.05 - (1 - intro) * 1.1
    const scale = (1 - drift * 0.28 - p * 0.25) * (0.5 + 0.5 * intro)
    this.group.scale.setScalar(Math.max(scale, 0.2))
    // settle rotation as the intro completes
    this.group.rotation.y += (1 - intro) * 1.4

    // section palette lerp
    this.shellMat.color.lerp(this.targetColors[0], 0.035)
    this.coreMat.color.lerp(this.targetColors[1], 0.035)
    this.coreMat.emissive.lerp(this.targetColors[2], 0.035)

    // counter-rotate core slightly for inner shimmer
    this.core.rotation.z = -p * Math.PI * 1.4 + t * 0.05
    if (this.glass) this.glass.rotation.z = p * Math.PI * 0.8 - t * 0.03

    this.renderer.render(this.scene, this.camera)
  }

  resize() {
    if (this.failed) return
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  dispose() {
    if (this.failed) return
    window.removeEventListener('resize', this._onResize)
    this.shell.geometry.dispose()
    this.core.geometry.dispose()
    this.shellMat.dispose()
    this.coreMat.dispose()
    if (this.glass) { this.glass.geometry.dispose(); this.glassMat.dispose() }
    this.renderer.dispose()
  }
}
