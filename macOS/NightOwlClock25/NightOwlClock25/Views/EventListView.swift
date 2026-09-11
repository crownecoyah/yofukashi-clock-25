import SwiftUI

struct EventListView: View {
    let events: [AppEvent]
    let onEdit: (AppEvent) -> Void
    let onDelete: (AppEvent) -> Void
    let onCalendar: (AppEvent) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("予定").font(.headline)
            if events.isEmpty {
                ContentUnavailableView("予定はありません", systemImage: "calendar", description: Text("下のボタンから追加できます。"))
                    .frame(minHeight: 110)
            } else {
                ForEach(events) { event in
                    HStack(spacing: 12) {
                        VStack(alignment: .leading, spacing: 6) {
                            Text(event.title).font(.headline).lineLimit(1)
                            HStack(spacing: 18) {
                                dateBlock("開始", event.start)
                                Image(systemName: "arrow.right").foregroundStyle(.secondary)
                                dateBlock("終了", event.end)
                            }
                        }
                        Spacer()
                        Button { onCalendar(event) } label: { Image(systemName: event.eventKitIdentifier == nil ? "arrow.down.to.line" : "checkmark.circle.fill") }
                            .buttonStyle(.borderless)
                            .disabled(event.eventKitIdentifier != nil)
                            .help(event.eventKitIdentifier == nil ? "Calendarへ登録" : "Calendar登録済み（重複登録を防止しています）")
                        Button { onEdit(event) } label: { Image(systemName: "pencil") }.buttonStyle(.borderless).help("編集")
                        Button(role: .destructive) { onDelete(event) } label: { Image(systemName: "trash") }.buttonStyle(.borderless).help("削除")
                    }
                    .padding(12).background(.quaternary.opacity(0.45), in: RoundedRectangle(cornerRadius: 10))
                }
            }
        }
    }

    private func dateBlock(_ label: String, _ value: LogicalDateTime) -> some View {
        VStack(alignment: .leading, spacing: 1) {
            Text(label).font(.caption).foregroundStyle(.secondary)
            Text(String(format: "%04d/%02d/%02d", value.logicalDate.year, value.logicalDate.month, value.logicalDate.day)).monospacedDigit()
            Text(String(format: "%02d:%02d", value.hour, value.minute)).fontWeight(.semibold).monospacedDigit()
        }
    }
}
