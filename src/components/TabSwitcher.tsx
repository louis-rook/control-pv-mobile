import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

type Tab = { key: string; label: string }

export default function TabSwitcher({ tabs, active, onChange }: { tabs: Tab[]; active: string; onChange: (key: string) => void }) {
  return (
    <View style={styles.container}>
      {tabs.map(t => {
        const isActive = t.key === active
        return (
          <TouchableOpacity key={t.key} onPress={() => onChange(t.key)} style={[styles.tab, isActive && styles.tabActive]}>
            <Text style={[styles.tabTexto, isActive && styles.tabTextoActive]}>{t.label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 10, padding: 4, marginHorizontal: 20, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  tabTexto: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  tabTextoActive: { color: '#0047BA' },
})
