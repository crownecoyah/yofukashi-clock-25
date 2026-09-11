import SwiftUI

struct CalendarRegistrationView: View {
    @Environment(\.dismiss) private var dismiss
    @ObservedObject var service: CalendarService
    let event: AppEvent
    let onRegistered: (String, String) -> Void
    @State private var calendarID = ""
    @State private var errorMessage: String?
    @State private var isLoading = true

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("Calendarへ登録しますか？").font(.title2.bold())
            GroupBox("アプリ上") { Text("\(logical(event.start)) ～ \(logical(event.end))").monospacedDigit().padding(6) }
            GroupBox("Calendarへ実際に登録する日時") { Text("\(actual(event.start)) ～ \(actual(event.end))").monospacedDigit().padding(6) }
            if isLoading { ProgressView("Calendarを読み込み中…") }
            else if !service.calendars.isEmpty {
                Picker("登録先", selection: $calendarID) {
                    ForEach(service.calendars) { value in Text("\(value.title) — \(value.source)").tag(value.id) }
                }
            }
            if let errorMessage { Text(errorMessage).font(.caption).foregroundStyle(.red) }
            HStack {
                Spacer(); Button("キャンセル", role: .cancel) { dismiss() }
                Button("登録") { register() }.buttonStyle(.borderedProminent).disabled(isLoading || calendarID.isEmpty)
            }
        }
        .padding(24).frame(width: 520)
        .task { await loadCalendars() }
    }

    private func loadCalendars() async {
        do {
            try await service.requestAccessAndLoad()
            calendarID = event.calendarIdentifier.flatMap { id in service.calendars.contains(where: { $0.id == id }) ? id : nil }
                ?? service.calendars.first?.id ?? ""
            if service.calendars.isEmpty { errorMessage = "書き込み可能なCalendarがありません。" }
        } catch { errorMessage = error.localizedDescription }
        isLoading = false
    }

    private func register() {
        do { onRegistered(try service.register(event, calendarIdentifier: calendarID), calendarID); dismiss() }
        catch { errorMessage = error.localizedDescription }
    }

    private func logical(_ value: LogicalDateTime) -> String {
        String(format: "%04d/%02d/%02d %02d:%02d", value.logicalDate.year, value.logicalDate.month, value.logicalDate.day, value.hour, value.minute)
    }

    private func actual(_ value: LogicalDateTime) -> String {
        guard let date = try? LogicalDateTimeConverter().actualDate(from: value) else { return "変換できません" }
        return date.formatted(.dateTime.year().month(.twoDigits).day(.twoDigits).hour(.twoDigits(amPM: .omitted)).minute(.twoDigits).locale(Locale(identifier: "ja_JP")))
    }
}
