import EventKit
import Foundation

struct CalendarChoice: Identifiable, Equatable {
    let id: String
    let title: String
    let source: String
}

@MainActor
final class CalendarService: ObservableObject {
    enum CalendarError: LocalizedError {
        case accessDenied
        case calendarUnavailable

        var errorDescription: String? {
            switch self {
            case .accessDenied: "Calendarへのアクセスが許可されていません。システム設定 ＞ プライバシーとセキュリティ ＞ カレンダーから変更できます。"
            case .calendarUnavailable: "登録先のCalendarが見つかりません。"
            }
        }
    }

    @Published private(set) var calendars: [CalendarChoice] = []
    private let eventStore = EKEventStore()

    func requestAccessAndLoad() async throws {
        let status = EKEventStore.authorizationStatus(for: .event)
        let granted: Bool
        switch status {
        case .fullAccess: granted = true
        case .notDetermined: granted = try await eventStore.requestFullAccessToEvents()
        default: granted = false
        }
        guard granted else { throw CalendarError.accessDenied }
        calendars = eventStore.calendars(for: .event)
            .filter(\.allowsContentModifications)
            .map { CalendarChoice(id: $0.calendarIdentifier, title: $0.title, source: $0.source.title) }
            .sorted { ($0.source, $0.title) < ($1.source, $1.title) }
    }

    func register(_ appEvent: AppEvent, calendarIdentifier: String) throws -> String {
        guard let calendar = eventStore.calendar(withIdentifier: calendarIdentifier), calendar.allowsContentModifications else {
            throw CalendarError.calendarUnavailable
        }
        let converter = LogicalDateTimeConverter()
        let event = EKEvent(eventStore: eventStore)
        event.title = appEvent.title
        event.startDate = try converter.actualDate(from: appEvent.start)
        event.endDate = try converter.actualDate(from: appEvent.end)
        event.notes = appEvent.notes.isEmpty ? nil : appEvent.notes
        event.calendar = calendar
        try eventStore.save(event, span: .thisEvent, commit: true)
        return event.eventIdentifier
    }
}
