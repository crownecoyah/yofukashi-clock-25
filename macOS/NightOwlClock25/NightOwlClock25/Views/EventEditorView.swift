import SwiftUI

struct EventEditorView: View {
    @Environment(\.dismiss) private var dismiss
    let existing: AppEvent?
    let onSave: (AppEvent) -> Void
    @State private var title = ""
    @State private var startDate = Date()
    @State private var startHour = 20
    @State private var startMinute = 0
    @State private var endDate = Date()
    @State private var endHour = 21
    @State private var endMinute = 0
    @State private var notes = ""
    @State private var validationMessage: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text(existing == nil ? "予定を追加" : "予定を編集").font(.title2.bold())
            TextField("タイトル", text: $title)
            logicalInput("開始", date: $startDate, hour: $startHour, minute: $startMinute)
            logicalInput("終了", date: $endDate, hour: $endHour, minute: $endMinute)
            TextField("メモ（任意）", text: $notes, axis: .vertical).lineLimit(2...5)
            if let validationMessage { Text(validationMessage).font(.caption).foregroundStyle(.red) }
            HStack {
                Spacer()
                Button("キャンセル", role: .cancel) { dismiss() }.keyboardShortcut(.cancelAction)
                Button("保存") { save() }.keyboardShortcut(.defaultAction).disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
        }
        .padding(24)
        .frame(width: 480)
        .onAppear(perform: populate)
    }

    @ViewBuilder
    private func logicalInput(_ label: String, date: Binding<Date>, hour: Binding<Int>, minute: Binding<Int>) -> some View {
        GroupBox(label) {
            HStack {
                DatePicker("日付", selection: date, displayedComponents: .date).labelsHidden()
                Picker("時", selection: hour) { ForEach(0...35, id: \.self) { Text("\($0)時").tag($0) } }.frame(width: 90)
                Text(":")
                Picker("分", selection: minute) { ForEach(0...59, id: \.self) { Text(String(format: "%02d", $0)).tag($0) } }.frame(width: 75)
            }.padding(6)
        }
    }

    private func populate() {
        guard let event = existing else { return }
        title = event.title; startHour = event.start.hour; startMinute = event.start.minute
        endHour = event.end.hour; endMinute = event.end.minute; notes = event.notes
        startDate = civilDate(event.start.logicalDate); endDate = civilDate(event.end.logicalDate)
    }

    private func civilDate(_ logical: LogicalDate) -> Date {
        Calendar.current.date(from: DateComponents(year: logical.year, month: logical.month, day: logical.day, hour: 12)) ?? .now
    }

    private func logical(date: Date, hour: Int, minute: Int) throws -> LogicalDateTime {
        let c = Calendar.current.dateComponents([.year, .month, .day], from: date)
        return try LogicalDateTime(logicalDate: .init(year: c.year!, month: c.month!, day: c.day!), hour: hour, minute: minute)
    }

    private func save() {
        do {
            let start = try logical(date: startDate, hour: startHour, minute: startMinute)
            let end = try logical(date: endDate, hour: endHour, minute: endMinute)
            let converter = LogicalDateTimeConverter()
            guard try converter.actualDate(from: start) < converter.actualDate(from: end) else {
                validationMessage = "終了日時は開始日時より後にしてください。"; return
            }
            onSave(AppEvent(id: existing?.id ?? UUID(), title: title.trimmingCharacters(in: .whitespacesAndNewlines), start: start, end: end, notes: notes, calendarIdentifier: existing?.calendarIdentifier, eventKitIdentifier: existing?.eventKitIdentifier))
            dismiss()
        } catch { validationMessage = error.localizedDescription }
    }
}
