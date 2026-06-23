import React, { useEffect, useState, useMemo } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { getProductos, postRegistroVentas, type Producto } from '../api/pvn'
import { ApiError } from '../api/client'

const TURNOS = ['Mañana', 'Tarde', 'Noche', 'Cierre']

function limpiarNombre(n: string) {
  return n.replace(/ \(IVA\)$/, '').replace(/ IVA$/, '')
}
function categoria(nombre: string): string {
  const n = nombre.toUpperCase()
  if (n.startsWith('HELADO')) return 'Helados'
  if (n.startsWith('GRANIZADO')) return 'Granizados'
  if (n.includes('SUNDAE')) return 'Sundaes'
  return 'Otros'
}
function hoyBogota(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
}

export default function PvnVentasTab() {
  const { token } = useAuth()
  const [productos, setProductos]   = useState<Producto[]>([])
  const [cargando, setCargando]     = useState(true)
  const [cantidades, setCantidades] = useState<Record<number, number>>({})
  const [turno, setTurno]           = useState('Cierre')
  const [obs, setObs]               = useState('')
  const [guardando, setGuardando]   = useState(false)
  const [error, setError]           = useState('')
  const [exito, setExito]           = useState('')

  useEffect(() => {
    if (!token) return
    getProductos(token).then(data => {
      setProductos(data)
      const init: Record<number, number> = {}
      data.forEach(p => { init[p.id] = 0 })
      setCantidades(init)
    }).finally(() => setCargando(false))
  }, [token])

  function setQty(id: number, v: number) {
    setCantidades(prev => ({ ...prev, [id]: Math.max(0, v) }))
  }

  const totalUnidades = Object.values(cantidades).reduce((a, b) => a + b, 0)

  const grupos = useMemo(() => {
    const g: Record<string, Producto[]> = {}
    productos.forEach(p => {
      const cat = categoria(p.nombre)
      if (!g[cat]) g[cat] = []
      g[cat].push(p)
    })
    return g
  }, [productos])

  async function registrar() {
    if (!token) return
    setError(''); setExito('')
    const detalle = productos
      .filter(p => (cantidades[p.id] ?? 0) > 0)
      .map(p => ({ producto_id: p.id, producto_nombre: p.nombre, cantidad: cantidades[p.id] }))

    if (detalle.length === 0) { setError('Ingresa al menos un producto vendido'); return }

    setGuardando(true)
    try {
      await postRegistroVentas(token, { turno, observaciones: obs.trim() || null, detalle })
      setExito(`Ventas del ${hoyBogota()} (${turno}) registradas — ${detalle.length} productos, ${detalle.reduce((s, d) => s + d.cantidad, 0)} unidades`)
      const reset: Record<number, number> = {}
      productos.forEach(p => { reset[p.id] = 0 })
      setCantidades(reset)
      setObs('')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return <View style={styles.center}><ActivityIndicator color="#0047BA" /></View>
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}>
    <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <View style={styles.fechaBox}>
        <Text style={styles.fechaTexto}>📅 {hoyBogota()} (hoy · Colombia)</Text>
      </View>

      {exito ? <Text style={styles.exito}>{exito}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.label}>Turno</Text>
        <View style={styles.turnos}>
          {TURNOS.map(t => (
            <TouchableOpacity key={t} onPress={() => setTurno(t)} style={[styles.turnoBtn, turno === t && styles.turnoBtnActivo]}>
              <Text style={[styles.turnoTexto, turno === t && styles.turnoTextoActivo]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.label, { marginTop: 14 }]}>Observaciones</Text>
        <TextInput value={obs} onChangeText={setObs} placeholder="Opcional..." style={styles.input} />
      </View>

      {Object.entries(grupos).map(([cat, prods]) => (
        <View key={cat} style={styles.card}>
          <Text style={styles.catTitulo}>{cat}</Text>
          {prods.map(p => {
            const qty = cantidades[p.id] ?? 0
            return (
              <View key={p.id} style={styles.fila}>
                <Text style={[styles.prodNombre, qty > 0 && styles.prodNombreActivo]} numberOfLines={2}>
                  {limpiarNombre(p.nombre)}
                </Text>
                <View style={styles.contador}>
                  <TouchableOpacity onPress={() => setQty(p.id, qty - 1)} style={styles.contBtn}>
                    <Text style={styles.contBtnTexto}>−</Text>
                  </TouchableOpacity>
                  <TextInput
                    value={String(qty)}
                    onChangeText={v => setQty(p.id, parseInt(v.replace(/[^0-9]/g, '')) || 0)}
                    keyboardType="numeric"
                    selectTextOnFocus
                    style={styles.contInput}
                  />
                  <TouchableOpacity onPress={() => setQty(p.id, qty + 1)} style={[styles.contBtn, styles.contBtnMas]}>
                    <Text style={[styles.contBtnTexto, { color: '#fff' }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          })}
        </View>
      ))}

      <View style={styles.resumen}>
        <Text style={styles.resumenTexto}>Total: <Text style={styles.resumenValor}>{totalUnidades} unidades</Text></Text>
      </View>

      <TouchableOpacity
        onPress={registrar}
        disabled={guardando || totalUnidades === 0}
        style={[styles.guardarBtn, (guardando || totalUnidades === 0) && styles.guardarBtnDisabled]}
      >
        <Text style={styles.guardarTexto}>{guardando ? 'Guardando...' : `Guardar — ${turno}`}</Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, paddingHorizontal: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fechaBox: { backgroundColor: '#eff6ff', borderRadius: 10, padding: 12, marginBottom: 14 },
  fechaTexto: { color: '#1d4ed8', fontWeight: '600', fontSize: 13 },
  exito: { backgroundColor: '#d1fae5', color: '#065f46', padding: 12, borderRadius: 10, marginBottom: 12, fontSize: 13, fontWeight: '600' },
  error: { backgroundColor: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 10, marginBottom: 12, fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  label: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 8 },
  turnos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  turnoBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9' },
  turnoBtnActivo: { backgroundColor: '#0047BA' },
  turnoTexto: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  turnoTextoActivo: { color: '#fff' },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0f172a' },
  catTitulo: { fontSize: 12, fontWeight: '800', color: '#0047BA', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EBF4FF' },
  prodNombre: { flex: 1, fontSize: 13, color: '#1e293b', marginRight: 10 },
  prodNombreActivo: { fontWeight: '700' },
  contador: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  contBtnMas: { backgroundColor: '#0047BA' },
  contBtnTexto: { fontSize: 16, fontWeight: '700', color: '#475569' },
  contValor: { minWidth: 24, textAlign: 'center', fontSize: 15, fontWeight: '700', color: '#0f172a' },
  contInput: { minWidth: 40, textAlign: 'center', fontSize: 15, fontWeight: '700', color: '#0f172a', padding: 0, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 6, paddingVertical: 4 },
  resumen: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 14 },
  resumenTexto: { fontSize: 13, color: '#64748b' },
  resumenValor: { fontWeight: '800', color: '#0f172a', fontSize: 15 },
  guardarBtn: { backgroundColor: '#0047BA', borderRadius: 10, paddingVertical: 15, alignItems: 'center' },
  guardarBtnDisabled: { backgroundColor: '#94a3b8' },
  guardarTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
