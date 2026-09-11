import Foundation

struct AppEvent: Codable, Identifiable, Equatable, Sendable {
    var id: UUID
    var title: String
    var start: LogicalDateTime
    var end: LogicalDateTime
    var notes: String
    var calendarIdentifier: String?
    var eventKitIdentifier: String?

    init(id: UUID = UUID(), title: String, start: LogicalDateTime, end: LogicalDateTime,
         notes: String = "", calendarIdentifier: String? = nil, eventKitIdentifier: String? = nil) {
        self.id = id
        self.title = title
        self.start = start
        self.end = end
        self.notes = notes
        self.calendarIdentifier = calendarIdentifier
        self.eventKitIdentifier = eventKitIdentifier
    }
}
