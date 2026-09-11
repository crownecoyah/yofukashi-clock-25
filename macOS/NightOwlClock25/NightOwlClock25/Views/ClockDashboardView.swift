import SwiftUI

struct ClockDashboardView: View {
    @EnvironmentObject private var fontSettings: DigitalClockFontSettings
    let boundaryHour: Int
    let showsSeconds: Bool
    let events: [AppEvent]
    let onAdd: () -> Void
    let onEdit: (AppEvent) -> Void
    let onDelete: (AppEvent) -> Void
    let onCalendar: (AppEvent) -> Void

    var body: some View {
        TimelineView(showsSeconds ? .periodic(from: .now, by: 1) : .periodic(from: .now, by: 60)) { context in
            VStack(spacing: 0) {
                ScrollView {
                    VStack(spacing: 20) {
                        AnalogClockView(date: context.date, showsSeconds: showsSeconds)
                            .frame(maxWidth: 240, maxHeight: 240)
                            .shadow(color: .black.opacity(0.10), radius: 14, y: 6)
                        DigitalClockView(date: context.date, boundaryHour: boundaryHour, showsSeconds: showsSeconds)
                        Divider()
                        EventListView(events: events, onEdit: onEdit, onDelete: onDelete, onCalendar: onCalendar)
                    }
                    .padding(.horizontal, 28)
                    .padding(.top, 24)
                    .padding(.bottom, 18)
                }
                Divider()
                HStack {
                    Button(action: onAdd) { Label("予定を追加", systemImage: "plus") }
                        .buttonStyle(.borderedProminent)
                    Spacer()
                    Button {
                        SettingsWindowController.shared.show(fontSettings: fontSettings)
                    } label: {
                        Label("設定", systemImage: "gearshape")
                    }
                }
                .padding(.horizontal, 28)
                .padding(.vertical, 16)
            }
        }
    }
}
