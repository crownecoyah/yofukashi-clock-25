import Foundation

actor EventPersistence {
    private let fileURL: URL

    init(fileManager: FileManager = .default) {
        let base = fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
        let directory = base.appendingPathComponent("NightOwlClock25", isDirectory: true)
        try? fileManager.createDirectory(at: directory, withIntermediateDirectories: true)
        fileURL = directory.appendingPathComponent("events.json")
    }

    func load() throws -> [AppEvent] {
        guard FileManager.default.fileExists(atPath: fileURL.path) else { return [] }
        return try JSONDecoder().decode([AppEvent].self, from: Data(contentsOf: fileURL))
    }

    func save(_ events: [AppEvent]) throws {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        try encoder.encode(events).write(to: fileURL, options: .atomic)
    }
}

@MainActor
final class EventStore: ObservableObject {
    @Published private(set) var events: [AppEvent] = []
    @Published var errorMessage: String?
    private let persistence = EventPersistence()

    func load() async {
        do { events = try await persistence.load().sorted(by: Self.sort) }
        catch { errorMessage = "予定を読み込めませんでした: \(error.localizedDescription)" }
    }

    func upsert(_ event: AppEvent) {
        if let index = events.firstIndex(where: { $0.id == event.id }) { events[index] = event }
        else { events.append(event) }
        events.sort(by: Self.sort)
        persist()
    }

    func delete(_ event: AppEvent) {
        events.removeAll { $0.id == event.id }
        persist()
    }

    private func persist() {
        let snapshot = events
        Task {
            do { try await persistence.save(snapshot) }
            catch { errorMessage = "予定を保存できませんでした: \(error.localizedDescription)" }
        }
    }

    private static func sort(_ lhs: AppEvent, _ rhs: AppEvent) -> Bool {
        (try? LogicalDateTimeConverter().actualDate(from: lhs.start)) ?? .distantFuture <
        (try? LogicalDateTimeConverter().actualDate(from: rhs.start)) ?? .distantFuture
    }
}
