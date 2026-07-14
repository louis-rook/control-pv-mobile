import React, { useEffect, useState } from 'react'
import { Modal, View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { getMisPagosHoy, putPagoQR, deletePagoQR, type PagoQR } from '../api/qr'
import { postCerrarTurno, getTurnosHistorialHoy, type TurnoHist } from '../api/turno'
import { COLORS } from '../theme'

function fmtMoneda(v: number) {
  return `$${Math.round(v).toLocaleString('es-CO')}`
}
function fmtHora(s: string) {
  return new Date(s).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

type Props = {
  visible: boolean
  onClose: () => void
  // Al cerrar el panel después de confirmar el cierre, avisa al padre para
  // que muestre la pantalla de "turno cerrado" (o, en rotativas, vuelva a
  // pedir el punto de venta).
  onCerrado?: () => void
}

export default function MisPagosHoyModal({ visible, onClose, onCerrado }: Props) {
  const { token } = useAuth()
  const [pagos, setPagos]     = useState<PagoQR[]>([])
  const [cargando, setCargando] = useState(true)
  const [cerrando, setCerrando] = useState(false)
  const [cerrado, setCerrado] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [valorEdit, setValorEdit] = useState('')
  const [guardandoEdit, setGuardandoEdit] = useState(false)
  const [eliminandoId, setEliminandoId] = useState<number | null>(null)
  const [verTurnoId, setVerTurnoId] = useState<number | null>(null) // null = turno actual
  const [turnosHist, setTurnosHist] = useState<TurnoHist[]>([])
  const [mostrarListaTurnos, setMostrarListaTurnos] = useState(false)
  const [cargandoTurnosHist, setCargandoTurnosHist] = useState(false)

  const cargarPagos = React.useCallback((turnoId?: number | null) => {
    if (!token) return
    setCargando(true)
    getMisPagosHoy(token, turnoId ?? undefined).then(setPagos).finally(() => setCargando(false))
  }, [token])

  useEffect(() => {
    if (!visible || !token) return
    setCerrado(false)
    setMostrarListaTurnos(false)
    setVerTurnoId(null)
    cargarPagos()
  }, [visible, token, cargarPagos])

  const total = pagos.reduce((s, p) => s + Number(p.valor), 0)

  function cargarTurnosHist() {
    if (!token) return
    setCargandoTurnosHist(true)
    getTurnosHistorialHoy(token).then(setTurnosHist).finally(() => setCargandoTurnosHist(false))
  }

  function verTurnoActual() {
    setVerTurnoId(null)
    setMostrarListaTurnos(false)
    cargarPagos()
  }

  function verTurnoAnterior(t: TurnoHist) {
    setVerTurnoId(t.id)
    setMostrarListaTurnos(false)
    cargarPagos(t.id)
  }

  async function confirmarCierre() {
    if (!token) return
    Alert.alert(
      'Cerrar día',
      `Confirmas el cierre de turno con ${pagos.length} pago(s) por un total de ${fmtMoneda(total)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setCerrando(true)
            try {
              await postCerrarTurno(token)
              setCerrado(true)
            } finally {
              setCerrando(false)
            }
          },
        },
      ]
    )
  }

  function iniciarEdicion(p: PagoQR) {
    setEditandoId(p.id)
    setValorEdit(String(p.valor))
  }

  async function guardarEdicion(id: number) {
    if (!token) return
    const valorNum = parseFloat(valorEdit.replace(/[^\d.]/g, ''))
    if (!valorNum || valorNum <= 0) return
    setGuardandoEdit(true)
    try {
      await putPagoQR(token, id, valorNum)
      setEditandoId(null)
      cargarPagos(verTurnoId)
    } finally {
      setGuardandoEdit(false)
    }
  }

  function confirmarEliminar(id: number) {
    if (!token) return
    Alert.alert('Eliminar pago', '¿Confirmas que quieres eliminar este pago?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setEliminandoId(id)
          try {
            await deletePagoQR(token, id)
            cargarPagos(verTurnoId)
          } finally {
            setEliminandoId(null)
          }
        },
      },
    ])
  }

  function cerrarPanel() {
    onClose()
    if (cerrado) onCerrado?.()
  }

  const turnoActual = turnosHist.find(t => t.id === verTurnoId)

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={cerrarPanel}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View>
            <Text style={styles.titulo}>
              {mostrarListaTurnos ? 'Turnos de hoy' : verTurnoId ? 'Turno anterior' : 'Mis pagos de hoy'}
            </Text>
            {!mostrarListaTurnos && verTurnoId && turnoActual && (
              <Text style={styles.subtitulo}>🔒 {turnoActual.punto_venta_nombre} · solo lectura</Text>
            )}
          </View>
          <TouchableOpacity onPress={cerrarPanel} style={styles.cerrarBtn}>
            <Text style={styles.cerrarTexto}>×</Text>
          </TouchableOpacity>
        </View>

        {!mostrarListaTurnos && (
          <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
            {verTurnoId ? (
              <TouchableOpacity onPress={verTurnoActual}>
                <Text style={styles.link}>← Volver al turno actual</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => { setMostrarListaTurnos(true); cargarTurnosHist() }}>
                <Text style={styles.link}>🕐 Turnos anteriores de hoy</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {mostrarListaTurnos ? (
          cargandoTurnosHist ? (
            <View style={styles.center}><ActivityIndicator color={COLORS.accent} /></View>
          ) : (
            <FlatList
              data={turnosHist}
              keyExtractor={t => String(t.id)}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
              ListEmptyComponent={<Text style={styles.vacio}>Sin turnos hoy</Text>}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => verTurnoAnterior(item)} style={styles.filaTurno}>
                  <View>
                    <Text style={styles.filaTurnoNombre}>{item.punto_venta_nombre}</Text>
                    <Text style={styles.filaTurnoHora}>
                      {fmtHora(item.abierto_at)} – {item.cerrado_at ? fmtHora(item.cerrado_at) : (item.activo ? 'en curso' : '—')}
                    </Text>
                  </View>
                  <Text style={styles.filaTurnoFlecha}>›</Text>
                </TouchableOpacity>
              )}
            />
          )
        ) : cargando ? (
          <View style={styles.center}><ActivityIndicator color={COLORS.accent} /></View>
        ) : (
          <>
            <View style={styles.resumen}>
              <View style={styles.resumenItem}>
                <Text style={styles.resumenValor}>{pagos.length}</Text>
                <Text style={styles.resumenLabel}>Pagos</Text>
              </View>
              <View style={styles.resumenItem}>
                <Text style={styles.resumenValor}>{fmtMoneda(total)}</Text>
                <Text style={styles.resumenLabel}>Total</Text>
              </View>
            </View>

            <FlatList
              data={pagos}
              keyExtractor={p => String(p.id)}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
              ListEmptyComponent={<Text style={styles.vacio}>Sin pagos registrados</Text>}
              renderItem={({ item }) => (
                <View style={styles.fila}>
                  <TouchableOpacity onPress={() => setLightbox(item.foto_url)}>
                    <Image source={{ uri: item.foto_url }} style={styles.filaFoto} />
                  </TouchableOpacity>
                  <Text style={styles.filaHora}>{fmtHora(item.created_at)}</Text>
                  <View style={{ flex: 1 }} />
                  {verTurnoId !== null ? (
                    <Text style={styles.filaValor}>{fmtMoneda(Number(item.valor))}</Text>
                  ) : editandoId === item.id ? (
                    <>
                      <TextInput
                        value={valorEdit}
                        onChangeText={setValorEdit}
                        keyboardType="numeric"
                        autoFocus
                        style={styles.inputEdit}
                      />
                      <TouchableOpacity onPress={() => guardarEdicion(item.id)} disabled={guardandoEdit} style={[styles.iconBtn, styles.iconBtnConfirmar, guardandoEdit && { opacity: 0.6 }]}>
                        <Text style={[styles.iconBtnTexto, styles.iconBtnConfirmarTexto]}>✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setEditandoId(null)} style={[styles.iconBtn, styles.iconBtnCancelar]}>
                        <Text style={[styles.iconBtnTexto, styles.iconBtnCancelarTexto]}>×</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={styles.filaValor}>{fmtMoneda(Number(item.valor))}</Text>
                      <TouchableOpacity onPress={() => iniciarEdicion(item)} style={styles.iconBtn}>
                        <Text style={styles.iconBtnTexto}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => confirmarEliminar(item.id)} disabled={eliminandoId === item.id} style={styles.iconBtn}>
                        <Text style={styles.iconBtnTexto}>🗑️</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
            />

            {verTurnoId === null && (
              <View style={styles.footer}>
                {cerrado ? (
                  <View style={styles.cerradoBox}>
                    <Text style={styles.cerradoTexto}>✅ Día cerrado correctamente</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={confirmarCierre}
                    disabled={cerrando || pagos.length === 0 || editandoId !== null}
                    style={[styles.cierreBtn, (cerrando || pagos.length === 0 || editandoId !== null) && styles.cierreBtnDisabled]}
                  >
                    <Text style={styles.cierreTexto}>{cerrando ? 'Cerrando...' : 'Cerrar día'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}

        <Modal visible={!!lightbox} animationType="fade" transparent onRequestClose={() => setLightbox(null)}>
          <TouchableOpacity style={styles.lightboxFondo} activeOpacity={1} onPress={() => setLightbox(null)}>
            {lightbox && <Image source={{ uri: lightbox }} style={styles.lightboxImagen} resizeMode="contain" />}
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  titulo: { fontSize: 19, fontWeight: '800', color: COLORS.text },
  subtitulo: { fontSize: 12, color: COLORS.text2, marginTop: 2 },
  cerrarBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  cerrarTexto: { fontSize: 20, color: COLORS.text2, lineHeight: 22 },
  link: { color: COLORS.accent, fontWeight: '700', fontSize: 13 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  resumen: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 16 },
  resumenItem: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center' },
  resumenValor: { fontSize: 22, fontWeight: '800', color: COLORS.accent },
  resumenLabel: { fontSize: 12, color: COLORS.text2, marginTop: 2 },
  vacio: { textAlign: 'center', color: '#94a3b8', marginTop: 40 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 8 },
  filaFoto: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#e2e8f0' },
  filaHora: { fontSize: 13, color: COLORS.text2, fontWeight: '600' },
  filaValor: { fontSize: 15, fontWeight: '800', color: COLORS.accent2 },
  filaTurno: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8 },
  filaTurnoNombre: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  filaTurnoHora: { fontSize: 12, color: COLORS.text2, marginTop: 2 },
  filaTurnoFlecha: { fontSize: 18, color: '#94a3b8' },
  inputEdit: { width: 80, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, fontSize: 14, fontWeight: '700', color: COLORS.text },
  iconBtn: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  iconBtnTexto: { fontSize: 13 },
  iconBtnConfirmar: { backgroundColor: '#dcfce7' },
  iconBtnConfirmarTexto: { color: '#16a34a', fontWeight: '800' },
  iconBtnCancelar: { backgroundColor: '#fee2e2' },
  iconBtnCancelarTexto: { color: '#dc2626', fontWeight: '800' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: COLORS.border },
  cierreBtn: { backgroundColor: COLORS.danger, borderRadius: 10, paddingVertical: 15, alignItems: 'center' },
  cierreBtnDisabled: { opacity: 0.5 },
  cierreTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cerradoBox: { backgroundColor: '#d1fae5', borderRadius: 10, padding: 15, alignItems: 'center' },
  cerradoTexto: { color: '#065f46', fontWeight: '700', fontSize: 14 },
  lightboxFondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', alignItems: 'center', justifyContent: 'center' },
  lightboxImagen: { width: '95%', height: '80%' },
})
