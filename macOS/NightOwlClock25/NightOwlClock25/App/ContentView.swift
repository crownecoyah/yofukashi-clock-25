import SwiftUI

struct ContentView: View {
    @Environment(\.scenePhase) private var scenePhase
    @AppStorage("boundaryHour") private var boundaryHour = 5
    @AppStorage("showsSeconds") private var showsSeconds = false
    @AppStorage("alwaysOnTop") private var alwaysOnTop = false
    @AppStorage("showsOnAllSpaces") private var showsOnAllSpaces = true
    @AppStorage("showsOverFullScreen") private var showsOverFullScreen = false
    @StateObject private var store = EventStore()
    @StateObject private var calendarService = CalendarService()
    @State private var editedEvent: AppEvent?
    @State private var showsEditor = false
    @State private var calendarEvent: AppEvent?
    @State private var clockRefreshID = UUID()

    var body: some View {
        ClockDashboardView(boundaryHour: boundaryHour, showsSeconds: showsSeconds, events: store.events,
                           onAdd: { editedEvent = nil; showsEditor = true },
                           onEdit: { editedEvent = $0; showsEditor = true },
                           onDelete: store.delete,
                           onCalendar: { calendarEvent = $0 })
            .id(clockRefreshID)
            .frame(minWidth: 480, minHeight: 720)
            .background(WindowConfigurator(alwaysOnTop: alwaysOnTop,
                                           showsOnAllSpaces: showsOnAllSpaces,
                                           showsOverFullScreen: showsOverFullScreen).frame(width: 0, height: 0))
            .task { await store.load() }
            .onChange(of: scenePhase) { _, phase in if phase == .active { clockRefreshID = UUID() } }
            .sheet(isPresented: $showsEditor) { EventEditorView(existing: editedEvent, onSave: store.upsert) }
            .sheet(item: $calendarEvent) { event in
                CalendarRegistrationView(service: calendarService, event: event) { identifier, calendarIdentifier in
                    var updated = event
                    updated.eventKitIdentifier = identifier
                    updated.calendarIdentifier = calendarIdentifier
                    store.upsert(updated)
                }
            }
            .alert("エラー", isPresented: Binding(get: { store.errorMessage != nil }, set: { if !$0 { store.errorMessage = nil } })) {
                Button("OK") { store.errorMessage = nil }
            } message: { Text(store.errorMessage ?? "") }
    }
}
